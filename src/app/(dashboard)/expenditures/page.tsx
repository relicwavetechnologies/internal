import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import { ExpenditureDialog } from "@/components/expenditures/expenditure-dialog"
import { ExpenditureActions } from "@/components/expenditures/expenditure-actions"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { format } from "date-fns"
import { Badge } from "@/components/ui/badge"

// Define a type that includes the relations we are fetching
// We use 'any' here because Prisma generated types can be tricky to import directly
// in some environments, and we want to avoid build errors.
type ExpenditureWithRelations = any;

export default async function ExpendituresPage() {
  const session = await auth()

  const [expenditures, accounts, tags, employees, categories] = await Promise.all([
    db.expenditure.findMany({
      where: {
        companyId: session?.user?.companyId,
      },
      include: {
        account: true,
        employee: true,
        category: true,
        tags: {
          include: {
            tag: true,
          },
        },
      },
      orderBy: {
        date: "desc",
      },
    }),
    db.account.findMany({
      where: { companyId: session?.user?.companyId },
    }),
    db.tag.findMany({
      where: { companyId: session?.user?.companyId },
    }),
    db.employee.findMany({
      where: { companyId: session?.user?.companyId, status: "ACTIVE" },
      orderBy: { name: "asc" },
    }),
    db.category.findMany({
      where: {
        OR: [
          { companyId: session?.user?.companyId },
          { companyId: null, isSystem: true },
        ],
        type: { in: ["EXPENSE", "BOTH"] },
      },
      orderBy: { name: "asc" },
    }),
  ])

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Expenditures</h1>
        <ExpenditureDialog
          accounts={accounts}
          tags={tags}
          employees={employees}
          categories={categories}
        />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent Expenses</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Employee</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Account</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead className="w-[100px]">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {expenditures.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center">
                    No expenditures logged.
                  </TableCell>
                </TableRow>
              ) : (
                expenditures.map((exp: ExpenditureWithRelations) => (
                  <TableRow key={exp.id}>
                    <TableCell>{format(exp.date, "PPP")}</TableCell>
                    <TableCell className="font-medium">{exp.description}</TableCell>
                    <TableCell>
                      {exp.employee ? (
                        <span className="text-sm">{exp.employee.name}</span>
                      ) : (
                        <span className="text-muted-foreground">-</span>
                      )}
                    </TableCell>
                    <TableCell>
                      {exp.category ? (
                        <Badge
                          variant="secondary"
                          style={{
                            backgroundColor: exp.category.color ? `${exp.category.color}20` : undefined,
                            color: exp.category.color || undefined,
                            borderColor: exp.category.color || undefined,
                          }}
                          className="border"
                        >
                          {exp.category.name}
                        </Badge>
                      ) : (
                        <span className="text-muted-foreground">-</span>
                      )}
                    </TableCell>
                    <TableCell>{exp.account.name}</TableCell>
                    <TableCell className="font-bold text-red-500">
                      -${exp.amount.toFixed(2)}
                    </TableCell>
                    <TableCell>
                      <ExpenditureActions id={exp.id} />
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
