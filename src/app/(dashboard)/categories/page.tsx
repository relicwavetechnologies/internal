import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import { CategoryDialog } from "@/components/categories/category-dialog"
import { CategoryActions } from "@/components/categories/category-actions"
import { SeedCategoriesButton } from "@/components/categories/seed-categories-button"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import * as LucideIcons from "lucide-react"

const typeLabels: Record<string, string> = {
  EXPENSE: "Expense",
  INCOME: "Income",
  BOTH: "Both",
}

const typeBadgeColors: Record<string, string> = {
  EXPENSE: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100",
  INCOME: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100",
  BOTH: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100",
}

export default async function CategoriesPage() {
  const session = await auth()

  const categories = await db.category.findMany({
    where: {
      OR: [
        { companyId: session?.user?.companyId },
        { companyId: null, isSystem: true },
      ],
    },
    include: {
      _count: {
        select: {
          expenditures: true,
          incomes: true,
        },
      },
    },
    orderBy: [
      { type: "asc" },
      { name: "asc" },
    ],
  })

  const expenseCategories = categories.filter((c: any) => c.type === "EXPENSE" || c.type === "BOTH")
  const incomeCategories = categories.filter((c: any) => c.type === "INCOME" || c.type === "BOTH")

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Categories</h1>
          <p className="text-muted-foreground">
            Organize your transactions with categories
          </p>
        </div>
        <div className="flex gap-2">
          <SeedCategoriesButton />
          <CategoryDialog />
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Categories
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{categories.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Expense Categories
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{expenseCategories.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Income Categories
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{incomeCategories.length}</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Categories</CardTitle>
          <CardDescription>
            Click "Add Defaults" to populate with common expense and income categories.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Category</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Usage</TableHead>
                <TableHead className="w-[100px]">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {categories.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center py-8">
                    <p className="text-muted-foreground">
                      No categories yet. Add some or click "Add Defaults" to get started.
                    </p>
                  </TableCell>
                </TableRow>
              ) : (
                categories.map((category: any) => {
                  const Icon = category.icon ? (LucideIcons as any)[category.icon] : null
                  const usageCount = category._count.expenditures + category._count.incomes

                  return (
                    <TableRow key={category.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          {Icon && (
                            <div
                              className="p-2 rounded-md"
                              style={{
                                backgroundColor: category.color ? `${category.color}20` : undefined,
                              }}
                            >
                              <Icon
                                className="h-4 w-4"
                                style={{ color: category.color || undefined }}
                              />
                            </div>
                          )}
                          <div>
                            <p className="font-medium">{category.name}</p>
                            {category.isSystem && (
                              <p className="text-xs text-muted-foreground">System</p>
                            )}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant="secondary"
                          className={typeBadgeColors[category.type]}
                        >
                          {typeLabels[category.type]}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <span className="text-muted-foreground">
                          {usageCount} transaction{usageCount !== 1 ? "s" : ""}
                        </span>
                      </TableCell>
                      <TableCell>
                        <CategoryActions category={category} />
                      </TableCell>
                    </TableRow>
                  )
                })
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
