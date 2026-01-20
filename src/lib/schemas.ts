import { z } from "zod"

export const loginSchema = z.object({
  email: z.string().email({ message: "Invalid email address" }),
  password: z.string().min(6, { message: "Password must be at least 6 characters" }),
})

export const signupSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters" }),
  email: z.string().email({ message: "Invalid email address" }),
  password: z.string().min(6, { message: "Password must be at least 6 characters" }),
  companyName: z.string().min(2, { message: "Company name must be at least 2 characters" }),
})

export const accountSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters" }),
  type: z.enum(["Bank Account", "Cash", "Bitcoin Wallet", "Other"]),
  balance: z.coerce.number().min(0, { message: "Balance must be positive" }),
})

export const tagSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters" }),
})

export type LoginData = z.infer<typeof loginSchema>
export type SignupData = z.infer<typeof signupSchema>
export type AccountData = z.infer<typeof accountSchema>
export type TagData = z.infer<typeof tagSchema>
