import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import { Tag } from "@prisma/client"
import { TagDialog } from "@/components/tags/tag-dialog"
import { TagActions } from "@/components/tags/tag-actions"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default async function TagsPage() {
  const session = await auth()
  const tags = await db.tag.findMany({
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
        <h1 className="text-3xl font-bold">Tags</h1>
        <TagDialog />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Your Tags</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead className="w-[100px]">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {tags.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={2} className="text-center">
                    No tags found. Create one to categorize your expenses.
                  </TableCell>
                </TableRow>
              ) : (
                tags.map((tag: Tag) => (
                  <TableRow key={tag.id}>
                    <TableCell className="font-medium">{tag.name}</TableCell>
                    <TableCell>
                      <TagActions tag={tag} />
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
