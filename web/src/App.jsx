import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { fetchTickets } from './api.js'
import './App.css'

function App() {
  const [tickets, setTickets] = useState(null)
  const [error, setError] = useState(null)

  useEffect(() => {
    fetchTickets()
      .then(setTickets)
      .catch((err) => setError(err.message))
  }, [])

  return (
    <div>
      <h1>Support Desk</h1>
      {error ? (
        <p>Failed to load tickets: {error}</p>
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

export default App
