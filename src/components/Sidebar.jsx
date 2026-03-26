import { useState, useRef, useEffect } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { useProject } from '../contexts/ProjectContext'
import { canDo } from '../lib/permissions'
import { signOut } from '../lib/auth'

const NAV_ITEMS = [
  { to: '', icon: 'fa-solid fa-house', color: 'var(--clean-inbox, #4A90D9)', label: 'Dashboard', end: true },
  { to: 'updates', icon: 'fa-solid fa-bullhorn', color: 'var(--clean-today, #F4B400)', label: 'Updates', minRole: 'guest' },
  { to: 'community', icon: 'fa-solid fa-comments', color: 'var(--clean-anytime, #3BD269)', label: 'Prikbord', action: 'read_board' },
  { to: 'events', icon: 'fa-solid fa-calendar-check', color: 'var(--clean-upcoming, #F09020)', label: 'Events', action: 'view_meetings' },
  { to: 'roadmap', icon: 'fa-solid fa-road', color: 'var(--clean-logbook, #7B5EA7)', label: 'Roadmap', minRole: 'guest' },
  { to: 'members', icon: 'fa-solid fa-users', color: '#F23578', label: 'Leden', minRole: 'guest' },
]

export default function Sidebar() {
  const { profile } = useAuth()
  const { project, role } = useProject()
  const navigate = useNavigate()
  const location = useLocation()
  const [userMenuOpen, setUserMenuOpen] = useState(false)
  const menuRef = useRef(null)

  const basePath = `/p/${project?.id || ''}`

  function isActive(to) {
    if (to === '') return location.pathname === basePath || location.pathname === basePath + '/'
    return location.pathname.startsWith(`${basePath}/${to}`)
  }

  async function handleSignOut() {
    setUserMenuOpen(false)
    await signOut()
    navigate('/')
  }

  // Close menu on click outside
  useEffect(() => {
    function handleClickOutside(e) {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setUserMenuOpen(false)
      }
    }
    if (userMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside)
      return () => document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [userMenuOpen])

  const initials = (profile?.full_name || 'U').split(' ').map(n => n[0]).join('').slice(0, 2)

  return (
    <nav className="cl-sidebar">
      {/* Project header — logo + name only */}
      <div className="sidebar-project-header" onClick={() => navigate(basePath)} role="button" tabIndex={0}>
        {project?.logo_url ? (
          <img src={project.logo_url} alt={project.name} className="sidebar-project-logo" />
        ) : (
          <div className="sidebar-project-logo sidebar-project-logo--placeholder">
            {(project?.name || 'C')[0]}
          </div>
        )}
        <div className="sidebar-project-name">{project?.name || 'Community'}</div>
      </div>

      {/* Navigation */}
      <div className="sidebar-nav-section">
        {NAV_ITEMS.map(item => {
          if (item.action && !canDo(role, item.action)) return null
          return (
            <div
              key={item.to}
              className={`cl-nav-item ${isActive(item.to) ? 'cl-nav-item--active' : ''}`}
              onClick={() => navigate(item.to === '' ? basePath : `${basePath}/${item.to}`)}
              role="button"
              tabIndex={0}
            >
              <i className={`cl-nav-item__icon ${item.icon}`} style={{ color: item.color }} />
              <span>{item.label}</span>
            </div>
          )
        })}

        {canDo(role, 'edit_settings') && (
          <div
            className={`cl-nav-item ${isActive('settings') ? 'cl-nav-item--active' : ''}`}
            onClick={() => navigate(`${basePath}/settings`)}
            role="button"
            tabIndex={0}
          >
            <i className="cl-nav-item__icon fa-solid fa-gear" />
            <span>Instellingen</span>
          </div>
        )}
      </div>

      {/* User row at bottom with popup menu */}
      <div className="sidebar-footer" ref={menuRef}>
        {userMenuOpen && (
          <div className="sidebar-user-menu">
            <div
              className="sidebar-user-menu-item"
              onClick={() => { setUserMenuOpen(false); navigate(`${basePath}/settings`) }}
            >
              <i className="fa-solid fa-gear" />
              <span>Instellingen</span>
            </div>
            <div className="sidebar-user-menu-divider" />
            <div className="sidebar-user-menu-item sidebar-user-menu-item--danger" onClick={handleSignOut}>
              <i className="fa-solid fa-right-from-bracket" />
              <span>Uitloggen</span>
            </div>
          </div>
        )}

        <div
          className={`sidebar-user-row ${userMenuOpen ? 'sidebar-user-row--active' : ''}`}
          onClick={() => setUserMenuOpen(!userMenuOpen)}
          role="button"
          tabIndex={0}
        >
          {profile?.avatar_url ? (
            <img src={profile.avatar_url} alt="" className="sidebar-user-avatar" />
          ) : (
            <div className="sidebar-user-avatar sidebar-user-avatar--placeholder">{initials}</div>
          )}
          <span className="sidebar-user-name">{profile?.full_name || 'Gebruiker'}</span>
          <i className={`fa-solid fa-chevron-up sidebar-user-chevron ${userMenuOpen ? 'sidebar-user-chevron--open' : ''}`} />
        </div>
      </div>
    </nav>
  )
}
