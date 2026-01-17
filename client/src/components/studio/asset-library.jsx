"use client"
import { X, Search } from "lucide-react"
import { useState } from "react"

const assetData = {
  graphics: {
    title,
    categories: [
      {
        name,
        items: [
          { id, name, emoji: "🇺🇸" },
          { id, name, emoji: "🍖" },
          { id, name, emoji: "⭐" },
          { id, name, emoji: "⭐" },
          { id, name, emoji: "🎨" },
          { id, name, emoji: "🗽" },
        ],
      },
      {
        name,
        items: [
          { id, name, emoji: "♻️" },
          { id, name, emoji: "🌍" },
          { id, name, emoji: "🌱" },
          { id, name, emoji: "🌸" },
          { id, name, emoji: "🎨" },
          { id, name, emoji: "🌻" },
        ],
      },
    ],
  },
  ai: {
    title,
    categories,
  },
  text: {
    title,
    categories: [
      {
        name,
        items: [
          { id, name, emoji: "B" },
          { id, name, emoji: "I" },
          { id, name, emoji: "S" },
          { id, name, emoji: "A" },
        ],
      },
    ],
  },
  library: {
    title,
    categories,
  },
  templates: {
    title,
    categories,
  },
  stock: {
    title,
    categories,
  },
}

export function AssetLibrary({ activeTab, onAddLayer }) {
  const [searchQuery, setSearchQuery] = useState("")

  const data = assetData[activeTab typeof assetData]

  if (!data) return null

  const hasContent = data.categories && data.categories.length > 0

  return (
    <div className="w-80 bg-card border-r border-border flex flex-col shadow-soft overflow-hidden">
      {/* Header */}
      <div className="p-4 border-b border-border">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-semibold text-foreground">{data.title}</h3>
          <X size={20} className="text-muted-foreground cursor-pointer hover:text-foreground" />
        </div>

        {hasContent && (
          <div className="relative">
            <Search size={16} className="absolute left-3 top-2.5 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-sm bg-muted border border-input rounded-lg text-foreground placeholder)}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        {hasContent ? (
          data.categories.map((category) => (
            <div key={category.name}>
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">{category.name}</h4>
                <button className="text-xs text-accent hover:text-accent/80">Show more</button>
              </div>
              <div className="grid grid-cols-3 gap-3">
                {category.items.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => onAddLayer("graphic", item.name)}
                    className="flex flex-col items-center justify-center p-3 rounded-lg bg-muted hover:bg-muted/70 transition-colors group"
                  >
                    <div className="text-3xl mb-1">{item.emoji}</div>
                    <span className="text-xs text-muted-foreground text-center line-clamp-2 group-hover:text-foreground transition-colors">
                      {item.name}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          ))
        ) {/* Footer */}
      <div className="border-t border-border p-4">
        <button className="w-full py-2 px-3 rounded-lg bg-muted border border-dashed border-accent text-accent hover)
}
