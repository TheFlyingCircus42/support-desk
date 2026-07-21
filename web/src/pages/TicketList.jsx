import { useEffect, useState } from 'react'
import { fetchTickets } from '../api.js'

function TicketList() {
  const [tickets, setTickets] = useState([])
  const [error, setError] = useState(null)

  useEffect(() => {
    fetchTickets()
      .then(setTickets)
      .catch((err) => setError(err.message))
  }, [])

  return (
    <div>
      <h1>Tickets</h1>
      {error ? (
        <p>Failed to load tickets: {error}</p>
      ) : (
        <ul>
          {tickets.map((ticket) => (
            <li key={ticket.id}>
              <ul>
                <li>ID: {ticket.id}</li>
                <li>Subject: {ticket.subject}</li>
                <li>Status: {ticket.status}</li>
                <li>Priority: {ticket.priority}</li>
                <li>Requester: {ticket.requester}</li>
              </ul>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

export default TicketList
