"use client"

import { useState } from 'react'
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Button } from '@/components/ui/button'
import { Plus } from 'lucide-react'
import { CreateTaskDialog } from '../tasks/create-task-dialog'
import { TaskTreeView } from './task-tree-view'
import { Separator } from '@/components/ui/separator'
import { TaskSheet } from '../tasks/task-sheet'
import { useRouter } from 'next/navigation'

interface PipelinePhaseDrawerProps {
  phase: any
  isOpen: boolean
  onClose: () => void
  projectId: string
  employees: any[]
}

export function PipelinePhaseDrawer({
  phase,
  isOpen,
  onClose,
  projectId,
  employees
}: PipelinePhaseDrawerProps) {
  const router = useRouter()
  const [selectedTask, setSelectedTask] = useState<any>(null)

  if (!phase) return null

  // Group tasks by taskGroup
  const groupedTasks = (phase.tasks || []).reduce((acc: any, task: any) => {
    // Only show top-level tasks (no parent)
    if (task.parentTaskId) return acc

    const group = task.taskGroup || "Ungrouped"
    if (!acc[group]) acc[group] = []
    acc[group].push(task)
    return acc
  }, {})

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent side="right" className="w-full sm:max-w-2xl">
        <SheetHeader>
          <SheetTitle className="text-2xl">{phase.name}</SheetTitle>
          <p className="text-sm text-muted-foreground mt-1">
            Manage tasks and subtasks for this phase
          </p>
        </SheetHeader>

        <ScrollArea className="h-[calc(100vh-10rem)] mt-6">
          <div className="space-y-6 pr-4">
            {Object.entries(groupedTasks).map(([groupName, tasks]: [string, any]) => (
              <div key={groupName} className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wider">
                    {groupName}
                  </h3>
                  <CreateTaskDialog
                    projectId={projectId}
                    moduleId={phase.id}
                    employees={employees}
                    trigger={
                      <Button variant="ghost" size="sm">
                        <Plus className="h-4 w-4 mr-1" />
                        Add Task
                      </Button>
                    }
                  />
                </div>

                <div className="space-y-2">
                  {tasks.map((task: any) => (
                    <TaskTreeView
                      key={task.id}
                      task={task}
                      depth={0}
                      maxDepth={3}
                      projectId={projectId}
                      employees={employees}
                      onTaskClick={(task) => setSelectedTask(task)}
                    />
                  ))}
                </div>

                <Separator />
              </div>
            ))}
          </div>
        </ScrollArea>
      </SheetContent>

      {/* Task Edit Sheet */}
      <TaskSheet
        task={selectedTask}
        isOpen={!!selectedTask}
        onClose={() => setSelectedTask(null)}
        onUpdate={() => {
          router.refresh()
          setSelectedTask(null)
        }}
        employees={employees}
      />
    </Sheet>
  )
}
