import type { Lead } from "./types"

const STORAGE_KEY = "leads_data"

// Server-side in-memory storage
let serverLeads: Lead[] | null = null

// Initialize with sample data if storage is empty
function initializeLeads(): Lead[] {
  const initialLeads: Lead[] = [
    {
      id: "1",
      nome: "João da Silva",
      email: "joao.silva@email.com",
      telefone: "(11) 98765-4321",
      status: "Novo",
      anotacoes: "Interesse em imóveis na zona sul de São Paulo. Família com 3 pessoas.",
      data_cadastro: new Date().toISOString(),
      historico_interacoes: [
        {
          data: new Date().toISOString(),
          tipo: "Ligação",
          descricao: "Primeiro contato. Conversa sobre o perfil de imóvel ideal.",
        },
      ],
    },
    {
      id: "2",
      nome: "Maria Santos",
      email: "maria.santos@email.com",
      telefone: "(11) 91234-5678",
      status: "Negociação",
      anotacoes: "Gostou do apartamento na Rua X. Aguardando feedback sobre a proposta.",
      data_cadastro: new Date().toISOString(),
      historico_interacoes: [
        {
          data: new Date().toISOString(),
          tipo: "Email",
          descricao: "Apresentação da proposta do apartamento Y.",
        },
      ],
    },
    {
      id: "3",
      nome: "Carlos Oliveira",
      email: "carlos.oliveira@email.com",
      telefone: "(11) 99876-5432",
      status: "Em Contato",
      anotacoes: "Procura apartamento de 2 quartos. Orçamento até R$ 500.000.",
      data_cadastro: new Date().toISOString(),
      historico_interacoes: [
        {
          data: new Date().toISOString(),
          tipo: "WhatsApp",
          descricao: "Enviou fotos de imóveis disponíveis.",
        },
      ],
    },
  ]
  return initialLeads
}

export function getLeads(): Lead[] {
  // Server-side: use in-memory storage
  if (typeof window === "undefined") {
    if (serverLeads === null) {
      serverLeads = initializeLeads()
    }
    return serverLeads
  }

  // Client-side: use localStorage
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (!stored) {
      const initial = initializeLeads()
      localStorage.setItem(STORAGE_KEY, JSON.stringify(initial))
      return initial
    }
    return JSON.parse(stored)
  } catch (error) {
    console.error("[v0] Error reading leads from localStorage:", error)
    return []
  }
}

export function saveLeads(leads: Lead[]): void {
  // Server-side: update in-memory storage
  if (typeof window === "undefined") {
    serverLeads = leads
    return
  }

  // Client-side: use localStorage
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(leads))
  } catch (error) {
    console.error("[v0] Error saving leads to localStorage:", error)
  }
}

export function getLeadById(id: string): Lead | null {
  const leads = getLeads()
  return leads.find((lead) => lead.id === id) || null
}

export function createLead(lead: Omit<Lead, "id" | "data_cadastro">): Lead {
  const leads = getLeads()
  const newLead: Lead = {
    ...lead,
    id: Date.now().toString(),
    data_cadastro: new Date().toISOString(),
    historico_interacoes: lead.historico_interacoes || [],
  }
  leads.push(newLead)
  saveLeads(leads)
  return newLead
}

export function updateLead(id: string, updates: Partial<Lead>): Lead | null {
  const leads = getLeads()
  const index = leads.findIndex((lead) => lead.id === id)

  if (index === -1) return null

  leads[index] = { ...leads[index], ...updates, id }
  saveLeads(leads)
  return leads[index]
}

export function deleteLead(id: string): boolean {
  const leads = getLeads()
  const filteredLeads = leads.filter((lead) => lead.id !== id)

  if (filteredLeads.length === leads.length) return false

  saveLeads(filteredLeads)
  return true
}
