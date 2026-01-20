"use client"

import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
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
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command"
import { Check, X, CalendarIcon } from "lucide-react"
import { cn } from "@/lib/utils"
import { format } from "date-fns"
import { useState } from "react"

interface TransactionFiltersProps {
  accounts: any[]
  tags: any[]
}

export function TransactionFilters({ accounts, tags }: TransactionFiltersProps) {
  const router = useRouter()
  const searchParams = useSearchParams()

  const [openTags, setOpenTags] = useState(false)

  const typeFilter = searchParams.get("type") || "all"
  const accountFilter = searchParams.get("account") || ""
  const selectedTags = searchParams.getAll("tags") || []

  const handleTypeChange = (value: string) => {
    const params = new URLSearchParams(searchParams)
    if (value === "all") {
      params.delete("type")
    } else {
      params.set("type", value)
    }
    router.push(`?${params.toString()}`)
  }

  const handleAccountChange = (value: string) => {
    const params = new URLSearchParams(searchParams)
    if (!value) {
      params.delete("account")
    } else {
      params.set("account", value)
    }
    router.push(`?${params.toString()}`)
  }

  const handleTagToggle = (tagId: string) => {
    const params = new URLSearchParams(searchParams)
    const currentTags = params.getAll("tags") || []
    const newTags = currentTags.includes(tagId)
      ? currentTags.filter((t) => t !== tagId)
      : [...currentTags, tagId]

    params.delete("tags")
    newTags.forEach((tag) => params.append("tags", tag))
    router.push(`?${params.toString()}`)
  }

  const handleClearFilters = () => {
    router.push("/transactions")
  }

  const hasActiveFilters =
    typeFilter !== "all" || accountFilter || selectedTags.length > 0

  return (
    <div className="flex flex-wrap gap-3 items-center">
      <Select onValueChange={handleTypeChange} defaultValue={typeFilter}>
        <SelectTrigger className="w-[120px]">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Types</SelectItem>
          <SelectItem value="INCOME">Income</SelectItem>
          <SelectItem value="EXPENSE">Expenses</SelectItem>
        </SelectContent>
      </Select>

      <Select onValueChange={handleAccountChange} defaultValue={accountFilter}>
        <SelectTrigger className="w-[140px]">
          <SelectValue placeholder="All Accounts" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="">All Accounts</SelectItem>
          {accounts.map((account) => (
            <SelectItem key={account.id} value={account.id}>
              {account.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Popover open={openTags} onOpenChange={setOpenTags}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            className={cn(
              "w-[140px] justify-between",
              selectedTags.length === 0 && "text-muted-foreground"
            )}
          >
            {selectedTags.length > 0
              ? `${selectedTags.length} tags`
              : "All Tags"}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[200px] p-0">
          <Command>
            <CommandInput placeholder="Search tags..." />
            <CommandList>
              <CommandEmpty>No tags found.</CommandEmpty>
              <CommandGroup>
                {tags.map((tag) => (
                  <CommandItem
                    key={tag.id}
                    value={tag.name}
                    onSelect={() => handleTagToggle(tag.id)}
                  >
                    <Check
                      className={cn(
                        "mr-2 h-4 w-4",
                        selectedTags.includes(tag.id)
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

      {hasActiveFilters && (
        <Button
          variant="ghost"
          size="sm"
          onClick={handleClearFilters}
          className="text-muted-foreground"
        >
          <X className="h-4 w-4 mr-1" />
          Clear
        </Button>
      )}
    </div>
  )
}
