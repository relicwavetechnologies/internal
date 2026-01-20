"use server";

import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { redirect } from "next/navigation";

export async function getEmployeePaymentReport(
    startDate: Date,
    endDate: Date
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

    // Get all employees with their expenditures in the date range
    const employees = await db.employee.findMany({
        where: {
            companyId: user.companyId,
            status: "ACTIVE",
        },
        include: {
            expenditures: {
                where: {
                    date: {
                        gte: startDate,
                        lte: endDate,
                    },
                },
                select: {
                    amount: true,
                    date: true,
                    description: true,
                    category: {
                        select: {
                            name: true,
                            color: true,
                            icon: true,
                        },
                    },
                },
            },
        },
        orderBy: {
            name: "asc",
        },
    });

    // Calculate totals for each employee
    const report = employees.map((employee) => {
        const totalPaid = employee.expenditures.reduce(
            (sum, exp) => sum + exp.amount,
            0
        );
        const paymentCount = employee.expenditures.length;

        return {
            id: employee.id,
            name: employee.name,
            email: employee.email,
            role: employee.role,
            department: employee.department,
            employeeType: employee.employeeType,
            totalPaid,
            paymentCount,
            payments: employee.expenditures,
        };
    });

    // Calculate grand total
    const grandTotal = report.reduce((sum, emp) => sum + emp.totalPaid, 0);

    return {
        employees: report,
        grandTotal,
        dateRange: {
            from: startDate,
            to: endDate,
        },
    };
}

export async function getCategoryBreakdownReport(
    startDate: Date,
    endDate: Date
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

    // Get expense categories with their totals
    const expenseCategories = await db.category.findMany({
        where: {
            OR: [
                { companyId: user.companyId },
                { isSystem: true },
            ],
            type: {
                in: ["EXPENSE", "BOTH"],
            },
        },
        include: {
            expenditures: {
                where: {
                    date: {
                        gte: startDate,
                        lte: endDate,
                    },
                    companyId: user.companyId,
                },
                select: {
                    amount: true,
                },
            },
        },
    });

    // Get income categories with their totals
    const incomeCategories = await db.category.findMany({
        where: {
            OR: [
                { companyId: user.companyId },
                { isSystem: true },
            ],
            type: {
                in: ["INCOME", "BOTH"],
            },
        },
        include: {
            incomes: {
                where: {
                    date: {
                        gte: startDate,
                        lte: endDate,
                    },
                    companyId: user.companyId,
                },
                select: {
                    amount: true,
                },
            },
        },
    });

    // Calculate expense breakdown
    const expenseBreakdown = expenseCategories
        .map((category) => {
            const total = category.expenditures.reduce(
                (sum, exp) => sum + exp.amount,
                0
            );
            return {
                id: category.id,
                name: category.name,
                icon: category.icon,
                color: category.color,
                total,
                count: category.expenditures.length,
            };
        })
        .filter((cat) => cat.total > 0)
        .sort((a, b) => b.total - a.total);

    const totalExpenses = expenseBreakdown.reduce((sum, cat) => sum + cat.total, 0);

    // Calculate income breakdown
    const incomeBreakdown = incomeCategories
        .map((category) => {
            const total = category.incomes.reduce((sum, inc) => sum + inc.amount, 0);
            return {
                id: category.id,
                name: category.name,
                icon: category.icon,
                color: category.color,
                total,
                count: category.incomes.length,
            };
        })
        .filter((cat) => cat.total > 0)
        .sort((a, b) => b.total - a.total);

    const totalIncome = incomeBreakdown.reduce((sum, cat) => sum + cat.total, 0);

    // Get uncategorized transactions
    const uncategorizedExpenses = await db.expenditure.findMany({
        where: {
            companyId: user.companyId,
            categoryId: null,
            date: {
                gte: startDate,
                lte: endDate,
            },
        },
        select: {
            amount: true,
        },
    });

    const uncategorizedIncome = await db.income.findMany({
        where: {
            companyId: user.companyId,
            categoryId: null,
            date: {
                gte: startDate,
                lte: endDate,
            },
        },
        select: {
            amount: true,
        },
    });

    const uncategorizedExpenseTotal = uncategorizedExpenses.reduce(
        (sum, exp) => sum + exp.amount,
        0
    );
    const uncategorizedIncomeTotal = uncategorizedIncome.reduce(
        (sum, inc) => sum + inc.amount,
        0
    );

    return {
        expenses: {
            categories: expenseBreakdown,
            total: totalExpenses,
            uncategorized: {
                total: uncategorizedExpenseTotal,
                count: uncategorizedExpenses.length,
            },
        },
        income: {
            categories: incomeBreakdown,
            total: totalIncome,
            uncategorized: {
                total: uncategorizedIncomeTotal,
                count: uncategorizedIncome.length,
            },
        },
        netIncome: totalIncome - totalExpenses,
        dateRange: {
            from: startDate,
            to: endDate,
        },
    };
}

export async function getReportSummary(startDate: Date, endDate: Date) {
    const session = await auth();
    if (!session?.user?.id) redirect("/login");

    const user = await db.user.findUnique({
        where: { id: session.user.id },
        select: { companyId: true },
    });

    if (!user?.companyId) {
        throw new Error("User not associated with a company");
    }

    // Get totals for the period
    const [totalIncome, totalExpenses, expenditureCount, incomeCount] = await Promise.all([
        db.income.aggregate({
            where: {
                companyId: user.companyId,
                date: {
                    gte: startDate,
                    lte: endDate,
                },
            },
            _sum: {
                amount: true,
            },
        }),
        db.expenditure.aggregate({
            where: {
                companyId: user.companyId,
                date: {
                    gte: startDate,
                    lte: endDate,
                },
            },
            _sum: {
                amount: true,
            },
        }),
        db.expenditure.count({
            where: {
                companyId: user.companyId,
                date: {
                    gte: startDate,
                    lte: endDate,
                },
            },
        }),
        db.income.count({
            where: {
                companyId: user.companyId,
                date: {
                    gte: startDate,
                    lte: endDate,
                },
            },
        }),
    ]);

    const transactionCount = expenditureCount + incomeCount;

    const income = totalIncome._sum.amount || 0;
    const expenses = totalExpenses._sum.amount || 0;
    const netIncome = income - expenses;

    return {
        income,
        expenses,
        netIncome,
        transactionCount,
        dateRange: {
            from: startDate,
            to: endDate,
        },
    };
}
