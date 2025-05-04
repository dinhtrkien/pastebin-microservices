import Link from "next/link"
import { Button } from "@/components/ui/button"

export default function NotFound() {
  return (
    <div className="container flex flex-col items-center justify-center min-h-[70vh] text-center px-4">
      <h1 className="text-4xl font-bold mb-4">404 - Paste Not Found</h1>
      <p className="text-muted-foreground mb-6">The paste you're looking for doesn't exist or has expired.</p>
      <Button asChild>
        <Link href="/">Create a New Paste</Link>
      </Button>
    </div>
  )
}
