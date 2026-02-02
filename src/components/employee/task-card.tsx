"use client"

import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card"
import { TaskStatusBadge } from "@/components/tasks/task-status-badge"
import { TaskPriorityBadge } from "@/components/tasks/task-priority-badge"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Calendar, CheckCircle } from "lucide-react"
import { format } from "date-fns"
import type { Task, Project } from "@prisma/client"
import { markTaskComplete } from "@/actions/employee-tasks"
import { toast } from "sonner"
import { useState } from "react"
import { DocumentUploadDialog } from "@/components/projects/document-upload-dialog"

type TaskWithProject = Task & {
  project: Project
}

export function EmployeeTaskCard({ task }: { task: TaskWithProject }) {
  const [isCompleting, setIsCompleting] = useState(false)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [completionProof, setCompletionProof] = useState("")
  const [completionPrLinks, setCompletionPrLinks] = useState("")

  const handleComplete = async () => {
    if (task.status === 'COMPLETED' || task.status === 'IN_REVIEW') return

    setIsCompleting(true)
    try {
      const result = await markTaskComplete(task.id, completionProof, completionPrLinks)

      if (result?.error) {
        toast.error(result.error)
      } else {
        toast.success("Task submitted for review")
        setIsDialogOpen(false)
        setCompletionProof("")
        setCompletionPrLinks("")
      }
    } catch (error) {
      toast.error("Something went wrong")
    } finally {
      setIsCompleting(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between gap-2">
          <div className="space-y-1 flex-1">
            <div className="text-sm text-muted-foreground mb-1">
              {task.project.name}
            </div>
            <CardTitle className="text-base">{task.title}</CardTitle>
            {task.description && (
              <CardDescription className="line-clamp-2 text-sm">
                {task.description}
              </CardDescription>
            )}
          </div>
          <div className="flex gap-2">
            <TaskPriorityBadge priority={task.priority} />
            <TaskStatusBadge status={task.status} />
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          {task.dueDate && (
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              <span>Due: {format(new Date(task.dueDate), "MMM d, yyyy")}</span>
            </div>
          )}
        </div>
      </CardContent>
      {task.status !== 'COMPLETED' && task.status !== 'CANCELLED' && (
        <CardFooter>
          {task.status === 'IN_REVIEW' ? (
            <Button className="w-full" variant="secondary" disabled>
              Waiting for review
            </Button>
          ) : (
            <>
              <Button
                onClick={() => setIsDialogOpen(true)}
                disabled={isCompleting}
                className="w-full"
                variant="default"
              >
                <CheckCircle className="h-4 w-4 mr-2" />
                Submit for Review
              </Button>

              <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Submit Proof of Work</DialogTitle>
                    <DialogDescription>
                      Add a short summary of what you completed and attach any supporting files or links.
                    </DialogDescription>
                  </DialogHeader>

                  <div className="space-y-3">
                    <div className="space-y-2">
                      <Label htmlFor={`proof-${task.id}`}>Proof summary</Label>
                      <Textarea
                        id={`proof-${task.id}`}
                        placeholder="Describe what you completed, links, environments, or notes for review."
                        value={completionProof}
                        onChange={(e) => setCompletionProof(e.target.value)}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor={`pr-links-${task.id}`}>PR links (optional)</Label>
                      <Textarea
                        id={`pr-links-${task.id}`}
                        placeholder="Paste one or more PR links (one per line)."
                        value={completionPrLinks}
                        onChange={(e) => setCompletionPrLinks(e.target.value)}
                        className="min-h-[60px]"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Attachments (optional)</Label>
                      <DocumentUploadDialog
                        projectId={task.projectId}
                        taskId={task.id}
                        trigger={
                          <Button variant="outline" size="sm">
                            Add Proof Attachment
                          </Button>
                        }
                      />
                    </div>
                  </div>

                  <DialogFooter>
                    <Button
                      onClick={handleComplete}
                      disabled={isCompleting}
                    >
                      {isCompleting ? "Submitting..." : "Submit for Review"}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </>
          )}
        </CardFooter>
      )}
    </Card>
  )
}
