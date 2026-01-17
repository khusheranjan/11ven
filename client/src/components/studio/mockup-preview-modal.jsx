"use client"

import { useState } from "react"
import { Button } from "@/components/ui/premium-button"
import { Card } from "@/components/ui/premium-card"

export function MockupPreviewModal({ isOpen, onClose }) => void }) {
  const [bgColor, setBgColor] = useState("white")
  const [selectedView, setSelectedView] = useState("flat-lay")

  if (!isOpen) return null

  const views = [
    { id, label, description: "Front view on flat surface" },
    { id, label, description: "Neatly folded presentation" },
    { id, label, description: "Worn on person" },
    { id, label, description: "Back view perspective" },
  ]

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <Card className="max-h-[90vh] w-full max-w-5xl overflow-y-auto">
        <div className="sticky top-0 border-b border-border bg-card p-6 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-foreground">Mockup Preview</h2>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground transition-smooth text-2xl">
            ×
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* View selector */}
          <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
            {views.map((view) => (
              <button
                key={view.id}
                onClick={() => setSelectedView(view.id)}
                className={`p-4 rounded-lg border-2 transition-smooth text-left ${
                  selectedView === view.id ? "border-accent bg-accent/10" : "border-border hover:border-accent/50"
                }`}
              >
                <div className="font-semibold text-foreground text-sm">{view.label}</div>
                <div className="text-xs text-muted-foreground">{view.description}</div>
              </button>
            ))}
          </div>

          {/* Mockup Preview Area */}
          <div className="flex flex-col items-center gap-6">
            <div
              className="flex items-center justify-center rounded-xl p-8 shadow-elevated transition-smooth"
              style={{ backgroundColor: bgColor }}
            >
              <svg
                viewBox="0 0 400 500"
                className="h-96 w-auto drop-shadow-2xl"
                style={{
                  filter,0,0,0.25))",
                }}
              >
                <path
                  d="M 100 80 L 150 120 L 150 350 Q 150 400 100 400 L 100 350 Q 100 300 100 100 Z"
                  fill="#1a1a1a"
                  stroke="rgba(0,0,0,0.2)"
                  strokeWidth="1"
                />
                <path
                  d="M 300 80 L 250 120 L 250 350 Q 250 400 300 400 L 300 350 Q 300 300 300 100 Z"
                  fill="#1a1a1a"
                  stroke="rgba(0,0,0,0.2)"
                  strokeWidth="1"
                />
                <ellipse cx="80" cy="150" rx="40" ry="30" fill="#1a1a1a" stroke="rgba(0,0,0,0.2)" strokeWidth="1" />
                <ellipse cx="320" cy="150" rx="40" ry="30" fill="#1a1a1a" stroke="rgba(0,0,0,0.2)" strokeWidth="1" />
                <circle cx="200" cy="90" r="35" fill="#1a1a1a" stroke="rgba(0,0,0,0.2)" strokeWidth="1" />

                {/* Design on shirt */}
                <rect x="140" y="170" width="120" height="140" fill="rgba(200, 100, 255, 0.8)" rx="8" />
                <text x="200" y="245" textAnchor="middle" className="fill-white" fontSize="24" fontWeight="bold">
                  Your Design
                </text>
              </svg>
            </div>

            {/* Background Color Selector */}
            <div className="flex items-center gap-4 justify-center w-full">
              <span className="text-sm font-medium text-foreground">Background:</span>
              <div className="flex gap-3">
                {["white", "#f5f5f5", "#e0e0e0", "#1a1a1a"].map((color) => (
                  <button
                    key={color}
                    onClick={() => setBgColor(color)}
                    className={`h-10 w-10 rounded-lg border-2 transition-smooth ${
                      bgColor === color ? "border-accent" : "border-border hover:border-accent/50"
                    }`}
                    style={{ backgroundColor: color }}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Details */}
          <Card className="p-4 bg-muted/50 border border-border">
            <h3 className="font-semibold text-foreground mb-3">Preview Details</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div>
                <div className="text-muted-foreground text-xs mb-1">Size</div>
                <div className="font-medium text-foreground">Large</div>
              </div>
              <div>
                <div className="text-muted-foreground text-xs mb-1">Color</div>
                <div className="font-medium text-foreground">Black</div>
              </div>
              <div>
                <div className="text-muted-foreground text-xs mb-1">Material</div>
                <div className="font-medium text-foreground">Premium Cotton</div>
              </div>
              <div>
                <div className="text-muted-foreground text-xs mb-1">Price</div>
                <div className="font-bold text-accent">$32.99</div>
              </div>
            </div>
          </Card>

          {/* Action buttons */}
          <div className="flex flex-col md:flex-row gap-3 pt-4">
            <Button variant="outline" className="flex-1 bg-transparent" onClick={onClose}>
              Back to Editor
            </Button>
            <Button variant="secondary" className="flex-1">
              Download Preview
            </Button>
            <Button variant="accent" className="flex-1">
              Add to Cart
            </Button>
          </div>
        </div>
      </Card>
    </div>
  )
}
