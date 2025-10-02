"use client"

import type React from "react"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Upload, FileSpreadsheet, AlertCircle } from "lucide-react"
import { parseCSV } from "@/lib/export-import"
import { Alert, AlertDescription } from "@/components/ui/alert"

interface ImportLeadsModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess: () => void
}

export function ImportLeadsModal({ open, onOpenChange, onSuccess }: ImportLeadsModalProps) {
  const [importing, setImporting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setError(null)
    setImporting(true)

    try {
      const text = await file.text()
      const leads = parseCSV(text)

      if (leads.length === 0) {
        setError("Nenhum lead válido encontrado no arquivo CSV.")
        setImporting(false)
        return
      }

      // Import leads one by one
      let successCount = 0
      for (const lead of leads) {
        try {
          const response = await fetch("/api/leads", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(lead),
          })

          if (response.ok) successCount++
        } catch (err) {
          console.error("[v0] Error importing lead:", err)
        }
      }

      if (successCount > 0) {
        onSuccess()
        onOpenChange(false)
      } else {
        setError("Falha ao importar leads. Verifique o formato do arquivo.")
      }
    } catch (err) {
      console.error("[v0] Error reading file:", err)
      setError("Erro ao ler o arquivo. Certifique-se de que é um arquivo CSV válido.")
    } finally {
      setImporting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Importar Leads</DialogTitle>
          <DialogDescription>Faça upload de um arquivo CSV com os dados dos leads.</DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="flex flex-col items-center justify-center gap-4 rounded-lg border-2 border-dashed border-border bg-muted/20 p-8">
            <FileSpreadsheet className="h-12 w-12 text-muted-foreground" />
            <div className="text-center">
              <p className="text-sm font-medium">Formato esperado do CSV:</p>
              <p className="text-xs text-muted-foreground mt-1">Nome, Email, Telefone, Status, Data, Anotações</p>
            </div>

            <label htmlFor="csv-upload">
              <Button disabled={importing} asChild>
                <span>
                  <Upload className="h-4 w-4 mr-2" />
                  {importing ? "Importando..." : "Selecionar Arquivo CSV"}
                </span>
              </Button>
            </label>
            <input
              id="csv-upload"
              type="file"
              accept=".csv"
              className="hidden"
              onChange={handleFileUpload}
              disabled={importing}
            />
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
