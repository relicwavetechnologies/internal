import NextAuth from "next-auth"
import Credentials from "next-auth/providers/credentials"
import { z } from "zod"
import bcrypt from "bcryptjs"
import { db } from "@/lib/db"
import { authConfig } from "@/lib/auth.config"

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
})

export const { handlers, signIn, signOut, auth } = NextAuth({
  ...authConfig,
  providers: [
    Credentials({
      async authorize(credentials) {
        const validatedFields = loginSchema.safeParse(credentials)

        if (validatedFields.success) {
          const { email, password } = validatedFields.data

          const user = await db.user.findUnique({
            where: { email },
          })

          if (!user || !user.password) return null

          const passwordsMatch = await bcrypt.compare(password, user.password)

          if (passwordsMatch) {
            return {
              id: user.id,
              name: user.name,
              email: user.email,
              companyId: user.companyId,
            }
          }
        }

        return null
      },
    }),
  ],
})
