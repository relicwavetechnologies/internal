"use client"

import { useState } from "react"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { cn } from "@/lib/utils"
import { format } from "date-fns"
import { TaskStatus, TaskPriority } from "@prisma/client"
import { updateTaskStatus } from "@/actions/tasks"
import { toast } from "sonner"
import { Calendar, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { deleteTask } from "@/actions/tasks"

interface TaskItemProps {
    task: {
        id: string
        title: string
        description?: string | null
        status: TaskStatus
        priority: TaskPriority
        dueDate?: Date | string | null
        assignees?: any[]
    }
    onClick?: () => void
}

const PRIORITIES: Record<TaskPriority, string> = {
    LOW: "bg-slate-500",
    MEDIUM: "bg-blue-500",
    HIGH: "bg-orange-500",
    URGENT: "bg-red-500"
}

export function TaskItem({ task, onClick }: TaskItemProps) {
    const [completed, setCompleted] = useState(task.status === "COMPLETED")
    const [isHovered, setIsHovered] = useState(false)

    const handleStatusChange = async (checked: boolean) => {
        setCompleted(checked)
        const newStatus = checked ? "COMPLETED" : "TODO" // Simplified for now
        const result = await updateTaskStatus(task.id, newStatus)

        if (result.success) {
            toast.success(checked ? "Task completed" : "Task re-opened")
        } else {
            setCompleted(!checked) // Revert
            toast.error("Failed to update status")
        }
    }

    const handleDelete = async (e: React.MouseEvent) => {
        e.stopPropagation()
        if (!confirm("Delete this task?")) return
        const result = await deleteTask(task.id)
        if (result.success) toast.success("Task deleted")
        else toast.error("Failed to delete")
    }

    return (
        <div
            className="group flex items-center gap-4 py-3 px-4 bg-card dark:bg-slate-950/50 border border-border/40 rounded-lg hover:border-border/80 hover:shadow-sm transition-all duration-200 cursor-pointer"
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            onClick={onClick}
        >
            <div onClick={(e) => e.stopPropagation()}>
                <Checkbox
                    checked={completed}
                    onCheckedChange={handleStatusChange}
                    className="rounded-full h-5 w-5 data-[state=checked]:bg-primary data-[state=checked]:border-primary transition-colors"
                />
            </div>

            <div className="flex-1 min-w-0 flex flex-col justify-center">
                <span className={cn(
                    "font-medium text-sm transition-all truncate",
                    completed && "text-muted-foreground line-through decoration-border"
                )}>
                    {task.title}
                </span>
                {task.description && (
                    <span className="text-xs text-muted-foreground truncate hidden group-hover:block transition-all delay-75">
                        {task.description}
                    </span>
                )}
            </div>

            <div className="flex items-center gap-3 shrink-0">
                {/* Priority Dot */}
                <TooltipProvider>
                    <Tooltip>
                        <TooltipTrigger>
                            <div className={cn("h-2 w-2 rounded-full", PRIORITIES[task.priority])} />
                        </TooltipTrigger>
                        <TooltipContent>
                            <p className="text-xs">{task.priority} Priority</p>
                        </TooltipContent>
                    </Tooltip>
                </TooltipProvider>

                {/* Status Badge */}
                <Badge variant="outline" className={cn(
                    "hidden sm:flex h-5 px-1.5 text-[10px] uppercase font-bold tracking-wider",
                    task.status === "IN_PROGRESS" && "border-blue-200 text-blue-700 bg-blue-50",
                    task.status === "IN_REVIEW" && "border-purple-200 text-purple-700 bg-purple-50",
                    task.status === "TODO" && "border-slate-200 text-slate-600 bg-slate-50",
                    task.status === "CANCELLED" && "border-red-200 text-red-700 bg-red-50",
                    task.status === "COMPLETED" && "border-green-200 text-green-700 bg-green-50"
                )}>
                    {task.status.replace("_", " ")}
                </Badge>

                {/* Date */}
                {task.dueDate && (
                    <div className={cn(
                        "flex items-center gap-1.5 text-xs px-2 py-1 rounded-md bg-secondary/50 text-secondary-foreground font-medium",
                        new Date(task.dueDate) < new Date() && !completed && "text-destructive bg-destructive/10"
                    )}>
                        <Calendar className="h-3 w-3" />
                        {format(new Date(task.dueDate), "MMM d")}
                    </div>
                )}

                {/* Assignees */}
                <div className="flex -space-x-2">
                    {task.assignees?.map(({ employee }: any) => (
                        <TooltipProvider key={employee.id}>
                            <Tooltip>
                                <TooltipTrigger>
                                    <Avatar className="h-6 w-6 border-2 border-background ring-1 ring-border/10">
                                        <AvatarFallback className="text-[9px] bg-primary/10 text-primary">
                                            {employee.name.charAt(0)}
                                        </AvatarFallback>
                                    </Avatar>
                                </TooltipTrigger>
                                <TooltipContent>
                                    <p className="text-xs">{employee.name}</p>
                                </TooltipContent>
                            </Tooltip>
                        </TooltipProvider>
                    ))}
                </div>

                {/* Actions */}
                <Button
                    variant="ghost"
                    size="icon"
                    onClick={handleDelete}
                    className={cn(
                        "h-7 w-7 text-muted-foreground hover:text-destructive hover:bg-destructive/10 opacity-0 transition-opacity",
                        isHovered && "opacity-100"
                    )}
                >
                    <Trash2 className="h-3.5 w-3.5" />
                </Button>
            </div>
        </div>
    )
}
