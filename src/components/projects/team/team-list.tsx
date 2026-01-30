'use client'

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
} from "@/components/ui/command"
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import {
    Plus,
    Trash2,
    Check,
    ChevronsUpDown,
    ExternalLink,
    UserPlus,
    Briefcase,
    Calendar,
    AlertCircle
} from "lucide-react"
import { assignEmployee, removeEmployee } from "@/actions/project-employees"
import { toast } from "sonner"
import { cn } from "@/lib/utils"
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

interface TeamListProps {
    projectId: string
    projectTeam: any[]
    allEmployees: any[]
    upworkContractUrl?: string | null
}

export function TeamList({ projectId, projectTeam, allEmployees, upworkContractUrl }: TeamListProps) {
    const [openAdd, setOpenAdd] = useState(false)
    const [loading, setLoading] = useState(false)
    const [selectedEmployeeId, setSelectedEmployeeId] = useState<string | null>(null)
    const [role, setRole] = useState<"LEAD" | "DEVELOPER" | "REVIEWER" | "DESIGNER" | "QA">("DEVELOPER")
    const [memberIdToRemove, setMemberIdToRemove] = useState<string | null>(null)

    const handleAddMember = async () => {
        if (!selectedEmployeeId) return
        setLoading(true)
        const result = await assignEmployee({
            projectId,
            employeeId: selectedEmployeeId,
            role
        })
        setLoading(false)
        if (result.success) {
            toast.success("Team member added")
            setOpenAdd(false)
            setSelectedEmployeeId(null)
        } else {
            toast.error(result.error || "Failed to add member")
        }
    }

    const handleRemoveMember = async () => {
        if (!memberIdToRemove) return
        const result = await removeEmployee(projectId, memberIdToRemove)
        if (result.success) {
            toast.success("Team member removed")
        } else {
            toast.error("Failed to remove member")
        }
        setMemberIdToRemove(null)
    }

    // Combine legacy tasksAssigned and new taskAssignees
    const getEmployeeTasks = (member: any) => {
        const legacyTasks = member.employee.tasksAssigned || []
        const newTasks = member.employee.taskAssignees?.map((ta: any) => ta.task) || []

        // Deduplicate by ID
        const taskMap = new Map()
        legacyTasks.forEach((t: any) => taskMap.set(t.id, t))
        newTasks.forEach((t: any) => taskMap.set(t.id, t))

        return Array.from(taskMap.values())
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    {/* Removed Heading as page likely has it, or keep minimal */}
                </div>
                <div className="flex gap-2">
                    {upworkContractUrl && (
                        <Button variant="outline" className="gap-2 text-green-600 border-green-200 hover:bg-green-50" asChild>
                            <a href={upworkContractUrl} target="_blank" rel="noopener noreferrer">
                                <ExternalLink className="h-4 w-4" />
                                Upwork Timesheet
                            </a>
                        </Button>
                    )}

                    <Popover open={openAdd} onOpenChange={setOpenAdd}>
                        <PopoverTrigger asChild>
                            <Button className="gap-2">
                                <UserPlus className="h-4 w-4" />
                                Add Member
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-[300px] p-0" align="end">
                            <div className="p-4 space-y-4">
                                <h4 className="font-medium leading-none">Add Team Member</h4>
                                <div className="space-y-2">
                                    <Popover>
                                        <PopoverTrigger asChild>
                                            <Button variant="outline" role="combobox" className="w-full justify-between">
                                                {selectedEmployeeId
                                                    ? allEmployees.find(e => e.id === selectedEmployeeId)?.name
                                                    : "Select employee..."}
                                                <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                            </Button>
                                        </PopoverTrigger>
                                        <PopoverContent className="w-[260px] p-0">
                                            <Command>
                                                <CommandInput placeholder="Search..." />
                                                <CommandList>
                                                    <CommandEmpty>No employee found.</CommandEmpty>
                                                    <CommandGroup>
                                                        {allEmployees
                                                            .filter(emp => !projectTeam.find(pt => pt.employeeId === emp.id))
                                                            .map(emp => (
                                                                <CommandItem
                                                                    key={emp.id}
                                                                    value={emp.name}
                                                                    onSelect={() => setSelectedEmployeeId(emp.id)}
                                                                >
                                                                    <Check className={cn(
                                                                        "mr-2 h-4 w-4",
                                                                        selectedEmployeeId === emp.id ? "opacity-100" : "opacity-0"
                                                                    )} />
                                                                    {emp.name}
                                                                </CommandItem>
                                                            ))}
                                                    </CommandGroup>
                                                </CommandList>
                                            </Command>
                                        </PopoverContent>
                                    </Popover>
                                    <Button className="w-full" onClick={handleAddMember} disabled={!selectedEmployeeId || loading}>
                                        {loading ? "Adding..." : "Add to Project"}
                                    </Button>
                                </div>
                            </div>
                        </PopoverContent>
                    </Popover>
                </div>
            </div>

            <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
                {projectTeam.map((member) => {
                    const tasks = getEmployeeTasks(member)
                    return (
                        <Card key={member.id} className="overflow-hidden group">
                            <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2 bg-muted/30">
                                <div className="flex items-center gap-3">
                                    <Avatar className="h-10 w-10 border-2 border-background shadow-sm">
                                        <AvatarImage src={`https://api.dicebear.com/7.x/initials/svg?seed=${member.employee.name}`} />
                                        <AvatarFallback>{member.employee.name[0]}</AvatarFallback>
                                    </Avatar>
                                    <div>
                                        <CardTitle className="text-base font-semibold">{member.employee.name}</CardTitle>
                                        <CardDescription className="text-xs">{member.role} • {member.employee.role || 'Employee'}</CardDescription>
                                    </div>
                                </div>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-8 w-8 text-muted-foreground hover:text-destructive opacity-0 group-hover:opacity-100 transition-opacity"
                                    onClick={() => setMemberIdToRemove(member.employeeId)}
                                >
                                    <Trash2 className="h-4 w-4" />
                                </Button>
                            </CardHeader>
                            <CardContent className="p-4 pt-4">
                                <div className="space-y-3">
                                    <div className="flex items-center justify-between text-xs text-muted-foreground font-medium">
                                        <span>Active Tasks</span>
                                        <Badge variant="secondary" className="text-[10px] h-5 px-1.5 min-w-[1.25rem] justify-center">
                                            {tasks.length}
                                        </Badge>
                                    </div>
                                    <Separator />
                                    <div className="space-y-2 min-h-[100px] max-h-[200px] overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-muted-foreground/20">
                                        {tasks.length > 0 ? tasks.map((task: any) => (
                                            <div key={task.id} className="flex items-start gap-2 p-2 rounded-md hover:bg-muted/50 transition-colors text-sm border border-transparent hover:border-border/50">
                                                <div className={cn(
                                                    "w-1.5 h-1.5 mt-1.5 rounded-full shrink-0",
                                                    task.status === "IN_PROGRESS" ? "bg-blue-500" :
                                                        task.status === "IN_REVIEW" ? "bg-purple-500" :
                                                            "bg-slate-300"
                                                )} />
                                                <div className="flex-1 min-w-0">
                                                    <p className="font-medium truncate leading-tight">{task.title}</p>
                                                    <div className="flex items-center gap-2 mt-1 text-[10px] text-muted-foreground">
                                                        <span className="uppercase tracking-wider">{task.status.replace("_", " ")}</span>
                                                        {task.dueDate && (
                                                            <span className={cn(
                                                                "flex items-center gap-0.5",
                                                                new Date(task.dueDate) < new Date() ? "text-red-500 font-bold" : ""
                                                            )}>
                                                                <Calendar className="h-3 w-3" />
                                                                {new Date(task.dueDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        )) : (
                                            <div className="flex flex-col items-center justify-center py-6 text-muted-foreground/50 text-sm">
                                                <Briefcase className="h-8 w-8 mb-2 opacity-20" />
                                                <span>No active tasks</span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    )
                })}
            </div>

            {projectTeam.length === 0 && (
                <div className="text-center py-12 bg-muted/10 border-2 border-dashed rounded-xl">
                    <UserPlus className="h-10 w-10 text-muted-foreground/30 mx-auto mb-3" />
                    <h3 className="text-lg font-medium text-muted-foreground">No team members assigned</h3>
                    <p className="text-sm text-muted-foreground/70 mt-1">Add members to start assigning tasks.</p>
                </div>
            )}

            <AlertDialog open={!!memberIdToRemove} onOpenChange={(open) => !open && setMemberIdToRemove(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This will remove the member from the project. Their assigned tasks will remain but will no longer have an assignee.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={handleRemoveMember} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                            Remove Member
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    )
}
