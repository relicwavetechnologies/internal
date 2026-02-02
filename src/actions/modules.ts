'use server'

import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import { revalidatePath } from "next/cache"

export async function createModule(projectId: string, name: string) {
    const session = await auth()
    if (!session?.user?.companyId) {
        return { error: 'Unauthorized' }
    }

    try {
        const module = await db.module.create({
            data: {
                name,
                projectId,
                order: 0 // Default order, can benefit from a reorder logic later
            }
        })

        revalidatePath(`/admin/projects/${projectId}`)
        revalidatePath(`/admin/projects/${projectId}/tasks`)
        return { success: true, module }
    } catch (error) {
        console.error("Create module error:", error)
        return { error: 'Failed to create module' }
    }
}

export async function getProjectModules(projectId: string) {
    const session = await auth()
    if (!session?.user?.companyId) return []

    try {
        const modules = await db.module.findMany({
            where: { projectId },
            include: {
                tasks: {
                    include: {
                        assignees: {
                            include: {
                                employee: true
                            }
                        },
                        documents: {
                            include: {
                                uploadedBy: true,
                                uploadedByEmployee: true
                            },
                            orderBy: { createdAt: 'desc' }
                        }
                    },
                    orderBy: { createdAt: 'desc' }
                }
            },
            orderBy: { createdAt: 'asc' } // Or by 'order'
        })
        return modules
    } catch (error) {
        console.error("Get modules error:", error)
        return []
    }
}

export async function deleteModule(moduleId: string) {
    const session = await auth()
    if (!session?.user?.companyId) {
        return { error: 'Unauthorized' }
    }

    try {
        const mod = await db.module.delete({ where: { id: moduleId } })
        revalidatePath(`/admin/projects/${mod.projectId}`)
        revalidatePath(`/admin/projects/${mod.projectId}/tasks`)
        return { success: true }
    } catch (error) {
        console.error("Delete module error:", error)
        return { error: 'Failed to delete module' }
    }
}
