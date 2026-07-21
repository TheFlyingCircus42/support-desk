import { Routes, Route } from 'react-router-dom'
import Home from './pages/Home.jsx'
import TicketList from './pages/TicketList.jsx'
import TicketDetail from './pages/TicketDetail.jsx'

function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/tickets" element={<TicketList />} />
      <Route path="/tickets/:id" element={<TicketDetail />} />
    </Routes>
  )
}

export default App
