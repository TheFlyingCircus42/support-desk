import { useAuth } from './auth/authContext.js'
import './Header.css'

function Header() {
  const { user, signOut } = useAuth()

  return (
    <header className="app-header">
      <span>{user ? `Signed in as ${user.name}` : 'Not Signed In'}</span>
      {user && (
        <button type="button" onClick={signOut}>
          Sign out
        </button>
      )}
    </header>
  )
}

export default Header
