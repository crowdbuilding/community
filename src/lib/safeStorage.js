/**
 * Safe localStorage wrapper for private browsing / restricted environments.
 * Falls back silently when storage is unavailable.
 */
export const safeStorage = {
  getItem(key) {
    try { return localStorage.getItem(key) }
    catch { return null }
  },
  setItem(key, value) {
    try { localStorage.setItem(key, value) }
    catch { /* silently fail */ }
  },
  removeItem(key) {
    try { localStorage.removeItem(key) }
    catch { /* silently fail */ }
  },
}
