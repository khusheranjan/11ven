"use client"

import Link from "next/link"
import { Button } from "@/components/ui/premium-button"

export function StudioHeader() {
  return (
    <div className="flex items-center justify-between border-b border-border bg-card px-6 py-4 shadow-soft">
      <Link href="/" className="flex items-center gap-2">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-accent text-accent-foreground text-sm font-bold">
          11
        </div>
        <span className="font-bold text-foreground">ven Studio</span>
      </Link>

      <div className="flex items-center gap-2">
        <Button variant="outline" size="sm">
          Save Draft
        </Button>
        <Button variant="secondary" size="sm">
          Undo
        </Button>
        <Button variant="secondary" size="sm">
          Redo
        </Button>
      </div>

      <div className="flex items-center gap-2">
        <Button variant="outline" size="sm" asChild>
          <Link href="/">Exit Studio</Link>
        </Button>
      </div>
    </div>
  )
}
