"use server"

import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import { expenditureSchema, ExpenditureData } from "@/lib/schemas"
import { revalidatePath } from "next/cache"

export async function createExpenditure(data: ExpenditureData) {
  const session = await auth()
  if (!session?.user?.companyId) {
    return { error: "Unauthorized" }
  }

  const validatedFields = expenditureSchema.safeParse(data)
  if (!validatedFields.success) {
    return { error: "Invalid fields" }
  }

  const { amount, description, date, accountId, tagIds, employeeId, categoryId } = validatedFields.data

  try {
    await db.$transaction(async (tx: any) => {
      // Create expenditure
      const expenditure = await tx.expenditure.create({
        data: {
          amount,
          description,
          date,
          accountId,
          companyId: session.user.companyId,
          employeeId: employeeId || null,
          categoryId: categoryId || null,
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
            decrement: amount,
          },
        },
      })
    })
    revalidatePath("/expenditures")
    revalidatePath("/accounts")
    revalidatePath("/employees")
    revalidatePath("/")
    return { success: true }
  } catch (error) {
    console.error(error)
    return { error: "Failed to create expenditure" }
  }
}

export async function deleteExpenditure(id: string) {
  const session = await auth()
  if (!session?.user?.companyId) {
    return { error: "Unauthorized" }
  }

  try {
    const expenditure = await db.expenditure.findUnique({
      where: { id, companyId: session.user.companyId },
    })

    if (!expenditure) {
      return { error: "Expenditure not found" }
    }

    await db.$transaction(async (tx: any) => {
      // Delete expenditure (tags cascade)
      await tx.expenditure.delete({
        where: { id },
      })

      // Refund account balance
      await tx.account.update({
        where: { id: expenditure.accountId },
        data: {
          balance: {
            increment: expenditure.amount,
          },
        },
      })
    })

    revalidatePath("/expenditures")
    revalidatePath("/accounts")
    revalidatePath("/employees")
    revalidatePath("/")
    return { success: true }
  } catch (error) {
    return { error: "Failed to delete expenditure" }
  }
}
