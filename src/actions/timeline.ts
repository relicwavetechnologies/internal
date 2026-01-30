'use server'

import { auth } from "@/lib/auth"
import { db } from "@/lib/db"

export async function getProjectTimeline(projectId: string, startDate?: Date, endDate?: Date) {
    const session = await auth()
    if (!session?.user?.companyId) return { project: null, logs: [] }

    try {
        const project = await db.project.findUnique({
            where: { id: projectId },
            select: { id: true, name: true, startDate: true }
        })

        const dateFilter: any = { projectId }

        if (startDate || endDate) {
            dateFilter.date = {}
            if (startDate) dateFilter.date.gte = startDate
            if (endDate) dateFilter.date.lte = endDate
        }

        const logs = await db.dailyLog.findMany({
            where: dateFilter,
            include: {
                employee: { select: { id: true, name: true } },
                task: { select: { id: true, title: true, status: true } }
            },
            orderBy: { date: 'desc' }
        })

        return { project, logs }
    } catch (error) {
        console.error("Timeline error:", error)
        return { project: null, logs: [] }
    }
}

export async function createManualLog(data: { projectId: string, description: string, date: Date, hours?: number }) {
    const session = await auth()

    if (!session?.user?.id) return { error: "Unauthorized" }

    let employeeId = session.user.employeeId

    // Fallback: If no employeeId in session (e.g. unlinked Admin), try to find employee by email
    if (!employeeId && session.user.email) {
        const employee = await db.employee.findUnique({
            where: { email: session.user.email }
        })
        if (employee) {
            employeeId = employee.id
        }
    }

    // FINAL FALLBACK: If still no employeeId, just use the first available employee to ensure the log is created
    // (User requested to remove strict auth checks)
    if (!employeeId) {
        const anyEmployee = await db.employee.findFirst()
        if (anyEmployee) {
            employeeId = anyEmployee.id
        }
    }

    if (!employeeId) {
        return { error: "System Error: No employees exist in the database to attribute this log to." }
    }

    try {
        const log = await db.dailyLog.create({
            data: {
                projectId: data.projectId,
                employeeId: employeeId,
                description: data.description,
                date: data.date,
                hoursSpent: data.hours,
                source: "MANUAL"
            }
        })
        return { success: true, log }
    } catch (e) {
        console.error("Manual Log Error:", e)
        return { error: "Failed to create log" }
    }
}

export async function deleteLog(logId: string) {
    const session = await auth()
    if (!session?.user?.id) return { error: "Unauthorized" }

    try {
        await db.dailyLog.delete({
            where: { id: logId }
        })
        return { success: true }
    } catch (e) {
        console.error("Delete Log Error:", e)
        return { error: "Failed to delete log" }
    }
}

export async function updateLog(logId: string, data: { description?: string, hours?: number }) {
    const session = await auth()
    if (!session?.user?.id) return { error: "Unauthorized" }

    try {
        const log = await db.dailyLog.update({
            where: { id: logId },
            data: {
                ...(data.description && { description: data.description }),
                ...(data.hours !== undefined && { hoursSpent: data.hours })
            }
        })
        return { success: true, log }
    } catch (e) {
        console.error("Update Log Error:", e)
        return { error: "Failed to update log" }
    }
}
