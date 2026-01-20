import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import Link from "next/link"
import { LayoutDashboard, Wallet, Receipt, Tags, LogOut, TrendingUp, ListFilter, Users, FolderTree, BarChart3, Repeat } from "lucide-react"
import { Button } from "@/components/ui/button"
import { signOut } from "@/lib/auth"

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await auth()

  if (!session) {
    redirect("/login")
  }

  return (
    <div className="flex min-h-screen flex-col md:flex-row">
      <aside className="w-full md:w-64 bg-background border-r p-6 flex flex-col">
        <div className="mb-8">
          <h1 className="text-2xl font-bold">Finance Tracker</h1>
          <p className="text-sm text-muted-foreground mt-1">{session.user?.name}</p>
          <p className="text-xs text-muted-foreground">{session.user?.email}</p>
        </div>

        <nav className="flex-1 space-y-2">
          <Link href="/" className="flex items-center space-x-2 p-2 hover:bg-accent hover:text-accent-foreground rounded">
            <LayoutDashboard size={20} />
            <span>Dashboard</span>
          </Link>
          <Link href="/accounts" className="flex items-center space-x-2 p-2 hover:bg-accent hover:text-accent-foreground rounded">
            <Wallet size={20} />
            <span>Accounts</span>
          </Link>
          <Link href="/employees" className="flex items-center space-x-2 p-2 hover:bg-accent hover:text-accent-foreground rounded">
            <Users size={20} />
            <span>Employees</span>
          </Link>
          <Link href="/expenditures" className="flex items-center space-x-2 p-2 hover:bg-accent hover:text-accent-foreground rounded">
            <Receipt size={20} />
            <span>Expenditures</span>
          </Link>
          <Link href="/incomes" className="flex items-center space-x-2 p-2 hover:bg-accent hover:text-accent-foreground rounded">
            <TrendingUp size={20} />
            <span>Income</span>
          </Link>
          <Link href="/transactions" className="flex items-center space-x-2 p-2 hover:bg-accent hover:text-accent-foreground rounded">
            <ListFilter size={20} />
            <span>Transactions</span>
          </Link>
          <Link href="/categories" className="flex items-center space-x-2 p-2 hover:bg-accent hover:text-accent-foreground rounded">
            <FolderTree size={20} />
            <span>Categories</span>
          </Link>
          <Link href="/tags" className="flex items-center space-x-2 p-2 hover:bg-accent hover:text-accent-foreground rounded">
            <Tags size={20} />
            <span>Tags</span>
          </Link>
          <Link href="/recurring-transactions" className="flex items-center space-x-2 p-2 hover:bg-accent hover:text-accent-foreground rounded">
            <Repeat size={20} />
            <span>Recurring</span>
          </Link>
          <Link href="/reports" className="flex items-center space-x-2 p-2 hover:bg-accent hover:text-accent-foreground rounded">
            <BarChart3 size={20} />
            <span>Reports</span>
          </Link>
        </nav>

        <div className="mt-auto pt-6 border-t">
          <form
            action={async () => {
              "use server"
              await signOut()
            }}
          >
            <Button variant="ghost" className="w-full justify-start p-2 text-red-500 hover:text-red-400 hover:bg-accent">
              <LogOut size={20} className="mr-2" />
              Logout
            </Button>
          </form>
        </div>
      </aside>

      <main className="flex-1 bg-background p-8 overflow-y-auto">
        {children}
      </main>
    </div>
  )
}
