import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { format } from "date-fns"
import { TrendingUp, TrendingDown } from "lucide-react"

export type RecentTransaction = {
  id: string
  type: "INCOME" | "EXPENSE"
  description: string
  amount: number
  date: Date
  account: {
    name: string
  }
}

export function RecentTransactions({ data }: { data: RecentTransaction[] }) {
  return (
    <div className="space-y-8">
      {data.map((item) => {
        const isIncome = item.type === "INCOME"
        const amountColor = isIncome ? "text-green-500" : "text-red-500"
        const amountPrefix = isIncome ? "+" : "-"
        const Icon = isIncome ? TrendingUp : TrendingDown

        return (
          <div key={`${item.type}-${item.id}`} className="flex items-center">
            <Avatar className="h-9 w-9">
              <AvatarFallback>{item.account.name[0]}</AvatarFallback>
            </Avatar>
            <div className="ml-4 space-y-1 flex-1">
              <p className="text-sm font-medium leading-none">{item.description}</p>
              <p className="text-sm text-muted-foreground">
                {format(item.date, "MMM dd")} • {item.account.name}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Icon className={`h-4 w-4 ${amountColor}`} />
              <div className={`font-medium ${amountColor}`}>
                {amountPrefix}${item.amount.toFixed(2)}
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}
