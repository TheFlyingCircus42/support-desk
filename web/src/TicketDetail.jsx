import { useEffect, useState } from 'react'
import { fetchTicket } from './lib/api.js'

function TicketDetail({ id, onBack }) {
  const [ticket, setTicket] = useState(null)
  const [error, setError] = useState(null)

  useEffect(() => {
    fetchTicket(id)
      .then(setTicket)
      .catch((err) => setError(err.message))
  }, [id])

  return (
    <div>
      <button type="button" onClick={onBack}>
        Back
      </button>
      {error && <p>{error}</p>}
      {ticket && (
        <div>
          <h1>{ticket.subject}</h1>
          <p>Status: {ticket.status}</p>
          <p>Priority: {ticket.priority}</p>
          <p>Requester: {ticket.requester}</p>
          <p>{ticket.description}</p>
        </div>
      )}
    </div>
  )
}

export default TicketDetail
