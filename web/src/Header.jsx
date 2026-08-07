import { useAuth } from './auth/authContext.js'
import { useTheme } from './theme/themeContext.js'
import './Header.css'

function Header() {
  const { user, signOut } = useAuth()
  const { theme, toggleTheme } = useTheme()

  return (
    <header className="app-header">
      <span>{user ? `Signed in as ${user.name}` : 'Not Signed In'}</span>
      <button type="button" onClick={toggleTheme}>
        {theme === 'dark' ? 'Light mode' : 'Dark mode'}
      </button>
      {user && (
        <button type="button" onClick={signOut}>
          Sign out
        </button>
      )}
    </header>
  )
}

export default Header
