"use client"

import { Button } from "@/components/ui/button"
import { seedDefaultCategories } from "@/actions/categories"
import { toast } from "sonner"
import { useState } from "react"
import { Sparkles } from "lucide-react"

export function SeedCategoriesButton() {
  const [isPending, setIsPending] = useState(false)

  async function handleSeed() {
    setIsPending(true)
    try {
      const result = await seedDefaultCategories()
      if (result.error) {
        toast.error(result.error)
      } else {
        toast.success("Default categories added")
      }
    } catch (error) {
      toast.error("Failed to seed categories")
    } finally {
      setIsPending(false)
    }
  }

  return (
    <Button variant="outline" onClick={handleSeed} disabled={isPending}>
      <Sparkles className="mr-2 h-4 w-4" />
      {isPending ? "Adding..." : "Add Defaults"}
    </Button>
  )
}
