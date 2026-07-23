import { Routes, Route } from 'react-router-dom'
import Home from './pages/Home.jsx'
import TicketList from './pages/TicketList.jsx'
import NotFound from './pages/NotFound.jsx'

function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/tickets" element={<TicketList />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  )
}

export default App
