"use client"

import type React from "react"

import { useState, useEffect } from "react"
import type { Lead } from "@/lib/types"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Phone, Mail, Calendar, Eye, Trash2 } from "lucide-react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

interface LeadsListViewProps {
  searchQuery: string
  onLeadClick: (lead: Lead) => void
  refreshKey: number
}

const statusColors = {
  Novo: "bg-blue-500/10 text-blue-500 border-blue-500/20",
  "Em Contato": "bg-yellow-500/10 text-yellow-500 border-yellow-500/20",
  Negociação: "bg-purple-500/10 text-purple-500 border-purple-500/20",
  "Fechado/Concluído": "bg-green-500/10 text-green-500 border-green-500/20",
  "Perdido/Descartado": "bg-red-500/10 text-red-500 border-red-500/20",
}

export function LeadsListView({ searchQuery, onLeadClick, refreshKey }: LeadsListViewProps) {
  const [leads, setLeads] = useState<Lead[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchLeads()
  }, [refreshKey])

  const fetchLeads = async () => {
    try {
      setLoading(true)
      const response = await fetch("/api/leads")
      if (!response.ok) throw new Error("Failed to fetch leads")
      const data = await response.json()
      setLeads(data)
    } catch (error) {
      console.error("[v0] Error fetching leads:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation()
    if (!confirm("Tem certeza que deseja excluir este lead?")) return

    try {
      const response = await fetch(`/api/leads/${id}`, { method: "DELETE" })
      if (!response.ok) throw new Error("Failed to delete lead")
      fetchLeads()
    } catch (error) {
      console.error("[v0] Error deleting lead:", error)
    }
  }

  const filteredLeads = leads.filter((lead) => {
    if (!searchQuery) return true
    const query = searchQuery.toLowerCase()
    return (
      lead.nome.toLowerCase().includes(query) ||
      lead.email.toLowerCase().includes(query) ||
      lead.telefone.toLowerCase().includes(query)
    )
  })

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-muted-foreground">Carregando leads...</div>
      </div>
    )
  }

  if (filteredLeads.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <p className="text-muted-foreground">
          {searchQuery ? "Nenhum lead encontrado com os critérios de busca." : "Nenhum lead cadastrado ainda."}
        </p>
      </div>
    )
  }

  return (
    <div className="rounded-lg border border-border bg-card">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Nome</TableHead>
            <TableHead>Contato</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Data de Cadastro</TableHead>
            <TableHead>Interações</TableHead>
            <TableHead className="text-right">Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filteredLeads.map((lead) => (
            <TableRow key={lead.id} className="cursor-pointer hover:bg-muted/50" onClick={() => onLeadClick(lead)}>
              <TableCell className="font-medium">{lead.nome}</TableCell>
              <TableCell>
                <div className="flex flex-col gap-1 text-sm">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Mail className="h-3 w-3" />
                    {lead.email}
                  </div>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Phone className="h-3 w-3" />
                    {lead.telefone}
                  </div>
                </div>
              </TableCell>
              <TableCell>
                <Badge variant="outline" className={statusColors[lead.status]}>
                  {lead.status}
                </Badge>
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Calendar className="h-3 w-3" />
                  {new Date(lead.data_cadastro).toLocaleDateString("pt-BR")}
                </div>
              </TableCell>
              <TableCell>
                <span className="text-sm text-muted-foreground">
                  {lead.historico_interacoes?.length || 0} interações
                </span>
              </TableCell>
              <TableCell className="text-right">
                <div className="flex items-center justify-end gap-2">
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={(e) => {
                      e.stopPropagation()
                      onLeadClick(lead)
                    }}
                  >
                    <Eye className="h-4 w-4" />
                  </Button>
                  <Button size="sm" variant="ghost" onClick={(e) => handleDelete(lead.id, e)}>
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
