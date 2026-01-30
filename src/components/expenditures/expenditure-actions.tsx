"use client"

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import { MoreHorizontal, Trash, Edit } from "lucide-react"
import { deleteExpenditure } from "@/actions/expenditures"
import { toast } from "sonner"
import { useState } from "react"
import { ExpenditureDialog } from "./expenditure-dialog"
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

interface ExpenditureActionsProps {
  transaction: any
  accounts: any[]
  tags: any[]
  employees: any[]
  categories: any[]
}

export function ExpenditureActions({ transaction, accounts, tags, employees, categories }: ExpenditureActionsProps) {
  const [showEditDialog, setShowEditDialog] = useState(false)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)

  async function handleDelete() {
    const result = await deleteExpenditure(transaction.id)
    if (result.error) {
      toast.error(result.error)
    } else {
      toast.success("Expenditure deleted")
    }
  }

  return (
    <>
      <ExpenditureDialog
        open={showEditDialog}
        onOpenChange={setShowEditDialog}
        id={transaction.id}
        initialData={{
          description: transaction.description,
          amount: transaction.amount,
          date: transaction.date,
          accountId: transaction.accountId,
          categoryId: transaction.category?.id,
          employeeId: transaction.employee?.id,
          tagIds: transaction.tags.map((t: any) => t.tag.id)
        }}
        accounts={accounts}
        tags={tags}
        employees={employees}
        categories={categories}
        showTrigger={false}
      />
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="h-8 w-8 p-0">
            <span className="sr-only">Open menu</span>
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuLabel>Actions</DropdownMenuLabel>
          <DropdownMenuItem onClick={() => setShowEditDialog(true)}>
            <Edit className="mr-2 h-4 w-4" />
            Edit
          </DropdownMenuItem>
          <DropdownMenuItem onSelect={() => setShowDeleteDialog(true)} className="text-red-600">
            <Trash className="mr-2 h-4 w-4" />
            Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this expenditure? Balance will be refunded. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-red-600 hover:bg-red-700">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
