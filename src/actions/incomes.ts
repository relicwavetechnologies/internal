"use server"

import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import { incomeSchema, IncomeData } from "@/lib/schemas"
import { revalidatePath } from "next/cache"

export async function createIncome(data: IncomeData) {
  const session = await auth()
  if (!session?.user?.companyId) {
    return { error: "Unauthorized" }
  }

  const validatedFields = incomeSchema.safeParse(data)
  if (!validatedFields.success) {
    return { error: "Invalid fields" }
  }

  const { amount, description, date, accountId, tagIds } = validatedFields.data

  try {
    await db.$transaction(async (tx: any) => {
      // Create income
      const income = await tx.income.create({
        data: {
          amount,
          description,
          date,
          accountId,
          companyId: session.user.companyId,
          tags: {
            create: tagIds?.map((tagId) => ({
              tag: { connect: { id: tagId } },
            })),
          },
        },
      })

      // Update account balance
      await tx.account.update({
        where: { id: accountId },
        data: {
          balance: {
            increment: amount,
          },
        },
      })
    })
    revalidatePath("/incomes")
    revalidatePath("/accounts")
    revalidatePath("/")
    revalidatePath("/transactions")
    return { success: true }
  } catch (error) {
    console.error(error)
    return { error: "Failed to create income" }
  }
}

export async function deleteIncome(id: string) {
  const session = await auth()
  if (!session?.user?.companyId) {
    return { error: "Unauthorized" }
  }

  try {
    const income = await db.income.findUnique({
      where: { id, companyId: session.user.companyId },
    })

    if (!income) {
      return { error: "Income not found" }
    }

    await db.$transaction(async (tx: any) => {
      // Delete income (tags cascade)
      await tx.income.delete({
        where: { id },
      })

      // Refund account balance
      await tx.account.update({
        where: { id: income.accountId },
        data: {
          balance: {
            decrement: income.amount,
          },
        },
      })
    })

    revalidatePath("/incomes")
    revalidatePath("/accounts")
    revalidatePath("/")
    revalidatePath("/transactions")
    return { success: true }
  } catch (error) {
    return { error: "Failed to delete income" }
  }
}
