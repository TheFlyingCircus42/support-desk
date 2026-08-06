import { useEffect, useState } from 'react'
import { AuthContext } from './authContext.js'
import { login as apiLogin, register as apiRegister, fetchCurrentUser } from '../lib/api.js'

const TOKEN_KEY = 'supportdesk.token'

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem(TOKEN_KEY))
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false

    if (!token) {
      setUser(null)
      setLoading(false)
      return () => {
        cancelled = true
      }
    }

    fetchCurrentUser(token)
      .then(({ user: fetchedUser }) => {
        if (!cancelled) {
          setUser(fetchedUser)
        }
      })
      .catch(() => {
        if (!cancelled) {
          localStorage.removeItem(TOKEN_KEY)
          setToken(null)
          setUser(null)
        }
      })
      .finally(() => {
        if (!cancelled) {
          setLoading(false)
        }
      })

    return () => {
      cancelled = true
    }
  }, [token])

  async function signIn(email, password) {
    const { token: newToken, user: newUser } = await apiLogin(email, password)
    localStorage.setItem(TOKEN_KEY, newToken)
    setToken(newToken)
    setUser(newUser)
  }

  async function signUp(email, name, password) {
    const { token: newToken, user: newUser } = await apiRegister(email, name, password)
    localStorage.setItem(TOKEN_KEY, newToken)
    setToken(newToken)
    setUser(newUser)
  }

  function signOut() {
    // No server call here: the JWT is a stateless signed claim with no
    // revocation mechanism, so it stays valid until it naturally expires.
    // This only makes the browser forget it.
    localStorage.removeItem(TOKEN_KEY)
    setToken(null)
    setUser(null)
  }

  const value = { user, token, loading, signIn, signUp, signOut }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
