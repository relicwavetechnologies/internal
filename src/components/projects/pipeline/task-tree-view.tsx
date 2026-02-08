"use client"

import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible'
import { Button } from '@/components/ui/button'
import { ChevronRight, Plus } from 'lucide-react'
import { TaskItem } from '../tasks/task-item'
import { Badge } from '@/components/ui/badge'
import { useState } from 'react'
import { cn } from '@/lib/utils'
import { CreateSubtaskDialog } from '../tasks/create-subtask-dialog'
import { useRouter } from 'next/navigation'

interface TaskTreeViewProps {
  task: any
  depth: number
  maxDepth: number
  projectId: string
  employees: any[]
  onTaskClick?: (task: any) => void
}

export function TaskTreeView({ task, depth, maxDepth, projectId, employees, onTaskClick }: TaskTreeViewProps) {
  const router = useRouter()
  const [isOpen, setIsOpen] = useState(true)
  const [showSubtaskDialog, setShowSubtaskDialog] = useState(false)
  const hasChildren = task.children?.length > 0
  const canAddSubtask = depth < maxDepth

  return (
    <div className="space-y-1">
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <div
          className={cn(
            "flex items-center gap-2 rounded p-2 hover:bg-muted/50 group",
            depth > 0 && "border-l-2 border-border/30"
          )}
          style={{ marginLeft: `${depth * 16}px` }}
        >
          {hasChildren ? (
            <CollapsibleTrigger asChild>
              <Button variant="ghost" size="icon" className="h-5 w-5 shrink-0">
                <ChevronRight className={cn(
                  "h-3 w-3 transition-transform",
                  isOpen && "rotate-90"
                )} />
              </Button>
            </CollapsibleTrigger>
          ) : (
            <div className="w-5 h-5 shrink-0" />
          )}

          <div className="flex-1 min-w-0">
            <TaskItem task={task} onClick={() => onTaskClick?.(task)} />
          </div>

          {task.version !== 'NONE' && (
            <Badge variant="outline" className="text-xs shrink-0">
              {task.version}
            </Badge>
          )}

          {canAddSubtask && (
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity shrink-0"
              title="Add subtask"
              onClick={(e) => {
                e.stopPropagation()
                setShowSubtaskDialog(true)
              }}
            >
              <Plus className="h-3 w-3" />
            </Button>
          )}
        </div>

        {hasChildren && (
          <CollapsibleContent className="space-y-1">
            {task.children.map((child: any) => (
              <TaskTreeView
                key={child.id}
                task={child}
                depth={depth + 1}
                maxDepth={maxDepth}
                projectId={projectId}
                employees={employees}
                onTaskClick={onTaskClick}
              />
            ))}
          </CollapsibleContent>
        )}
      </Collapsible>

      <CreateSubtaskDialog
        parentTaskId={task.id}
        projectId={projectId}
        moduleId={task.moduleId}
        employees={employees}
        open={showSubtaskDialog}
        onOpenChange={setShowSubtaskDialog}
        onSuccess={() => router.refresh()}
      />
    </div>
  )
}
