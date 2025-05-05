import CreatePasteForm from "@/components/create-paste-form"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export default function Home() {
  return (
    <div className="container mx-auto py-10 px-4">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Pastebin</h1>
        <Card>
          <CardHeader>
            <CardTitle>Create New Paste</CardTitle>
            <CardDescription>Share code snippets, notes, or any text content</CardDescription>
          </CardHeader>
          <CardContent>
            <CreatePasteForm />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
