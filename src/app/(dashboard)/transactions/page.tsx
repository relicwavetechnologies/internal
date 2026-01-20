import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import { TransactionRow, Transaction } from "@/components/transactions/transaction-row"
import { TransactionFilters } from "@/components/transactions/transaction-filters"
import { IncomeDialog } from "@/components/incomes/income-dialog"
import { ExpenditureDialog } from "@/components/expenditures/expenditure-dialog"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default async function TransactionsPage({
  searchParams,
}: {
  searchParams: Record<string, string | string[] | undefined>
}) {
  const session = await auth()

  // Fetch all data in parallel
  const [incomes, expenditures, accounts, tags] = await Promise.all([
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
    }),
    db.expenditure.findMany({
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
    }),
    db.account.findMany({
      where: { companyId: session?.user?.companyId },
    }),
    db.tag.findMany({
      where: { companyId: session?.user?.companyId },
    }),
  ])

  // Combine and transform transactions
  const transactions: Transaction[] = [
    ...incomes.map((income: any) => ({
      ...income,
      type: "INCOME" as const,
    })),
    ...expenditures.map((exp: any) => ({
      ...exp,
      type: "EXPENSE" as const,
    })),
  ]

  // Sort by date descending
  transactions.sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  )

  // Apply filters
  const typeFilter = searchParams.type ? String(searchParams.type) : "all"
  const accountFilter = searchParams.account ? String(searchParams.account) : ""
  const tagFilters = searchParams.tags
    ? Array.isArray(searchParams.tags)
      ? searchParams.tags
      : [searchParams.tags]
    : []

  let filteredTransactions = transactions

  if (typeFilter !== "all") {
    filteredTransactions = filteredTransactions.filter(
      (t) => t.type === typeFilter
    )
  }

  if (accountFilter) {
    filteredTransactions = filteredTransactions.filter(
      (t) => t.accountId === accountFilter
    )
  }

  if (tagFilters.length > 0) {
    filteredTransactions = filteredTransactions.filter((t) =>
      tagFilters.some((tagId) =>
        t.tags.some((tag: any) => tag.tag.id === tagId)
      )
    )
  }

  // Calculate statistics
  const incomeTotal = filteredTransactions
    .filter((t) => t.type === "INCOME")
    .reduce((sum, t) => sum + t.amount, 0)

  const expenseTotal = filteredTransactions
    .filter((t) => t.type === "EXPENSE")
    .reduce((sum, t) => sum + t.amount, 0)

  const netFlow = incomeTotal - expenseTotal

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Transaction Logs</h1>
        <div className="flex gap-2">
          <IncomeDialog accounts={accounts} tags={tags} />
          <ExpenditureDialog accounts={accounts} tags={tags} />
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Income</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-500">
              +${incomeTotal.toFixed(2)}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">
              Total Expenses
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-500">
              -${expenseTotal.toFixed(2)}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Net Flow</CardTitle>
          </CardHeader>
          <CardContent>
            <div
              className={`text-2xl font-bold ${
                netFlow >= 0 ? "text-green-500" : "text-red-500"
              }`}
            >
              {netFlow >= 0 ? "+" : ""}${netFlow.toFixed(2)}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <TransactionFilters accounts={accounts} tags={tags} />
        </CardContent>
      </Card>

      {/* Transactions Table */}
      <Card>
        <CardHeader>
          <CardTitle>Transactions</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Account</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Tags</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead className="w-[100px]">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredTransactions.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center">
                    No transactions found.
                  </TableCell>
                </TableRow>
              ) : (
                filteredTransactions.map((transaction) => (
                  <TransactionRow
                    key={`${transaction.type}-${transaction.id}`}
                    transaction={transaction}
                  />
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
