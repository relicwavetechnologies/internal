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

export const employeeSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters" }),
  email: z.string().email({ message: "Invalid email address" }).optional().or(z.literal("")),
  phone: z.string().optional(),
  role: z.string().optional(),
  department: z.string().optional(),
  salary: z.coerce.number().min(0, { message: "Salary must be positive" }).optional().or(z.literal("")),
  employeeType: z.enum(["EMPLOYEE", "CONTRACTOR", "VENDOR", "FREELANCER"]).default("EMPLOYEE"),
  status: z.enum(["ACTIVE", "INACTIVE", "TERMINATED"]).default("ACTIVE"),
  hireDate: z.date().optional(),
  notes: z.string().optional(),
})

export const categorySchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters" }),
  icon: z.string().optional(),
  color: z.string().optional(),
  type: z.enum(["EXPENSE", "INCOME", "BOTH"]).default("EXPENSE"),
})

export const expenditureSchema = z.object({
  description: z.string().min(2, { message: "Description must be at least 2 characters" }),
  amount: z.coerce.number().positive({ message: "Amount must be positive" }),
  date: z.date({ message: "Date is required" }),
  accountId: z.string().min(1, { message: "Account is required" }),
  tagIds: z.array(z.string()).optional(),
  employeeId: z.string().optional(),
  categoryId: z.string().optional(),
})

export const incomeSchema = z.object({
  description: z.string().min(2, { message: "Description must be at least 2 characters" }),
  amount: z.coerce.number().positive({ message: "Amount must be positive" }),
  date: z.date({ message: "Date is required" }),
  accountId: z.string().min(1, { message: "Account is required" }),
  tagIds: z.array(z.string()).optional(),
  categoryId: z.string().optional(),
})

export const recurringTransactionSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters" }),
  amount: z.coerce.number().positive({ message: "Amount must be positive" }),
  description: z.string().optional(),
  type: z.enum(["INCOME", "EXPENSE"]),
  frequency: z.enum(["DAILY", "WEEKLY", "BIWEEKLY", "MONTHLY", "QUARTERLY", "YEARLY"]),
  startDate: z.date({ message: "Start date is required" }),
  endDate: z.date().optional(),
  accountId: z.string().min(1, { message: "Account is required" }),
  employeeId: z.string().optional(),
  categoryId: z.string().optional(),
})

export type LoginData = z.infer<typeof loginSchema>
export type SignupData = z.infer<typeof signupSchema>
export type AccountData = z.infer<typeof accountSchema>
export type TagData = z.infer<typeof tagSchema>
export type EmployeeData = z.infer<typeof employeeSchema>
export type CategoryData = z.infer<typeof categorySchema>
export type ExpenditureData = z.infer<typeof expenditureSchema>
export type IncomeData = z.infer<typeof incomeSchema>
export type RecurringTransactionData = z.infer<typeof recurringTransactionSchema>
