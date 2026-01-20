"use server"

import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import { employeeSchema, EmployeeData } from "@/lib/schemas"
import { revalidatePath } from "next/cache"

export async function createEmployee(data: EmployeeData) {
  const session = await auth()
  if (!session?.user?.companyId) {
    return { error: "Unauthorized" }
  }

  const validatedFields = employeeSchema.safeParse(data)
  if (!validatedFields.success) {
    return { error: "Invalid fields" }
  }

  const { email, salary, ...rest } = validatedFields.data

  try {
    await db.employee.create({
      data: {
        ...rest,
        email: email || null,
        salary: salary === "" || salary === undefined ? null : Number(salary),
        companyId: session.user.companyId,
      },
    })
    revalidatePath("/employees")
    return { success: true }
  } catch (error) {
    console.error(error)
    return { error: "Failed to create employee" }
  }
}

export async function updateEmployee(id: string, data: EmployeeData) {
  const session = await auth()
  if (!session?.user?.companyId) {
    return { error: "Unauthorized" }
  }

  const validatedFields = employeeSchema.safeParse(data)
  if (!validatedFields.success) {
    return { error: "Invalid fields" }
  }

  const { email, salary, ...rest } = validatedFields.data

  try {
    const employee = await db.employee.findUnique({
      where: { id, companyId: session.user.companyId },
    })

    if (!employee) {
      return { error: "Employee not found" }
    }

    await db.employee.update({
      where: { id },
      data: {
        ...rest,
        email: email || null,
        salary: salary === "" || salary === undefined ? null : Number(salary),
      },
    })
    revalidatePath("/employees")
    revalidatePath(`/employees/${id}`)
    return { success: true }
  } catch (error) {
    console.error(error)
    return { error: "Failed to update employee" }
  }
}

export async function deleteEmployee(id: string) {
  const session = await auth()
  if (!session?.user?.companyId) {
    return { error: "Unauthorized" }
  }

  try {
    const employee = await db.employee.findUnique({
      where: { id, companyId: session.user.companyId },
      include: { expenditures: true },
    })

    if (!employee) {
      return { error: "Employee not found" }
    }

    // Unlink expenditures from employee before deleting
    await db.$transaction(async (tx: any) => {
      // Set employeeId to null for all linked expenditures
      await tx.expenditure.updateMany({
        where: { employeeId: id },
        data: { employeeId: null },
      })

      // Delete the employee
      await tx.employee.delete({
        where: { id },
      })
    })

    revalidatePath("/employees")
    revalidatePath("/expenditures")
    return { success: true }
  } catch (error) {
    console.error(error)
    return { error: "Failed to delete employee" }
  }
}

export async function getEmployees() {
  const session = await auth()
  if (!session?.user?.companyId) {
    return []
  }

  return db.employee.findMany({
    where: { companyId: session.user.companyId },
    orderBy: { name: "asc" },
  })
}

export async function getEmployee(id: string) {
  const session = await auth()
  if (!session?.user?.companyId) {
    return null
  }

  return db.employee.findUnique({
    where: { id, companyId: session.user.companyId },
    include: {
      expenditures: {
        include: {
          account: true,
          category: true,
          tags: { include: { tag: true } },
        },
        orderBy: { date: "desc" },
      },
    },
  })
}
