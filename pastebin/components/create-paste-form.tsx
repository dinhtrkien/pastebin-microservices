"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { createPaste } from "@/lib/api"
import { Loader2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

const expirationOptions = [
  { value: "1m", label: "1 minute" },
  { value: "5m", label: "5 minutes" },
  { value: "10m", label: "10 minutes" },
  { value: "1h", label: "1 hour" },
  { value: "1d", label: "1 day" },
  { value: "1w", label: "1 week" },
  { value: "2w", label: "2 weeks" },
  { value: "1mo", label: "1 month" },
  { value: "6mo", label: "6 months" },
  { value: "1y", label: "1 year" },
  { value: "never", label: "Never" },
]

export default function CreatePasteForm() {
  const [content, setContent] = useState("")
  const [expirationType, setExpirationType] = useState("never")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const router = useRouter()
  const { toast } = useToast()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!content.trim()) {
      toast({
        title: "Error",
        description: "Paste content cannot be empty",
        variant: "destructive",
      })
      return
    }

    setIsSubmitting(true)

    try {
      const paste = await createPaste(content, expirationType)
      toast({
        title: "Success",
        description: "Paste created successfully",
      })
      router.push(`/${paste.slug}`)
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create paste. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="content">Content</Label>
        <Textarea
          id="content"
          placeholder="Enter your paste content here..."
          value={content}
          onChange={(e) => setContent(e.target.value)}
          className="min-h-[200px] font-mono"
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="expiration">Expiration</Label>
        <Select value={expirationType} onValueChange={setExpirationType}>
          <SelectTrigger id="expiration">
            <SelectValue placeholder="Select expiration time" />
          </SelectTrigger>
          <SelectContent>
            {expirationOptions.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <Button type="submit" className="w-full" disabled={isSubmitting}>
        {isSubmitting ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Creating...
          </>
        ) : (
          "Create Paste"
        )}
      </Button>
    </form>
  )
}
