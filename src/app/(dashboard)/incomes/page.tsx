import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import { IncomeDialog } from "@/components/incomes/income-dialog"
import { IncomeActions } from "@/components/incomes/income-actions"
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
type IncomeWithRelations = any;

export default async function IncomesPage() {
  const session = await auth()

  const [incomes, accounts, tags] = await Promise.all([
    db.income.findMany({
      where: {
        companyId: session?.user?.companyId,
      },
      include: {
        account: true,
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
  ])

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Income</h1>
        <IncomeDialog accounts={accounts} tags={tags} />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Income Entries</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Account</TableHead>
                <TableHead>Tags</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead className="w-[100px]">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {incomes.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center">
                    No income logged.
                  </TableCell>
                </TableRow>
              ) : (
                incomes.map((income: IncomeWithRelations) => (
                  <TableRow key={income.id}>
                    <TableCell>{format(income.date, "PPP")}</TableCell>
                    <TableCell className="font-medium">{income.description}</TableCell>
                    <TableCell>{income.account.name}</TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {income.tags.map(({ tag }: any) => (
                          <Badge key={tag.id} variant="secondary">
                            {tag.name}
                          </Badge>
                        ))}
                      </div>
                    </TableCell>
                    <TableCell className="font-bold text-green-500">
                      +${income.amount.toFixed(2)}
                    </TableCell>
                    <TableCell>
                      <IncomeActions id={income.id} />
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
