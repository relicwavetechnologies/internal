"use client"

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { ExternalLink, Trash2, Loader2 } from "lucide-react"
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

interface DocumentListViewProps {
  documents: ExtendedDocument[]
  onDelete?: () => void
}

export function DocumentListView({ documents, onDelete }: DocumentListViewProps) {
  const [deletingId, setDeletingId] = React.useState<string | null>(null)
  const [idToDelete, setIdToDelete] = React.useState<string | null>(null)

  const handleDelete = async () => {
    if (!idToDelete) return
    const id = idToDelete
    setDeletingId(id)
    const result = await deleteDocument(id)
    if (result.success) {
      toast.success("Document deleted")
      if (onDelete) onDelete()
    } else {
      toast.error("Failed to delete document")
    }
    setDeletingId(null)
    setIdToDelete(null)
  }

  return (
    <div className="rounded-xl border bg-card/50 backdrop-blur-sm overflow-hidden shadow-sm">
      <Table>
        <TableHeader>
          <TableRow className="hover:bg-transparent border-b border-border/50">
            <TableHead className="w-[60px]"></TableHead>
            <TableHead className="font-medium text-muted-foreground uppercase text-xs tracking-wider pl-4">Name</TableHead>
            <TableHead className="font-medium text-muted-foreground uppercase text-xs tracking-wider">Type</TableHead>
            <TableHead className="font-medium text-muted-foreground uppercase text-xs tracking-wider">Uploaded By</TableHead>
            <TableHead className="font-medium text-muted-foreground uppercase text-xs tracking-wider">Date</TableHead>
            <TableHead className="text-right font-medium text-muted-foreground uppercase text-xs tracking-wider pr-6">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {documents.map((doc) => {
            const Icon = DOCUMENT_TYPE_ICONS[doc.type] || DOCUMENT_TYPE_ICONS.OTHER
            const colorClass = DOCUMENT_TYPE_COLORS[doc.type] || DOCUMENT_TYPE_COLORS.OTHER

            return (
              <TableRow key={doc.id} className="hover:bg-muted/50 transition-colors border-b border-border/40 group">
                <TableCell className="py-5 pl-6">
                  <div className={`p-2.5 rounded-lg bg-background w-fit shadow-sm ring-1 ring-border/5 ${colorClass}`}>
                    <Icon className="h-5 w-5" />
                  </div>
                </TableCell>
                <TableCell className="py-5">
                  <div className="flex flex-col gap-0.5">
                    <a
                      href={doc.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 w-fit font-semibold text-foreground/90 group-hover:text-primary transition-colors"
                    >
                      {doc.name}
                    </a>
                  </div>
                </TableCell>
                <TableCell className="py-5">
                  <div className={`inline-flex items-center px-2 py-1 rounded-md text-[10px] font-bold tracking-wide uppercase bg-secondary/50 text-secondary-foreground/80`}>
                    {doc.type}
                  </div>
                </TableCell>
                <TableCell className="py-5">
                  <div className="flex items-center gap-2">
                    <div className="h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center text-xs font-medium text-primary">
                      {doc.uploadedBy.name?.[0] || "U"}
                    </div>
                    <span className="text-sm font-medium text-muted-foreground">{doc.uploadedBy.name}</span>
                  </div>
                </TableCell>
                <TableCell className="py-5 text-sm font-medium text-muted-foreground/80 font-mono">
                  {new Date(doc.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                </TableCell>
                <TableCell className="text-right py-5 pr-6">
                  <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button size="sm" variant="outline" className="h-8 gap-2 bg-background hover:bg-accent text-xs font-medium" asChild>
                      <a href={doc.url} target="_blank" rel="noopener noreferrer">
                        <ExternalLink className="h-3.5 w-3.5" />
                        Open
                      </a>
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setIdToDelete(doc.id)}
                      disabled={deletingId === doc.id}
                      className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                    >
                      {deletingId === doc.id ? (
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      ) : (
                        <Trash2 className="h-3.5 w-3.5" />
                      )}
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            )
          })}
          {documents.length === 0 && (
            <TableRow>
              <TableCell colSpan={6} className="h-32 text-center text-muted-foreground text-sm">
                No documents found.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>

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
