import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import Link from "next/link"
import { LayoutDashboard, Wallet, Receipt, Tags, LogOut } from "lucide-react"
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
      <aside className="w-full md:w-64 bg-gray-900 text-white p-6 flex flex-col">
        <div className="mb-8">
          <h1 className="text-2xl font-bold">Finance Tracker</h1>
          <p className="text-sm text-gray-400 mt-1">{session.user?.name}</p>
          <p className="text-xs text-gray-500">{session.user?.email}</p>
        </div>
        
        <nav className="flex-1 space-y-2">
          <Link href="/" className="flex items-center space-x-2 p-2 hover:bg-gray-800 rounded">
            <LayoutDashboard size={20} />
            <span>Dashboard</span>
          </Link>
          <Link href="/accounts" className="flex items-center space-x-2 p-2 hover:bg-gray-800 rounded">
            <Wallet size={20} />
            <span>Accounts</span>
          </Link>
          <Link href="/expenditures" className="flex items-center space-x-2 p-2 hover:bg-gray-800 rounded">
            <Receipt size={20} />
            <span>Expenditures</span>
          </Link>
          <Link href="/tags" className="flex items-center space-x-2 p-2 hover:bg-gray-800 rounded">
            <Tags size={20} />
            <span>Tags</span>
          </Link>
        </nav>

        <div className="mt-auto pt-6 border-t border-gray-800">
          <form
            action={async () => {
              "use server"
              await signOut()
            }}
          >
            <Button variant="ghost" className="w-full justify-start p-2 text-red-400 hover:text-red-300 hover:bg-gray-800">
              <LogOut size={20} className="mr-2" />
              Logout
            </Button>
          </form>
        </div>
      </aside>
      
      <main className="flex-1 bg-gray-50 dark:bg-gray-900 p-8 overflow-y-auto">
        {children}
      </main>
    </div>
  )
}
