export const formatDate = (dateString) => {
  if (!dateString) return 'N/A'
  const date = new Date(dateString)
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  })
}

export const formatTime = (dateString) => {
  if (!dateString) return 'N/A'
  const date = new Date(dateString)
  return date.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit'
  })
}

export const formatDateTime = (dateString) => {
  return `${formatDate(dateString)} ${formatTime(dateString)}`
}

export const timeAgo = (dateStr) => {
  const now = new Date()
  const past = new Date(dateStr)
  const diffMs = now - past
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))
  if (diffDays > 0) return `${diffDays} day(s) ago`
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
  if (diffHours > 0) return `${diffHours} hour(s) ago`
  const diffMinutes = Math.floor(diffMs / (1000 * 60))
  if (diffMinutes > 0) return `${diffMinutes} minute(s) ago`
  return 'Just now'
}