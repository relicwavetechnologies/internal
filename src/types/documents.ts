import { Document, User, Employee } from "@prisma/client"

export type ExtendedDocument = Document & {
    uploadedBy: User | null
    uploadedByEmployee: Employee | null
}
