"use client"

import type { Lead } from "@/lib/types"
import { Card } from "@/components/ui/card"
import { Phone, Mail, Calendar } from "lucide-react"

interface LeadCardProps {
  lead: Lead
  onClick: () => void
}

export function LeadCard({ lead, onClick }: LeadCardProps) {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    })
  }

  return (
    <Card className="p-4 cursor-pointer hover:shadow-md transition-shadow bg-card" onClick={onClick}>
      <h3 className="font-semibold text-base mb-2 text-card-foreground">{lead.nome}</h3>

      <div className="space-y-1.5 text-sm text-muted-foreground">
        <div className="flex items-center gap-2">
          <Mail className="h-3.5 w-3.5" />
          <span className="truncate">{lead.email}</span>
        </div>

        <div className="flex items-center gap-2">
          <Phone className="h-3.5 w-3.5" />
          <span>{lead.telefone}</span>
        </div>

        <div className="flex items-center gap-2">
          <Calendar className="h-3.5 w-3.5" />
          <span>{formatDate(lead.data_cadastro)}</span>
        </div>
      </div>

      {lead.anotacoes && <p className="mt-3 text-xs text-muted-foreground line-clamp-2">{lead.anotacoes}</p>}

      {lead.historico_interacoes.length > 0 && (
        <div className="mt-3 pt-3 border-t border-border">
          <p className="text-xs text-muted-foreground">
            {lead.historico_interacoes.length} interação{lead.historico_interacoes.length !== 1 ? "ões" : ""}
          </p>
        </div>
      )}
    </Card>
  )
}
