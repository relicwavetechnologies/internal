import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { DashboardCharts } from "@/components/dashboard/dashboard-charts"
import { RecentTransactions } from "@/components/dashboard/recent-transactions"
import { startOfMonth } from "date-fns"
import { Wallet, TrendingUp, TrendingDown, Activity } from "lucide-react"

export default async function DashboardPage() {
  const session = await auth()
  const companyId = session?.user?.companyId

  if (!companyId) return null

  // Fetch data
  const [accounts, expenditures, incomes, recentExpenditures, recentIncomes] = await Promise.all([
    db.account.findMany({
      where: { companyId },
    }),
    db.expenditure.findMany({
      where: { companyId },
    }),
    db.income.findMany({
      where: { companyId },
    }),
    db.expenditure.findMany({
      where: { companyId },
      orderBy: { date: "desc" },
      take: 5,
      include: { account: true },
    }),
    db.income.findMany({
      where: { companyId },
      orderBy: { date: "desc" },
      take: 5,
      include: { account: true },
    }),
  ])

  // Calculate stats
  const totalBalance = accounts.reduce((acc: number, curr: any) => acc + curr.balance, 0)

  const currentMonthStart = startOfMonth(new Date())
  const monthlySpending = expenditures
    .filter((exp: any) => exp.date >= currentMonthStart)
    .reduce((acc: number, curr: any) => acc + curr.amount, 0)

  const monthlyIncome = incomes
    .filter((inc: any) => inc.date >= currentMonthStart)
    .reduce((acc: number, curr: any) => acc + curr.amount, 0)

  const monthlyNetFlow = monthlyIncome - monthlySpending

  // Combine recent transactions
  const recentTransactions = [
    ...recentExpenditures.map((exp: any) => ({
      ...exp,
      type: "EXPENSE" as const,
    })),
    ...recentIncomes.map((inc: any) => ({
      ...inc,
      type: "INCOME" as const,
    })),
  ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, 5)

  return (
    <div className="max-w-7xl space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground mt-1">
          Overview of your finances
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Balance</CardTitle>
            <Wallet className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${totalBalance.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {accounts.length} account{accounts.length !== 1 ? 's' : ''}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Monthly Income</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">+${monthlyIncome.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {currentMonthStart.toLocaleString('default', { month: 'long' })}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Monthly Spending</CardTitle>
            <TrendingDown className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">-${monthlySpending.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {currentMonthStart.toLocaleString('default', { month: 'long' })}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Net Flow</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${monthlyNetFlow >= 0 ? "text-green-600" : "text-red-600"}`}>
              {monthlyNetFlow >= 0 ? "+" : ""}${Math.abs(monthlyNetFlow).toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {currentMonthStart.toLocaleString('default', { month: 'long' })}
            </p>
          </CardContent>
        </Card>
      </div>

      <DashboardCharts />

      <Card>
        <CardHeader>
          <CardTitle>Recent Transactions</CardTitle>
          <p className="text-sm text-muted-foreground">
            Latest activity
          </p>
        </CardHeader>
        <CardContent>
          <RecentTransactions data={recentTransactions} />
        </CardContent>
      </Card>
    </div>
  )
}
