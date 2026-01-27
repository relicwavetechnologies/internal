import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { signOut } from "@/lib/auth"
import { ModeToggle } from "@/components/theme-toggle"
import { AdminSidebar } from "@/components/layout/admin-sidebar"

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await auth()

  if (!session) {
    redirect("/login")
  }

  // Only allow admin users
  if (session.user.userType !== 'ADMIN') {
    redirect("/employee")
  }

  return (
    <div className="flex h-screen overflow-hidden flex-col md:flex-row bg-background">
      <AdminSidebar 
        user={session.user} 
        onSignOut={async () => {
          "use server"
          await signOut()
        }} 
      />

      <main className="flex-1 overflow-y-auto p-6 md:p-8">
         {children}
      </main>
    </div>
  )
}
