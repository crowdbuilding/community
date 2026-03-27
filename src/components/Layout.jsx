import { Outlet } from 'react-router-dom'
import Sidebar from './Sidebar'
import BottomNav from './BottomNav'
import NotificationBell from './NotificationBell'
import GlobalSearch from './GlobalSearch'
import { useTheme } from '../contexts/ThemeContext'

function ThemeToggle() {
  const { mode, setMode } = useTheme()

  const modes = [
    { value: 'light', icon: 'fa-solid fa-sun' },
    { value: 'warm', icon: 'fa-solid fa-cloud-sun' },
    { value: 'dark', icon: 'fa-solid fa-moon' },
  ]

  const current = modes.find(m => m.value === mode)
  const nextIndex = (modes.findIndex(m => m.value === mode) + 1) % modes.length

  return (
    <button
      className="theme-toggle-btn"
      onClick={() => setMode(modes[nextIndex].value)}
      title={`Thema: ${mode}`}
    >
      <i className={current.icon} />
    </button>
  )
}

export default function Layout() {
  return (
    <div className="app-layout">
      <Sidebar />
      <main className="main-content">
        <div className="main-topbar">
          <GlobalSearch />
          <ThemeToggle />
          <NotificationBell />
        </div>
        <Outlet />
      </main>
      <BottomNav />
    </div>
  )
}
