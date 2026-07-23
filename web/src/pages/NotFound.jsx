import { useEffect } from 'react'
import Header from '../components/header.jsx'

function NotFound() {
  useEffect(() => {
    console.error('404: Page not found')
  }, [])

  return (
    <div>
      <Header />
      <p>404 - Page not found</p>
    </div>
  )
}

export default NotFound
