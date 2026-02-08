import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import Link from "next/link"
import { LayoutDashboard, FileText, MessageSquare, LogOut, DollarSign } from "lucide-react"
import { Button } from "@/components/ui/button"
import { signOut } from "@/lib/auth"
import { ModeToggle } from "@/components/theme-toggle"
import { db } from "@/lib/db"

export async function ClientLayoutWrapper({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await auth()

  if (!session) {
    redirect("/client/login")
  }

  // Only allow client users
  if (session.user.userType !== 'CLIENT') {
    redirect("/admin")
  }

  // Get client data
  const client = await db.client.findUnique({
    where: { id: session.user.id },
    include: {
      projects: {
        select: { id: true, name: true },
      },
    },
  })

  return (
    <div className="flex min-h-screen flex-col md:flex-row bg-background">
      <aside className="w-full md:w-64 border-r border-border p-6 flex flex-col z-50 relative bg-background">
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <h1 className="text-2xl font-bold">
              Client Portal
            </h1>
            <ModeToggle />
          </div>
          <p className="text-sm text-muted-foreground mt-2">{session.user?.name}</p>
          <p className="text-xs text-muted-foreground/70">{session.user?.email}</p>
        </div>

        <nav className="flex-1 space-y-1">
          <Link href="/client" className="flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-md transition-colors hover:bg-accent">
            <LayoutDashboard className="h-4 w-4" />
            <span>Dashboard</span>
          </Link>

          {client?.projects && client.projects.length > 0 && (
            <>
              <div className="px-3 py-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider mt-4">
                Your Project
              </div>
              {client.projects.map((project) => (
                <div key={project.id} className="space-y-1">
                  <Link
                    href={`/client/${project.id}`}
                    className="flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-md transition-colors hover:bg-accent"
                  >
                    <LayoutDashboard className="h-4 w-4" />
                    <span>{project.name}</span>
                  </Link>
                  <Link
                    href={`/client/${project.id}?tab=documents`}
                    className="flex items-center gap-3 px-6 py-1.5 text-sm rounded-md transition-colors hover:bg-accent text-muted-foreground"
                  >
                    <FileText className="h-3.5 w-3.5" />
                    <span>Documents</span>
                  </Link>
                  <Link
                    href={`/client/${project.id}?tab=payments`}
                    className="flex items-center gap-3 px-6 py-1.5 text-sm rounded-md transition-colors hover:bg-accent text-muted-foreground"
                  >
                    <DollarSign className="h-3.5 w-3.5" />
                    <span>Payments</span>
                  </Link>
                  <Link
                    href={`/client/${project.id}?tab=comments`}
                    className="flex items-center gap-3 px-6 py-1.5 text-sm rounded-md transition-colors hover:bg-accent text-muted-foreground"
                  >
                    <MessageSquare className="h-3.5 w-3.5" />
                    <span>Comments</span>
                  </Link>
                </div>
              ))}
            </>
          )}
        </nav>

        <div className="mt-auto pt-6 border-t">
          <form
            action={async () => {
              "use server"
              await signOut({ redirectTo: "/client/login" })
            }}
          >
            <Button
              type="submit"
              variant="ghost"
              className="w-full justify-start gap-3 px-3 py-2 text-sm font-medium text-destructive hover:text-destructive hover:bg-destructive/10 rounded-md"
            >
              <LogOut className="h-4 w-4" />
              Logout
            </Button>
          </form>
        </div>
      </aside>

      <main className="flex-1 p-6 md:p-8 overflow-y-auto">
        <div className="max-w-7xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  )
}
