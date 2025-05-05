import { getPaste } from "@/lib/api"
import PasteAnalytics from "@/components/paste-analytics"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"
import { notFound } from "next/navigation"

export default async function AnalyticsPage({ params }: { params: { slug: string } }) {
  try {
    const paste = await getPaste(params.slug)

    return (
      <div className="container mx-auto py-10 px-4">
        <div className="max-w-3xl mx-auto space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <Button variant="ghost" size="sm" asChild className="mr-2">
                <Link href={`/${params.slug}`}>
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back to paste
                </Link>
              </Button>
            </div>
            <div className="text-sm text-muted-foreground">Paste #{paste.id}</div>
          </div>

          <div className="space-y-2">
            <h1 className="text-2xl font-bold">Analytics for Paste</h1>
            <p className="text-muted-foreground">View statistics and insights for your paste</p>
          </div>

          <PasteAnalytics slug={params.slug} createdAt={paste.createdAt} />
        </div>
      </div>
    )
  } catch (error) {
    notFound()
  }
}
