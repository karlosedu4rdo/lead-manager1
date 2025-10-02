"use client"

import { useState } from "react"
import type { Lead } from "@/lib/types"
import { KanbanBoard } from "@/components/kanban-board"
import { LeadsListView } from "@/components/leads-list-view"
import { LeadDetailModal } from "@/components/lead-detail-modal"
import { AddLeadModal } from "@/components/add-lead-modal"
import { ImportLeadsModal } from "@/components/import-leads-modal"
import { SearchBar } from "@/components/search-bar"
import { Button } from "@/components/ui/button"
import { Plus, LayoutGrid, List, Download, Upload } from "lucide-react"
import { exportToCSV } from "@/lib/export-import"
import { getLeads } from "@/lib/leads-storage"

type ViewMode = "kanban" | "list"

export default function Home() {
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null)
  const [refreshKey, setRefreshKey] = useState(0)
  const [showAddModal, setShowAddModal] = useState(false)
  const [showImportModal, setShowImportModal] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [viewMode, setViewMode] = useState<ViewMode>("kanban")

  const handleLeadUpdate = () => {
    setRefreshKey((prev) => prev + 1)
  }

  const handleLeadDelete = () => {
    setSelectedLead(null)
    setRefreshKey((prev) => prev + 1)
  }

  const handleLeadAdded = () => {
    setRefreshKey((prev) => prev + 1)
  }

  const handleExport = () => {
    const leads = getLeads()
    exportToCSV(leads)
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <div className="flex-shrink-0">
              <h1 className="text-2xl font-bold text-foreground">Gerenciamento de Leads</h1>
              <p className="text-sm text-muted-foreground mt-1">Acompanhe seu funil de vendas</p>
            </div>

            <div className="flex items-center gap-3 flex-wrap">
              <SearchBar onSearch={setSearchQuery} />

              <div className="flex items-center gap-2 border border-border rounded-lg p-1">
                <Button
                  size="sm"
                  variant={viewMode === "kanban" ? "secondary" : "ghost"}
                  onClick={() => setViewMode("kanban")}
                  className="h-8"
                >
                  <LayoutGrid className="h-4 w-4" />
                </Button>
                <Button
                  size="sm"
                  variant={viewMode === "list" ? "secondary" : "ghost"}
                  onClick={() => setViewMode("list")}
                  className="h-8"
                >
                  <List className="h-4 w-4" />
                </Button>
              </div>

              <Button size="sm" variant="outline" onClick={handleExport}>
                <Download className="h-4 w-4 mr-2" />
                Exportar
              </Button>

              <Button size="sm" variant="outline" onClick={() => setShowImportModal(true)}>
                <Upload className="h-4 w-4 mr-2" />
                Importar
              </Button>

              <Button size="sm" onClick={() => setShowAddModal(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Novo Lead
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-6 py-8">
        {viewMode === "kanban" ? (
          <KanbanBoard key={refreshKey} onLeadClick={setSelectedLead} searchQuery={searchQuery} />
        ) : (
          <LeadsListView
            key={refreshKey}
            onLeadClick={setSelectedLead}
            searchQuery={searchQuery}
            refreshKey={refreshKey}
          />
        )}
      </main>

      <LeadDetailModal
        lead={selectedLead}
        open={!!selectedLead}
        onOpenChange={(open) => !open && setSelectedLead(null)}
        onUpdate={handleLeadUpdate}
        onDelete={handleLeadDelete}
      />

      <AddLeadModal open={showAddModal} onOpenChange={setShowAddModal} onSuccess={handleLeadAdded} />

      <ImportLeadsModal open={showImportModal} onOpenChange={setShowImportModal} onSuccess={handleLeadAdded} />
    </div>
  )
}
