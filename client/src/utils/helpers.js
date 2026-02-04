import { formatDistanceToNow } from 'date-fns'

const DATE_KEY_REGEX = /^\d{4}-\d{2}-\d{2}$/

export function getBrowserTimeZone() {
  return Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC'
}

function dateToKey(date, timeZone) {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  }).format(date)
}

export function normalizeDateKey(value, timeZone = getBrowserTimeZone()) {
  if (!value) return ''
  if (typeof value === 'string') {
    if (DATE_KEY_REGEX.test(value)) return value
    const date = new Date(value)
    if (Number.isNaN(date.getTime())) return ''
    return dateToKey(date, timeZone)
  }
  if (value instanceof Date) {
    if (Number.isNaN(value.getTime())) return ''
    return dateToKey(value, timeZone)
  }
  return ''
}

export function addDaysToDateKey(dateKey, days) {
  if (!DATE_KEY_REGEX.test(dateKey)) return ''
  const [year, month, day] = dateKey.split('-').map(Number)
  const date = new Date(Date.UTC(year, month - 1, day))
  date.setUTCDate(date.getUTCDate() + days)
  return date.toISOString().slice(0, 10)
}

export function getTodayKey(timeZone = getBrowserTimeZone()) {
  return dateToKey(new Date(), timeZone)
}

export function formatDateKey(dateKey, options = { month: 'short', day: 'numeric', year: 'numeric' }) {
  if (!DATE_KEY_REGEX.test(dateKey)) return ''
  const [year, month, day] = dateKey.split('-').map(Number)
  const date = new Date(Date.UTC(year, month - 1, day, 12))
  return new Intl.DateTimeFormat(undefined, { ...options, timeZone: 'UTC' }).format(date)
}

export function formatDate(date, timeZone = getBrowserTimeZone()) {
  const key = normalizeDateKey(date, timeZone)
  if (!key) return ''
  const todayKey = getTodayKey(timeZone)
  if (key === todayKey) return 'Today'
  if (key === addDaysToDateKey(todayKey, 1)) return 'Tomorrow'
  return formatDateKey(key)
}

export function formatShortDate(date, timeZone = getBrowserTimeZone()) {
  const key = normalizeDateKey(date, timeZone)
  if (!key) return ''
  return formatDateKey(key, { month: 'numeric', day: 'numeric' })
}

export function formatDateTime(date, timeZone = getBrowserTimeZone()) {
  if (!date) return ''
  if (typeof date === 'string' && DATE_KEY_REGEX.test(date)) {
    return formatDateKey(date)
  }
  const parsed = new Date(date)
  if (Number.isNaN(parsed.getTime())) return ''
  return new Intl.DateTimeFormat(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
    timeZone
  }).format(parsed)
}

export function isOverdue(date, timeZone = getBrowserTimeZone()) {
  const key = normalizeDateKey(date, timeZone)
  if (!key) return false
  const todayKey = getTodayKey(timeZone)
  return key < todayKey
}

export function getPriorityColor(priority) {
  const colors = {
    low: '#22c55e',
    medium: '#3b82f6',
    high: '#f59e0b',
    urgent: '#ef4444'
  }
  return colors[priority] || colors.medium
}

export function getInitials(firstName, lastName) {
  if (!firstName || !lastName) return ''
  return `${firstName[0]}${lastName[0]}`.toUpperCase()
}

export function generateId() {
  return Math.random().toString(36).substring(2, 9)
}

export function formatTimeAgo(date) {
  if (!date) return ''
  return formatDistanceToNow(new Date(date), { addSuffix: true })
}
