export function trimText(value) {
  return value.trim()
}

export function combineName(firstName, surname) {
  return `${trimText(firstName)} ${trimText(surname)}`.trim()
}
