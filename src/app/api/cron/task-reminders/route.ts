import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { sendTaskDeadlineReminder } from '@/lib/email'
import { addDays, startOfDay, endOfDay, isPast } from 'date-fns'

export async function GET(request: Request) {
  try {
    // Verify cron secret for security
    const authHeader = request.headers.get('authorization')
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const now = new Date()
    const tomorrow = addDays(now, 1)
    const threeDaysFromNow = addDays(now, 3)

    // Find tasks that need reminders
    const tasksNeedingReminders = await db.task.findMany({
      where: {
        status: {
          in: ['TODO', 'IN_PROGRESS'],
        },
        dueDate: {
          not: null,
        },
        OR: [
          // Overdue tasks
          {
            dueDate: {
              lt: now,
            },
          },
          // Due today
          {
            dueDate: {
              gte: startOfDay(now),
              lte: endOfDay(now),
            },
          },
          // Due tomorrow
          {
            dueDate: {
              gte: startOfDay(tomorrow),
              lte: endOfDay(tomorrow),
            },
          },
          // Due in 3 days
          {
            dueDate: {
              gte: startOfDay(threeDaysFromNow),
              lte: endOfDay(threeDaysFromNow),
            },
          },
        ],
      },
      include: {
        project: true,
        assignees: {
          include: {
            employee: true,
          },
        },
      },
    })

    const emailsSent = []
    const errors = []

    for (const task of tasksNeedingReminders) {
      if (!task.dueDate) continue

      const daysUntilDue = Math.ceil(
        (task.dueDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
      )
      const isOverdue = isPast(task.dueDate)

      // Send reminder to each assignee
      for (const assignee of task.assignees) {
        if (!assignee.employee.email) continue

        try {
          await sendTaskDeadlineReminder({
            employeeEmail: assignee.employee.email,
            employeeName: assignee.employee.name,
            taskTitle: task.title,
            taskDescription: task.description,
            projectName: task.project.name,
            dueDate: task.dueDate,
            daysUntilDue,
            taskId: task.id,
            isOverdue,
          })

          emailsSent.push({
            task: task.title,
            employee: assignee.employee.name,
            daysUntilDue,
            isOverdue,
          })
        } catch (error) {
          console.error(`Failed to send reminder for task ${task.id} to ${assignee.employee.email}:`, error)
          errors.push({
            task: task.id,
            employee: assignee.employee.email,
            error: error instanceof Error ? error.message : 'Unknown error',
          })
        }
      }
    }

    return NextResponse.json({
      success: true,
      emailsSent: emailsSent.length,
      errors: errors.length,
      details: {
        sent: emailsSent,
        errors,
      },
    })
  } catch (error) {
    console.error('Task reminders cron error:', error)
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}
