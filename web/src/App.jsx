import { useState } from 'react'
import { useAuth } from './auth/authContext.js'
import { LoginForm } from './auth/LoginForm.jsx'
import Header from './Header.jsx'
import TicketList from './TicketList.jsx'
import TicketDetail from './TicketDetail.jsx'
import './App.css'

function App() {
  const { loading, user } = useAuth()
  const [selectedId, setSelectedId] = useState(null)

  // The loading / no user / signed in check below is a UX convenience only,
  // not a security boundary: it just controls what renders in the browser.
  // It has no bearing on whether the API actually returns data - that's
  // enforced entirely server-side via requireAuth.
  if (loading) {
    return <p>Loading…</p>
  }

  return (
    <>
      <Header />
      {!user ? (
        <LoginForm />
      ) : (
        <>
          {selectedId !== null ? (
            <TicketDetail id={selectedId} onBack={() => setSelectedId(null)} />
          ) : (
            <TicketList onSelect={setSelectedId} />
          )}
        </>
      )}
    </>
  )
}

export default App
