'use client'

import { useState } from "react"
import { format } from "date-fns"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Calendar as CalendarIcon, Clock, Plus, GitCommitHorizontal, CheckCircle2, Circle, MoreHorizontal, Trash2, Edit2 } from "lucide-react"
import { createManualLog } from "@/actions/timeline"
import { deleteLog, updateLog } from "@/actions/timeline"
import { toast } from "sonner"
import { useRouter, useSearchParams } from "next/navigation"
import { DatePickerWithRange } from "@/components/ui/date-range-picker"
import { DateRange } from "react-day-picker"
import { X } from "lucide-react"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

interface TimelineViewProps {
    projectId: string
    projectStartDate: Date | null
    logs: any[]
}

export function TimelineView({ projectId, projectStartDate, logs }: TimelineViewProps) {
    const router = useRouter()
    const searchParams = useSearchParams()

    // Initialize date range from URL
    const [date, setDate] = useState<DateRange | undefined>(() => {
        const from = searchParams.get('from')
        const to = searchParams.get('to')
        if (from && to) {
            return { from: new Date(from), to: new Date(to) }
        }
        return undefined
    })

    const [openManual, setOpenManual] = useState(false)
    const [description, setDescription] = useState("")
    const [hours, setHours] = useState("")
    const [loading, setLoading] = useState(false)

    // Edit mode state
    const [editingLog, setEditingLog] = useState<any>(null)
    const [editDescription, setEditDescription] = useState("")
    const [editHours, setEditHours] = useState("")
    const [editOpen, setEditOpen] = useState(false)

    // Update URL when date changes
    const handleDateSelect = (newDate: DateRange | undefined) => {
        setDate(newDate)
        if (newDate?.from && newDate?.to) {
            const params = new URLSearchParams(searchParams)
            params.set('from', newDate.from.toISOString())
            params.set('to', newDate.to.toISOString())
            router.push(`?${params.toString()}`)
        }
    }

    const clearFilter = () => {
        setDate(undefined)
        router.push('progress')
    }

    // Group logs by date
    const groupedLogs = logs.reduce((acc: any, log) => {
        const dateKey = format(new Date(log.date), 'yyyy-MM-dd')
        if (!acc[dateKey]) acc[dateKey] = []
        acc[dateKey].push(log)
        return acc
    }, {})

    // Sort dates descending
    const sortedDates = Object.keys(groupedLogs).sort((a, b) => new Date(b).getTime() - new Date(a).getTime())

    const handleManualLog = async () => {
        if (!description.trim()) return
        setLoading(true)
        const res = await createManualLog({
            projectId,
            description,
            date: new Date(),
            hours: hours ? parseFloat(hours) : undefined
        })
        setLoading(false)
        if (res.success) {
            toast.success("Log added")
            setOpenManual(false)
            setDescription("")
            setHours("")
            router.refresh()
        } else {
            toast.error("Failed to add log")
        }
    }

    const handleDeleteLog = async (logId: string) => {
        if (!confirm("Are you sure you want to delete this log?")) return
        const res = await deleteLog(logId)
        if (res.success) {
            toast.success("Log deleted")
            router.refresh()
        } else {
            toast.error("Failed to delete log")
        }
    }

    const openEditDialog = (log: any) => {
        setEditingLog(log)
        setEditDescription(log.description)
        setEditHours(log.hoursSpent?.toString() || "")
        setEditOpen(true)
    }

    const handleUpdateLog = async () => {
        if (!editingLog || !editDescription.trim()) return
        setLoading(true)
        const res = await updateLog(editingLog.id, {
            description: editDescription,
            hours: editHours ? parseFloat(editHours) : undefined
        })
        setLoading(false)
        if (res.success) {
            toast.success("Log updated")
            setEditOpen(false)
            router.refresh()
        } else {
            toast.error("Failed to update log")
        }
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <DatePickerWithRange
                        date={date}
                        setDate={handleDateSelect}
                    />
                    {date && (
                        <Button variant="ghost" size="icon" onClick={clearFilter}>
                            <X className="h-4 w-4" />
                        </Button>
                    )}
                </div>
                <Dialog open={openManual} onOpenChange={setOpenManual}>
                    <DialogTrigger asChild>
                        <Button className="gap-2 shadow-sm">
                            <Plus className="h-4 w-4" />
                            Log Update
                        </Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Add Daily Log</DialogTitle>
                            <DialogDescription>
                                Manually log your work hours and activities for today.
                            </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4 pt-2">
                            <Textarea
                                placeholder="What did you work on today?"
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                            />
                            <Input
                                type="number"
                                placeholder="Hours spent (optional)"
                                value={hours}
                                onChange={(e) => setHours(e.target.value)}
                            />
                            <Button className="w-full" onClick={handleManualLog} disabled={loading}>
                                {loading ? "Saving..." : "Save Log"}
                            </Button>
                        </div>
                    </DialogContent>
                </Dialog>
            </div>

            {/* Edit Log Dialog */}
            <Dialog open={editOpen} onOpenChange={setEditOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Edit Log</DialogTitle>
                        <DialogDescription>
                            Update your log entry.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 pt-2">
                        <Textarea
                            placeholder="What did you work on?"
                            value={editDescription}
                            onChange={(e) => setEditDescription(e.target.value)}
                        />
                        <Input
                            type="number"
                            placeholder="Hours spent (optional)"
                            value={editHours}
                            onChange={(e) => setEditHours(e.target.value)}
                        />
                        <Button className="w-full" onClick={handleUpdateLog} disabled={loading}>
                            {loading ? "Saving..." : "Update Log"}
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>

            <div className="relative border-l-2 border-border/50 ml-4 space-y-8 pb-10">
                {/* Current Date / Today Marker usually goes top, logic handled by logs */}

                {sortedDates.map((date) => (
                    <div key={date} className="relative pl-8">
                        <span className="absolute -left-[9px] top-0 h-4 w-4 rounded-full bg-primary ring-4 ring-background" />
                        <h3 className="text-lg font-semibold tracking-tight mb-4">
                            {format(new Date(date), "MMMM d, yyyy")}
                        </h3>

                        <div className="space-y-4">
                            {groupedLogs[date].map((log: any) => (
                                <Card key={log.id} className="overflow-hidden border-none shadow-sm bg-card/50 backdrop-blur-sm hover:bg-card/80 transition-all">
                                    <div className="flex items-start gap-4 p-4">
                                        <Avatar className="h-8 w-8 mt-1 border">
                                            <AvatarImage src={`https://api.dicebear.com/7.x/initials/svg?seed=${log.employee.name}`} />
                                            <AvatarFallback>{log.employee.name[0]}</AvatarFallback>
                                        </Avatar>
                                        <div className="flex-1 space-y-1">
                                            <div className="flex items-center justify-between">
                                                <p className="text-sm font-medium leading-none">{log.employee.name}</p>
                                                <div className="flex items-center gap-2">
                                                    <span className="text-xs text-muted-foreground flex items-center gap-1">
                                                        {format(new Date(log.createdAt), "h:mm a")}
                                                    </span>
                                                    {log.source === 'MANUAL' && (
                                                        <DropdownMenu>
                                                            <DropdownMenuTrigger asChild>
                                                                <Button variant="ghost" size="icon" className="h-6 w-6">
                                                                    <MoreHorizontal className="h-3 w-3" />
                                                                </Button>
                                                            </DropdownMenuTrigger>
                                                            <DropdownMenuContent align="end">
                                                                <DropdownMenuItem onClick={() => openEditDialog(log)} className="gap-2">
                                                                    <Edit2 className="h-3 w-3" />
                                                                    Edit
                                                                </DropdownMenuItem>
                                                                <DropdownMenuItem onClick={() => handleDeleteLog(log.id)} className="gap-2 text-destructive">
                                                                    <Trash2 className="h-3 w-3" />
                                                                    Delete
                                                                </DropdownMenuItem>
                                                            </DropdownMenuContent>
                                                        </DropdownMenu>
                                                    )}
                                                </div>
                                            </div>
                                            <p className="text-sm text-muted-foreground leading-relaxed">
                                                {log.source === 'SYSTEM' ? (
                                                    <span className="italic text-primary/80">{log.description}</span>
                                                ) : log.description}
                                            </p>

                                            <div className="flex items-center gap-3 pt-2">
                                                {log.source === 'SYSTEM' && (
                                                    <Badge variant="outline" className="text-[10px] bg-primary/5 border-primary/20">System Event</Badge>
                                                )}
                                                {log.hoursSpent && (
                                                    <Badge variant="secondary" className="text-[10px] gap-1">
                                                        <Clock className="h-3 w-3" />
                                                        {log.hoursSpent}h
                                                    </Badge>
                                                )}
                                                {log.task && (
                                                    <Badge variant="outline" className="text-[10px] gap-1">
                                                        <CheckCircle2 className="h-3 w-3" />
                                                        {log.task.title}
                                                    </Badge>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </Card>
                            ))}
                        </div>
                    </div>
                ))}

                {projectStartDate && (
                    <div className="relative pl-8 pt-4">
                        <span className="absolute -left-[9px] top-0 h-4 w-4 rounded-full bg-muted-foreground/30 ring-4 ring-background" />
                        <div className="flex flex-col gap-1 text-muted-foreground">
                            <span className="font-semibold text-sm">Project Started</span>
                            <span className="text-xs">{format(new Date(projectStartDate), "MMMM d, yyyy")}</span>
                        </div>
                    </div>
                )}
            </div>

            {logs.length === 0 && !projectStartDate && (
                <div className="text-center py-12 text-muted-foreground">
                    No timeline events yet.
                </div>
            )}
        </div>
    )
}
