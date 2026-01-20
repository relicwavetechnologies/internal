"use server";

import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { z } from "zod";

const recurringTransactionSchema = z.object({
    name: z.string().min(1, "Name is required"),
    amount: z.number().positive("Amount must be positive"),
    description: z.string().optional(),
    type: z.enum(["INCOME", "EXPENSE"]),
    frequency: z.enum(["DAILY", "WEEKLY", "BIWEEKLY", "MONTHLY", "QUARTERLY", "YEARLY"]),
    startDate: z.date(),
    endDate: z.date().optional(),
    accountId: z.string().min(1, "Account is required"),
    employeeId: z.string().optional(),
    categoryId: z.string().optional(),
});

type RecurringTransactionInput = z.infer<typeof recurringTransactionSchema>;

// Helper function to calculate next run date
function calculateNextRun(
    currentDate: Date,
    frequency: string
): Date {
    const next = new Date(currentDate);

    switch (frequency) {
        case "DAILY":
            next.setDate(next.getDate() + 1);
            break;
        case "WEEKLY":
            next.setDate(next.getDate() + 7);
            break;
        case "BIWEEKLY":
            next.setDate(next.getDate() + 14);
            break;
        case "MONTHLY":
            next.setMonth(next.getMonth() + 1);
            break;
        case "QUARTERLY":
            next.setMonth(next.getMonth() + 3);
            break;
        case "YEARLY":
            next.setFullYear(next.getFullYear() + 1);
            break;
    }

    return next;
}

export async function createRecurringTransaction(
    data: RecurringTransactionInput
) {
    const session = await auth();
    if (!session?.user?.id) redirect("/login");

    const user = await db.user.findUnique({
        where: { id: session.user.id },
        select: { companyId: true },
    });

    if (!user?.companyId) {
        throw new Error("User not associated with a company");
    }

    // Validate the data
    const validated = recurringTransactionSchema.parse(data);

    // Calculate initial next run date
    const nextRun = calculateNextRun(validated.startDate, validated.frequency);

    const recurringTransaction = await db.recurringTransaction.create({
        data: {
            ...validated,
            nextRun,
            companyId: user.companyId,
        },
    });

    revalidatePath("/recurring-transactions");
    return recurringTransaction;
}

export async function updateRecurringTransaction(
    id: string,
    data: RecurringTransactionInput
) {
    const session = await auth();
    if (!session?.user?.id) redirect("/login");

    const user = await db.user.findUnique({
        where: { id: session.user.id },
        select: { companyId: true },
    });

    if (!user?.companyId) {
        throw new Error("User not associated with a company");
    }

    // Verify ownership
    const existing = await db.recurringTransaction.findFirst({
        where: { id, companyId: user.companyId },
    });

    if (!existing) {
        throw new Error("Recurring transaction not found");
    }

    const validated = recurringTransactionSchema.parse(data);

    // Recalculate next run if start date or frequency changed
    let nextRun = existing.nextRun;
    if (
        validated.startDate.getTime() !== existing.startDate.getTime() ||
        validated.frequency !== existing.frequency
    ) {
        nextRun = calculateNextRun(validated.startDate, validated.frequency);
    }

    const updated = await db.recurringTransaction.update({
        where: { id },
        data: {
            ...validated,
            nextRun,
        },
    });

    revalidatePath("/recurring-transactions");
    return updated;
}

export async function deleteRecurringTransaction(id: string) {
    const session = await auth();
    if (!session?.user?.id) redirect("/login");

    const user = await db.user.findUnique({
        where: { id: session.user.id },
        select: { companyId: true },
    });

    if (!user?.companyId) {
        throw new Error("User not associated with a company");
    }

    // Verify ownership
    const existing = await db.recurringTransaction.findFirst({
        where: { id, companyId: user.companyId },
    });

    if (!existing) {
        throw new Error("Recurring transaction not found");
    }

    await db.recurringTransaction.delete({
        where: { id },
    });

    revalidatePath("/recurring-transactions");
}

export async function toggleRecurringTransaction(id: string) {
    const session = await auth();
    if (!session?.user?.id) redirect("/login");

    const user = await db.user.findUnique({
        where: { id: session.user.id },
        select: { companyId: true },
    });

    if (!user?.companyId) {
        throw new Error("User not associated with a company");
    }

    // Verify ownership
    const existing = await db.recurringTransaction.findFirst({
        where: { id, companyId: user.companyId },
    });

    if (!existing) {
        throw new Error("Recurring transaction not found");
    }

    const updated = await db.recurringTransaction.update({
        where: { id },
        data: {
            isActive: !existing.isActive,
        },
    });

    revalidatePath("/recurring-transactions");
    return updated;
}

export async function getRecurringTransactions() {
    const session = await auth();
    if (!session?.user?.id) redirect("/login");

    const user = await db.user.findUnique({
        where: { id: session.user.id },
        select: { companyId: true },
    });

    if (!user?.companyId) {
        throw new Error("User not associated with a company");
    }

    const transactions = await db.recurringTransaction.findMany({
        where: {
            companyId: user.companyId,
        },
        include: {
            account: true,
            employee: true,
            category: true,
        },
        orderBy: {
            nextRun: "asc",
        },
    });

    return transactions;
}

export async function processRecurringTransactions() {
    const session = await auth();
    if (!session?.user?.id) redirect("/login");

    const user = await db.user.findUnique({
        where: { id: session.user.id },
        select: { companyId: true },
    });

    if (!user?.companyId) {
        throw new Error("User not associated with a company");
    }

    const now = new Date();

    // Find all active recurring transactions that are due
    const dueTransactions = await db.recurringTransaction.findMany({
        where: {
            companyId: user.companyId,
            isActive: true,
            nextRun: {
                lte: now,
            },
        },
        include: {
            account: true,
        },
    });

    const processed = [];

    for (const transaction of dueTransactions) {
        try {
            // Check if end date has passed
            if (transaction.endDate && transaction.endDate < now) {
                await db.recurringTransaction.update({
                    where: { id: transaction.id },
                    data: { isActive: false },
                });
                continue;
            }

            // Create the actual transaction
            if (transaction.type === "EXPENSE") {
                await db.expenditure.create({
                    data: {
                        amount: transaction.amount,
                        description: transaction.description || transaction.name,
                        date: now,
                        accountId: transaction.accountId,
                        companyId: user.companyId,
                        employeeId: transaction.employeeId,
                        categoryId: transaction.categoryId,
                    },
                });

                // Update account balance
                await db.account.update({
                    where: { id: transaction.accountId },
                    data: {
                        balance: {
                            decrement: transaction.amount,
                        },
                    },
                });
            } else {
                await db.income.create({
                    data: {
                        amount: transaction.amount,
                        description: transaction.description || transaction.name,
                        date: now,
                        accountId: transaction.accountId,
                        companyId: user.companyId,
                        categoryId: transaction.categoryId,
                    },
                });

                // Update account balance
                await db.account.update({
                    where: { id: transaction.accountId },
                    data: {
                        balance: {
                            increment: transaction.amount,
                        },
                    },
                });
            }

            // Calculate next run date
            const nextRun = calculateNextRun(transaction.nextRun, transaction.frequency);

            // Update recurring transaction
            await db.recurringTransaction.update({
                where: { id: transaction.id },
                data: { nextRun },
            });

            processed.push(transaction);
        } catch (error) {
            console.error(
                `Error processing recurring transaction ${transaction.id}:`,
                error
            );
        }
    }

    revalidatePath("/recurring-transactions");
    revalidatePath("/dashboard");
    revalidatePath("/transactions");

    return {
        processed: processed.length,
        transactions: processed,
    };
}
