import { useEffect, useState } from 'react'
import { fetchTickets } from './api.js'
import './App.css'

function App() {
  const [tickets, setTickets] = useState([])
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
      ) : (
        <ul>
          {tickets.map((ticket) => (
            <li key={ticket.id}>
              {ticket.subject} — {ticket.status} — {ticket.priority}
            </li>
          ))}
        </ul>
      )}
      <footer>Ticket count: {tickets.length}</footer>
    </div>
  )
}

export default App
