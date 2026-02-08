"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Calendar } from "@/components/ui/calendar"
import { Check, ChevronsUpDown, CalendarIcon, Loader2, Plus } from "lucide-react"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command"
import { cn } from "@/lib/utils"
import { format } from "date-fns"
import { createTask } from "@/actions/tasks"
import { toast } from "sonner"
import { TaskPriority, TaskStatus } from "@prisma/client"

interface CreateTaskDialogProps {
  projectId: string
  moduleId: string
  employees: { id: string, name: string }[]
  trigger?: React.ReactNode
  defaultTaskGroup?: string
}

export function CreateTaskDialog({ projectId, moduleId, employees, trigger, defaultTaskGroup }: CreateTaskDialogProps) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [dateOpen, setDateOpen] = useState(false)
  const [assigneeOpen, setAssigneeOpen] = useState(false)

  // Form State
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [priority, setPriority] = useState<TaskPriority>("MEDIUM")
  const [status, setStatus] = useState<TaskStatus>("TODO")
  const [date, setDate] = useState<Date>()
  const [selectedAssignees, setSelectedAssignees] = useState<string[]>([])
  const [taskGroup, setTaskGroup] = useState(defaultTaskGroup || "")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim()) return

    setLoading(true)
    const result = await createTask({
        title,
        description,
        priority,
        status,
        dueDate: date,
        projectId,
        moduleId,
        assigneeIds: selectedAssignees
    })
    setLoading(false)

    if (result.success) {
        toast.success("Task created")
        setOpen(false)
        setTitle("")
        setDescription("")
        setPriority("MEDIUM")
        setStatus("TODO")
        setDate(undefined)
        setSelectedAssignees([])
    } else {
        toast.error("Failed to create task")
    }
  }

  const toggleAssignee = (id: string) => {
    setSelectedAssignees(prev => 
        prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    )
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
            <Button size="sm" variant="ghost" className="h-8 w-full justify-start text-muted-foreground hover:text-foreground">
                <Plus className="mr-2 h-4 w-4" />
                Add Task
            </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Create Task</DialogTitle>
          <DialogDescription>Add a new task to this story.</DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4 py-4">
            <div className="space-y-2">
                <Label htmlFor="title">Task Title</Label>
                <Input 
                    id="title" 
                    value={title} 
                    onChange={(e) => setTitle(e.target.value)} 
                    placeholder="Implement login flow" 
                    required 
                />
            </div>

            <div className="space-y-2">
                <Label htmlFor="description">Description (Optional)</Label>
                <Textarea 
                    id="description" 
                    value={description} 
                    onChange={(e) => setDescription(e.target.value)} 
                    placeholder="Add details..." 
                    rows={3}
                />
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label>Priority</Label>
                    <Select value={priority} onValueChange={(val) => setPriority(val as TaskPriority)}>
                        <SelectTrigger>
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="LOW">Low</SelectItem>
                            <SelectItem value="MEDIUM">Medium</SelectItem>
                            <SelectItem value="HIGH">High</SelectItem>
                            <SelectItem value="URGENT">Urgent</SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                <div className="space-y-2">
                    <Label>Due Date</Label>
                    <Popover open={dateOpen} onOpenChange={setDateOpen}>
                        <PopoverTrigger asChild>
                            <Button
                                variant={"outline"}
                                className={cn(
                                    "w-full justify-start text-left font-normal",
                                    !date && "text-muted-foreground"
                                )}
                            >
                                <CalendarIcon className="mr-2 h-4 w-4" />
                                {date ? format(date, "PPP") : <span>Pick a date</span>}
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0">
                            <Calendar
                                mode="single"
                                selected={date}
                                onSelect={(d) => { setDate(d); setDateOpen(false) }}
                                initialFocus
                            />
                        </PopoverContent>
                    </Popover>
                </div>
            </div>

            <div className="space-y-2">
                <Label>Assignees</Label>
                <Popover open={assigneeOpen} onOpenChange={setAssigneeOpen}>
                    <PopoverTrigger asChild>
                        <Button variant="outline" role="combobox" aria-expanded={assigneeOpen} className="w-full justify-between">
                            {selectedAssignees.length > 0 
                                ? `${selectedAssignees.length} selected` 
                                : "Select employees..."}
                            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                        </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-[400px] p-0">
                        <Command>
                            <CommandInput placeholder="Search employees..." />
                            <CommandList>
                                <CommandEmpty>No employee found.</CommandEmpty>
                                <CommandGroup>
                                    {employees.map((employee) => (
                                        <CommandItem
                                            key={employee.id}
                                            value={employee.name}
                                            onSelect={() => toggleAssignee(employee.id)}
                                        >
                                            <Check
                                                className={cn(
                                                    "mr-2 h-4 w-4",
                                                    selectedAssignees.includes(employee.id) ? "opacity-100" : "opacity-0"
                                                )}
                                            />
                                            {employee.name}
                                        </CommandItem>
                                    ))}
                                </CommandGroup>
                            </CommandList>
                        </Command>
                    </PopoverContent>
                </Popover>
            </div>

            <DialogFooter className="pt-4">
                <Button type="submit" disabled={!title.trim() || loading}>
                    {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Create Task
                </Button>
            </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
