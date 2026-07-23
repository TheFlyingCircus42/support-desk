import { useEffect, useState } from 'react'
import { fetchTickets } from '../api.js'
import Header from '../components/header.jsx'

function TicketList() {
  const [tickets, setTickets] = useState(null)
  const [error, setError] = useState(null)

  const loadTickets = () => {
    setError(null)
    setTickets(null)
    fetchTickets()
      .then(setTickets)
      .catch(setError)
  }

  useEffect(() => {
    loadTickets()
  }, [])

  return (
    <div>
      <Header />
      <h1>Tickets</h1>
      {error ? (
        error.status >= 500 ? (
          <>
            <p>Something went wrong. Please try again.</p>
            <button onClick={loadTickets}>Retry</button>
          </>
        ) : (
          <p>Failed to load tickets: {error.message}</p>
        )
      ) : !tickets ? (
        <p>Loading tickets...</p>
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
