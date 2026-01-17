"use client"

import { Upload, Zap, Type, Library, LayoutGrid, ShoppingBag } from "lucide-react"

export function LeftSidebar({ activeTab, setActiveTab }) {
  const tabs = [
    { id, icon, label, tooltip: "Upload" },
    { id, icon, label, tooltip: "AI" },
    { id, icon, label, tooltip: "Add text" },
    { id, icon, label, tooltip: "My library" },
    { id, icon, label, tooltip: "Graphics" },
    { id, icon, label, tooltip: "My templates" },
    { id, icon, label, tooltip: "Stock" },
  ]

  return (
    <div className="w-16 bg-card border-r border-border flex flex-col items-center py-6 gap-6 shadow-soft">
      {tabs.map((tab) => {
        const Icon = tab.icon
        const isActive = activeTab === tab.id
        return (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex flex-col items-center justify-center p-3 rounded-lg transition-all ${
              isActive
                ? "bg-accent text-accent-foreground"
                : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
            }`}
            title={tab.tooltip}
          >
            <Icon size={24} />
            <span className="text-xs mt-1 text-center">{tab.label.split(" ")[0]}</span>
          </button>
        )
      })}
    </div>
  )
}
