import { Badge } from "@/components/ui/badge"
import * as LucideIcons from "lucide-react"
import { cn } from "@/lib/utils"

interface CategoryBadgeProps {
  name: string
  icon?: string | null
  color?: string | null
  className?: string
}

export function CategoryBadge({ name, icon, color, className }: CategoryBadgeProps) {
  const Icon = icon ? (LucideIcons as any)[icon] : null

  return (
    <Badge
      variant="secondary"
      className={cn("gap-1.5", className)}
      style={{
        backgroundColor: color ? `${color}20` : undefined,
        color: color || undefined,
        borderColor: color || undefined,
      }}
    >
      {Icon && <Icon className="h-3 w-3" />}
      {name}
    </Badge>
  )
}
