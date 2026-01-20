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
import { IncomeForm } from "@/components/forms/income-form"
import { useState } from "react"
import { Plus } from "lucide-react"

interface IncomeDialogProps {
  accounts: any[]
  tags: any[]
  categories?: any[]
}

export function IncomeDialog({ accounts, tags, categories = [] }: IncomeDialogProps) {
  const [open, setOpen] = useState(false)

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Log Income
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Log Income</DialogTitle>
          <DialogDescription>
            Record a new income source and add to account balance.
          </DialogDescription>
        </DialogHeader>
        <IncomeForm
          accounts={accounts}
          tags={tags}
          categories={categories}
          onSuccess={() => setOpen(false)}
        />
      </DialogContent>
    </Dialog>
  )
}
