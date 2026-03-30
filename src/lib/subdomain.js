const MAIN_DOMAIN = import.meta.env.VITE_MAIN_DOMAIN || 'commoncity.nl'

export function getSubdomain() {
  const hostname = window.location.hostname
  if (hostname === 'localhost' || hostname === '127.0.0.1') return null
  if (!hostname.endsWith(`.${MAIN_DOMAIN}`)) return null
  const sub = hostname.slice(0, hostname.length - MAIN_DOMAIN.length - 1)
  if (!sub || sub.includes('.')) return null
  return sub
}

export function isOrgDomain() {
  return getSubdomain() === 'my'
}

export function isProjectDomain() {
  const sub = getSubdomain()
  return sub !== null && sub !== 'my' && sub !== 'www'
}

export function getProjectSlugFromSubdomain() {
  return isProjectDomain() ? getSubdomain() : null
}
