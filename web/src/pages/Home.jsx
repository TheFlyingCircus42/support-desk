import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { fetchTickets } from '../api.js'
import '../App.css'

function Home() {
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
      <h1>Support Desk</h1>
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
              <Link to={`/tickets/${ticket.id}`}>
                {ticket.subject} — {ticket.status} — {ticket.priority}
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

export default Home
