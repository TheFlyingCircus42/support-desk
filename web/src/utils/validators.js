const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export function isValidEmail(email) {
  return EMAIL_PATTERN.test(email)
}

export function isValidPassword(password) {
  return typeof password === 'string' && password.length >= 8
}

export function passwordsMatch(password, confirmPassword) {
  return password === confirmPassword
}
