// ===== Tag definitions =====

export const POST_TAGS = ['Vraag', 'Idee', 'Sociaal', 'In de media', 'Nieuw lid']

export const POST_TAG_COLORS = {
  'Vraag': '#4A90D9',
  'Idee': '#3BD269',
  'Sociaal': '#F09020',
  'In de media': '#F23578',
  'Nieuw lid': '#7B5EA7',
}

export const UPDATE_TAGS = ['Mijlpaal', 'Update', 'Besluit', 'Verslag']

export const UPDATE_TAG_COLORS = {
  'Mijlpaal': { bg: '#3BD269', color: '#fff' },
  'Update': { bg: '#4A90D9', color: '#fff' },
  'Besluit': { bg: '#F23578', color: '#fff' },
  'Verslag': { bg: '#F09020', color: '#fff' },
}

// ===== Role definitions =====

export const ROLES = ['guest', 'member', 'moderator', 'admin']

export const ROLE_LABELS = {
  guest: 'Gast',
  member: 'Lid',
  moderator: 'Moderator',
  admin: 'Admin',
}

export const ROLE_COLORS = {
  guest: '#9ba1b0',
  member: '#4A90D9',
  moderator: '#F09020',
  admin: '#F23578',
}

// ===== Helpers =====

export function timeAgo(dateStr) {
  const diff = Math.floor((Date.now() - new Date(dateStr)) / 1000)
  if (diff < 60) return 'Zojuist'
  if (diff < 3600) return `${Math.floor(diff / 60)} min geleden`
  if (diff < 86400) return `${Math.floor(diff / 3600)} uur geleden`
  if (diff < 604800) return `${Math.floor(diff / 86400)} dagen geleden`
  return new Date(dateStr).toLocaleDateString('nl-NL', { day: 'numeric', month: 'short', year: 'numeric' })
}

export function timeAgoShort(dateStr) {
  const diff = Math.floor((Date.now() - new Date(dateStr)) / 1000)
  if (diff < 60) return 'Zojuist'
  if (diff < 3600) return `${Math.floor(diff / 60)} min`
  if (diff < 86400) return `${Math.floor(diff / 3600)} uur`
  if (diff < 604800) return `${Math.floor(diff / 86400)}d`
  return new Date(dateStr).toLocaleDateString('nl-NL', { day: 'numeric', month: 'short' })
}
