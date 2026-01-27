"use server"

import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import { revalidatePath } from "next/cache"
import { ApprovalStatus } from "@prisma/client"
import { sendApprovalConfirmationEmail } from "@/lib/email"

export async function approveTask(id: string) {
    const session = await auth()
    if (!session?.user?.companyId) return { success: false, error: 'Unauthorized' }

    return updateApprovalStatus(id, "APPROVED")
}

export async function rejectTask(id: string) {
    const session = await auth()
    if (!session?.user?.companyId) return { success: false, error: 'Unauthorized' }

    return updateApprovalStatus(id, "REJECTED")
}

export async function requestChangesTask(id: string) {
    const session = await auth()
    if (!session?.user?.companyId) return { success: false, error: 'Unauthorized' }

    // Logic: Set status back to IN_PROGRESS and approval to REJECTED or similar?
    // For now, let's just use REJECTED approval status.
    return updateApprovalStatus(id, "REJECTED")
}

async function updateApprovalStatus(id: string, status: ApprovalStatus) {
    try {
        const session = await auth()
        const approverName = session?.user?.name || 'Admin'

        // Fetch task with related data
        const task = await db.task.findUnique({
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

        if (!task) {
            return { success: false, error: 'Task not found' }
        }

        // Update the task
        const updatedTask = await db.task.update({
            where: { id },
            data: { approvalStatus: status }
        })

        // Send email notifications to all assignees
        const approved = status === 'APPROVED'
        for (const assignee of task.assignees) {
            if (assignee.employee.email) {
                try {
                    await sendApprovalConfirmationEmail({
                        employeeEmail: assignee.employee.email,
                        employeeName: assignee.employee.name,
                        taskTitle: task.title,
                        projectName: task.project.name,
                        approverName,
                        approved,
                        feedback: null, // TODO: Add feedback field to approval workflow
                    })
                } catch (emailError) {
                    console.error(`Failed to send approval email to ${assignee.employee.email}:`, emailError)
                    // Don't fail the entire operation if email fails
                }
            }
        }

        revalidatePath(`/admin/projects/${task.projectId}/tasks`)
        return { success: true, task: updatedTask }
    } catch (error) {
        console.error('Failed to update approval status:', error)
        return { success: false, error: 'Failed to update approval status' }
    }
}
