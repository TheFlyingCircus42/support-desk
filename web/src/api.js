export async function fetchTickets() {
  const res = await fetch('/api/tickets')
  if (!res.ok) {
    throw new Error(`Failed to fetch tickets: ${res.status}`)
  }
  return res.json()
}

export async function fetchTicketById(id) {
  const res = await fetch(`/api/tickets/${id}`)
  if (!res.ok) {
    const body = await res.json().catch(() => ({}))
    throw new Error(body.error || `Failed to fetch ticket: ${res.status}`)
  }
  return res.json()
}
