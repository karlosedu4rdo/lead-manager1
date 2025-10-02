"use client"

import { useState } from "react"
import type { Lead, Interacao } from "@/lib/types"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { Phone, Mail, Calendar, Plus, Edit2, Trash2 } from "lucide-react"
import { ScrollArea } from "@/components/ui/scroll-area"

interface LeadDetailModalProps {
  lead: Lead | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onUpdate: () => void
  onDelete: (id: string) => void
}

const interactionTypes = ["Ligação", "Email", "WhatsApp", "Reunião", "Outro"] as const

export function LeadDetailModal({ lead, open, onOpenChange, onUpdate, onDelete }: LeadDetailModalProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [editedLead, setEditedLead] = useState<Lead | null>(null)
  const [newInteraction, setNewInteraction] = useState<Partial<Interacao>>({
    tipo: "Ligação",
    descricao: "",
  })
  const [showAddInteraction, setShowAddInteraction] = useState(false)

  if (!lead) return null

  const currentLead = isEditing && editedLead ? editedLead : lead

  const handleEdit = () => {
    setEditedLead({ ...lead })
    setIsEditing(true)
  }

  const handleCancel = () => {
    setIsEditing(false)
    setEditedLead(null)
  }

  const handleSave = async () => {
    if (!editedLead) return

    try {
      const response = await fetch(`/api/leads/${lead.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(editedLead),
      })

      if (response.ok) {
        onUpdate()
        setIsEditing(false)
        setEditedLead(null)
      }
    } catch (error) {
      console.error("[v0] Error updating lead:", error)
    }
  }

  const handleDelete = async () => {
    if (!confirm("Tem certeza que deseja excluir este lead?")) return

    try {
      const response = await fetch(`/api/leads/${lead.id}`, {
        method: "DELETE",
      })

      if (response.ok) {
        onDelete(lead.id)
        onOpenChange(false)
      }
    } catch (error) {
      console.error("[v0] Error deleting lead:", error)
    }
  }

  const handleAddInteraction = async () => {
    if (!newInteraction.descricao || !editedLead) return

    const interaction: Interacao = {
      data: new Date().toISOString(),
      tipo: (newInteraction.tipo as Interacao["tipo"]) || "Ligação",
      descricao: newInteraction.descricao,
    }

    const updatedLead = {
      ...editedLead,
      historico_interacoes: [...editedLead.historico_interacoes, interaction],
    }

    try {
      const response = await fetch(`/api/leads/${lead.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updatedLead),
      })

      if (response.ok) {
        setEditedLead(updatedLead)
        setNewInteraction({ tipo: "Ligação", descricao: "" })
        setShowAddInteraction(false)
        onUpdate()
      }
    } catch (error) {
      console.error("[v0] Error adding interaction:", error)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  const getStatusColor = (status: Lead["status"]) => {
    const colors = {
      Novo: "bg-blue-500",
      "Em Contato": "bg-yellow-500",
      Negociação: "bg-purple-500",
      Fechado: "bg-green-500",
      Perdido: "bg-red-500",
    }
    return colors[status]
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh]">
        <DialogHeader>
          <DialogTitle>Detalhes do Lead</DialogTitle>
          <DialogDescription>Visualize e edite as informações do lead</DialogDescription>
        </DialogHeader>

        <ScrollArea className="max-h-[calc(90vh-200px)] pr-4">
          <div className="space-y-6">
            {/* Status Badge */}
            <div className="flex items-center gap-2">
              <div className={`w-3 h-3 rounded-full ${getStatusColor(currentLead.status)}`} />
              <Badge variant="secondary">{currentLead.status}</Badge>
            </div>

            {/* Basic Information */}
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="nome">Nome</Label>
                {isEditing ? (
                  <Input
                    id="nome"
                    value={editedLead?.nome || ""}
                    onChange={(e) => setEditedLead(editedLead ? { ...editedLead, nome: e.target.value } : null)}
                  />
                ) : (
                  <p className="text-sm font-medium">{currentLead.nome}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">
                  <Mail className="h-4 w-4 inline mr-2" />
                  Email
                </Label>
                {isEditing ? (
                  <Input
                    id="email"
                    type="email"
                    value={editedLead?.email || ""}
                    onChange={(e) => setEditedLead(editedLead ? { ...editedLead, email: e.target.value } : null)}
                  />
                ) : (
                  <p className="text-sm">{currentLead.email}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="telefone">
                  <Phone className="h-4 w-4 inline mr-2" />
                  Telefone
                </Label>
                {isEditing ? (
                  <Input
                    id="telefone"
                    value={editedLead?.telefone || ""}
                    onChange={(e) => setEditedLead(editedLead ? { ...editedLead, telefone: e.target.value } : null)}
                  />
                ) : (
                  <p className="text-sm">{currentLead.telefone}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label>
                  <Calendar className="h-4 w-4 inline mr-2" />
                  Data de Cadastro
                </Label>
                <p className="text-sm text-muted-foreground">{formatDate(currentLead.data_cadastro)}</p>
              </div>
            </div>

            <Separator />

            {/* Notes */}
            <div className="space-y-2">
              <Label htmlFor="anotacoes">Anotações</Label>
              {isEditing ? (
                <Textarea
                  id="anotacoes"
                  value={editedLead?.anotacoes || ""}
                  onChange={(e) => setEditedLead(editedLead ? { ...editedLead, anotacoes: e.target.value } : null)}
                  rows={4}
                  placeholder="Adicione observações sobre o lead..."
                />
              ) : (
                <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                  {currentLead.anotacoes || "Nenhuma anotação"}
                </p>
              )}
            </div>

            <Separator />

            {/* Interaction History */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label>Histórico de Interações</Label>
                {isEditing && (
                  <Button variant="outline" size="sm" onClick={() => setShowAddInteraction(!showAddInteraction)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Adicionar
                  </Button>
                )}
              </div>

              {showAddInteraction && isEditing && (
                <div className="space-y-3 p-4 border rounded-lg bg-muted/50">
                  <div className="space-y-2">
                    <Label htmlFor="interaction-type">Tipo</Label>
                    <Select
                      value={newInteraction.tipo}
                      onValueChange={(value) =>
                        setNewInteraction({ ...newInteraction, tipo: value as Interacao["tipo"] })
                      }
                    >
                      <SelectTrigger id="interaction-type">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {interactionTypes.map((type) => (
                          <SelectItem key={type} value={type}>
                            {type}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="interaction-description">Descrição</Label>
                    <Textarea
                      id="interaction-description"
                      value={newInteraction.descricao}
                      onChange={(e) => setNewInteraction({ ...newInteraction, descricao: e.target.value })}
                      rows={3}
                      placeholder="Descreva a interação..."
                    />
                  </div>

                  <div className="flex gap-2">
                    <Button size="sm" onClick={handleAddInteraction} disabled={!newInteraction.descricao}>
                      Salvar Interação
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        setShowAddInteraction(false)
                        setNewInteraction({ tipo: "Ligação", descricao: "" })
                      }}
                    >
                      Cancelar
                    </Button>
                  </div>
                </div>
              )}

              <div className="space-y-3">
                {currentLead.historico_interacoes.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-4">Nenhuma interação registrada</p>
                ) : (
                  currentLead.historico_interacoes
                    .slice()
                    .reverse()
                    .map((interacao, index) => (
                      <div key={index} className="p-3 border rounded-lg bg-card">
                        <div className="flex items-start justify-between mb-2">
                          <Badge variant="outline">{interacao.tipo}</Badge>
                          <span className="text-xs text-muted-foreground">{formatDate(interacao.data)}</span>
                        </div>
                        <p className="text-sm whitespace-pre-wrap">{interacao.descricao}</p>
                      </div>
                    ))
                )}
              </div>
            </div>
          </div>
        </ScrollArea>

        <Separator />

        <div className="flex justify-between">
          <Button variant="destructive" onClick={handleDelete}>
            <Trash2 className="h-4 w-4 mr-2" />
            Excluir
          </Button>

          <div className="flex gap-2">
            {isEditing ? (
              <>
                <Button variant="outline" onClick={handleCancel}>
                  Cancelar
                </Button>
                <Button onClick={handleSave}>
                  <Edit2 className="h-4 w-4 mr-2" />
                  Salvar
                </Button>
              </>
            ) : (
              <Button onClick={handleEdit}>
                <Edit2 className="h-4 w-4 mr-2" />
                Editar
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
