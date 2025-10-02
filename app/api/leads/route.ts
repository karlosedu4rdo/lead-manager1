import { type NextRequest, NextResponse } from "next/server"
import { getLeads, createLead } from "@/lib/leads-storage"

export async function GET() {
  try {
    const leads = getLeads()
    return NextResponse.json(leads)
  } catch (error) {
    console.error("[v0] Error fetching leads:", error)
    return NextResponse.json({ error: "Failed to fetch leads" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const newLead = createLead(body)
    return NextResponse.json(newLead, { status: 201 })
  } catch (error) {
    console.error("[v0] Error creating lead:", error)
    return NextResponse.json({ error: "Failed to create lead" }, { status: 500 })
  }
}
