export interface Interacao {
  data: string
  tipo: "Ligação" | "Email" | "WhatsApp" | "Reunião" | "Outro"
  descricao: string
}

export interface Lead {
  id: string
  nome: string
  email: string
  telefone: string
  status: "Novo" | "Em Contato" | "Negociação" | "Fechado" | "Perdido"
  anotacoes: string
  historico_interacoes: Interacao[]
  data_cadastro: string
}

export type LeadStatus = Lead["status"]
