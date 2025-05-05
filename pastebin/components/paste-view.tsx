"use client"

import { useState } from "react"
import { formatDistanceToNow } from "date-fns"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Copy, Check, ArrowLeft, Link, BarChart } from "lucide-react"
import NextLink from "next/link"
import { useToast } from "@/hooks/use-toast"

interface Paste {
  id: number
  slug: string
  content: string
  createdAt: string
  expirationTime: string | null
}

export default function PasteView({ paste }: { paste: Paste }) {
  const [copied, setCopied] = useState(false)
  const [linkCopied, setLinkCopied] = useState(false)
  const { toast } = useToast()

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(paste.content)
      setCopied(true)
      toast({
        title: "Copied to clipboard",
        description: "The paste content has been copied to your clipboard",
      })

      setTimeout(() => setCopied(false), 2000)
    } catch (error) {
      toast({
        title: "Failed to copy",
        description: "Could not copy to clipboard",
        variant: "destructive",
      })
    }
  }

  const copyLinkToClipboard = async () => {
    try {
      const url = window.location.href
      await navigator.clipboard.writeText(url)
      setLinkCopied(true)
      toast({
        title: "Link copied to clipboard",
        description: "The paste URL has been copied to your clipboard",
      })

      setTimeout(() => setLinkCopied(false), 2000)
    } catch (error) {
      toast({
        title: "Failed to copy link",
        description: "Could not copy link to clipboard",
        variant: "destructive",
      })
    }
  }

  const createdAt = new Date(paste.createdAt)
  const timeAgo = formatDistanceToNow(createdAt, { addSuffix: true })

  return (
    <div className="space-y-4">
      <div className="flex items-center">
        <NextLink href="/" className="flex items-center text-muted-foreground hover:text-foreground">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to home
        </NextLink>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex justify-between items-center">
            <span>Paste #{paste.id}</span>
            <div className="flex space-x-2">
              <Button variant="outline" size="sm" asChild>
                <NextLink href={`/analytics/${paste.slug}`}>
                  <BarChart className="mr-2 h-4 w-4" />
                  View Analytics
                </NextLink>
              </Button>
              <Button variant="outline" size="sm" onClick={copyLinkToClipboard}>
                {linkCopied ? (
                  <>
                    <Check className="mr-2 h-4 w-4" />
                    Link Copied
                  </>
                ) : (
                  <>
                    <Link className="mr-2 h-4 w-4" />
                    Copy Link
                  </>
                )}
              </Button>
              <Button variant="outline" size="sm" onClick={copyToClipboard}>
                {copied ? (
                  <>
                    <Check className="mr-2 h-4 w-4" />
                    Copied
                  </>
                ) : (
                  <>
                    <Copy className="mr-2 h-4 w-4" />
                    Copy
                  </>
                )}
              </Button>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <pre className="bg-muted p-4 rounded-md overflow-x-auto font-mono text-sm whitespace-pre-wrap">
            {paste.content}
          </pre>
        </CardContent>
        <CardFooter className="text-sm text-muted-foreground">
          <div className="flex flex-col space-y-1 w-full">
            <div>Created {timeAgo}</div>
            {paste.expirationTime && <div>Expires: {new Date(paste.expirationTime).toLocaleString()}</div>}
          </div>
        </CardFooter>
      </Card>
    </div>
  )
}
