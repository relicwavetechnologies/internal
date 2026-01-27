'use server'

import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import { projectEmployeeSchema, type ProjectEmployeeData } from "@/lib/schemas"
import { revalidatePath } from "next/cache"

export async function assignEmployee(data: ProjectEmployeeData) {
    const session = await auth()
    if (!session?.user?.companyId || session.user.userType !== 'ADMIN') {
        return { error: 'Unauthorized' }
    }

    try {
        const validated = projectEmployeeSchema.parse(data)

        const assignment = await db.projectEmployee.create({
            data: validated,
        })

        revalidatePath(`/admin/projects/${data.projectId}`)
        revalidatePath(`/admin/projects/${data.projectId}/tasks`)
        return { success: true, assignment }
    } catch (error) {
        console.error('Assign employee error:', error)
        return { error: 'Failed to assign employee' }
    }
}

export async function removeEmployee(projectId: string, employeeId: string) {
    const session = await auth()
    if (!session?.user?.companyId || session.user.userType !== 'ADMIN') {
        return { error: 'Unauthorized' }
    }

    try {
        await db.projectEmployee.delete({
            where: {
                projectId_employeeId: {
                    projectId,
                    employeeId,
                },
            },
        })

        revalidatePath(`/admin/projects/${projectId}`)
        revalidatePath(`/admin/projects/${projectId}/tasks`)
        return { success: true }
    } catch (error) {
        console.error('Remove employee error:', error)
        return { error: 'Failed to remove employee' }
    }
}

export async function getProjectTeam(projectId: string) {
    const session = await auth()
    if (!session?.user?.companyId) return []

    try {
        return await db.projectEmployee.findMany({
            where: { projectId },
            include: {
                employee: {
                    include: {
                        // Support both legacy single assignee and new multi-assignee
                        tasksAssigned: {
                            where: { projectId, status: { not: 'COMPLETED' } },
                            select: {
                                id: true,
                                title: true,
                                status: true,
                                priority: true,
                                dueDate: true,
                            },
                            orderBy: { dueDate: 'asc' }
                        },
                        taskAssignees: {
                            where: { task: { projectId, status: { not: 'COMPLETED' } } },
                            include: {
                                task: {
                                    select: {
                                        id: true,
                                        title: true,
                                        status: true,
                                        priority: true,
                                        dueDate: true,
                                    }
                                }
                            },
                            orderBy: { task: { dueDate: 'asc' } }
                        }
                    },
                },
            },
            orderBy: { employee: { name: 'asc' } }
        })
    } catch (error) {
        console.error('Get team error:', error)
        return []
    }
}
