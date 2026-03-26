import { createContext, useContext, useEffect, useState } from 'react'

const ThemeContext = createContext(null)

export function ThemeProvider({ children, projectBranding }) {
  const [mode, setMode] = useState(() => {
    return localStorage.getItem('theme-mode') || projectBranding?.default_theme || 'light'
  })

  useEffect(() => {
    localStorage.setItem('theme-mode', mode)
    // Clean Design System uses data-theme for dark mode
    document.documentElement.setAttribute('data-theme', mode === 'dark' ? 'dark' : 'light')
  }, [mode])

  useEffect(() => {
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
  }, [projectBranding])

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
