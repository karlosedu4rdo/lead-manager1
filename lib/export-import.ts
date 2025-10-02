import type { Lead } from "./types"

export function exportToCSV(leads: Lead[]): void {
  const headers = ["Nome", "Email", "Telefone", "Status", "Data de Cadastro", "Anotações", "Interações"]

  const rows = leads.map((lead) => [
    lead.nome,
    lead.email,
    lead.telefone,
    lead.status,
    new Date(lead.data_cadastro).toLocaleDateString("pt-BR"),
    lead.anotacoes || "",
    lead.historico_interacoes?.length || 0,
  ])

  const csvContent = [headers, ...rows].map((row) => row.map((cell) => `"${cell}"`).join(",")).join("\n")

  const blob = new Blob(["\ufeff" + csvContent], { type: "text/csv;charset=utf-8;" })
  const link = document.createElement("a")
  const url = URL.createObjectURL(blob)

  link.setAttribute("href", url)
  link.setAttribute("download", `leads_${new Date().toISOString().split("T")[0]}.csv`)
  link.style.visibility = "hidden"
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}

export function parseCSV(csvText: string): Omit<Lead, "id" | "data_cadastro">[] {
  const lines = csvText.split("\n").filter((line) => line.trim())
  if (lines.length < 2) return []

  // Skip header row
  const dataLines = lines.slice(1)

  return dataLines
    .map((line) => {
      // Simple CSV parser (handles quoted fields)
      const fields: string[] = []
      let currentField = ""
      let inQuotes = false

      for (let i = 0; i < line.length; i++) {
        const char = line[i]

        if (char === '"') {
          inQuotes = !inQuotes
        } else if (char === "," && !inQuotes) {
          fields.push(currentField.trim())
          currentField = ""
        } else {
          currentField += char
        }
      }
      fields.push(currentField.trim())

      if (fields.length < 4) return null

      const [nome, email, telefone, status, , anotacoes] = fields

      return {
        nome: nome || "",
        email: email || "",
        telefone: telefone || "",
        status: (status as Lead["status"]) || "Novo",
        anotacoes: anotacoes || "",
        historico_interacoes: [],
      }
    })
    .filter((lead): lead is Omit<Lead, "id" | "data_cadastro"> => lead !== null && !!lead.nome)
}
