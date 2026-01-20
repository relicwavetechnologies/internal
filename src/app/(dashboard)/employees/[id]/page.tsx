import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import { notFound } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { EmployeeDialog } from "@/components/employees/employee-dialog"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Mail, Phone, Calendar, Briefcase, Building, DollarSign } from "lucide-react"
import Link from "next/link"
import { format } from "date-fns"

const statusColors: Record<string, string> = {
  ACTIVE: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100",
  INACTIVE: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-100",
  TERMINATED: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100",
}

const typeLabels: Record<string, string> = {
  EMPLOYEE: "Employee",
  CONTRACTOR: "Contractor",
  VENDOR: "Vendor",
  FREELANCER: "Freelancer",
}

interface PageProps {
  params: Promise<{ id: string }>
}

export default async function EmployeeDetailPage({ params }: PageProps) {
  const { id } = await params
  const session = await auth()

  const employee = await db.employee.findUnique({
    where: {
      id,
      companyId: session?.user?.companyId,
    },
    include: {
      expenditures: {
        include: {
          account: true,
          category: true,
          tags: { include: { tag: true } },
        },
        orderBy: { date: "desc" },
      },
    },
  })

  if (!employee) {
    notFound()
  }

  const totalPaid = employee.expenditures.reduce((sum, e) => sum + e.amount, 0)
  const thisMonth = employee.expenditures.filter((e) => {
    const now = new Date()
    return (
      e.date.getMonth() === now.getMonth() &&
      e.date.getFullYear() === now.getFullYear()
    )
  })
  const thisMonthTotal = thisMonth.reduce((sum, e) => sum + e.amount, 0)

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/employees">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-bold">{employee.name}</h1>
            <Badge
              variant="secondary"
              className={statusColors[employee.status]}
            >
              {employee.status}
            </Badge>
          </div>
          <p className="text-muted-foreground">
            {typeLabels[employee.employeeType]}
            {employee.role && ` - ${employee.role}`}
          </p>
        </div>
        <EmployeeDialog
          employee={employee}
          trigger={<Button variant="outline">Edit Employee</Button>}
        />
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Paid
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${totalPaid.toLocaleString()}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              This Month
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${thisMonthTotal.toLocaleString()}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Monthly Salary
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {employee.salary ? `$${employee.salary.toLocaleString()}` : "-"}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Payments
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{employee.expenditures.length}</div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <Card className="md:col-span-1">
          <CardHeader>
            <CardTitle>Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {employee.email && (
              <div className="flex items-center gap-3">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <span>{employee.email}</span>
              </div>
            )}
            {employee.phone && (
              <div className="flex items-center gap-3">
                <Phone className="h-4 w-4 text-muted-foreground" />
                <span>{employee.phone}</span>
              </div>
            )}
            {employee.role && (
              <div className="flex items-center gap-3">
                <Briefcase className="h-4 w-4 text-muted-foreground" />
                <span>{employee.role}</span>
              </div>
            )}
            {employee.department && (
              <div className="flex items-center gap-3">
                <Building className="h-4 w-4 text-muted-foreground" />
                <span>{employee.department}</span>
              </div>
            )}
            {employee.hireDate && (
              <div className="flex items-center gap-3">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span>Hired {format(employee.hireDate, "PPP")}</span>
              </div>
            )}
            {employee.salary && (
              <div className="flex items-center gap-3">
                <DollarSign className="h-4 w-4 text-muted-foreground" />
                <span>${employee.salary.toLocaleString()}/month</span>
              </div>
            )}
            {employee.notes && (
              <div className="pt-4 border-t">
                <p className="text-sm text-muted-foreground">{employee.notes}</p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Payment History</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Account</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {employee.expenditures.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8">
                      <p className="text-muted-foreground">
                        No payments recorded for this employee.
                      </p>
                    </TableCell>
                  </TableRow>
                ) : (
                  employee.expenditures.map((expenditure: any) => (
                    <TableRow key={expenditure.id}>
                      <TableCell>
                        {format(expenditure.date, "MMM d, yyyy")}
                      </TableCell>
                      <TableCell>{expenditure.description}</TableCell>
                      <TableCell>{expenditure.account.name}</TableCell>
                      <TableCell>
                        {expenditure.category?.name || "-"}
                      </TableCell>
                      <TableCell className="text-right font-medium">
                        ${expenditure.amount.toLocaleString()}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
