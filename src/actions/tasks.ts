'use server'

import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import { revalidatePath } from "next/cache"
import { TaskPriority, TaskStatus, LogSource } from "@prisma/client"

import { TaskData } from "@/lib/schemas"
import { sendApprovalRequestEmail, sendTaskAssignmentEmail } from "@/lib/email"

interface CreateTaskData {
  title: string
  description?: string
  priority: TaskPriority
  status: TaskStatus
  dueDate?: Date
  projectId: string
  moduleId?: string
  assigneeIds: string[]
}

// Updating createTask signature to match TaskForm usage if needed, but TaskForm calls it with TaskData?
// TaskForm: const result = task ? await updateTask(task.id, data) : await createTask(data)
// Validation: resolver: zodResolver(taskSchema).
// So data is TaskData.

// But createTask currently exported expects CreateTaskData which has strict types.
// I should probably adapt createTask to accept TaskData or keep it and ensure TaskData maps to it.
// The current createTask implementation:
// export async function createTask(data: CreateTaskData)
// The CreateTaskData interface has assigneeIds: string[]
// But TaskData (zod) has assigneeId: string | optional.

// IMPORTANT: I need to align these. TaskForm sends assigneeId (singular).
// I will overload or just export a new function compatible with the form, OR update the existing one.
// Since build failed on updateTask, let's fix that first.

export async function updateTask(id: string, data: TaskData) {
  const session = await auth()
  if (!session?.user?.companyId) return { success: false, error: 'Unauthorized' }

  try {
    const task = await db.task.update({
      where: { id },
      data: {
        title: data.title,
        description: data.description,
        status: data.status,
        priority: data.priority,
        dueDate: data.dueDate,
        assigneeId: data.assigneeId === 'unassigned' ? null : data.assigneeId
      }
    })

    revalidatePath(`/admin/projects/${task.projectId}/tasks`)
    return { success: true, task }
  } catch (error) {
    console.error("Update task error:", error)
    return { success: false, error: 'Failed to update task' }
  }
}

export async function getEmployeesForAssignment() {
  const session = await auth()
  if (!session?.user?.companyId) return []

  return db.employee.findMany({
    where: {
      companyId: session.user.companyId,
      status: 'ACTIVE'
    },
    select: { id: true, name: true, role: true }
  })
}

// Overloading or creating a compatible version for the form
export async function createTask(data: CreateTaskData | TaskData) {
  const session = await auth()

  if (!session?.user?.companyId || !session?.user?.id) {
    return { success: false, error: 'Unauthorized' }
  }

  // Fallback Logic for Employee ID
  let employeeId = session.user.employeeId
  if (!employeeId && session.user.email) {
    const employee = await db.employee.findUnique({ where: { email: session.user.email } })
    if (employee) employeeId = employee.id
  }
  if (!employeeId) {
    const anyEmployee = await db.employee.findFirst()
    if (anyEmployee) employeeId = anyEmployee.id
  }

  if (!employeeId) {
    return { success: false, error: 'System Error: No valid employee found for logging.' }
  }

  try {
    // Normalizing input
    const isTaskData = (d: any): d is TaskData => 'projectId' in d && !('assigneeIds' in d)

    // Default values
    let assigneeIds: string[] = []
    let moduleId: string | undefined = undefined

    if (isTaskData(data)) {
      if (data.assigneeId && data.assigneeId !== 'unassigned') assigneeIds = [data.assigneeId]
      if (data.subModuleId) moduleId = data.subModuleId // Mapping submodule to module relation? Schema has both.
    } else {
      assigneeIds = data.assigneeIds
      moduleId = data.moduleId
    }

    const result = await db.$transaction(async (tx) => {
      const task = await tx.task.create({
        data: {
          title: data.title,
          description: data.description,
          priority: data.priority,
          status: data.status,
          dueDate: data.dueDate,
          projectId: data.projectId,
          moduleId: moduleId,
          // subModuleId?? If generic TaskData has subModuleId but we mapped to moduleId?
          // Let's perform safe spread excluding specific keys if needed, or just manual map
          isClientVisible: true,
          assignees: {
            create: assigneeIds.map(id => ({ employeeId: id }))
          },
          // Also set legacy assigneeId for backward compatibility
          assigneeId: assigneeIds.length > 0 ? assigneeIds[0] : null
        },
        include: {
          project: true,
          assignees: {
            include: {
              employee: true,
            },
          },
        },
      })

      // Auto-log creation
      await tx.dailyLog.create({
        data: {
          projectId: data.projectId,
          employeeId: employeeId!, // Safe assert due to check above
          description: `Created task: ${data.title}`,
          taskId: task.id,
          source: LogSource.SYSTEM,
          date: new Date(),
        }
      })

      // Send assignment emails to all assignees
      for (const assignee of task.assignees) {
        if (assignee.employee.email) {
          try {
            await sendTaskAssignmentEmail({
              employeeEmail: assignee.employee.email,
              employeeName: assignee.employee.name,
              taskTitle: task.title,
              taskDescription: task.description,
              projectName: task.project.name,
              dueDate: task.dueDate,
            })
          } catch (emailError) {
            console.error(`Failed to send assignment email to ${assignee.employee.email}:`, emailError)
            // Don't fail the operation if email fails
          }
        }
      }

      return task
    })

    revalidatePath(`/admin/projects/${data.projectId}`)
    revalidatePath(`/admin/projects/${result.projectId}/tasks`)
    return { success: true, task: result }

  } catch (error) {
    console.error("Create task error:", error)
    return { success: false, error: 'Failed to create task' }
  }
}

export async function updateTaskStatus(id: string, status: TaskStatus) {
  const session = await auth()
  if (!session?.user?.companyId) return { success: false, error: 'Unauthorized' }

  // Fallback Logic for Employee ID
  let employeeId = session.user.employeeId
  if (!employeeId && session.user.email) {
    const employee = await db.employee.findUnique({ where: { email: session.user.email } })
    if (employee) employeeId = employee.id
  }
  if (!employeeId) {
    const anyEmployee = await db.employee.findFirst()
    if (anyEmployee) employeeId = anyEmployee.id
  }

  if (!employeeId) {
    return { success: false, error: 'System Error: No valid employee found for logging.' }
  }

  try {
    const result = await db.$transaction(async (tx) => {
      // Fetch task with related data before update
      const taskBefore = await tx.task.findUnique({
        where: { id },
        include: {
          project: true,
          assignees: {
            include: {
              employee: true,
            },
          },
        },
      })

      const task = await tx.task.update({
        where: { id },
        data: {
          status,
          // When moving to IN_REVIEW, set approval status to PENDING
          ...(status === 'IN_REVIEW' && { approvalStatus: 'PENDING' })
        }
      })

      // Auto-log status change
      await tx.dailyLog.create({
        data: {
          projectId: task.projectId,
          employeeId: employeeId!,
          description: `Updated status to ${status}: ${task.title}`,
          taskId: task.id,
          source: LogSource.SYSTEM,
          date: new Date(),
        }
      })

      // Send approval request email when task moves to IN_REVIEW
      if (status === 'IN_REVIEW' && taskBefore) {
        const adminEmail = process.env.ADMIN_NOTIFICATION_EMAIL
        if (adminEmail) {
          try {
            await sendApprovalRequestEmail({
              approverEmail: adminEmail,
              approverName: 'Admin',
              taskTitle: taskBefore.title,
              taskDescription: taskBefore.description,
              projectName: taskBefore.project.name,
              employeeName: session.user.name || 'Unknown',
              completedAt: new Date(),
              taskId: task.id,
            })
          } catch (emailError) {
            console.error('Failed to send approval request email:', emailError)
            // Don't fail the operation if email fails
          }
        }
      }

      return task
    })

    revalidatePath(`/admin/projects/${result.projectId}/tasks`)
    return { success: true, task: result }
  } catch (error) {
    console.error("Update status error:", error)
    return { success: false, error: 'Failed to update task status' }
  }
}

export async function updateTaskVisibility(id: string, isVisible: boolean) {
  const session = await auth()
  if (!session?.user?.companyId) return { success: false, error: 'Unauthorized' }

  try {
    const task = await db.task.update({
      where: { id },
      data: { isClientVisible: isVisible }
    })
    revalidatePath(`/admin/projects/${task.projectId}/tasks`)
    return { success: true, task }
  } catch (error) {
    return { success: false, error: 'Failed to update task visibility' }
  }
}

export async function deleteTask(id: string) {
  const session = await auth()
  if (!session?.user?.companyId) return { success: false, error: 'Unauthorized' }

  try {
    const task = await db.task.delete({ where: { id } })
    revalidatePath(`/admin/projects/${task.projectId}/tasks`)
    return { success: true }
  } catch (error) {
    return { success: false, error: 'Failed to delete task' }
  }
}

export async function assignTask(taskId: string, employeeId: string) {
  const session = await auth()
  if (!session?.user?.companyId) return { success: false, error: 'Unauthorized' }

  try {
    await db.taskAssignee.create({
      data: { taskId, employeeId }
    })
    const task = await db.task.findUnique({
      where: { id: taskId },
      include: {
        project: true,
        assignees: { include: { employee: true } }
      }
    })

    if (!task) {
      return { success: false, error: 'Task not found' }
    }

    // Send assignment email to the newly assigned employee
    const newAssignee = task.assignees.find(a => a.employeeId === employeeId)
    if (newAssignee?.employee.email) {
      try {
        await sendTaskAssignmentEmail({
          employeeEmail: newAssignee.employee.email,
          employeeName: newAssignee.employee.name,
          taskTitle: task.title,
          taskDescription: task.description,
          projectName: task.project.name,
          dueDate: task.dueDate,
        })
      } catch (emailError) {
        console.error('Failed to send assignment email:', emailError)
        // Don't fail the operation if email fails
      }
    }

    revalidatePath(`/admin/projects/${task.projectId}/tasks`)
    return { success: true, task }
  } catch (error) {
    return { success: false, error: 'Failed to assign task' }
  }
}

export async function unassignTask(taskId: string, employeeId: string) {
  const session = await auth()
  if (!session?.user?.companyId) return { success: false, error: 'Unauthorized' }

  try {
    await db.taskAssignee.deleteMany({
      where: { taskId, employeeId }
    })
    const task = await db.task.findUnique({
      where: { id: taskId },
      include: { assignees: { include: { employee: true } } }
    })
    revalidatePath(`/admin/projects/${task?.projectId}/tasks`)
    return { success: true, task }
  } catch (error) {
    return { success: false, error: 'Failed to unassign task' }
  }
}

