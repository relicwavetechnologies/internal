"use server"

import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import { categorySchema, CategoryData } from "@/lib/schemas"
import { revalidatePath } from "next/cache"

export async function createCategory(data: CategoryData) {
  const session = await auth()
  if (!session?.user?.companyId) {
    return { error: "Unauthorized" }
  }

  const validatedFields = categorySchema.safeParse(data)
  if (!validatedFields.success) {
    return { error: "Invalid fields" }
  }

  try {
    await db.category.create({
      data: {
        ...validatedFields.data,
        companyId: session.user.companyId,
      },
    })
    revalidatePath("/categories")
    return { success: true }
  } catch (error) {
    console.error(error)
    return { error: "Failed to create category" }
  }
}

export async function updateCategory(id: string, data: CategoryData) {
  const session = await auth()
  if (!session?.user?.companyId) {
    return { error: "Unauthorized" }
  }

  const validatedFields = categorySchema.safeParse(data)
  if (!validatedFields.success) {
    return { error: "Invalid fields" }
  }

  try {
    const category = await db.category.findFirst({
      where: {
        id,
        OR: [
          { companyId: session.user.companyId },
          { companyId: null, isSystem: true },
        ],
      },
    })

    if (!category) {
      return { error: "Category not found" }
    }

    // Don't allow editing system categories
    if (category.isSystem) {
      return { error: "Cannot edit system categories" }
    }

    await db.category.update({
      where: { id },
      data: validatedFields.data,
    })
    revalidatePath("/categories")
    return { success: true }
  } catch (error) {
    console.error(error)
    return { error: "Failed to update category" }
  }
}

export async function deleteCategory(id: string) {
  const session = await auth()
  if (!session?.user?.companyId) {
    return { error: "Unauthorized" }
  }

  try {
    const category = await db.category.findFirst({
      where: {
        id,
        companyId: session.user.companyId,
      },
    })

    if (!category) {
      return { error: "Category not found" }
    }

    // Don't allow deleting system categories
    if (category.isSystem) {
      return { error: "Cannot delete system categories" }
    }

    // Unlink expenditures and incomes before deleting
    await db.$transaction(async (tx: any) => {
      await tx.expenditure.updateMany({
        where: { categoryId: id },
        data: { categoryId: null },
      })
      await tx.income.updateMany({
        where: { categoryId: id },
        data: { categoryId: null },
      })
      await tx.category.delete({
        where: { id },
      })
    })

    revalidatePath("/categories")
    return { success: true }
  } catch (error) {
    console.error(error)
    return { error: "Failed to delete category" }
  }
}

export async function getCategories(type?: "EXPENSE" | "INCOME" | "BOTH") {
  const session = await auth()
  if (!session?.user?.companyId) {
    return []
  }

  const whereClause = type
    ? {
      OR: [
        { companyId: session.user.companyId, type },
        { companyId: session.user.companyId, type: "BOTH" as const },
        { companyId: null, isSystem: true, type },
        { companyId: null, isSystem: true, type: "BOTH" as const },
      ],
    }
    : {
      OR: [
        { companyId: session.user.companyId },
        { companyId: null, isSystem: true },
      ],
    }

  return db.category.findMany({
    where: whereClause,
    orderBy: { name: "asc" },
  })
}

export async function seedDefaultCategories() {
  const session = await auth()
  if (!session?.user?.companyId) {
    return { error: "Unauthorized" }
  }

  const defaultCategories = [
    // Expense categories
    { name: "Salary", icon: "Wallet", color: "#ef4444", type: "EXPENSE" as const },
    { name: "Utilities", icon: "Zap", color: "#f59e0b", type: "EXPENSE" as const },
    { name: "Office Supplies", icon: "Package", color: "#8b5cf6", type: "EXPENSE" as const },
    { name: "Marketing", icon: "Megaphone", color: "#ec4899", type: "EXPENSE" as const },
    { name: "Travel", icon: "Plane", color: "#06b6d4", type: "EXPENSE" as const },
    { name: "Software", icon: "Code", color: "#3b82f6", type: "EXPENSE" as const },
    { name: "Rent", icon: "Building", color: "#64748b", type: "EXPENSE" as const },
    { name: "Insurance", icon: "Shield", color: "#22c55e", type: "EXPENSE" as const },
    // Income categories
    { name: "Sales", icon: "ShoppingCart", color: "#22c55e", type: "INCOME" as const },
    { name: "Services", icon: "Briefcase", color: "#3b82f6", type: "INCOME" as const },
    { name: "Investment", icon: "TrendingUp", color: "#8b5cf6", type: "INCOME" as const },
    { name: "Grants", icon: "Gift", color: "#f59e0b", type: "INCOME" as const },
  ]

  try {
    for (const category of defaultCategories) {
      // Check if category already exists for this company
      const existing = await db.category.findFirst({
        where: {
          name: category.name,
          companyId: session.user.companyId,
        },
      })

      if (!existing) {
        await db.category.create({
          data: {
            ...category,
            companyId: session.user.companyId,
          },
        })
      }
    }
    revalidatePath("/categories")
    return { success: true }
  } catch (error) {
    console.error(error)
    return { error: "Failed to seed categories" }
  }
}
