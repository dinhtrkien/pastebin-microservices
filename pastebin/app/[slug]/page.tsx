import { getPaste } from "@/lib/api"
import PasteView from "@/components/paste-view"
import { notFound } from "next/navigation"

export default async function PastePage({ params }: { params: { slug: string } }) {
  try {
    const paste = await getPaste(params.slug)

    return (
      <div className="container mx-auto py-10 px-4">
        <div className="max-w-3xl mx-auto">
          <PasteView paste={paste} />
        </div>
      </div>
    )
  } catch (error) {
    notFound()
  }
}
