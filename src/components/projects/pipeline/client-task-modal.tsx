"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { CheckCircle2, Clock, Circle } from 'lucide-react'

export function ClientTaskModal({ task, isOpen, onClose }: any) {
  if (!task) return null

  const statusColors = {
    TODO: "bg-slate-100 text-slate-800",
    IN_PROGRESS: "bg-blue-100 text-blue-800",
    IN_REVIEW: "bg-purple-100 text-purple-800",
    COMPLETED: "bg-green-100 text-green-800",
    CANCELLED: "bg-red-100 text-red-800",
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 flex-wrap">
            <span>{task.title}</span>
            <Badge className={statusColors[task.status as keyof typeof statusColors]}>
              {task.status.replace('_', ' ')}
            </Badge>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <h4 className="text-sm font-medium mb-2">Description</h4>
            <p className="text-sm text-muted-foreground">
              {task.description || "No description provided"}
            </p>
          </div>

          {task.dueDate && (
            <div className="flex items-center gap-2 text-sm">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <span>Due: {new Date(task.dueDate).toLocaleDateString()}</span>
            </div>
          )}

          {task.children?.filter((c: any) => c.isClientVisible).length > 0 && (
            <div>
              <h4 className="text-sm font-medium mb-2">Subtasks</h4>
              <div className="space-y-2">
                {task.children
                  .filter((c: any) => c.isClientVisible)
                  .map((subtask: any) => (
                    <div key={subtask.id} className="flex items-center gap-2 text-sm p-2 rounded bg-muted/50">
                      {subtask.status === 'COMPLETED' ? (
                        <CheckCircle2 className="h-4 w-4 text-green-500 shrink-0" />
                      ) : (
                        <Circle className="h-4 w-4 text-muted-foreground shrink-0" />
                      )}
                      <span className="flex-1">{subtask.title}</span>
                    </div>
                  ))}
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
