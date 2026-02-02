'use server'

import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import { revalidatePath } from "next/cache"
import { DocumentType } from "@prisma/client"
import cloudinary from "@/lib/cloudinary"

// Helper to determine document type from mime type or extension
function getDocumentType(mimeType: string, filename: string): DocumentType {
    const lowerName = filename.toLowerCase()

    if (mimeType.startsWith('image/')) return 'IMAGE'
    if (mimeType.startsWith('video/')) return 'VIDEO'
    if (mimeType.startsWith('audio/')) return 'AUDIO'

    // Specific extensions/mimes
    if (mimeType === 'application/pdf') return 'REPORT' // Generic default for PDF
    if (lowerName.endsWith('.pdf')) return 'REPORT'

    // Spreadsheets
    if (lowerName.endsWith('.xlsx') || lowerName.endsWith('.xls') || lowerName.endsWith('.csv') || mimeType.includes('spreadsheet') || mimeType.includes('excel')) return 'SPREADSHEET'

    // Presentations
    if (lowerName.endsWith('.pptx') || lowerName.endsWith('.ppt') || mimeType.includes('presentation') || mimeType.includes('powerpoint')) return 'PRESENTATION'

    // Archives
    if (lowerName.endsWith('.zip') || lowerName.endsWith('.rar') || lowerName.endsWith('.7z') || lowerName.endsWith('.tar')) return 'ARCHIVE'

    // Code
    if (lowerName.endsWith('.js') || lowerName.endsWith('.ts') || lowerName.endsWith('.tsx') || lowerName.endsWith('.html') || lowerName.endsWith('.css') || lowerName.endsWith('.json') || lowerName.endsWith('.py')) return 'CODE'

    // Text
    if (lowerName.endsWith('.txt') || lowerName.endsWith('.md')) return 'TEXT'

    // Word docs
    if (lowerName.endsWith('.doc') || lowerName.endsWith('.docx')) return 'SOW'

    return 'OTHER'
}

// Helper for links
function getLinkType(url: string): DocumentType {
    const lowerUrl = url.toLowerCase()
    if (lowerUrl.includes('youtube.com') || lowerUrl.includes('vimeo.com') || lowerUrl.includes('loom.com')) return 'VIDEO'
    if (lowerUrl.includes('figma.com') || lowerUrl.includes('dribbble.com') || lowerUrl.includes('behance.net')) return 'DESIGN'
    if (lowerUrl.includes('docs.google.com/spreadsheets') || lowerUrl.includes('airtable.com')) return 'SPREADSHEET'
    if (lowerUrl.includes('docs.google.com/presentation') || lowerUrl.includes('canva.com') || lowerUrl.includes('slides.com')) return 'PRESENTATION'
    if (lowerUrl.includes('docs.google.com/document') || lowerUrl.includes('notion.so')) return 'SOW'
    if (lowerUrl.includes('github.com') || lowerUrl.includes('gitlab.com') || lowerUrl.includes('bitbucket.org')) return 'CODE'
    if (lowerUrl.includes('spotify.com') || lowerUrl.includes('soundcloud.com')) return 'AUDIO'
    if (lowerUrl.endsWith('.pdf')) return 'REPORT'
    if (lowerUrl.match(/\.(jpeg|jpg|gif|png|webp|svg)$/) != null) return 'IMAGE'
    return 'OTHER'
}

export async function createDocument(data: {
    name: string
    url: string
    type: DocumentType
    projectId: string
    taskId?: string
}, uploadedById: string) {
    const session = await auth()
    if (!session?.user?.companyId) {
        return { error: 'Unauthorized' }
    }

    try {
        const uploaderData = session.user.userType === 'EMPLOYEE'
            ? { uploadedByEmployeeId: session.user.employeeId || session.user.id }
            : { uploadedById }

        const document = await db.document.create({
            data: {
                name: data.name,
                url: data.url,
                type: data.type,
                projectId: data.projectId,
                ...uploaderData,
                taskId: data.taskId,
            },
        })

        revalidatePath(`/admin/projects/${data.projectId}`)
        return { success: true, document }
    } catch (error) {
        console.error('Create document error:', error)
        return { error: 'Failed to create document' }
    }
}

export async function uploadDocument(formData: FormData, projectId: string, taskId?: string) {
    const session = await auth()
    if (!session?.user?.companyId) {
        return { error: 'Unauthorized' }
    }

    const file = formData.get('file') as File
    const name = formData.get('name') as string || file.name

    if (!file) {
        return { error: 'No file provided' }
    }

    try {
        const arrayBuffer = await file.arrayBuffer()
        const buffer = Buffer.from(arrayBuffer)

        // Determine type before upload if possible, or use resource_type from Cloudinary
        let docType = getDocumentType(file.type, file.name)

        let folderPath = `finance-tracker/${session.user.companyId}/projects/${projectId}`
        if (taskId) folderPath += `/tasks/${taskId}`

        const result = await new Promise<any>((resolve, reject) => {
            cloudinary.uploader.upload_stream(
                {
                    resource_type: "auto",
                    folder: folderPath,
                    use_filename: true,
                },
                (error, result) => {
                    if (error) reject(error)
                    else resolve(result)
                }
            ).end(buffer)
        })

        // Refine type based on cloudinary result if needed
        // result.resource_type: 'image' | 'video' | 'raw'
        if (result.resource_type === 'video') docType = 'VIDEO'
        else if (result.resource_type === 'image' && docType === 'OTHER') docType = 'IMAGE'

        const uploaderData = session.user.userType === 'EMPLOYEE'
            ? { uploadedByEmployeeId: session.user.employeeId || session.user.id }
            : { uploadedById: session.user.id! }

        const document = await db.document.create({
            data: {
                name: name,
                url: result.secure_url,
                type: docType,
                projectId,
                ...uploaderData,
                taskId: taskId,
            },
        })

        revalidatePath(`/admin/projects/${projectId}`)
        revalidatePath(`/admin/projects/${projectId}/documents`)
        // Also revalidate task view if possible, generic project revalidate might cover it
        return { success: true, document }

    } catch (error) {
        console.error('Upload error:', error)
        return { error: 'Failed to upload document' }
    }
}

export async function createLinkDocument(data: { url: string; name: string; projectId: string; taskId?: string }) {
    const session = await auth()
    if (!session?.user?.companyId) {
        return { error: 'Unauthorized' }
    }

    try {
        let type = getLinkType(data.url)
        // If it's a link, we can explicitly treat it as LINK unless it matches a specific file type like PDF/Image
        if (type === 'OTHER') type = 'LINK'

        const uploaderData = session.user.userType === 'EMPLOYEE'
            ? { uploadedByEmployeeId: session.user.employeeId || session.user.id }
            : { uploadedById: session.user.id! }

        const document = await db.document.create({
            data: {
                name: data.name,
                url: data.url,
                type: type,
                projectId: data.projectId,
                ...uploaderData,
                taskId: data.taskId,
            },
        })

        revalidatePath(`/admin/projects/${data.projectId}`)
        revalidatePath(`/admin/projects/${data.projectId}/documents`)
        return { success: true, document }
    } catch (error) {
        console.error('Create link error:', error)
        return { error: 'Failed to create link' }
    }
}

export async function deleteDocument(id: string) {
    const session = await auth()
    if (!session?.user?.companyId) {
        return { error: 'Unauthorized' }
    }

    try {
        const doc = await db.document.delete({ where: { id } })

        // Use revalidatePath for both specific project and nested routes just in case
        revalidatePath(`/admin/projects/${doc.projectId}`)
        revalidatePath(`/admin/projects/${doc.projectId}/documents`)
        return { success: true }
    } catch (error) {
        console.error('Delete document error:', error)
        return { error: 'Failed to delete document' }
    }
}

export async function getTaskDocuments(taskId: string) {
    const session = await auth()
    if (!session?.user?.companyId) return []

    try {
        const docs = await db.document.findMany({
            where: { taskId },
            include: { uploadedBy: true, uploadedByEmployee: true },
            orderBy: { createdAt: 'desc' }
        })
        return docs
    } catch (error) {
        console.error("Get task docs error:", error)
        return []
    }
}
