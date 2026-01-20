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
import { EmployeeForm } from "@/components/forms/employee-form"
import { useState } from "react"
import { Plus } from "lucide-react"

interface EmployeeDialogProps {
  employee?: any
  trigger?: React.ReactNode
  open?: boolean
  onOpenChange?: (open: boolean) => void
}

export function EmployeeDialog({ employee, trigger, open, onOpenChange }: EmployeeDialogProps) {
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
            Add Employee
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{employee ? "Edit Employee" : "Create Employee"}</DialogTitle>
          <DialogDescription>
            {employee ? "Update employee details" : "Add a new employee or payee"}
          </DialogDescription>
        </DialogHeader>
        <EmployeeForm employee={employee} onSuccess={() => setShow(false)} />
      </DialogContent>
    </Dialog>
  )
}
