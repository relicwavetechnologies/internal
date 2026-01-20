import type { NextAuthConfig } from "next-auth"

export const authConfig = {
  pages: {
    signIn: "/login",
    newUser: "/signup",
  },
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user
      const isOnDashboard = nextUrl.pathname.startsWith("/dashboard") || nextUrl.pathname === "/"
      const isOnAuth = nextUrl.pathname.startsWith("/login") || nextUrl.pathname.startsWith("/signup")

      if (isOnDashboard) {
        if (isLoggedIn) return true
        return false // Redirect unauthenticated users to login page
      } else if (isOnAuth) {
        if (isLoggedIn) {
          return Response.redirect(new URL("/", nextUrl))
        }
        return true
      }
      return true
    },
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id || ""
        token.companyId = user.companyId || ""
      }
      return token
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id
        session.user.companyId = token.companyId
      }
      return session
    },
  },
  providers: [], // Add providers with an empty array for now
} satisfies NextAuthConfig
