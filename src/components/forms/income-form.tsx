"use client"

import { useForm, Resolver } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { incomeSchema, IncomeData } from "@/lib/schemas"
import { createIncome } from "@/actions/incomes"
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
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Calendar } from "@/components/ui/calendar"
import { cn } from "@/lib/utils"
import { format } from "date-fns"
import { CalendarIcon, Check } from "lucide-react"
import { toast } from "sonner"
import { useState } from "react"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command"

interface IncomeFormProps {
  accounts: any[]
  tags: any[]
  onSuccess?: () => void
}

export function IncomeForm({ accounts, tags, onSuccess }: IncomeFormProps) {
  const [isPending, setIsPending] = useState(false)
  const [openTags, setOpenTags] = useState(false)

  const form = useForm<IncomeData>({
    resolver: zodResolver(incomeSchema) as unknown as Resolver<IncomeData>,
    defaultValues: {
      description: "",
      amount: 0,
      tagIds: [],
    },
  })

  async function onSubmit(data: IncomeData) {
    setIsPending(true)
    try {
      const result = await createIncome(data)

      if (result?.error) {
        toast.error(result.error)
      } else {
        toast.success("Income logged")
        form.reset()
        if (onSuccess) onSuccess()
      }
    } catch (error) {
      // toast.error("Something went wrong")
    } finally {
      setIsPending(false)
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Input placeholder="Salary, Freelance, Bonus..." {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="amount"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Amount</FormLabel>
                <FormControl>
                  <Input type="number" step="0.01" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="date"
            render={({ field }) => (
              <FormItem className="flex flex-col mt-2">
                <FormLabel>Date</FormLabel>
                <Popover>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        variant={"outline"}
                        className={cn(
                          "w-full pl-3 text-left font-normal",
                          !field.value && "text-muted-foreground"
                        )}
                      >
                        {field.value ? (
                          format(field.value, "PPP")
                        ) : (
                          <span>Pick a date</span>
                        )}
                        <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={field.value}
                      onSelect={field.onChange}
                      disabled={(date) =>
                        date > new Date() || date < new Date("1900-01-01")
                      }
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="accountId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Account</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select account" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {accounts.map((account: any) => (
                    <SelectItem key={account.id} value={account.id}>
                      {account.name} (${account.balance.toFixed(2)})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="tagIds"
          render={({ field }) => (
            <FormItem className="flex flex-col">
              <FormLabel>Tags</FormLabel>
              <Popover open={openTags} onOpenChange={setOpenTags}>
                <PopoverTrigger asChild>
                  <FormControl>
                    <Button
                      variant="outline"
                      role="combobox"
                      className={cn(
                        "w-full justify-between",
                        !field.value?.length && "text-muted-foreground"
                      )}
                    >
                      {field.value?.length
                        ? `${field.value.length} tags selected`
                        : "Select tags"}
                    </Button>
                  </FormControl>
                </PopoverTrigger>
                <PopoverContent className="w-[200px] p-0">
                  <Command>
                    <CommandInput placeholder="Search tags..." />
                    <CommandList>
                      <CommandEmpty>No tags found.</CommandEmpty>
                      <CommandGroup>
                        {tags.map((tag: any) => (
                          <CommandItem
                            key={tag.id}
                            value={tag.name}
                            onSelect={() => {
                              const current = field.value || []
                              const updated = current.includes(tag.id)
                                ? current.filter((id) => id !== tag.id)
                                : [...current, tag.id]
                              field.onChange(updated)
                            }}
                          >
                            <Check
                              className={cn(
                                "mr-2 h-4 w-4",
                                field.value?.includes(tag.id)
                                  ? "opacity-100"
                                  : "opacity-0"
                              )}
                            />
                            {tag.name}
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" className="w-full" disabled={isPending}>
          {isPending ? "Logging..." : "Log Income"}
        </Button>
      </form>
    </Form>
  )
}
