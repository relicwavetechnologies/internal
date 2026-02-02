'use server'

import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import { revalidatePath } from "next/cache"
import { sendApprovalRequestEmail } from "@/lib/email"

export async function markTaskComplete(taskId: string, completionProof?: string, completionPrLinks?: string) {
  const session = await auth()
  const employeeId = session?.user?.employeeId

  if (!employeeId || session.user.userType !== 'EMPLOYEE') {
    return { error: 'Unauthorized' }
  }

  try {
    const task = await db.task.findUnique({
      where: { id: taskId },
      include: {
        assignee: true,
        project: true,
      },
    })

    if (!task || task.assigneeId !== employeeId) {
      return { error: 'Not your task' }
    }

    if (task.status === 'COMPLETED' || task.status === 'IN_REVIEW' || task.status === 'CANCELLED') {
      return { error: 'Task cannot be submitted for review' }
    }

    const updated = await db.task.update({
      where: { id: taskId },
      data: {
        status: 'IN_REVIEW',
        approvalStatus: 'PENDING',
        completionProof: completionProof?.trim() || null,
        completionPrLinks: completionPrLinks?.trim() || null,
        completedAt: null,
      },
    })

    // Send approval request email to admin
    if (process.env.ADMIN_NOTIFICATION_EMAIL && task.assignee) {
      await sendApprovalRequestEmail({
        approverEmail: process.env.ADMIN_NOTIFICATION_EMAIL,
        approverName: 'Admin',
        taskTitle: task.title,
        taskDescription: task.description,
        projectName: task.project.name,
        employeeName: task.assignee.name,
        completedAt: new Date(),
        taskId: task.id,
        completionProof: completionProof?.trim() || null,
        completionPrLinks: completionPrLinks?.trim() || null,
      })
    }

    revalidatePath('/employee/tasks')
    revalidatePath(`/admin/projects/${task.projectId}/tasks`)
    return { success: true }
  } catch (error) {
    console.error('Mark task complete error:', error)
    return { error: 'Failed to mark task as complete' }
  }
}

export async function getEmployeeTasks() {
  const session = await auth()
  const employeeId = session?.user?.employeeId

  if (!employeeId) return []

  try {
    return await db.task.findMany({
      where: { assigneeId: employeeId },
      include: { project: true },
      orderBy: { dueDate: 'asc' },
    })
  } catch (error) {
    console.error('Get employee tasks error:', error)
    return []
  }
}
