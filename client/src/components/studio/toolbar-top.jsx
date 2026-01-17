"use client"

import { ChevronLeft, RotateCcw, RotateCw, Square, Copy, Trash2, Grid3x3, Eye } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/premium-button"

export function ToolbarTop({ showFrontSide, setShowFrontSide }) {
  return (
    <div className="flex items-center gap-4 border-b border-border bg-card px-6 py-3 shadow-soft">
      <Link href="/" className="p-2 hover:bg-muted rounded-lg transition-colors">
        <ChevronLeft size={20} className="text-foreground" />
      </Link>

      <div className="text-sm font-medium text-muted-foreground">Position</div>

      <div className="flex items-center gap-2">
        <button className="p-2 hover:bg-muted rounded-lg transition-colors" title="Undo">
          <RotateCcw size={18} className="text-muted-foreground" />
        </button>
        <button className="p-2 hover:bg-muted rounded-lg transition-colors" title="Redo">
          <RotateCw size={18} className="text-muted-foreground" />
        </button>
        <button className="p-2 hover:bg-muted rounded-lg transition-colors" title="Flip horizontal">
          <Square size={18} className="text-muted-foreground" />
        </button>
        <button className="p-2 hover:bg-muted rounded-lg transition-colors" title="Align">
          <Grid3x3 size={18} className="text-muted-foreground" />
        </button>
        <button className="p-2 hover:bg-muted rounded-lg transition-colors" title="Duplicate">
          <Copy size={18} className="text-muted-foreground" />
        </button>
        <button className="p-2 hover:bg-muted rounded-lg transition-colors" title="Delete">
          <Trash2 size={18} className="text-muted-foreground" />
        </button>
      </div>

      <div className="flex-1" />

      <Button variant="outline" size="sm" className="text-sm bg-transparent">
        Apply to all areas
      </Button>
      <Button variant="outline" size="sm" className="text-sm bg-transparent">
        Save
      </Button>

      <div className="flex items-center gap-2 ml-4 border-l border-border pl-4">
        <button
          onClick={() => setShowFrontSide(true)}
          className={`px-4 py-2 rounded-lg transition-colors text-sm font-medium ${
            showFrontSide ? "bg-accent text-accent-foreground" : "text-muted-foreground hover:text-foreground"
          }`}
        >
          Edit
        </button>
        <button
          onClick={() => setShowFrontSide(false)}
          className={`px-4 py-2 rounded-lg transition-colors text-sm font-medium ${
            !showFrontSide ? "bg-accent text-accent-foreground" : "text-muted-foreground hover:text-foreground"
          }`}
        >
          Preview
        </button>
      </div>

      <button className="p-2 hover:bg-muted rounded-lg transition-colors ml-2">
        <Eye size={20} className="text-muted-foreground" />
      </button>
    </div>
  )
}
