import { useEffect, useState } from 'react'
import { fetchTickets } from '../lib/api.js'
import Header from '../components/header.jsx'
import TicketDetail from '../components/TicketDetail.jsx'
import '../App.css'

function Home() {
  const [tickets, setTickets] = useState(null)
  const [error, setError] = useState(null)
  const [selectedId, setSelectedId] = useState(null)

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

  if (selectedId !== null) {
    return <TicketDetail id={selectedId} onBack={() => setSelectedId(null)} />
  }

  return (
    <div>
      <Header />
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
              <button onClick={() => setSelectedId(ticket.id)}>
                {ticket.subject} — {ticket.status} — {ticket.priority}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

export default Home
