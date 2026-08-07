import { useEffect, useState } from 'react'
import { AuthContext } from './authContext.js'
import { login as apiLogin, register as apiRegister, refreshSession, logout } from '../lib/api.js'

export function AuthProvider({ children }) {
  const [token, setToken] = useState(null)
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false

    refreshSession()
      .then(({ user: restoredUser, token: restoredToken }) => {
        if (!cancelled) {
          setUser(restoredUser)
          setToken(restoredToken)
        }
      })
      .catch(() => {
        if (!cancelled) {
          setUser(null)
          setToken(null)
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
  }, [])

  async function signIn(email, password) {
    const { token: newToken, user: newUser } = await apiLogin(email, password)
    setToken(newToken)
    setUser(newUser)
  }

  async function signUp(email, name, password) {
    const { token: newToken, user: newUser } = await apiRegister(email, name, password)
    setToken(newToken)
    setUser(newUser)
  }

  async function signOut() {
    // This now DOES make a server call: logout() revokes the entire
    // refresh-token family, not just the current access token. That
    // matters even for an access token that's still technically valid
    // elsewhere (another tab, a copy an attacker made) - once it expires,
    // whoever's holding it can no longer use the refresh cookie to get a
    // new one.
    await logout()
    setToken(null)
    setUser(null)
  }

  const value = { user, token, loading, signIn, signUp, signOut }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
