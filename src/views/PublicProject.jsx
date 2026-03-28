import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { timeAgo } from '../lib/constants'

function RoadmapTimeline({ phases }) {
  if (!phases.length) return null
  return (
    <section className="pub-section">
      <h2><i className="fa-solid fa-road" /> Tijdlijn</h2>
      <div className="pub-roadmap">
        {phases.map(phase => (
          <div key={phase.id} className={`pub-roadmap__phase pub-roadmap__phase--${phase.status}`}>
            <div className="pub-roadmap__dot" style={{ borderColor: phase.color }} />
            <div className="pub-roadmap__content">
              <div className="pub-roadmap__header">
                <span className="pub-roadmap__num" style={{ color: phase.color }}>Fase {phase.num}</span>
                {phase.period && <span className="pub-roadmap__period">{phase.period}</span>}
                {phase.status === 'done' && <span className="pub-roadmap__badge pub-roadmap__badge--done">Afgerond</span>}
                {phase.status === 'active' && <span className="pub-roadmap__badge pub-roadmap__badge--active">Actief</span>}
              </div>
              <h3>{phase.name}</h3>
              {phase.subtitle && <p>{phase.subtitle}</p>}
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}

function EventCard({ event }) {
  const d = new Date(event.date)
  const MONTHS = ['jan', 'feb', 'mrt', 'apr', 'mei', 'jun', 'jul', 'aug', 'sep', 'okt', 'nov', 'dec']
  return (
    <div className="pub-event">
      <div className="pub-event__date">
        <span className="pub-event__day">{d.getDate()}</span>
        <span className="pub-event__month">{MONTHS[d.getMonth()]}</span>
      </div>
      <div className="pub-event__info">
        <h4>{event.title}</h4>
        {event.location && <p><i className="fa-solid fa-location-dot" /> {event.location}</p>}
        {event.description && <p className="pub-event__desc">{event.description}</p>}
      </div>
    </div>
  )
}

function UpdateCard({ update }) {
  return (
    <div className="pub-update">
      <div className="pub-update__meta">
        {update.author?.avatar_url ? (
          <img src={update.author.avatar_url} alt="" className="pub-avatar" />
        ) : (
          <div className="pub-avatar pub-avatar--placeholder">{(update.author?.full_name || 'A')[0]}</div>
        )}
        <span>{update.author?.full_name}</span>
        <span className="pub-update__time">{timeAgo(update.created_at)}</span>
      </div>
      <h4>{update.title}</h4>
      {update.image_url && <img src={update.image_url} alt="" className="pub-update__img" />}
      <p>{update.body?.length > 200 ? update.body.slice(0, 200) + '...' : update.body}</p>
    </div>
  )
}

function TeamMember({ member }) {
  const p = member.profile
  return (
    <div className="pub-team-member">
      {p?.avatar_url ? (
        <img src={p.avatar_url} alt="" className="pub-avatar pub-avatar--lg" />
      ) : (
        <div className="pub-avatar pub-avatar--lg pub-avatar--placeholder">
          {(p?.full_name || '?')[0]}
        </div>
      )}
      <span className="pub-team-member__name">{p?.full_name}</span>
      <span className="pub-team-member__role">{member.role === 'admin' ? 'Beheerder' : 'Moderator'}</span>
    </div>
  )
}

export default function PublicProject() {
  const { slug } = useParams()
  const [project, setProject] = useState(null)
  const [phases, setPhases] = useState([])
  const [events, setEvents] = useState([])
  const [updates, setUpdates] = useState([])
  const [team, setTeam] = useState([])
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)

  useEffect(() => {
    async function load() {
      // Fetch project by slug
      const { data: proj, error } = await supabase
        .from('projects')
        .select('*')
        .eq('slug', slug)
        .eq('is_public', true)
        .single()

      if (error || !proj) {
        setNotFound(true)
        setLoading(false)
        return
      }

      setProject(proj)

      // Fetch all public data in parallel
      const [roadmapRes, eventsRes, updatesRes, teamRes] = await Promise.all([
        supabase.from('roadmap_phases').select('*, items:roadmap_items(*)').eq('project_id', proj.id).order('sort_order'),
        supabase.from('meetings').select('*').eq('project_id', proj.id).eq('visibility', 'public').gte('date', new Date().toISOString()).order('date').limit(5),
        supabase.from('updates').select('*, author:profiles(full_name, avatar_url)').eq('project_id', proj.id).eq('is_public', true).order('created_at', { ascending: false }).limit(5),
        supabase.from('memberships').select('role, profile:profiles(full_name, avatar_url)').eq('project_id', proj.id).in('role', ['admin', 'moderator']),
      ])

      setPhases((roadmapRes.data || []).map(p => ({ ...p, items: (p.items || []).sort((a, b) => a.sort_order - b.sort_order) })))
      setEvents(eventsRes.data || [])
      setUpdates(updatesRes.data || [])
      setTeam(teamRes.data || [])
      setLoading(false)
    }
    load()
  }, [slug])

  // Apply project branding
  useEffect(() => {
    if (!project) return
    if (project.brand_primary_color) {
      document.documentElement.style.setProperty('--accent-primary', project.brand_primary_color)
    }
    return () => document.documentElement.style.removeProperty('--accent-primary')
  }, [project])

  if (loading) return <div className="loading-page"><p>Laden...</p></div>

  if (notFound) {
    return (
      <div className="error-boundary">
        <div className="error-boundary__card">
          <i className="fa-solid fa-compass error-boundary__icon" style={{ color: 'var(--text-tertiary)' }} />
          <h2>Project niet gevonden</h2>
          <p>Dit project bestaat niet of is niet publiek.</p>
        </div>
      </div>
    )
  }

  const progressPct = phases.length > 0
    ? Math.round((phases.filter(p => p.status === 'done').length / phases.length) * 100)
    : 0

  return (
    <div className="pub-page">
      {/* Hero */}
      <header className="pub-hero" style={project.cover_image_url ? { backgroundImage: `linear-gradient(to bottom, rgba(0,0,0,0.3), rgba(0,0,0,0.6)), url(${project.cover_image_url})` } : {}}>
        <div className="pub-hero__content">
          {project.logo_url && <img src={project.logo_url} alt="" className="pub-hero__logo" />}
          <h1>{project.name}</h1>
          {project.tagline && <p className="pub-hero__tagline">{project.tagline}</p>}
          {project.location && (
            <p className="pub-hero__location"><i className="fa-solid fa-location-dot" /> {project.location}</p>
          )}
        </div>
      </header>

      <main className="pub-main">
        {/* Progress */}
        {phases.length > 0 && (
          <div className="pub-progress">
            <div className="pub-progress__bar">
              <div className="pub-progress__fill" style={{ width: `${progressPct}%`, background: project.brand_primary_color || 'var(--accent-primary)' }} />
            </div>
            <span className="pub-progress__label">{progressPct}% voltooid</span>
          </div>
        )}

        {/* Description */}
        {(project.public_description || project.description) && (
          <section className="pub-section">
            <h2><i className="fa-solid fa-circle-info" /> Over dit project</h2>
            <p className="pub-description">{project.public_description || project.description}</p>
          </section>
        )}

        {/* Roadmap */}
        <RoadmapTimeline phases={phases} />

        {/* Upcoming events */}
        {events.length > 0 && (
          <section className="pub-section">
            <h2><i className="fa-solid fa-calendar" /> Komende bijeenkomsten</h2>
            <div className="pub-events">
              {events.map(e => <EventCard key={e.id} event={e} />)}
            </div>
          </section>
        )}

        {/* Latest updates */}
        {updates.length > 0 && (
          <section className="pub-section">
            <h2><i className="fa-solid fa-bullhorn" /> Laatste updates</h2>
            <div className="pub-updates">
              {updates.map(u => <UpdateCard key={u.id} update={u} />)}
            </div>
          </section>
        )}

        {/* Team */}
        {team.length > 0 && (
          <section className="pub-section">
            <h2><i className="fa-solid fa-people-group" /> Team</h2>
            <div className="pub-team">
              {team.map((m, i) => <TeamMember key={i} member={m} />)}
            </div>
          </section>
        )}

        {/* Contact / CTA */}
        <section className="pub-section pub-cta">
          {project.public_contact_email && (
            <a href={`mailto:${project.public_contact_email}`} className="cl-btn cl-btn--primary">
              <i className="fa-solid fa-envelope" /> Neem contact op
            </a>
          )}
        </section>
      </main>

      <footer className="pub-footer">
        <p>Powered by <strong>CrowdBuilding</strong></p>
        <Link to="/privacy">Privacybeleid</Link>
      </footer>
    </div>
  )
}
