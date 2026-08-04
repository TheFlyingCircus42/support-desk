import { API_BASE } from '../config.js'

export async function fetchTickets() {
  const res = await fetch(`${API_BASE}/api/tickets`)
  if (!res.ok) {
    throw new Error(`Failed to fetch tickets: ${res.status}`)
  }
  return res.json()
}

export async function fetchTicket(id) {
  const res = await fetch(`${API_BASE}/api/tickets/${id}`)
  if (!res.ok) {
    throw new Error(`Failed to fetch ticket ${id}: ${res.status}`)
  }
  return res.json()
}

export async function fetchTicketCount() {
  const res = await fetch(`${API_BASE}/api/tickets/count`)
  if (!res.ok) {
    throw new Error(`Failed to fetch ticket count: ${res.status}`)
  }
  return res.json()
}
