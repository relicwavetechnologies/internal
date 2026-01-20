"use server"

import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import { accountSchema, AccountData } from "@/lib/schemas"
import { revalidatePath } from "next/cache"

export async function createAccount(data: AccountData) {
  const session = await auth()
  if (!session?.user?.companyId) {
    return { error: "Unauthorized" }
  }

  const validatedFields = accountSchema.safeParse(data)
  if (!validatedFields.success) {
    return { error: "Invalid fields" }
  }

  try {
    await db.account.create({
      data: {
        ...validatedFields.data,
        companyId: session.user.companyId,
      },
    })
    revalidatePath("/accounts")
    return { success: true }
  } catch (error) {
    return { error: "Failed to create account" }
  }
}

export async function updateAccount(id: string, data: AccountData) {
  const session = await auth()
  if (!session?.user?.companyId) {
    return { error: "Unauthorized" }
  }

  const validatedFields = accountSchema.safeParse(data)
  if (!validatedFields.success) {
    return { error: "Invalid fields" }
  }

  try {
    // Verify ownership
    const account = await db.account.findUnique({
      where: { id, companyId: session.user.companyId },
    })

    if (!account) {
      return { error: "Account not found" }
    }

    await db.account.update({
      where: { id },
      data: validatedFields.data,
    })
    revalidatePath("/accounts")
    return { success: true }
  } catch (error) {
    return { error: "Failed to update account" }
  }
}

export async function deleteAccount(id: string) {
  const session = await auth()
  if (!session?.user?.companyId) {
    return { error: "Unauthorized" }
  }

  try {
    // Verify ownership
    const account = await db.account.findUnique({
      where: { id, companyId: session.user.companyId },
    })

    if (!account) {
      return { error: "Account not found" }
    }

    await db.account.delete({
      where: { id },
    })
    revalidatePath("/accounts")
    return { success: true }
  } catch (error) {
    return { error: "Failed to delete account" }
  }
}
