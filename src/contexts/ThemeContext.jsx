import { createContext, useContext, useEffect, useState } from 'react'
import { safeStorage } from '../lib/safeStorage'

const ThemeContext = createContext(null)

export function ThemeProvider({ children, projectBranding }) {
  const [mode, setMode] = useState(() => {
    return safeStorage.getItem('theme-mode') || projectBranding?.default_theme || 'light'
  })

  useEffect(() => {
    safeStorage.setItem('theme-mode', mode)
    // Clean Design System uses data-theme for dark mode
    document.documentElement.setAttribute('data-theme', mode)
  }, [mode])

  useEffect(() => {
    // In contrast mode, don't apply project branding — use theme's own colors
    if (mode === 'contrast') {
      document.documentElement.style.removeProperty('--accent-primary')
      document.documentElement.style.removeProperty('--border-focus')
      document.documentElement.style.removeProperty('--accent-green')
      return
    }

    // Apply project branding colors as CSS custom properties
    if (projectBranding?.brand_primary_color) {
      document.documentElement.style.setProperty('--accent-primary', projectBranding.brand_primary_color)
      document.documentElement.style.setProperty('--border-focus', projectBranding.brand_primary_color)
    }
    if (projectBranding?.brand_accent_color) {
      document.documentElement.style.setProperty('--accent-green', projectBranding.brand_accent_color)
    }

    return () => {
      // Clean up when leaving project
      document.documentElement.style.removeProperty('--accent-primary')
      document.documentElement.style.removeProperty('--border-focus')
      document.documentElement.style.removeProperty('--accent-green')
    }
  }, [projectBranding, mode])

  return (
    <ThemeContext.Provider value={{ mode, setMode }}>
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme() {
  const ctx = useContext(ThemeContext)
  if (!ctx) throw new Error('useTheme must be used within ThemeProvider')
  return ctx
}
