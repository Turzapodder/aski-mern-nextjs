import fs from "fs"
import path from "path"
import type { ReactNode } from "react"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

const loadGuide = () => {
  try {
    const guidePath = path.resolve(process.cwd(), "..", "..", "agents", "TEST_GUIDE.md")
    return fs.readFileSync(guidePath, "utf8")
  } catch (error) {
    return "# Test Guide\nUnable to load the test guide file."
  }
}

const renderGuide = (content: string) => {
  const lines = content.split(/\r?\n/)
  const elements: ReactNode[] = []
  let listItems: string[] = []

  const flushList = (key: string) => {
    if (listItems.length === 0) return
    const items = listItems
    listItems = []
    elements.push(
      <ul key={key} className="list-disc space-y-1 pl-5 text-sm text-gray-700">
        {items.map((item, index) => (
          <li key={`${key}-item-${index}`}>{item}</li>
        ))}
      </ul>
    )
  }

  lines.forEach((line, index) => {
    const trimmed = line.trim()

    if (!trimmed) {
      flushList(`list-${index}`)
      elements.push(<div key={`spacer-${index}`} className="h-2" />)
      return
    }

    if (trimmed.startsWith("# ")) {
      flushList(`list-${index}`)
      elements.push(
        <h1 key={`h1-${index}`} className="text-2xl font-semibold text-gray-900">
          {trimmed.slice(2)}
        </h1>
      )
      return
    }

    if (trimmed.startsWith("## ")) {
      flushList(`list-${index}`)
      elements.push(
        <h2 key={`h2-${index}`} className="text-lg font-semibold text-gray-900">
          {trimmed.slice(3)}
        </h2>
      )
      return
    }

    if (trimmed.startsWith("### ")) {
      flushList(`list-${index}`)
      elements.push(
        <h3 key={`h3-${index}`} className="text-base font-semibold text-gray-900">
          {trimmed.slice(4)}
        </h3>
      )
      return
    }

    if (trimmed.startsWith("- ")) {
      listItems.push(trimmed.slice(2))
      return
    }

    flushList(`list-${index}`)
    elements.push(
      <p key={`p-${index}`} className="text-sm text-gray-700">
        {trimmed}
      </p>
    )
  })

  flushList("list-final")
  return elements
}

export default function AdminTestGuidePage() {
  const content = loadGuide()

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-gray-900">Test Guide</h1>
        <p className="text-sm text-gray-500">Step-by-step checklist for validating admin panel workflows.</p>
      </div>
      <Card className="border border-gray-200/70 bg-white/90 shadow-sm">
        <CardHeader>
          <CardTitle className="text-base font-semibold">QA Checklist</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">{renderGuide(content)}</CardContent>
      </Card>
    </div>
  )
}
