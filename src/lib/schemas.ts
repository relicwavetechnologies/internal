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
  password: z.string().min(6, { message: "Password must be at least 6 characters" }).optional().or(z.literal("")),
  phone: z.string().optional(),
  role: z.string().optional(),
  department: z.string().optional(),
  githubProfile: z.string().url({ message: "Invalid URL" }).optional().or(z.literal("")),
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

export const projectSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters" }),
  description: z.string().optional(),
  status: z.enum(["PLANNING", "ACTIVE", "ON_HOLD", "COMPLETED", "CANCELLED"]).default("PLANNING"),
  startDate: z.date().optional(),
  endDate: z.date().optional(),
  clientId: z.string().optional(),
  hasUpworkTimesheet: z.boolean().default(false),
  upworkContractUrl: z.string().url().optional().or(z.literal("")),
})

export const taskSchema = z.object({
  title: z.string().min(2, { message: "Title must be at least 2 characters" }),
  description: z.string().optional(),
  status: z.enum(["TODO", "IN_PROGRESS", "IN_REVIEW", "COMPLETED", "CANCELLED"]).default("TODO"),
  priority: z.enum(["LOW", "MEDIUM", "HIGH", "URGENT"]).default("MEDIUM"),
  dueDate: z.date().optional(),
  projectId: z.string().min(1, { message: "Project is required" }),
  assigneeId: z.string().optional(),
  subModuleId: z.string().optional(),
  estimatedHours: z.coerce.number().min(0).optional(),
  actualHours: z.coerce.number().min(0).optional(),
})

// CRM Schemas
export const clientSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters" }),
  email: z.string().email({ message: "Invalid email address" }),
  password: z.string().min(6, { message: "Password must be at least 6 characters" }).optional().or(z.literal("")),
})

export const documentSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters" }),
  url: z.string().url({ message: "Invalid URL" }),
  type: z.enum(["CONTRACT", "INVOICE", "DESIGN", "SOW", "REPORT", "IMAGE", "VIDEO", "OTHER"]),
  projectId: z.string().min(1, { message: "Project is required" }),
})

export const dailyLogSchema = z.object({
  date: z.date().default(() => new Date()),
  projectId: z.string().min(1, { message: "Project is required" }),
  employeeId: z.string().min(1, { message: "Employee is required" }),
  description: z.string().min(2, { message: "Description must be at least 2 characters" }),
  taskId: z.string().optional(),
  hoursSpent: z.coerce.number().min(0).optional(),
  notes: z.string().optional(),
  source: z.enum(["MANUAL", "AUTO_TASK_COMPLETE"]).default("MANUAL"),
})

export const moduleSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters" }),
  description: z.string().optional(),
  projectId: z.string().min(1, { message: "Project is required" }),
  order: z.coerce.number().int().min(0).default(0),
})

export const subModuleSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters" }),
  description: z.string().optional(),
  moduleId: z.string().min(1, { message: "Module is required" }),
  order: z.coerce.number().int().min(0).default(0),
})

export const commentSchema = z.object({
  content: z.string().min(1, { message: "Comment cannot be empty" }),
  projectId: z.string().min(1, { message: "Project is required" }),
  parentId: z.string().optional(),
})

export const projectEmployeeSchema = z.object({
  projectId: z.string().min(1, { message: "Project is required" }),
  employeeId: z.string().min(1, { message: "Employee is required" }),
  role: z.enum(["LEAD", "DEVELOPER", "REVIEWER", "DESIGNER", "QA"]).default("DEVELOPER"),
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
export type ProjectData = z.infer<typeof projectSchema>
export type TaskData = z.infer<typeof taskSchema>
export type ClientData = z.infer<typeof clientSchema>
export type DocumentData = z.infer<typeof documentSchema>
export type DailyLogData = z.infer<typeof dailyLogSchema>
export type ModuleData = z.infer<typeof moduleSchema>
export type SubModuleData = z.infer<typeof subModuleSchema>
export type CommentData = z.infer<typeof commentSchema>
export type ProjectEmployeeData = z.infer<typeof projectEmployeeSchema>
