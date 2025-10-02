"use client"

import type React from "react"

import { useState, useEffect } from "react"
import type { Lead, LeadStatus } from "@/lib/types"
import { KanbanColumn } from "./kanban-column"
import { Loader2 } from "lucide-react"

interface KanbanBoardProps {
  onLeadClick: (lead: Lead) => void
  searchQuery?: string
}

const columns: { title: string; status: LeadStatus }[] = [
  { title: "Novo", status: "Novo" },
  { title: "Em Contato", status: "Em Contato" },
  { title: "Negociação", status: "Negociação" },
  { title: "Fechado", status: "Fechado" },
  { title: "Perdido", status: "Perdido" },
]

export function KanbanBoard({ onLeadClick, searchQuery = "" }: KanbanBoardProps) {
  const [leads, setLeads] = useState<Lead[]>([])
  const [draggedLead, setDraggedLead] = useState<Lead | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchLeads()
  }, [])

  const fetchLeads = async () => {
    try {
      const response = await fetch("/api/leads")
      const data = await response.json()
      setLeads(data)
    } catch (error) {
      console.error("[v0] Error fetching leads:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleDragStart = (lead: Lead) => {
    setDraggedLead(lead)
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
  }

  const handleDrop = async (newStatus: LeadStatus) => {
    if (!draggedLead || draggedLead.status === newStatus) {
      setDraggedLead(null)
      return
    }

    try {
      const response = await fetch(`/api/leads/${draggedLead.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...draggedLead, status: newStatus }),
      })

      if (response.ok) {
        const updatedLead = await response.json()
        setLeads(leads.map((lead) => (lead.id === updatedLead.id ? updatedLead : lead)))
      }
    } catch (error) {
      console.error("[v0] Error updating lead status:", error)
    } finally {
      setDraggedLead(null)
    }
  }

  const filterLeads = (leadsToFilter: Lead[]) => {
    if (!searchQuery.trim()) return leadsToFilter

    const query = searchQuery.toLowerCase()
    return leadsToFilter.filter(
      (lead) =>
        lead.nome.toLowerCase().includes(query) ||
        lead.email.toLowerCase().includes(query) ||
        lead.telefone.toLowerCase().includes(query),
    )
  }

  const getLeadsByStatus = (status: LeadStatus) => {
    const statusLeads = leads.filter((lead) => lead.status === status)
    return filterLeads(statusLeads)
  }

  const filteredLeadsCount = filterLeads(leads).length
  const totalLeadsCount = leads.length

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {searchQuery && (
        <div className="text-sm text-muted-foreground">
          Mostrando {filteredLeadsCount} de {totalLeadsCount} leads
        </div>
      )}

      <div className="flex gap-6 overflow-x-auto pb-4">
        {columns.map((column) => (
          <KanbanColumn
            key={column.status}
            title={column.title}
            status={column.status}
            leads={getLeadsByStatus(column.status)}
            onLeadClick={onLeadClick}
            onDragStart={handleDragStart}
            onDragOver={handleDragOver}
            onDrop={handleDrop}
          />
        ))}
      </div>
    </div>
  )
}
