import { useEffect, useState } from 'react'
import { fetchTickets, fetchTicketCount } from './lib/api.js'
import { useAuth } from './auth/authContext.js'
import './TicketList.css'

function TicketList({ onSelect }) {
  const { token } = useAuth()
  const [tickets, setTickets] = useState([])
  const [count, setCount] = useState(null)
  const [error, setError] = useState(null)

  useEffect(() => {
    fetchTickets(token)
      .then(setTickets)
      .catch((err) => setError(err.message))
  }, [token])

  useEffect(() => {
    fetchTicketCount(token).then(({ count }) => setCount(count))
  }, [token])

  return (
    <div>
      <h1>Support Desk</h1>
      <h2>My tickets</h2>
      {count !== null && (
        <p>
          {count} {count === 1 ? 'ticket' : 'tickets'} open
        </p>
      )}
      {error && <p>{error}</p>}
      {tickets.length === 0 && !error ? (
        <p>No tickets involve you yet.</p>
      ) : (
        <ul className="ticket-list">
          {tickets.map((ticket) => (
            <li key={ticket.id}>
              <button type="button" onClick={() => onSelect(ticket.id)}>
                {ticket.subject} —{' '}
                <span className={`status-${ticket.status}`}>{ticket.status}</span> —{' '}
                <span className={`priority-${ticket.priority}`}>{ticket.priority}</span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

export default TicketList
