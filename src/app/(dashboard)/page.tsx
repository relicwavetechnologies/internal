import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import { Account, Expenditure } from "@prisma/client"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { OverviewChart } from "@/components/dashboard/overview-chart"
import { RecentExpenditures } from "@/components/dashboard/recent-expenditures"
import { startOfMonth } from "date-fns"

export default async function DashboardPage() {
  const session = await auth()
  const companyId = session?.user?.companyId

  if (!companyId) return null

  // Fetch data
  const [accounts, expenditures, recentExpenditures] = await Promise.all([
    db.account.findMany({
      where: { companyId },
    }),
    db.expenditure.findMany({
      where: { companyId },
    }),
    db.expenditure.findMany({
      where: { companyId },
      orderBy: { date: "desc" },
      take: 5,
      include: { account: true },
    }),
  ])

  // Calculate stats
  const totalBalance = accounts.reduce((acc: number, curr: Account) => acc + curr.balance, 0)
  
  const currentMonthStart = startOfMonth(new Date())
  const monthlySpending = expenditures
    .filter((exp: Expenditure) => exp.date >= currentMonthStart)
    .reduce((acc: number, curr: Expenditure) => acc + curr.amount, 0)

  // Chart Data: Spending by Account
  // Actually, expenditures don't have account name directly, but accounts do.
  // We can sum expenditures by accountId.
  const spendingByAccount = accounts.map((acc: Account) => {
    const total = expenditures
      .filter((exp: Expenditure) => exp.accountId === acc.id)
      .reduce((sum: number, exp: Expenditure) => sum + exp.amount, 0)
    return {
      name: acc.name,
      total,
    }
  })

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Dashboard</h1>
      
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Balance</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${totalBalance.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">
              Across {accounts.length} accounts
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Monthly Spending</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${monthlySpending.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">
              For {currentMonthStart.toLocaleString('default', { month: 'long' })}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Accounts</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{accounts.length}</div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4">
          <CardHeader>
            <CardTitle>Spending by Account</CardTitle>
          </CardHeader>
          <CardContent className="pl-2">
            <OverviewChart data={spendingByAccount} />
          </CardContent>
        </Card>
        <Card className="col-span-3">
          <CardHeader>
            <CardTitle>Recent Transactions</CardTitle>
          </CardHeader>
          <CardContent>
            <RecentExpenditures data={recentExpenditures} />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
