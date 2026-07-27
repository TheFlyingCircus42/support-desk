import { useEffect, useState } from 'react'
import Home from './pages/Home.jsx'
import { fetchOpenTicketCount } from './lib/api.js'

function App() {
  const [count, setCount] = useState(null)

  useEffect(() => {
    fetchOpenTicketCount()
      .then(({ count }) => {
        console.log('Open tickets:', count)
        setCount(count)
      })
      .catch(() => setCount(null))
  }, [])

  return (
    <>
      <Home />
      {count !== null && <footer>Open Tickets {count}</footer>}
    </>
  )
}

export default App
