import { db } from "@/lib/db"
import { notFound } from "next/navigation"
import { ProjectSidebar } from "@/components/projects/project-sidebar"

export default async function ProjectLayout({
  children,
  params,
}: {
  children: React.ReactNode
  params: Promise<{ id: string }>
}) {
  const { id } = await params

  const project = await db.project.findUnique({
    where: { id },
    select: { id: true, name: true }
  })

  if (!project) {
    notFound()
  }

  return (
    // Constrain height to viewport minus header/padding estimates to prevent double scrollbars
    // The parent AdminLayout has padding, so we try to fit within that.
    // Full height and width layout for "App-like" feel
    <div className="flex h-full w-full overflow-hidden bg-background">
      <ProjectSidebar projectId={project.id} projectName={project.name} />
      <main className="flex-1 overflow-y-auto bg-background">
        <div className="h-full w-full p-6">
          {children}
        </div>
      </main>
    </div>
  )
}
