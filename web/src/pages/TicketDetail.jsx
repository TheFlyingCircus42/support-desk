import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { fetchTicketById } from '../api.js'

function TicketDetail() {
  const { id } = useParams()
  const [ticket, setTicket] = useState(null)
  const [error, setError] = useState(null)

  useEffect(() => {
    setTicket(null)
    setError(null)
    fetchTicketById(id)
      .then(setTicket)
      .catch((err) => setError(err.message))
  }, [id])

  return (
    <div>
      <h1>Ticket Detail</h1>
      {error ? (
        <p>Failed to load ticket: {error}</p>
      ) : !ticket ? (
        <p>Loading ticket...</p>
      ) : (
        <ul>
          <li>ID: {ticket.id}</li>
          <li>Subject: {ticket.subject}</li>
          <li>Status: {ticket.status}</li>
          <li>Priority: {ticket.priority}</li>
          <li>Requester: {ticket.requester}</li>
        </ul>
      )}
    </div>
  )
}

export default TicketDetail
