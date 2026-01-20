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

export const expenditureSchema = z.object({
  description: z.string().min(2, { message: "Description must be at least 2 characters" }),
  amount: z.coerce.number().positive({ message: "Amount must be positive" }),
  date: z.date({ message: "Date is required" }),
  accountId: z.string().min(1, { message: "Account is required" }),
  tagIds: z.array(z.string()).optional(),
})

export const incomeSchema = z.object({
  description: z.string().min(2, { message: "Description must be at least 2 characters" }),
  amount: z.coerce.number().positive({ message: "Amount must be positive" }),
  date: z.date({ message: "Date is required" }),
  accountId: z.string().min(1, { message: "Account is required" }),
  tagIds: z.array(z.string()).optional(),
})

export type LoginData = z.infer<typeof loginSchema>
export type SignupData = z.infer<typeof signupSchema>
export type AccountData = z.infer<typeof accountSchema>
export type TagData = z.infer<typeof tagSchema>
export type ExpenditureData = z.infer<typeof expenditureSchema>
export type IncomeData = z.infer<typeof incomeSchema>
