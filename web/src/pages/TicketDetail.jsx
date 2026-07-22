import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { fetchTicketById } from '../api.js'
import Header from '../components/header.jsx'

function TicketDetail() {
  const { id } = useParams()
  const [ticket, setTicket] = useState(null)
  const [error, setError] = useState(null)

  const loadTicket = () => {
    setTicket(null)
    setError(null)
    fetchTicketById(id)
      .then(setTicket)
      .catch(setError)
  }

  useEffect(() => {
    loadTicket()
  }, [id])

  return (
    <div>
      <Header />
      <h1>Ticket Detail</h1>
      <p>
        <Link to="/tickets">← Back to list</Link>
      </p>
      {error ? (
        error.status >= 500 ? (
          <>
            <p>Something went wrong. Please try again.</p>
            <button onClick={loadTicket}>Retry</button>
          </>
        ) : (
          <p>Failed to load ticket: {error.message}</p>
        )
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
