"use client"

import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ExternalLink, Trash2, Calendar, User, Loader2 } from "lucide-react"
import * as React from "react"
import type { ExtendedDocument } from "@/types/documents"
import { DOCUMENT_TYPE_ICONS, DOCUMENT_TYPE_COLORS } from "./document-utils"
import { deleteDocument } from "@/actions/documents"
import { toast } from "sonner"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"

interface DocumentGridViewProps {
  documents: ExtendedDocument[]
}

export function DocumentGridView({ documents }: DocumentGridViewProps) {
  const [deletingId, setDeletingId] = React.useState<string | null>(null)
  const [idToDelete, setIdToDelete] = React.useState<string | null>(null)

  const handleDelete = async () => {
    if (!idToDelete) return
    const id = idToDelete
    setDeletingId(id)
    const result = await deleteDocument(id)
    if (result.success) {
      toast.success("Document deleted")
    } else {
      toast.error("Failed to delete document")
    }
    setDeletingId(null)
    setIdToDelete(null)
  }

  if (documents.length === 0) {
    return (
      <div className="text-center py-12 border rounded-md border-dashed text-muted-foreground">
        No documents found.
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {documents.map((doc) => {
        const Icon = DOCUMENT_TYPE_ICONS[doc.type] || DOCUMENT_TYPE_ICONS.OTHER
        const colorClass = DOCUMENT_TYPE_COLORS[doc.type] || DOCUMENT_TYPE_COLORS.OTHER

        return (
          <Card key={doc.id} className="group relative flex flex-col transition-all duration-300 border-border/40 hover:border-border/80 hover:shadow-lg hover:-translate-y-1 overflow-hidden bg-card/50 backdrop-blur-sm">
            <CardHeader className="flex flex-row items-start gap-4 pb-2 pt-6 px-6">
              <div className={`p-3.5 rounded-xl bg-background shadow-sm ring-1 ring-border/10 ${colorClass}`}>
                <Icon className="h-7 w-7" />
              </div>
              <div className="flex-1 min-w-0 pt-0.5">
                <h3 className="font-semibold text-base truncate leading-tight tracking-tight text-foreground/90 group-hover:text-primary transition-colors" title={doc.name}>
                  {doc.name}
                </h3>
                <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider mt-1.5">{doc.type}</p>
              </div>
            </CardHeader>

            <CardContent className="flex-1 pb-4 px-6">
              <div className="space-y-2.5 pt-2">
                <div className="flex items-center gap-2.5 text-xs text-muted-foreground/80">
                  <User className="h-3.5 w-3.5 opacity-70" />
                  <span>{doc.uploadedBy.name}</span>
                </div>
                <div className="flex items-center gap-2.5 text-xs text-muted-foreground/80">
                  <Calendar className="h-3.5 w-3.5 opacity-70" />
                  <span>{new Date(doc.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                </div>
              </div>
            </CardContent>

            <CardFooter className="pt-2 flex justify-between gap-3 pb-6 px-6 relative z-10">
              <Button size="sm" className="flex-1 h-9 font-medium shadow-sm bg-background text-foreground border border-input hover:bg-accent hover:text-accent-foreground transition-all" asChild>
                <a href={doc.url} target="_blank" rel="noopener noreferrer">
                  <ExternalLink className="h-3.5 w-3.5 mr-2 opacity-70" />
                  Open
                </a>
              </Button>
              <Button
                size="icon"
                variant="ghost"
                className="h-9 w-9 text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors opacity-0 group-hover:opacity-100"
                onClick={() => setIdToDelete(doc.id)}
                disabled={deletingId === doc.id}
              >
                {deletingId === doc.id ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Trash2 className="h-4 w-4" />
                )}
              </Button>
            </CardFooter>
          </Card>
        )
      })}

      <AlertDialog open={!!idToDelete} onOpenChange={(open) => !open && setIdToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this document? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
