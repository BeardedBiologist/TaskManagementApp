import { format, isPast, isToday, isTomorrow, formatDistanceToNow } from 'date-fns'

export function formatDate(date) {
  if (!date) return ''
  const d = new Date(date)
  
  if (isToday(d)) return 'Today'
  if (isTomorrow(d)) return 'Tomorrow'
  return format(d, 'MMM d, yyyy')
}

export function formatDateTime(date) {
  if (!date) return ''
  return format(new Date(date), 'MMM d, yyyy h:mm a')
}

export function isOverdue(date) {
  if (!date) return false
  return isPast(new Date(date)) && !isToday(new Date(date))
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
