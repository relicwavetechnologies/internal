"use server"

import { signIn } from "@/lib/auth"
import { db } from "@/lib/db"
import { loginSchema, signupSchema, SignupData, LoginData } from "@/lib/schemas"
import bcrypt from "bcryptjs"
import { AuthError } from "next-auth"
import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"

export async function login(data: LoginData) {
  const validatedFields = loginSchema.safeParse(data)

  if (!validatedFields.success) {
    return { error: "Invalid fields" }
  }

  const { email, password } = validatedFields.data

  try {
    await signIn("credentials", {
      email,
      password,
      redirectTo: "/",
    })
  } catch (error) {
    if (error instanceof AuthError) {
      switch (error.type) {
        case "CredentialsSignin":
          return { error: "Invalid credentials" }
        default:
          return { error: "Something went wrong" }
      }
    }
    throw error
  }
}

export async function signup(data: SignupData) {
  const validatedFields = signupSchema.safeParse(data)

  if (!validatedFields.success) {
    return { error: "Invalid fields" }
  }

  const { name, email, password, companyName } = validatedFields.data

  // Check if user already exists
  const existingUser = await db.user.findUnique({
    where: { email },
  })

  if (existingUser) {
    return { error: "Email already in use" }
  }

  const hashedPassword = await bcrypt.hash(password, 10)

  try {
    await db.$transaction(async (tx: any) => {
      // Create company
      const company = await tx.company.create({
        data: {
          name: companyName,
        },
      })

      // Create user
      await tx.user.create({
        data: {
          name,
          email,
          password: hashedPassword,
          companyId: company.id,
        },
      })
    })
  } catch (error) {
    return { error: "Failed to create account" }
  }

  redirect("/login")
}
