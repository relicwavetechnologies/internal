"use client"

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import { MoreHorizontal, Pencil, Trash } from "lucide-react"
import { Account } from "@prisma/client"
import { useState } from "react"
import { AccountDialog } from "./account-dialog"
import { deleteAccount } from "@/actions/accounts"
import { toast } from "sonner"

export function AccountActions({ account }: { account: Account }) {
  const [showEditDialog, setShowEditDialog] = useState(false)

  async function handleDelete() {
    if (confirm("Are you sure you want to delete this account?")) {
      const result = await deleteAccount(account.id)
      if (result.error) {
        toast.error(result.error)
      } else {
        toast.success("Account deleted")
      }
    }
  }

  return (
    <>
      <AccountDialog 
        account={account} 
        open={showEditDialog} 
        onOpenChange={setShowEditDialog}
        trigger={<span className="hidden"></span>} 
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
            <Pencil className="mr-2 h-4 w-4" />
            Edit
          </DropdownMenuItem>
          <DropdownMenuItem onClick={handleDelete} className="text-red-600">
            <Trash className="mr-2 h-4 w-4" />
            Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  )
}
