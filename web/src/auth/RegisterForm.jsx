import { useState } from 'react'
import { useAuth } from './authContext.js'
import { combineName } from '../utils/normalize.js'
import { isValidEmail, isValidPassword, passwordsMatch } from '../utils/validators.js'
import './RegisterForm.css'

export function RegisterForm({ onSwitchToLogin }) {
  const { signUp } = useAuth()
  const [firstName, setFirstName] = useState('')
  const [surname, setSurname] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState(null)
  const [submitting, setSubmitting] = useState(false)

  async function onSubmit(event) {
    event.preventDefault()
    setError(null)

    if (!isValidEmail(email)) {
      setError('Enter a valid email address.')
      return
    }
    if (!isValidPassword(password)) {
      setError('Password must be at least 8 characters.')
      return
    }
    if (!passwordsMatch(password, confirmPassword)) {
      setError('Passwords do not match.')
      return
    }

    setSubmitting(true)
    try {
      await signUp(email, combineName(firstName, surname), password)
    } catch (err) {
      setError(err.message)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <form className="register-form" onSubmit={onSubmit}>
      <h1>Register</h1>

      <div className="register-form-field">
        <label htmlFor="register-first-name">First Name</label>
        <input
          id="register-first-name"
          type="text"
          autoComplete="given-name"
          required
          value={firstName}
          onChange={(event) => setFirstName(event.target.value)}
        />
      </div>

      <div className="register-form-field">
        <label htmlFor="register-surname">Surname</label>
        <input
          id="register-surname"
          type="text"
          autoComplete="family-name"
          required
          value={surname}
          onChange={(event) => setSurname(event.target.value)}
        />
      </div>

      <div className="register-form-field">
        <label htmlFor="register-email">Email</label>
        <input
          id="register-email"
          type="email"
          autoComplete="email"
          required
          value={email}
          onChange={(event) => setEmail(event.target.value)}
        />
      </div>

      <div className="register-form-field">
        <label htmlFor="register-password">Password</label>
        <input
          id="register-password"
          type="password"
          autoComplete="new-password"
          required
          value={password}
          onChange={(event) => setPassword(event.target.value)}
        />
      </div>

      <div className="register-form-field">
        <label htmlFor="register-confirm-password">Confirm Password</label>
        <input
          id="register-confirm-password"
          type="password"
          autoComplete="new-password"
          required
          value={confirmPassword}
          onChange={(event) => setConfirmPassword(event.target.value)}
        />
      </div>

      {error && (
        <p className="register-form-error" role="alert">
          {error}
        </p>
      )}

      <button type="submit" disabled={submitting}>
        {submitting ? 'Registering…' : 'Register'}
      </button>
      <button type="button" onClick={onSwitchToLogin}>
        Back to sign in
      </button>
    </form>
  )
}
