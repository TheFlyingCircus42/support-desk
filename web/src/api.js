export async function fetchTickets() {
  const res = await fetch('/api/tickets')
  if (!res.ok) {
    const error = new Error(`Failed to fetch tickets: ${res.status}`)
    error.status = res.status
    throw error
  }
  return res.json()
}

export async function fetchTicketById(id) {
  const res = await fetch(`/api/tickets/${id}`)
  if (!res.ok) {
    const body = await res.json().catch(() => ({}))
    const error = new Error(body.error || `Failed to fetch ticket: ${res.status}`)
    error.status = res.status
    throw error
  }
  return res.json()
}
