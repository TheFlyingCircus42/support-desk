import { useEffect, useState } from 'react'
import { fetchTickets } from './lib/api.js'

function TicketList({ onSelect }) {
  const [tickets, setTickets] = useState([])
  const [error, setError] = useState(null)

  useEffect(() => {
    fetchTickets()
      .then(setTickets)
      .catch((err) => setError(err.message))
  }, [])

  return (
    <div>
      <h1>Support Desk</h1>
      {error && <p>{error}</p>}
      <ul>
        {tickets.map((ticket) => (
          <li key={ticket.id}>
            <button type="button" onClick={() => onSelect(ticket.id)}>
              {ticket.subject} — {ticket.status} — {ticket.priority}
            </button>
          </li>
        ))}
      </ul>
    </div>
  )
}

export default TicketList
