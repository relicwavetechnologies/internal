"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import {
  TrendingUp,
  FileText,
  BarChart3,
  Users,
  MessageSquare,
  ArrowLeft,
  Settings,
  CheckSquare
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"

interface ProjectSidebarProps {
  projectId: string
  projectName: string
}

export function ProjectSidebar({ projectId, projectName }: ProjectSidebarProps) {
  const pathname = usePathname()
  const baseUrl = `/admin/projects/${projectId}`

  const items = [
    {
      title: "Overview",
      href: baseUrl,
      icon: TrendingUp,
      exact: true
    },
    {
      title: "Documents",
      href: `${baseUrl}/documents`,
      icon: FileText
    },
    {
      title: "Tasks",
      href: `${baseUrl}/tasks`,
      icon: CheckSquare
    },
    {
      title: "Progress",
      href: `${baseUrl}/progress`,
      icon: BarChart3
    },
    {
      title: "Finances",
      href: `${baseUrl}/finances`,
      icon: TrendingUp
    },
    {
      title: "Team",
      href: `${baseUrl}/team`,
      icon: Users
    },
    {
      title: "Comments",
      href: `${baseUrl}/comments`,
      icon: MessageSquare
    },
  ]

  return (
    <aside className="w-56 bg-sidebar border-r border-border flex flex-col h-full shrink-0">
      <div className="p-4">
        <div className="flex items-center gap-2 mb-6">
          <Link href="/admin/projects">
            <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-accent -ml-2">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <span className="text-sm font-medium text-muted-foreground truncate">Back</span>
        </div>

        <div className="mb-6">
          <h2 className="text-lg font-semibold tracking-tight truncate" title={projectName}>
            {projectName}
          </h2>
          <p className="text-xs text-muted-foreground mt-1">Project Management</p>
        </div>

        <nav className="space-y-1">
          {items.map((item) => {
            const isActive = item.exact
              ? pathname === item.href
              : pathname?.startsWith(item.href)

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-md transition-colors",
                  isActive
                    ? "bg-primary/10 text-primary hover:bg-primary/20"
                    : "text-muted-foreground hover:bg-accent hover:text-foreground"
                )}
              >
                <item.icon className="h-4 w-4" />
                {item.title}
              </Link>
            )
          })}
        </nav>
      </div>

      <div className="mt-auto p-4">
        <Separator className="my-4" />
        <Link href={`${baseUrl}/settings`}>
          {/* Optional Settings link for future use */}
          <Button variant="ghost" className="w-full justify-start gap-3">
            <Settings className="h-4 w-4" />
            Settings
          </Button>
        </Link>
      </div>
    </aside>
  )
}
