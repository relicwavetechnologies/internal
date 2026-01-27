"use client"

import { CreateStoryDialog } from "@/components/projects/tasks/create-story-dialog"
import { StoryGroup } from "@/components/projects/tasks/story-group"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Layers, Network, List } from "lucide-react"
import { Button } from "@/components/ui/button"
import * as React from "react"
import { TaskSheet } from "./tasks/task-sheet"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Filter, User, X } from "lucide-react"
import { NetworkGraph } from "./tasks/graph/network-graph"
import { TaskListSkeleton, KanbanSkeleton, GraphSkeleton } from "@/components/projects/skeletons"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { RefreshCw } from "lucide-react"

interface TasksTabProps {
    projectId: string
    modules: any[]
    employees: any[]
}

export function TasksTab({ projectId, modules, employees }: TasksTabProps) {
    const router = useRouter()
    const [selectedTask, setSelectedTask] = React.useState<any>(null)
    const [view, setView] = React.useState<"list" | "graph">("list")
    const [statusFilter, setStatusFilter] = React.useState<string>("ALL")
    const [assigneeFilter, setAssigneeFilter] = React.useState<string>("ALL")
    const [isRefreshing, setIsRefreshing] = React.useState(false)

    const handleRefresh = async () => {
        setIsRefreshing(true)
        await router.refresh()
        setTimeout(() => {
            setIsRefreshing(false)
            toast.success("Tasks refreshed")
        }, 500)
    }

    // Filter Logic
    const filteredModules = React.useMemo(() => {
        if (statusFilter === "ALL" && assigneeFilter === "ALL") return modules

        return modules.map(module => ({
            ...module,
            tasks: module.tasks.filter((task: any) => {
                const statusMatch = statusFilter === "ALL" ? true : task.status === statusFilter
                const assigneeMatch = assigneeFilter === "ALL" ? true : task.assignees.some((a: any) => a.employeeId === assigneeFilter)
                return statusMatch && assigneeMatch
            })
        })).filter(module => module.tasks.length > 0)
    }, [modules, statusFilter, assigneeFilter])

    const activeFiltersCount = (statusFilter !== "ALL" ? 1 : 0) + (assigneeFilter !== "ALL" ? 1 : 0)

    const clearFilters = () => {
        setStatusFilter("ALL")
        setAssigneeFilter("ALL")
    }

    return (
        <div className="space-y-6 flex flex-col h-[calc(100vh-14rem)]">
            <div className="flex flex-col gap-4 pb-4 border-b">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div>
                            <h2 className="text-xl font-semibold tracking-tight">Project Tasks</h2>
                            <p className="text-sm text-muted-foreground mt-1">Manage stories and track progress.</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        <div className="flex items-center bg-muted p-1 rounded-lg border">
                            <Button
                                variant={view === "list" ? "secondary" : "ghost"}
                                size="sm"
                                className="h-7 px-3 text-xs"
                                onClick={() => setView("list")}
                            >
                                <List className="mr-2 h-3.5 w-3.5" />
                                List
                            </Button>
                            <Button
                                variant={view === "graph" ? "secondary" : "ghost"}
                                size="sm"
                                className="h-7 px-3 text-xs"
                                onClick={() => setView("graph")}
                            >
                                <Network className="mr-2 h-3.5 w-3.5" />
                                Graph
                            </Button>
                        </div>

                        <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 hover:bg-muted"
                            onClick={handleRefresh}
                            disabled={isRefreshing}
                        >
                            <RefreshCw className={`h-4 w-4 text-muted-foreground ${isRefreshing ? "animate-spin" : ""}`} />
                        </Button>

                        <CreateStoryDialog projectId={projectId} />
                    </div>
                </div>

                {/* Filter Toolbar - Only show in List view for now */}
                {view === "list" && (
                    <div className="flex items-center gap-2">
                        <div className="flex items-center bg-background border rounded-lg p-1 gap-1 shadow-sm">
                            <Filter className="h-4 w-4 text-muted-foreground ml-2 mr-1" />
                            <Select value={statusFilter} onValueChange={setStatusFilter}>
                                <SelectTrigger className="h-7 w-[130px] border-none text-xs bg-transparent focus:ring-0">
                                    <SelectValue placeholder="Status" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="ALL">All Statuses</SelectItem>
                                    <SelectItem value="TODO">To Do</SelectItem>
                                    <SelectItem value="IN_PROGRESS">In Progress</SelectItem>
                                    <SelectItem value="IN_REVIEW">In Review</SelectItem>
                                    <SelectItem value="COMPLETED">Completed</SelectItem>
                                </SelectContent>
                            </Select>
                            <div className="w-[1px] h-4 bg-border mx-1" />
                            <User className="h-4 w-4 text-muted-foreground ml-1" />
                            <Select value={assigneeFilter} onValueChange={setAssigneeFilter}>
                                <SelectTrigger className="h-7 w-[140px] border-none text-xs bg-transparent focus:ring-0">
                                    <SelectValue placeholder="Assignee" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="ALL">All Assignees</SelectItem>
                                    {employees.map(emp => (
                                        <SelectItem key={emp.id} value={emp.id}>{emp.name}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        {activeFiltersCount > 0 && (
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={clearFilters}
                                className="h-8 text-xs text-muted-foreground hover:text-foreground"
                            >
                                <X className="h-3.5 w-3.5 mr-1" />
                                Clear Filters
                            </Button>
                        )}
                    </div>
                )}
            </div>

            <div className="flex-1 min-h-0 relative">
                {isRefreshing ? (
                    view === "list" ? (
                        <ScrollArea className="h-full -mx-4 px-4">
                            <TaskListSkeleton />
                        </ScrollArea>
                    ) : (
                        <GraphSkeleton />
                    )
                ) : view === "list" ? (
                    <ScrollArea className="h-full -mx-4 px-4">
                        <div className="space-y-8 pb-10">
                            {filteredModules.length === 0 ? (
                                <div className="flex flex-col items-center justify-center py-20 text-center space-y-4 rounded-lg border border-dashed bg-muted/10">
                                    <div className="p-4 rounded-full bg-primary/10 text-primary">
                                        <Filter className="h-8 w-8" />
                                    </div>
                                    <div className="space-y-1">
                                        <h3 className="font-semibold text-lg">No tasks found</h3>
                                        <p className="text-muted-foreground max-w-sm mx-auto">
                                            {statusFilter !== "ALL" || assigneeFilter !== "ALL"
                                                ? "Try adjusting your filters to see more tasks."
                                                : "Get started by creating a major story to group your tasks."}
                                        </p>
                                    </div>
                                    {statusFilter === "ALL" && assigneeFilter === "ALL" && (
                                        <CreateStoryDialog projectId={projectId} />
                                    )}
                                </div>
                            ) : (
                                <>
                                    {/* Active Stories */}
                                    {filteredModules
                                        .filter(m => m.tasks.length === 0 || m.tasks.some((t: any) => t.status !== "COMPLETED"))
                                        .map((module) => (
                                            <StoryGroup
                                                key={module.id}
                                                module={module}
                                                projectId={projectId}
                                                employees={employees}
                                            />
                                        ))
                                    }

                                    {/* Past Stories */}
                                    {filteredModules.some(m => m.tasks.length > 0 && m.tasks.every((t: any) => t.status === "COMPLETED")) && (
                                        <div className="space-y-4 pt-4">
                                            <div className="flex items-center gap-4">
                                                <div className="h-[1px] flex-1 bg-border/60" />
                                                <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Past Stories</span>
                                                <div className="h-[1px] flex-1 bg-border/60" />
                                            </div>

                                            <div className="opacity-75 hover:opacity-100 transition-opacity space-y-6">
                                                {filteredModules
                                                    .filter(m => m.tasks.length > 0 && m.tasks.every((t: any) => t.status === "COMPLETED"))
                                                    .map((module) => (
                                                        <StoryGroup
                                                            key={module.id}
                                                            module={module}
                                                            projectId={projectId}
                                                            employees={employees}
                                                        />
                                                    ))
                                                }
                                            </div>
                                        </div>
                                    )}
                                </>
                            )}
                        </div>
                    </ScrollArea>
                ) : (
                    <NetworkGraph
                        modules={filteredModules}
                        employees={employees}
                        onTaskClick={(task) => setSelectedTask(task)}
                    />
                )}
            </div>

            {/* Global Sheet for Task selections */}
            <TaskSheet
                task={selectedTask}
                isOpen={!!selectedTask}
                onClose={() => setSelectedTask(null)}
                onUpdate={() => {
                    router.refresh()
                    // Optionally close the sheet or keep it open depending on UX preference
                }}
                employees={employees}
            />
        </div>
    )
}
