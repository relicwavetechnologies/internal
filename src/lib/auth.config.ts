import type { NextAuthConfig } from "next-auth"

export const authConfig = {
  pages: {
    signIn: "/login",
    newUser: "/signup",
  },
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user
      const userType = auth?.user?.userType

      const isAdminRoute = nextUrl.pathname.startsWith('/admin')
      const isEmployeeRoute = nextUrl.pathname.startsWith('/employee')
      const isClientRoute = nextUrl.pathname.startsWith('/client') && !nextUrl.pathname.startsWith('/client/login') && !nextUrl.pathname.startsWith('/client/auth')
      const isDashboardRoute = nextUrl.pathname.startsWith('/dashboard')
      const isAuthPage = nextUrl.pathname.startsWith('/login') || nextUrl.pathname.startsWith('/signup')
      const isClientAuthPage = nextUrl.pathname.startsWith('/client/login') || nextUrl.pathname.startsWith('/client/auth')

      if (!isLoggedIn) {
        if (isAuthPage || isClientAuthPage) return true
        return false // Redirect to /login
      }

      if (isAuthPage) {
        // Redirect logged-in users to their dashboard
        if (userType === 'ADMIN') return Response.redirect(new URL('/admin', nextUrl))
        if (userType === 'EMPLOYEE') return Response.redirect(new URL('/employee', nextUrl))
        if (userType === 'CLIENT') return Response.redirect(new URL('/client', nextUrl))
      }

      // Route based on userType - RESTRICTIONS REMOVED AS REQUESTED
      // if (isAdminRoute && userType !== 'ADMIN') return false
      // if (isEmployeeRoute && userType !== 'EMPLOYEE') return false
      // if (isClientRoute && userType !== 'CLIENT') return false

      // Handle old /dashboard routes - redirect to /admin
      if (isDashboardRoute && userType === 'ADMIN') {
        return Response.redirect(new URL(nextUrl.pathname.replace('/dashboard', '/admin'), nextUrl))
      }

      // Redirect root to appropriate dashboard
      if (nextUrl.pathname === '/') {
        if (userType === 'ADMIN') return Response.redirect(new URL('/admin', nextUrl))
        if (userType === 'EMPLOYEE') return Response.redirect(new URL('/employee', nextUrl))
        if (userType === 'CLIENT') return Response.redirect(new URL('/client', nextUrl))
      }

      return true
    },
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id || ""
        token.companyId = user.companyId || ""
        token.userType = user.userType
        token.employeeId = user.employeeId
      }
      return token
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id
        session.user.companyId = token.companyId
        session.user.userType = token.userType
        session.user.employeeId = token.employeeId
      }
      return session
    },
  },
  providers: [], // Add providers with an empty array for now
} satisfies NextAuthConfig
