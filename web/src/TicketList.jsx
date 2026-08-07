import { useEffect, useState } from 'react'
import { fetchTickets, fetchTicketCount } from './lib/api.js'
import { useAuth } from './auth/authContext.js'
import './TicketList.css'

function TicketList({ onSelect }) {
  const { token, user } = useAuth()
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
    <div className="ticket-panel">
      <h1>Support Desk</h1>
      <h2>My tickets</h2>
      {count !== null && (
        <p className="muted-text">
          {count} {count === 1 ? 'ticket' : 'tickets'} open
        </p>
      )}
      {error && <p className="error-text">{error}</p>}
      {tickets.length === 0 && !error ? (
        <p className="muted-text">No tickets involve you yet.</p>
      ) : (
        <ul className="ticket-list">
          {tickets.map((ticket) => {
            const isRequester = user && ticket.requester === user.email
            const isAssignee = user && ticket.assignee === user.email
            return (
              <li key={ticket.id}>
                <button type="button" onClick={() => onSelect(ticket.id)}>
                  {ticket.subject} —{' '}
                  <span className={`status-${ticket.status}`}>{ticket.status}</span> —{' '}
                  <span className={`priority-${ticket.priority}`}>{ticket.priority}</span>
                  {isRequester && <span className="role-pill">Requester</span>}
                  {isAssignee && <span className="role-pill">Assignee</span>}
                </button>
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}

export default TicketList
