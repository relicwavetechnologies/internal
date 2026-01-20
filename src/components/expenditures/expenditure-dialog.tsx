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
import { ExpenditureForm } from "@/components/forms/expenditure-form"
import { useState } from "react"
import { Plus } from "lucide-react"

interface ExpenditureDialogProps {
  accounts: any[]
  tags: any[]
  employees?: any[]
  categories?: any[]
}

export function ExpenditureDialog({ accounts, tags, employees = [], categories = [] }: ExpenditureDialogProps) {
  const [open, setOpen] = useState(false)

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Log Expense
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Log Expenditure</DialogTitle>
          <DialogDescription>
            Record a new expense and deduct from account balance.
          </DialogDescription>
        </DialogHeader>
        <ExpenditureForm
          accounts={accounts}
          tags={tags}
          employees={employees}
          categories={categories}
          onSuccess={() => setOpen(false)}
        />
      </DialogContent>
    </Dialog>
  )
}
