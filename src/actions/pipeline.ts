"use server"

import { db } from "@/lib/db"
import { revalidatePath } from "next/cache"

export async function seedPipelinePhases(projectId: string) {
  // Create 5 modules (phases)
  const phases = [
    {
      name: "Planning & Alignment",
      order: 0,
      tasks: [
        { title: "User flow definition", taskGroup: "Planning" },
        { title: "Core features (in/out scope)", taskGroup: "Planning" },
        { title: "Roles & permissions", taskGroup: "Planning" },
        { title: "Milestones & timelines", taskGroup: "Planning" },
      ]
    },
    {
      name: "Foundation Sprint",
      order: 1,
      tasks: [
        { title: "Basic authentication", taskGroup: "Backend" },
        { title: "Core database structure", taskGroup: "Backend" },
        { title: "API contracts", taskGroup: "Backend" },
        { title: "Repo setup", taskGroup: "DevOps" },
        { title: "Environments (dev/staging)", taskGroup: "DevOps" },
        { title: "CI/CD pipeline", taskGroup: "DevOps" },
        { title: "Secure access from Day 1", taskGroup: "DevOps" },
        { title: "5-7 key screens", taskGroup: "Design" },
        { title: "Layout & structure", taskGroup: "Design" },
      ]
    },
    {
      name: "Build Phase",
      order: 2,
      tasks: [
        { title: "Build real screens", taskGroup: "Frontend" },
        { title: "Expand APIs", taskGroup: "Backend" },
        { title: "Refine flows based on usage", taskGroup: "Design" },
      ]
    },
    {
      name: "Stabilization",
      order: 3,
      tasks: [
        { title: "Bug fixes", taskGroup: "Quality" },
        { title: "Permissions & edge cases", taskGroup: "Permissions" },
        { title: "Performance checks", taskGroup: "Performance" },
        { title: "Security validation", taskGroup: "Security" },
      ]
    },
    {
      name: "Delivery & Handover",
      order: 4,
      tasks: [
        { title: "Final demo", taskGroup: "Delivery" },
        { title: "Documentation", taskGroup: "Delivery" },
        { title: "Knowledge transfer", taskGroup: "Delivery" },
        { title: "Post-delivery support discussion", taskGroup: "Delivery" },
      ]
    }
  ]

  for (const phase of phases) {
    const module = await db.module.create({
      data: {
        name: phase.name,
        projectId,
        order: phase.order,
      }
    })

    for (const task of phase.tasks) {
      await db.task.create({
        data: {
          title: task.title,
          projectId,
          moduleId: module.id,
          taskGroup: task.taskGroup,
          status: "TODO",
          priority: "MEDIUM",
        }
      })
    }
  }

  revalidatePath(`/admin/projects/${projectId}/tasks`)
  return { success: true }
}

export async function getPipelineData(projectId: string, isClientView = false) {
  const modules = await db.module.findMany({
    where: { projectId },
    include: {
      tasks: {
        where: isClientView ? { isClientVisible: true } : {},
        include: {
          assignees: {
            include: { employee: true }
          },
          children: {
            where: isClientView ? { isClientVisible: true } : {},
            include: {
              assignees: {
                include: { employee: true }
              }
            }
          }
        },
        orderBy: { createdAt: 'desc' }
      }
    },
    orderBy: { order: 'asc' }
  })

  return modules
}
