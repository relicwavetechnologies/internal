'use server'

import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import { clientSchema, type ClientData } from "@/lib/schemas"
import { revalidatePath } from "next/cache"
import crypto from "crypto"
import bcrypt from "bcryptjs"
import { sendClientWelcomeEmail, sendClientMagicLinkEmail } from "@/lib/email"

export async function createClient(data: ClientData) {
    const session = await auth()
    if (!session?.user?.companyId || session.user.userType !== 'ADMIN') {
        return { error: 'Unauthorized' }
    }

    try {
        const validated = clientSchema.parse(data)

        const client = await db.client.create({
            data: {
                ...validated,
                companyId: session.user.companyId,
            },
        })

        revalidatePath('/admin/clients')
        return { success: true, client }
    } catch (error) {
        console.error('Create client error:', error)
        return { error: 'Failed to create client' }
    }
}

// Create client with project in one transaction (one-to-one relationship)
export async function createClientWithProject(data: any) {
    const session = await auth()
    if (!session?.user?.companyId || session.user.userType !== 'ADMIN') {
        return { error: 'Unauthorized' }
    }

    try {
        // Hash password if provided
        const hashedPassword = data.password ? await bcrypt.hash(data.password, 10) : null

        // Create client and project in transaction
        const result = await db.$transaction(async (tx) => {
            // Create client
            const client = await tx.client.create({
                data: {
                    name: data.name,
                    email: data.email,
                    password: hashedPassword,
                    companyId: session.user.companyId,
                },
            })

            // Create project linked to this client
            const project = await tx.project.create({
                data: {
                    name: data.projectName,
                    description: data.projectDescription || null,
                    status: 'PLANNING',
                    startDate: data.startDate || null,
                    endDate: data.endDate || null,
                    clientId: client.id,
                    hasUpworkTimesheet: data.hasUpworkTimesheet || false,
                    upworkContractUrl: data.upworkContractUrl || null,
                    companyId: session.user.companyId,
                },
            })

            // Auto-create tag for project
            await tx.tag.create({
                data: {
                    name: `Project: ${data.projectName}`,
                    companyId: session.user.companyId,
                    projectId: project.id,
                },
            })

            return { client, project }
        })

        // Generate magic link and send welcome email
        const token = crypto.randomBytes(32).toString('hex')
        const expiry = new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours

        await db.client.update({
            where: { id: result.client.id },
            data: {
                magicToken: token,
                tokenExpiry: expiry,
            },
        })

        const magicLink = `${process.env.NEXTAUTH_URL}/client/auth/magic?token=${token}`

        // Get company name from session or database
        const company = await db.company.findUnique({
            where: { id: session.user.companyId },
            select: { name: true },
        })

        // Send welcome email with portal access
        try {
            await sendClientWelcomeEmail({
                clientEmail: result.client.email,
                clientName: result.client.name,
                companyName: company?.name || 'Our Company',
                projectName: result.project.name,
                magicLink,
            })
        } catch (emailError) {
            console.error('Failed to send welcome email:', emailError)
            // Don't fail the operation if email fails
        }

        revalidatePath('/admin/clients')
        revalidatePath('/admin/projects')
        return { success: true, clientId: result.client.id, projectId: result.project.id }
    } catch (error) {
        console.error('Create client with project error:', error)
        return { error: 'Failed to create client and project' }
    }
}

export async function updateClient(id: string, data: any) {
    const session = await auth()
    if (!session?.user?.companyId || session.user.userType !== 'ADMIN') {
        return { error: 'Unauthorized' }
    }

    try {
        // Update client and project in transaction
        const result = await db.$transaction(async (tx) => {
            // Prepare client update data
            const clientUpdateData: any = {
                name: data.name,
                email: data.email,
            }

            // Only update password if provided
            if (data.password) {
                clientUpdateData.password = await bcrypt.hash(data.password, 10)
            }

            // Update client
            const client = await tx.client.update({
                where: { id, companyId: session.user.companyId },
                data: clientUpdateData,
                include: { projects: true },
            })

            // Update associated project if exists
            if (client.projects && client.projects.length > 0) {
                const project = client.projects[0]
                await tx.project.update({
                    where: { id: project.id },
                    data: {
                        name: data.projectName,
                        description: data.projectDescription || null,
                        startDate: data.startDate || null,
                        endDate: data.endDate || null,
                        hasUpworkTimesheet: data.hasUpworkTimesheet || false,
                        upworkContractUrl: data.upworkContractUrl || null,
                    },
                })
            }

            return client
        })

        revalidatePath('/admin/clients')
        revalidatePath('/admin/projects')
        return { success: true, client: result }
    } catch (error) {
        console.error('Update client error:', error)
        return { error: 'Failed to update client' }
    }
}

export async function getClients() {
    const session = await auth()
    if (!session?.user?.companyId) return []

    try {
        return await db.client.findMany({
            where: { companyId: session.user.companyId },
            include: {
                projects: {
                    select: { id: true, name: true, status: true },
                },
            },
            orderBy: { createdAt: 'desc' },
        })
    } catch (error) {
        console.error('Get clients error:', error)
        return []
    }
}

export async function getClientById(id: string) {
    const session = await auth()
    if (!session?.user?.companyId) return null

    try {
        return await db.client.findUnique({
            where: {
                id,
                companyId: session.user.companyId,
            },
            include: {
                projects: {
                    include: {
                        tasks: true,
                    },
                },
            },
        })
    } catch (error) {
        console.error('Get client error:', error)
        return null
    }
}

export async function generateMagicLink(email: string) {
    const session = await auth()
    if (!session?.user?.companyId || session.user.userType !== 'ADMIN') {
        return { error: 'Unauthorized' }
    }

    try {
        const token = crypto.randomBytes(32).toString('hex')
        const expiry = new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours

        const client = await db.client.update({
            where: { email },
            data: {
                magicToken: token,
                tokenExpiry: expiry,
            },
        })

        const magicLink = `${process.env.NEXTAUTH_URL}/client/auth/magic?token=${token}`

        // Send magic link email
        try {
            await sendClientMagicLinkEmail({
                clientEmail: client.email,
                clientName: client.name,
                magicLink,
            })
        } catch (emailError) {
            console.error('Failed to send magic link email:', emailError)
            // Don't fail the operation if email fails
        }

        return { success: true, magicLink }
    } catch (error) {
        console.error('Generate magic link error:', error)
        return { error: 'Failed to generate magic link' }
    }
}
