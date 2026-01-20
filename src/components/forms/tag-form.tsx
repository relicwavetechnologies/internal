"use client"

import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { tagSchema, TagData } from "@/lib/schemas"
import { createTag, updateTag } from "@/actions/tags"
import { Button } from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { toast } from "sonner"
import { useState } from "react"
import { Tag } from "@prisma/client"

interface TagFormProps {
  tag?: Tag
  onSuccess?: () => void
}

export function TagForm({ tag, onSuccess }: TagFormProps) {
  const [isPending, setIsPending] = useState(false)

  const form = useForm<TagData>({
    resolver: zodResolver(tagSchema),
    defaultValues: {
      name: tag?.name || "",
    },
  })

  async function onSubmit(data: TagData) {
    setIsPending(true)
    try {
      const result = tag
        ? await updateTag(tag.id, data)
        : await createTag(data)

      if (result?.error) {
        toast.error(result.error)
      } else {
        toast.success(tag ? "Tag updated" : "Tag created")
        if (onSuccess) onSuccess()
      }
    } catch (error) {
      toast.error("Something went wrong")
    } finally {
      setIsPending(false)
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Tag Name</FormLabel>
              <FormControl>
                <Input placeholder="Groceries, Rent, etc." {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" className="w-full" disabled={isPending}>
          {isPending ? "Saving..." : tag ? "Update Tag" : "Create Tag"}
        </Button>
      </form>
    </Form>
  )
}
