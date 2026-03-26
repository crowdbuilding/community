import { useProject } from '../contexts/ProjectContext'
import MilestoneBar from '../components/MilestoneBar'

export default function Dashboard() {
  const { project, milestones, role, loading } = useProject()

  if (loading) return <div className="loading-page"><p>Laden...</p></div>
  if (!project) return <div className="empty-state"><p>Project niet gevonden</p></div>

  const activePhase = milestones?.find(m => m.status === 'active')

  return (
    <div className="view-dashboard">
      {project.cover_image_url && (
        <div className="dashboard-cover" style={{ backgroundImage: `url(${project.cover_image_url})` }} />
      )}

      <div className="dashboard-header">
        <h1>{project.name}</h1>
        {project.tagline && <p className="dashboard-tagline">{project.tagline}</p>}
        {project.location && (
          <p className="dashboard-location">
            <i className="fa-solid fa-location-dot" /> {project.location}
          </p>
        )}
      </div>

      <MilestoneBar />

      <div className="dashboard-stats">
        <div className="dashboard-stat">
          <div className="dashboard-stat__icon" style={{ background: 'var(--accent-primary)' }}>
            <i className="fa-solid fa-user-tag" />
          </div>
          <div className="dashboard-stat__content">
            <span className="dashboard-stat__value">{role}</span>
            <span className="dashboard-stat__label">Jouw rol</span>
          </div>
        </div>
        <div className="dashboard-stat">
          <div className="dashboard-stat__icon" style={{ background: 'var(--accent-green)' }}>
            <i className="fa-solid fa-diagram-project" />
          </div>
          <div className="dashboard-stat__content">
            <span className="dashboard-stat__value">{activePhase?.label || '—'}</span>
            <span className="dashboard-stat__label">Huidige fase</span>
          </div>
        </div>
        <div className="dashboard-stat">
          <div className="dashboard-stat__icon" style={{ background: 'var(--text-tertiary)' }}>
            <i className="fa-solid fa-users" />
          </div>
          <div className="dashboard-stat__content">
            <span className="dashboard-stat__value">—</span>
            <span className="dashboard-stat__label">Leden</span>
          </div>
        </div>
        <div className="dashboard-stat">
          <div className="dashboard-stat__icon" style={{ background: 'var(--accent-primary)' }}>
            <i className="fa-solid fa-bullhorn" />
          </div>
          <div className="dashboard-stat__content">
            <span className="dashboard-stat__value">—</span>
            <span className="dashboard-stat__label">Updates</span>
          </div>
        </div>
      </div>

      {project.description && (
        <div className="dashboard-description">
          <h3>Over dit project</h3>
          <p>{project.description}</p>
        </div>
      )}
    </div>
  )
}
