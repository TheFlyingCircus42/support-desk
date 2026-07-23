export async function fetchTickets() {
  const res = await fetch('/api/tickets')
  if (!res.ok) {
    const error = new Error(`Failed to fetch tickets: ${res.status}`)
    error.status = res.status
    throw error
  }
  return res.json()
}
