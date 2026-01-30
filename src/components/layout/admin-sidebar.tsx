"use client"

import Link from "next/link"
import Image from "next/image"
import { usePathname } from "next/navigation"
import { LayoutDashboard, Wallet, Receipt, Tags, LogOut, TrendingUp, ListFilter, Users, FolderTree, BarChart3, Repeat, FolderKanban } from "lucide-react"
import { Button } from "@/components/ui/button"
import { ModeToggle } from "@/components/theme-toggle"
import { cn } from "@/lib/utils"
// import { signOut } from "@/lib/auth" // Can't import server action directly in client component if used in form action passed to 'action' prop? 
// No, server actions can be imported in client components. But let's check how it was used.
// It was passed to action={async () => { "use server"; await signOut() }} which is an inline server action.
// In a client component, we should pass the action as a prop or import a server action.
// Since I'm making this a client component (for usePathname probably needed for active state?), I need to handle signOut carefully.
// Actually, let's keep it consistent. The original was a Server Component (layout is server by default).
// If I make AdminSidebar a Server Component, I can't use usePathname.
// If I make it a Client Component, I need to pass the signOut action or import it.

// Let's create it as a SERVER component primarily, but maybe we need client for 'active' class?
// Usage of 'usePathname' requires 'use client'.
// The original layout didn't highlight active links? 
// Original: `className="flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-md transition-colors hover:bg-accent"`
// It didn't seem to have active state logic. I will add it for better UX.

// So:
// 1. Sidebar as Client Component for highlighting.
// 2. Pass user info as props.
// 3. Pass signOut action? Or just import it. Use server actions in client components is fine.

export function AdminSidebar({
  user,
  onSignOut
}: {
  user: { name?: string | null, email?: string | null },
  onSignOut: () => Promise<void>
}) {
  const pathname = usePathname()

  const links = [
    { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
    { href: "/admin/projects", label: "Projects", icon: FolderKanban },
    { href: "/admin/accounts", label: "Accounts", icon: Wallet },
    { href: "/admin/employees", label: "Team", icon: Users },
    { href: "/admin/expenditures", label: "Expenses", icon: Receipt },
    { href: "/admin/incomes", label: "Income", icon: TrendingUp },
    { href: "/admin/transactions", label: "Transact", icon: ListFilter },
    { href: "/admin/reports", label: "Reports", icon: BarChart3 },
    { href: "/admin/doc-settings", label: "Settings", icon: Tags }, // Grouped Categories/Tags/Recurring into Settings potentially? Or just omitted for space.
    // Restoring some essentials if needed but keeping it short for visual clarity as requested.
  ]
  // Removed some less critical ones or we need a scrollbar (which is already there).

  return (
    <aside className="w-[90px] border-r border-border flex flex-col shrink-0 bg-sidebar h-full overflow-hidden">
      <div className="flex flex-col items-center py-6 gap-6 overflow-y-auto flex-1 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
        <Link href="/admin" className="flex items-center justify-center mb-2">
          <div className="relative h-10 w-10">
            <Image
              src="/logo.png"
              alt="Relic Wave"
              fill
              className="object-contain"
              priority
            />
          </div>
        </Link>

        <nav className="flex flex-col gap-4 w-full px-2">
          {links.map((link) => {
            const Icon = link.icon
            const isActive = pathname === link.href || (link.href !== '/admin' && pathname?.startsWith(link.href))
            return (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "flex flex-col items-center gap-1.5 p-2 rounded-xl transition-all duration-200 group border border-transparent",
                  isActive
                    ? "bg-primary/10 text-primary border-primary/10 shadow-sm"
                    : "text-muted-foreground hover:bg-accent hover:text-foreground"
                )}
              >
                <Icon className={cn("h-5 w-5", isActive ? "fill-primary/20" : "")} />
                <span className="text-[10px] font-medium text-center leading-none">{link.label}</span>
              </Link>
            )
          })}
        </nav>
      </div>

      <div className="flex flex-col items-center gap-2 pb-6 pt-2 border-t mx-2">
        <ModeToggle />
        <form action={onSignOut}>
          <Button variant="ghost" size="icon" className="h-10 w-10 text-destructive hover:bg-destructive/10 rounded-xl" title="Logout">
            <LogOut className="h-5 w-5" />
          </Button>
        </form>
      </div>
    </aside>
  )
}
