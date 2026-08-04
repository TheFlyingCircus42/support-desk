import { useEffect, useState } from 'react'
import TicketList from './TicketList.jsx'
import TicketDetail from './TicketDetail.jsx'
import { fetchTicketCount } from './lib/api.js'
import './App.css'

function App() {
  const [selectedId, setSelectedId] = useState(null)
  const [count, setCount] = useState(null)

  useEffect(() => {
    fetchTicketCount().then(({ count }) => setCount(count))
  }, [])

  return (
    <>
      {selectedId !== null ? (
        <TicketDetail id={selectedId} onBack={() => setSelectedId(null)} />
      ) : (
        <TicketList onSelect={setSelectedId} />
      )}
      {count !== null && <footer>{count} open tickets</footer>}
    </>
  )
}

export default App
