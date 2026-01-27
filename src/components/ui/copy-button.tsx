"use client"

import { Button } from "@/components/ui/button"
import { Copy, Check } from "lucide-react"
import { useState } from "react"
import { toast } from "sonner"

interface CopyButtonProps {
    text: string
}

export function CopyButton({ text }: CopyButtonProps) {
    const [copied, setCopied] = useState(false)

    const handleCopy = async () => {
        try {
            await navigator.clipboard.writeText(text)
            setCopied(true)
            toast.success("Copied to clipboard")
            setTimeout(() => setCopied(false), 2000)
        } catch (err) {
            toast.error("Failed to copy")
        }
    }

    return (
        <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6 ml-1 text-muted-foreground hover:text-foreground"
            onClick={(e) => {
                e.preventDefault()
                e.stopPropagation()
                handleCopy()
            }}
        >
            {copied ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
        </Button>
    )
}
