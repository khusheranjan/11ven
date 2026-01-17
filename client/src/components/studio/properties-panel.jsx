"use client"
import { Button } from "@/components/ui/premium-button"
import { Trash2 } from "lucide-react"

export function PropertiesPanel({
  tshirtColor,
  setTshirtColor,
  layers,
  selectedLayer,
  onSelectLayer,
  onUpdateLayer,
  onDeleteLayer,
  onDuplicateLayer,
  showFrontSide,
}) {
  const selected = layers.find((l) => l.id === selectedLayer)

  return (
    <div className="w-96 bg-card border-l border-border flex flex-col shadow-soft overflow-hidden">
      {/* Variants Section */}
      <div className="border-b border-border p-4">
        <h3 className="font-bold text-foreground mb-4">Variants and layers</h3>

        <div className="space-y-4">
          <div>
            <h4 className="text-sm font-semibold text-foreground mb-3">Variants</h4>
            <div className="flex items-center justify-between bg-muted rounded-lg p-3">
              <span className="text-sm text-muted-foreground">Comfort colors · colors</span>
              <button className="text-accent text-sm font-medium hover:text-accent/80">Select variants</button>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex gap-2">
              <button
                onClick={() => setTshirtColor("#FFFFFF")}
                className={`w-8 h-8 rounded-full border-2 transition-all ${
                  tshirtColor === "#FFFFFF" ? "border-accent" : "border-border"
                }`}
                style={{ backgroundColor: "#FFFFFF" }}
              />
            </div>
            <span className="text-xs text-muted-foreground">T-Shirt Color</span>
          </div>
        </div>
      </div>

      {/* Layers Section */}
      <div className="border-b border-border p-4">
        <h4 className="text-sm font-semibold text-foreground mb-3">Layers</h4>

        <div className="space-y-2 max-h-48 overflow-y-auto">
          {layers.map((layer) => (
            <button
              key={layer.id}
              onClick={() => onSelectLayer(layer.id)}
              className={`w-full p-3 rounded-lg text-left transition-colors flex items-center gap-3 ${
                selectedLayer === layer.id
                  ? "bg-accent text-accent-foreground"
                  : "bg-muted text-foreground hover:bg-muted/80"
              }`}
            >
              <div className="w-8 h-8 bg-gradient-to-br from-green-300 to-green-500 rounded flex items-center justify-center text-xs font-bold">
                🥑
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-medium text-sm line-clamp-1">{layer.name}</div>
                <div className="text-xs opacity-70">High resolution (Vector)</div>
              </div>
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  onDeleteLayer(layer.id)
                }}
                className="opacity-60 hover:opacity-100 transition-opacity"
              >
                <Trash2 size={16} />
              </button>
            </button>
          ))}
        </div>

        <button className="w-full mt-3 py-2 px-3 rounded-lg bg-muted text-muted-foreground text-sm font-medium hover:text-foreground transition-colors">
          Create pattern
        </button>
      </div>

      {/* Properties Section */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {selected ? (
          <>
            {/* Width & Height */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-semibold text-muted-foreground block mb-2">Width</label>
                <div className="flex gap-2">
                  <input
                    type="number"
                    value={selected.width}
                    onChange={(e) => onUpdateLayer(selected.id, { width) })}
                    className="flex-1 px-3 py-2 rounded-lg bg-muted border border-input text-foreground text-sm"
                  />
                  <span className="px-2 py-2 text-sm text-muted-foreground">in</span>
                </div>
              </div>
              <div>
                <label className="text-xs font-semibold text-muted-foreground block mb-2">Height</label>
                <div className="flex gap-2">
                  <input
                    type="number"
                    value={selected.height}
                    onChange={(e) => onUpdateLayer(selected.id, { height) })}
                    className="flex-1 px-3 py-2 rounded-lg bg-muted border border-input text-foreground text-sm"
                  />
                  <span className="px-2 py-2 text-sm text-muted-foreground">in</span>
                </div>
              </div>
            </div>

            {/* Rotate & Scale */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-semibold text-muted-foreground block mb-2">Rotate</label>
                <div className="flex gap-2">
                  <input
                    type="number"
                    value={selected.rotation}
                    onChange={(e) => onUpdateLayer(selected.id, { rotation) })}
                    className="flex-1 px-3 py-2 rounded-lg bg-muted border border-input text-foreground text-sm"
                  />
                  <span className="px-2 py-2 text-sm text-muted-foreground">deg</span>
                </div>
              </div>
              <div>
                <label className="text-xs font-semibold text-muted-foreground block mb-2">Scale</label>
                <div className="flex gap-2">
                  <input
                    type="number"
                    value={selected.scaleX}
                    onChange={(e) => onUpdateLayer(selected.id, { scaleX) })}
                    className="flex-1 px-3 py-2 rounded-lg bg-muted border border-input text-foreground text-sm"
                  />
                  <span className="px-2 py-2 text-sm text-muted-foreground">%</span>
                </div>
              </div>
            </div>

            {/* Position */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-semibold text-muted-foreground block mb-2">Position left</label>
                <div className="flex gap-2">
                  <input
                    type="number"
                    value={selected.posX}
                    onChange={(e) => onUpdateLayer(selected.id, { posX) })}
                    className="flex-1 px-3 py-2 rounded-lg bg-muted border border-input text-foreground text-sm"
                  />
                  <span className="px-2 py-2 text-sm text-muted-foreground">%</span>
                </div>
              </div>
              <div>
                <label className="text-xs font-semibold text-muted-foreground block mb-2">Position top</label>
                <div className="flex gap-2">
                  <input
                    type="number"
                    value={selected.posY}
                    onChange={(e) => onUpdateLayer(selected.id, { posY) })}
                    className="flex-1 px-3 py-2 rounded-lg bg-muted border border-input text-foreground text-sm"
                  />
                  <span className="px-2 py-2 text-sm text-muted-foreground">%</span>
                </div>
              </div>
            </div>
          </>
        ) {/* Save Button */}
      <div className="border-t border-border p-4">
        <Button className="w-full bg-green-500 hover)
}
