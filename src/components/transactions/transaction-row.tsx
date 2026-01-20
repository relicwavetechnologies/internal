"use client"

import { format } from "date-fns"
import { Badge } from "@/components/ui/badge"
import { TableCell, TableRow } from "@/components/ui/table"
import { TrendingUp, TrendingDown } from "lucide-react"
import { IncomeActions } from "@/components/incomes/income-actions"
import { ExpenditureActions } from "@/components/expenditures/expenditure-actions"

export type TransactionType = "INCOME" | "EXPENSE"

export interface Transaction {
  id: string
  type: TransactionType
  date: Date
  description: string
  amount: number
  accountId: string
  account: {
    name: string
  }
  tags: Array<{
    tag: {
      id: string
      name: string
    }
  }>
}

interface TransactionRowProps {
  transaction: Transaction
}

export function TransactionRow({ transaction }: TransactionRowProps) {
  const isIncome = transaction.type === "INCOME"
  const amountColor = isIncome ? "text-green-500" : "text-red-500"
  const badgeVariant = isIncome ? "default" : "destructive"
  const Icon = isIncome ? TrendingUp : TrendingDown
  const amountPrefix = isIncome ? "+" : "-"

  return (
    <TableRow>
      <TableCell>{format(transaction.date, "PPP")}</TableCell>
      <TableCell className="font-medium">{transaction.description}</TableCell>
      <TableCell>{transaction.account.name}</TableCell>
      <TableCell>
        <div className="flex items-center gap-2">
          <Badge variant={badgeVariant} className="w-fit">
            <Icon className="mr-1 h-3 w-3" />
            {transaction.type}
          </Badge>
        </div>
      </TableCell>
      <TableCell>
        <div className="flex flex-wrap gap-1">
          {transaction.tags.map(({ tag }) => (
            <Badge key={tag.id} variant="secondary">
              {tag.name}
            </Badge>
          ))}
        </div>
      </TableCell>
      <TableCell className={`font-bold ${amountColor}`}>
        {amountPrefix}${transaction.amount.toFixed(2)}
      </TableCell>
      <TableCell>
        {isIncome ? (
          <IncomeActions id={transaction.id} />
        ) : (
          <ExpenditureActions id={transaction.id} />
        )}
      </TableCell>
    </TableRow>
  )
}
