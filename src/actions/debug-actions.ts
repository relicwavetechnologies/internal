'use server'

import { db } from "@/lib/db"
import { auth } from "@/lib/auth"

export async function debugFetchProject(projectId: string) {
    const session = await auth()

    if (!session) return { error: "No session" }

    const results: any = {
        sessionCompanyId: session.user.companyId,
        projectIdTarget: projectId,
    }

    try {
        // 1. Simple fetch (no includes)
        const simple = await db.project.findUnique({
            where: { id: projectId },
        })
        results.simpleFetch = simple || "NOT FOUND"

        // 2. Fetch with company check
        const withCompany = await db.project.findUnique({
            where: {
                id: projectId,
                companyId: session.user.companyId
            },
        })
        results.withCompanyFetch = withCompany || "NOT FOUND (Company Mismatch?)"

        // 3. Complex fetch (The one causing issues)
        const complex = await db.project.findUnique({
            where: {
                id: projectId,
                companyId: session.user.companyId,
            },
            include: {
                client: true,
                tasks: {
                    include: {
                        assignees: { include: { employee: true } },
                        assignee: true, // Legacy support
                    }
                },
                documents: true,
                dailyLogs: {
                    include: { employee: true, task: true },
                    orderBy: { date: 'desc' }, // Check if this sort causes issues
                    take: 5
                },
                modules: {
                    include: {
                        subModules: true,
                        tasks: true
                    },
                    orderBy: { order: 'asc' }
                },
                comments: {
                    include: { user: true, client: true },
                    orderBy: { createdAt: 'desc' }
                },
                projectEmployees: {
                    include: { employee: true }
                },
                tag: {
                    include: {
                        expenditures: { include: { expenditure: true } },
                        incomes: { include: { income: true } },
                    }
                },
            },
        })

        // Abstract the result to avoid circular JSON if too big, or just return keys/counts
        if (complex) {
            results.complexFetch = "SUCCESS"
            results.complexDataSummary = {
                id: complex.id,
                tasksCount: complex.tasks.length,
                tag: complex.tag ? "Found" : "Null"
            }
        } else {
            results.complexFetch = "RETURNED NULL"
        }

        return results

    } catch (error: any) {
        return {
            ...results,
            error: "CRASHED",
            errorMessage: error.message,
            errorStack: error.stack
        }
    }
}
