"use client"

import type React from "react"

import type { Lead, LeadStatus } from "@/lib/types"
import { LeadCard } from "./lead-card"
import { cn } from "@/lib/utils"

interface KanbanColumnProps {
  title: string
  status: LeadStatus
  leads: Lead[]
  onLeadClick: (lead: Lead) => void
  onDragStart: (lead: Lead) => void
  onDragOver: (e: React.DragEvent) => void
  onDrop: (status: LeadStatus) => void
}

const statusColors: Record<LeadStatus, string> = {
  Novo: "bg-blue-500",
  "Em Contato": "bg-yellow-500",
  Negociação: "bg-purple-500",
  Fechado: "bg-green-500",
  Perdido: "bg-red-500",
}

export function KanbanColumn({
  title,
  status,
  leads,
  onLeadClick,
  onDragStart,
  onDragOver,
  onDrop,
}: KanbanColumnProps) {
  return (
    <div className="flex flex-col min-w-[300px] flex-1">
      <div className="mb-4">
        <div className="flex items-center gap-2 mb-2">
          <div className={cn("w-3 h-3 rounded-full", statusColors[status])} />
          <h2 className="font-semibold text-lg text-foreground">{title}</h2>
          <span className="text-sm text-muted-foreground">({leads.length})</span>
        </div>
      </div>

      <div
        className="flex-1 space-y-3 min-h-[200px] p-3 rounded-lg bg-muted/30"
        onDragOver={onDragOver}
        onDrop={() => onDrop(status)}
      >
        {leads.map((lead) => (
          <div key={lead.id} draggable onDragStart={() => onDragStart(lead)} className="cursor-move">
            <LeadCard lead={lead} onClick={() => onLeadClick(lead)} />
          </div>
        ))}

        {leads.length === 0 && (
          <div className="flex items-center justify-center h-32 text-sm text-muted-foreground">
            Nenhum lead nesta etapa
          </div>
        )}
      </div>
    </div>
  )
}
