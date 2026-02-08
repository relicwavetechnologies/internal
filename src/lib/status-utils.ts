import { TaskStatus } from "@prisma/client"

export function computeParentStatus(childStatuses: TaskStatus[]): TaskStatus {
  if (childStatuses.length === 0) return "TODO"

  const allCompleted = childStatuses.every(s => s === "COMPLETED")
  if (allCompleted) return "COMPLETED"

  const hasInProgress = childStatuses.some(s => s === "IN_PROGRESS" || s === "IN_REVIEW")
  if (hasInProgress) return "IN_PROGRESS"

  const anyCancelled = childStatuses.some(s => s === "CANCELLED")
  const noneInProgress = !hasInProgress
  if (anyCancelled && noneInProgress) return "CANCELLED"

  return "TODO"
}

export function computePhaseProgress(tasks: any[]) {
  const total = tasks.length
  const completed = tasks.filter(t => t.status === "COMPLETED").length
  const inProgress = tasks.filter(t => t.status === "IN_PROGRESS" || t.status === "IN_REVIEW").length
  const percentage = total > 0 ? Math.round((completed / total) * 100) : 0

  return { total, completed, inProgress, percentage }
}
