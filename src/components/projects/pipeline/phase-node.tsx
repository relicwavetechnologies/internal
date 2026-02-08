"use client"

import { Handle, Position, NodeProps } from 'reactflow'
import { Badge } from '@/components/ui/badge'
import { CheckCircle2, Circle, Loader2, Clock } from 'lucide-react'
import { computePhaseProgress } from '@/lib/status-utils'
import { cn } from '@/lib/utils'

export function PhaseNode({ data }: NodeProps) {
  const { phase, onClick } = data

  const { total, completed, percentage } = computePhaseProgress(phase.tasks || [])

  // Get top-level tasks only (no parent)
  const topLevelTasks = (phase.tasks || []).filter((t: any) => !t.parentTaskId)
  const previewTasks = topLevelTasks.slice(0, 4)
  const remainingCount = topLevelTasks.length - previewTasks.length

  return (
    <div
      className="bg-card border-2 rounded-lg p-4 w-[320px] cursor-pointer hover:shadow-lg transition-all hover:scale-[1.02]"
      onClick={onClick}
    >
      <Handle type="target" position={Position.Left} className="w-2 h-2" />

      <div className="space-y-3">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-sm truncate pr-2">{phase.name}</h3>
          {percentage === 100 ? (
            <CheckCircle2 className="h-5 w-5 text-green-500 shrink-0" />
          ) : percentage > 0 ? (
            <Loader2 className="h-5 w-5 text-blue-500 shrink-0" />
          ) : (
            <Circle className="h-5 w-5 text-muted-foreground shrink-0" />
          )}
        </div>

        {/* Progress Bar */}
        <div className="space-y-1">
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>{completed}/{total} tasks</span>
            <span>{percentage}%</span>
          </div>
          <div className="h-2 bg-secondary rounded-full overflow-hidden">
            <div
              className="h-full bg-primary transition-all duration-500"
              style={{ width: `${percentage}%` }}
            />
          </div>
        </div>

        {/* Task Preview List */}
        {previewTasks.length > 0 && (
          <div className="space-y-1.5 pt-2 border-t">
            {previewTasks.map((task: any) => (
              <div
                key={task.id}
                className={cn(
                  "flex items-start gap-2 text-xs p-1.5 rounded hover:bg-muted/50 transition-colors",
                  task.status === 'COMPLETED' && "opacity-60"
                )}
              >
                {task.status === 'COMPLETED' ? (
                  <CheckCircle2 className="h-3.5 w-3.5 text-green-500 shrink-0 mt-0.5" />
                ) : task.status === 'IN_PROGRESS' || task.status === 'IN_REVIEW' ? (
                  <Clock className="h-3.5 w-3.5 text-blue-500 shrink-0 mt-0.5" />
                ) : (
                  <Circle className="h-3.5 w-3.5 text-muted-foreground shrink-0 mt-0.5" />
                )}
                <span className={cn(
                  "flex-1 line-clamp-2 leading-tight",
                  task.status === 'COMPLETED' && "line-through text-muted-foreground"
                )}>
                  {task.title}
                </span>
              </div>
            ))}

            {remainingCount > 0 && (
              <div className="text-xs text-muted-foreground text-center pt-1 font-medium">
                ...and {remainingCount} more
              </div>
            )}
          </div>
        )}
      </div>

      <Handle type="source" position={Position.Right} className="w-2 h-2" />
    </div>
  )
}
