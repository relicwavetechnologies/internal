"use client"

import { useForm, Resolver } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { accountSchema, AccountData } from "@/lib/schemas"
import { createAccount, updateAccount } from "@/actions/accounts"
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { toast } from "sonner"
import { useState } from "react"
import { Account } from "@prisma/client"

interface AccountFormProps {
  account?: Account
  onSuccess?: () => void
}

export function AccountForm({ account, onSuccess }: AccountFormProps) {
  const [isPending, setIsPending] = useState(false)

  const form = useForm<AccountData>({
    resolver: zodResolver(accountSchema) as unknown as Resolver<AccountData>,
    defaultValues: {
      name: account?.name || "",
      type: (account?.type as AccountData["type"]) || "Bank Account",
      balance: account?.balance || 0,
    },
  })

  async function onSubmit(data: AccountData) {
    setIsPending(true)
    try {
      const result = account
        ? await updateAccount(account.id, data)
        : await createAccount(data)

      if (result?.error) {
        toast.error(result.error)
      } else {
        toast.success(account ? "Account updated" : "Account created")
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
              <FormLabel>Account Name</FormLabel>
              <FormControl>
                <Input placeholder="Main Checking" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="type"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Type</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select account type" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="Bank Account">Bank Account</SelectItem>
                  <SelectItem value="Cash">Cash</SelectItem>
                  <SelectItem value="Bitcoin Wallet">Bitcoin Wallet</SelectItem>
                  <SelectItem value="Other">Other</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="balance"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Initial Balance</FormLabel>
              <FormControl>
                <Input type="number" step="0.01" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" className="w-full" disabled={isPending}>
          {isPending ? "Saving..." : account ? "Update Account" : "Create Account"}
        </Button>
      </form>
    </Form>
  )
}
