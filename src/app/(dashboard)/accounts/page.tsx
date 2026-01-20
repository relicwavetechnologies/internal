import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import { AccountDialog } from "@/components/accounts/account-dialog"
import { AccountActions } from "@/components/accounts/account-actions"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default async function AccountsPage() {
  const session = await auth()
  const accounts = await db.account.findMany({
    where: {
      companyId: session?.user?.companyId,
    },
    orderBy: {
      createdAt: "desc",
    },
  })

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Accounts</h1>
        <AccountDialog />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Your Accounts</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Balance</TableHead>
                <TableHead className="w-[100px]">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {accounts.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center">
                    No accounts found. Create one to get started.
                  </TableCell>
                </TableRow>
              ) : (
                accounts.map((account) => (
                  <TableRow key={account.id}>
                    <TableCell className="font-medium">{account.name}</TableCell>
                    <TableCell>{account.type}</TableCell>
                    <TableCell>${account.balance.toFixed(2)}</TableCell>
                    <TableCell>
                      <AccountActions account={account} />
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
