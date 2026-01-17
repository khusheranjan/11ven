"use client"

import { Button } from "@/components/ui/premium-button"

export function StudioFooter() {
  return (
    <div className="flex items-center justify-between border-t border-border bg-card px-6 py-4 shadow-soft">
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-foreground">Price:</span>
          <span className="text-lg font-bold text-accent">$32.99</span>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <Button variant="outline" size="lg">
          Preview Mockups
        </Button>
        <Button variant="accent" size="lg">
          Add to Cart
        </Button>
      </div>
    </div>
  )
}
