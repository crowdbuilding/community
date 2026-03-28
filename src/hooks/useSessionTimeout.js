import { useEffect, useRef, useCallback } from 'react'
import { supabase } from '../lib/supabase'

const TIMEOUT_MS = 30 * 60 * 1000 // 30 minutes
const WARNING_MS = 2 * 60 * 1000  // warn 2 minutes before
const ACTIVITY_EVENTS = ['mousedown', 'keydown', 'scroll', 'touchstart']

export function useSessionTimeout(enabled = true) {
  const timerRef = useRef(null)
  const warningRef = useRef(null)
  const warningShownRef = useRef(false)

  const logout = useCallback(async () => {
    await supabase.auth.signOut()
    window.location.href = '/login'
  }, [])

  const resetTimer = useCallback(() => {
    if (!enabled) return

    // Clear existing timers
    clearTimeout(timerRef.current)
    clearTimeout(warningRef.current)

    // Dismiss warning if it was shown
    if (warningShownRef.current) {
      const el = document.getElementById('session-timeout-warning')
      if (el) el.remove()
      warningShownRef.current = false
    }

    // Set warning timer
    warningRef.current = setTimeout(() => {
      warningShownRef.current = true

      const el = document.createElement('div')
      el.id = 'session-timeout-warning'
      el.className = 'session-timeout-warning'

      const icon = document.createElement('i')
      icon.className = 'fa-solid fa-clock'
      el.appendChild(icon)

      const text = document.createElement('span')
      text.textContent = 'Je sessie verloopt over 2 minuten wegens inactiviteit.'
      el.appendChild(text)

      const btn = document.createElement('button')
      btn.textContent = 'Doorgaan'
      btn.addEventListener('click', () => {
        el.remove()
        resetTimer()
      })
      el.appendChild(btn)

      document.body.appendChild(el)
    }, TIMEOUT_MS - WARNING_MS)

    // Set logout timer
    timerRef.current = setTimeout(logout, TIMEOUT_MS)
  }, [enabled, logout])

  useEffect(() => {
    if (!enabled) return

    resetTimer()

    const handler = () => resetTimer()
    ACTIVITY_EVENTS.forEach(e => document.addEventListener(e, handler, { passive: true }))

    return () => {
      clearTimeout(timerRef.current)
      clearTimeout(warningRef.current)
      ACTIVITY_EVENTS.forEach(e => document.removeEventListener(e, handler))
      const el = document.getElementById('session-timeout-warning')
      if (el) el.remove()
    }
  }, [enabled, resetTimer])
}
