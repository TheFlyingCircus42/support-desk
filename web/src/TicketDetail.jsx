import { useEffect, useState } from 'react'
import { fetchTicket } from './lib/api.js'
import { useAuth } from './auth/authContext.js'
import './TicketDetail.css'

function TicketDetail({ id, onBack }) {
  const { token, user } = useAuth()
  const [ticket, setTicket] = useState(null)
  const [error, setError] = useState(null)

  useEffect(() => {
    setTicket(null)
    setError(null)
    fetchTicket(id, token)
      .then(setTicket)
      .catch((err) => setError(err.message))
  }, [id, token])

  return (
    <div className="ticket-panel">
      <button className="back-button" type="button" onClick={onBack}>
        Back
      </button>
      {error && <p className="error-text">{error}</p>}
      {ticket && (
        <div>
          <h1>{ticket.subject}</h1>
          <p>
            Status: <span className={`status-${ticket.status}`}>{ticket.status}</span>
          </p>
          <p>
            Priority: <span className={`priority-${ticket.priority}`}>{ticket.priority}</span>
          </p>
          <p>
            Requester: {ticket.requester}
            {user && ticket.requester === user.email && <span className="you-pill">You</span>}
          </p>
          <p>
            Assignee: {ticket.assignee ?? 'unassigned'}
            {user && ticket.assignee === user.email && <span className="you-pill">You</span>}
          </p>
          <p>{ticket.description}</p>
        </div>
      )}
    </div>
  )
}

export default TicketDetail
