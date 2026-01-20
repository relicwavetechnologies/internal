import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import { EmployeeDialog } from "@/components/employees/employee-dialog"
import { EmployeeActions } from "@/components/employees/employee-actions"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

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

export default async function EmployeesPage() {
  const session = await auth()
  const employees = await db.employee.findMany({
    where: {
      companyId: session?.user?.companyId,
    },
    include: {
      _count: {
        select: { expenditures: true },
      },
    },
    orderBy: {
      name: "asc",
    },
  })

  const totalSalary = employees
    .filter((e: any) => e.status === "ACTIVE" && e.salary)
    .reduce((sum: number, e: any) => sum + (e.salary || 0), 0)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Employees</h1>
          <p className="text-muted-foreground">
            Manage employees, contractors, and vendors
          </p>
        </div>
        <EmployeeDialog />
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Employees
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{employees.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Active
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {employees.filter((e: any) => e.status === "ACTIVE").length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Monthly Salary Total
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${totalSalary.toLocaleString()}</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Employees</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Department</TableHead>
                <TableHead>Salary</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Payments</TableHead>
                <TableHead className="w-[100px]">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {employees.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-8">
                    <p className="text-muted-foreground">
                      No employees found. Add one to get started.
                    </p>
                  </TableCell>
                </TableRow>
              ) : (
                employees.map((employee: any) => (
                  <TableRow key={employee.id}>
                    <TableCell>
                      <div>
                        <p className="font-medium">{employee.name}</p>
                        {employee.email && (
                          <p className="text-sm text-muted-foreground">
                            {employee.email}
                          </p>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>{typeLabels[employee.employeeType]}</TableCell>
                    <TableCell>{employee.role || "-"}</TableCell>
                    <TableCell>{employee.department || "-"}</TableCell>
                    <TableCell>
                      {employee.salary
                        ? `$${employee.salary.toLocaleString()}`
                        : "-"}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="secondary"
                        className={statusColors[employee.status]}
                      >
                        {employee.status}
                      </Badge>
                    </TableCell>
                    <TableCell>{employee._count.expenditures}</TableCell>
                    <TableCell>
                      <EmployeeActions employee={employee} />
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
