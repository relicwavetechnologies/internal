"use client"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { TagForm } from "@/components/forms/tag-form"
import { useState } from "react"
import { Plus } from "lucide-react"
import { Tag } from "@prisma/client"

interface TagDialogProps {
  tag?: Tag
  trigger?: React.ReactNode
  open?: boolean
  onOpenChange?: (open: boolean) => void
}

export function TagDialog({ tag, trigger, open, onOpenChange }: TagDialogProps) {
  const [internalOpen, setInternalOpen] = useState(false)
  
  const isControlled = open !== undefined
  const show = isControlled ? open : internalOpen
  const setShow = isControlled ? onOpenChange! : setInternalOpen

  return (
    <Dialog open={show} onOpenChange={setShow}>
      <DialogTrigger asChild>
        {trigger || (
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Add Tag
          </Button>
        )}
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{tag ? "Edit Tag" : "Create Tag"}</DialogTitle>
          <DialogDescription>
            {tag ? "Update tag details" : "Add a new tag to categorize expenses"}
          </DialogDescription>
        </DialogHeader>
        <TagForm tag={tag} onSuccess={() => setShow(false)} />
      </DialogContent>
    </Dialog>
  )
}
