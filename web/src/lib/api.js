import { API_BASE } from '../config.js'

export class ApiError extends Error {
  constructor(status, message) {
    super(message)
    this.name = 'ApiError'
    this.status = status
  }
}

function messageFrom(body, status) {
  if (typeof body?.error === 'string') {
    return body.error
  }
  if (typeof body?.error?.message === 'string') {
    return body.error.message
  }
  return `Request failed (${status})`
}

async function apiFetch(path, { token, method = 'GET', body } = {}) {
  const headers = {}
  if (body !== undefined) {
    headers['content-type'] = 'application/json'
  }
  if (token) {
    headers['authorization'] = `Bearer ${token}`
  }

  const res = await fetch(`${API_BASE}${path}`, {
    method,
    headers,
    credentials: 'include',
    body: body !== undefined ? JSON.stringify(body) : undefined,
  })

  const text = await res.text()
  let data = null
  if (text) {
    try {
      data = JSON.parse(text)
    } catch {
      throw new ApiError(res.status, 'Invalid JSON response from server')
    }
  }

  if (!res.ok) {
    throw new ApiError(res.status, messageFrom(data, res.status))
  }

  return data
}

export function login(email, password) {
  return apiFetch('/api/auth/login', { method: 'POST', body: { email, password } })
}

// The refresh token itself is never handled here - it lives in an httpOnly
// cookie the browser sends automatically (credentials: 'include' above).
// This just asks the server to use it.
export function refreshSession() {
  return apiFetch('/api/auth/refresh', { method: 'POST' })
}

export function logout() {
  return apiFetch('/api/auth/logout', { method: 'POST' })
}

export function register(email, name, password) {
  return apiFetch('/api/auth/register', { method: 'POST', body: { email, name, password } })
}

export function fetchCurrentUser(token) {
  return apiFetch('/api/auth/me', { token })
}

export function fetchTickets(token) {
  return apiFetch('/api/tickets', { token })
}

export function fetchTicket(id, token) {
  return apiFetch(`/api/tickets/${id}`, { token })
}

export function fetchTicketCount(token) {
  return apiFetch('/api/tickets/count', { token })
}
