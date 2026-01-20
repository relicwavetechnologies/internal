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
import { AccountForm } from "@/components/forms/account-form"
import { useState } from "react"
import { Plus } from "lucide-react"
import { Account } from "@prisma/client"

interface AccountDialogProps {
  account?: Account
  trigger?: React.ReactNode
  open?: boolean
  onOpenChange?: (open: boolean) => void
}

export function AccountDialog({ account, trigger, open, onOpenChange }: AccountDialogProps) {
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
            Add Account
          </Button>
        )}
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{account ? "Edit Account" : "Create Account"}</DialogTitle>
          <DialogDescription>
            {account ? "Update account details" : "Add a new account to track"}
          </DialogDescription>
        </DialogHeader>
        <AccountForm account={account} onSuccess={() => setShow(false)} />
      </DialogContent>
    </Dialog>
  )
}
