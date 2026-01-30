"use client"

import * as React from "react"
import { useState } from "react"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetFooter } from "@/components/ui/sheet"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Separator } from "@/components/ui/separator"
import { Calendar, User, Eye, EyeOff, Loader2, CheckCircle2, XCircle } from "lucide-react"
import { cn } from "@/lib/utils"
import { updateTaskVisibility, assignTask, unassignTask, updateTaskStatus } from "@/actions/tasks"
import { approveTask, rejectTask } from "@/actions/approvals"
import { addComment, getTaskComments } from "@/actions/comments"
import { toast } from "sonner"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Clock, AlertCircle } from "lucide-react"

import { ProofOfWorkSection } from "./proof-of-work-section"
import { CommentSkeleton } from "@/components/projects/skeletons"

interface TaskSheetProps {
    task: any // Typed properly
    isOpen: boolean
    onClose: () => void
    onUpdate: (task: any) => void
    employees: any[]
}

export function TaskSheet({ task, isOpen, onClose, onUpdate, employees = [] }: TaskSheetProps) {
    const [loading, setLoading] = useState(false)
    const isClientVisible = task?.isClientVisible ?? true
    const [assigneeOpen, setAssigneeOpen] = useState(false)

    // Comment State
    const [comments, setComments] = useState<any[]>([])
    const [newComment, setNewComment] = useState("")
    const [commentLoading, setCommentLoading] = useState(false)
    const [initialCommentsLoading, setInitialCommentsLoading] = useState(false)

    React.useEffect(() => {
        if (task?.id && isOpen) {
            setInitialCommentsLoading(true)
            getTaskComments(task.id).then((data) => {
                setComments(data)
                setInitialCommentsLoading(false)
            })
        }
    }, [task?.id, isOpen])

    const handleAddComment = async () => {
        if (!newComment.trim()) return
        setCommentLoading(true)
        const result = await addComment(task.id, newComment, task.projectId)
        setCommentLoading(false)
        if (result.success) {
            setComments(prev => [result.comment, ...prev])
            setNewComment("")
            toast.success("Comment added")
        } else {
            toast.error("Failed to add comment")
        }
    }

    if (!task) return null

    return (
        <Sheet open={isOpen} onOpenChange={onClose}>
            <SheetContent className="w-full sm:max-w-xl md:max-w-2xl overflow-y-auto">
                <SheetHeader className="space-y-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <Badge variant="outline" className={cn(
                                "uppercase text-[10px] tracking-wider font-bold",
                                task.priority === "URGENT" ? "bg-red-500/10 text-red-500 border-red-500/20" :
                                    task.priority === "HIGH" ? "bg-orange-500/10 text-orange-500 border-orange-500/20" :
                                        "bg-muted text-muted-foreground border-border"
                            )}>
                                {task.priority}
                            </Badge>
                            {task.status === "COMPLETED" && (
                                <Badge className="bg-green-500/10 text-green-500 border-green-500/20 hover:bg-green-500/20">
                                    Completed
                                </Badge>
                            )}
                        </div>

                        {/* Client Visibility Toggle */}
                        <Button
                            variant="ghost"
                            size="sm"
                            className={cn(
                                "h-8 gap-2 transition-colors",
                                isClientVisible ? "text-primary bg-primary/10" : "text-muted-foreground"
                            )}
                            onClick={async () => {
                                setLoading(true)
                                const result = await updateTaskVisibility(task.id, !isClientVisible)
                                setLoading(false)
                                if (result.success && (result as any).task) {
                                    toast.success((result as any).task.isClientVisible ? "Task visible to client" : "Task hidden from client")
                                    onUpdate((result as any).task)
                                } else {
                                    toast.error("Failed to update visibility")
                                }
                            }}
                            disabled={loading}
                        >
                            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : (
                                isClientVisible ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />
                            )}
                            <span className="text-xs">{isClientVisible ? "Client Visible" : "Internal Only"}</span>
                        </Button>
                    </div>

                    <SheetTitle className="text-2xl font-bold leading-tight">
                        {task.title}
                    </SheetTitle>

                    <div className="flex items-center gap-4 text-sm text-muted-foreground flex-wrap">
                        {/* Status Select */}
                        <div className="min-w-[140px]">
                            <Select
                                defaultValue={task.status}
                                onValueChange={async (val) => {
                                    const result = await updateTaskStatus(task.id, val as any)
                                    if (result.success && (result as any).task) {
                                        toast.success(`Status updated to ${val}`)
                                        onUpdate((result as any).task)
                                    } else {
                                        toast.error(result.error || "Failed to update status")
                                    }
                                }}
                            >
                                <SelectTrigger className="h-8 text-xs bg-muted/50 border-transparent hover:bg-muted transition-colors">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="TODO">To Do</SelectItem>
                                    <SelectItem value="IN_PROGRESS">In Progress</SelectItem>
                                    <SelectItem value="IN_REVIEW">In Review</SelectItem>
                                    <SelectItem value="COMPLETED">Completed</SelectItem>
                                    <SelectItem value="CANCELLED">Cancelled</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        {/* Multi-Assignee Combobox */}
                        <Popover open={assigneeOpen} onOpenChange={setAssigneeOpen}>
                            <PopoverTrigger asChild>
                                <Button variant="outline" size="sm" className="h-8 gap-1.5 font-normal border-dashed text-muted-foreground hover:text-foreground hover:border-border">
                                    <User className="h-3.5 w-3.5" />
                                    <span>{task.assignees?.length || 0}</span>
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent className="p-0 w-[200px]" align="start">
                                <Command>
                                    <CommandInput placeholder="Assign..." />
                                    <CommandList>
                                        <CommandEmpty>No employee found.</CommandEmpty>
                                        <CommandGroup>
                                            {employees.map((emp) => {
                                                const isAssigned = task.assignees?.some((a: any) => a.employeeId === emp.id)
                                                return (
                                                    <CommandItem
                                                        key={emp.id}
                                                        value={emp.name}
                                                        onSelect={async () => {
                                                            // Ideally move this logic to a passed handler or better state mgmt
                                                            if (isAssigned) {
                                                                const res = await unassignTask(task.id, emp.id)
                                                                if (res.success && (res as any).task) onUpdate((res as any).task)
                                                            } else {
                                                                const res = await assignTask(task.id, emp.id)
                                                                if (res.success && (res as any).task) onUpdate((res as any).task)
                                                            }
                                                        }}
                                                    >
                                                        <div className={cn(
                                                            "mr-2 flex h-4 w-4 items-center justify-center rounded-sm border border-primary",
                                                            isAssigned ? "bg-primary text-primary-foreground" : "opacity-50 [&_svg]:invisible"
                                                        )}>
                                                            <CheckCircle2 className="h-4 w-4" />
                                                        </div>
                                                        <span>{emp.name}</span>
                                                    </CommandItem>
                                                )
                                            })}
                                        </CommandGroup>
                                    </CommandList>
                                </Command>
                            </PopoverContent>
                        </Popover>

                        {/* Assignee Avatars */}
                        <div className="flex -space-x-2">
                            {task.assignees?.map((a: any) => (
                                <div key={a.id} className="h-6 w-6 rounded-full bg-muted border border-background flex items-center justify-center text-[10px] font-bold overflow-hidden" title={a.employee?.name}>
                                    {a.employee?.name?.[0]}
                                </div>
                            ))}
                        </div>

                        {task.dueDate && (
                            <div className={cn(
                                "flex items-center gap-1.5 px-2 py-1 rounded-md text-xs font-medium border",
                                new Date(task.dueDate) < new Date() && task.status !== "COMPLETED"
                                    ? "bg-destructive/10 text-destructive border-destructive/20"
                                    : "bg-muted/50 border-border text-muted-foreground"
                            )}>
                                {new Date(task.dueDate) < new Date() && task.status !== "COMPLETED" ? (
                                    <AlertCircle className="h-3.5 w-3.5" />
                                ) : (
                                    <Clock className="h-3.5 w-3.5" />
                                )}
                                <span>
                                    {new Date(task.dueDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                                    {task.status !== "COMPLETED" && (
                                        <span className="opacity-75 ml-1">
                                            ({Math.ceil((new Date(task.dueDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))} days left)
                                        </span>
                                    )}
                                </span>
                            </div>
                        )}
                    </div>
                </SheetHeader>

                <div className="mt-8 space-y-6">
                    <section>
                        <h4 className="text-sm font-medium text-foreground mb-2">Description</h4>
                        <div className="prose prose-sm text-muted-foreground">
                            {task.description || "No description provided."}
                        </div>
                    </section>

                    <Separator />

                    {/* Approval Section - Only for Completed Tasks */}
                    {task.status === "COMPLETED" && (
                        <section className="p-4 rounded-lg bg-muted/30 border border-border/50 space-y-3">
                            <div className="flex items-center justify-between">
                                <h4 className="text-sm font-medium">Approval Status</h4>
                                <Badge variant={task.approvalStatus === "APPROVED" ? "default" : task.approvalStatus === "REJECTED" ? "destructive" : "secondary"}>
                                    {task.approvalStatus || "PENDING"}
                                </Badge>
                            </div>
                            {task.approvalStatus !== "APPROVED" && (
                                <div className="flex gap-2">
                                    <Button
                                        size="sm"
                                        className="w-full bg-green-600 hover:bg-green-700 text-white"
                                        onClick={async () => {
                                            setLoading(true)
                                            const result = await approveTask(task.id)
                                            setLoading(false)
                                            if (result.success && (result as any).task) {
                                                toast.success("Task approved")
                                                onUpdate((result as any).task)
                                            } else {
                                                toast.error("Failed to approve")
                                            }
                                        }}
                                        disabled={loading}
                                    >
                                        <CheckCircle2 className="mr-2 h-4 w-4" />
                                        Approve
                                    </Button>
                                    <Button
                                        size="sm"
                                        variant="outline"
                                        className="w-full text-destructive hover:bg-destructive/10 border-destructive/20"
                                        onClick={async () => {
                                            setLoading(true)
                                            const result = await rejectTask(task.id)
                                            setLoading(false)
                                            if (result.success && (result as any).task) {
                                                toast.success("Task rejected")
                                                onUpdate((result as any).task)
                                            } else {
                                                toast.error(result.error || "Failed to reject")
                                            }
                                        }}
                                        disabled={loading}
                                    >
                                        <XCircle className="mr-2 h-4 w-4" />
                                        Reject
                                    </Button>
                                </div>
                            )}
                        </section>
                    )}

                    <Tabs defaultValue="activity" className="w-full">
                        <TabsList className="grid w-full grid-cols-2 mb-4">
                            <TabsTrigger value="activity">Activity</TabsTrigger>
                            <TabsTrigger value="proof">Proof of Work</TabsTrigger>
                        </TabsList>

                        <TabsContent value="proof" className="space-y-4">
                            <ProofOfWorkSection
                                taskId={task.id}
                                projectId={task.projectId}
                                initialDocuments={task.documents || []}
                            />
                        </TabsContent>

                        <TabsContent value="activity" className="space-y-4">
                            <section>
                                {/* Removed Activity Header since tab implies it */}
                                <div className="space-y-4">
                                    {/* Comment Input */}
                                    <div className="flex gap-3">
                                        <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                                            <User className="h-4 w-4 text-primary" />
                                        </div>
                                        <div className="flex-1 space-y-2">
                                            <input
                                                className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                                                placeholder="Add a comment..."
                                                value={newComment}
                                                onChange={(e) => setNewComment(e.target.value)}
                                                onKeyDown={(e) => {
                                                    if (e.key === "Enter") handleAddComment()
                                                }}
                                            />
                                            <Button
                                                size="sm"
                                                className="h-7 px-3 text-xs"
                                                variant="secondary"
                                                onClick={handleAddComment}
                                                disabled={!newComment.trim() || commentLoading}
                                            >
                                                {commentLoading ? "Posting..." : "Comment"}
                                            </Button>
                                        </div>
                                    </div>

                                    {/* Comments List */}
                                    <div className="space-y-4 pl-11">
                                        {initialCommentsLoading ? (
                                            <CommentSkeleton />
                                        ) : comments.length === 0 ? (
                                            <div className="text-sm text-muted-foreground italic">No comments yet.</div>
                                        ) : (
                                            comments.map((comment: any) => (
                                                <div key={comment.id} className="space-y-1">
                                                    <div className="flex items-center gap-2">
                                                        <span className="text-sm font-medium">{comment.user?.name || "User"}</span>
                                                        <span className="text-xs text-muted-foreground">{new Date(comment.createdAt).toLocaleDateString()}</span>
                                                    </div>
                                                    <p className="text-sm text-muted-foreground">{comment.content}</p>
                                                </div>
                                            ))
                                        )}
                                    </div>
                                </div>
                            </section>
                        </TabsContent>
                    </Tabs>
                </div>
            </SheetContent>
        </Sheet>
    )
}
