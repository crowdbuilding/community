import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'

export default function ProjectsOverview() {
  const { isPlatformAdmin, memberships } = useAuth()
  const [projects, setProjects] = useState([])

  useEffect(() => {
    async function load() {
      if (isPlatformAdmin) {
        const { data } = await supabase.from('projects').select('*')
        setProjects(data || [])
      } else {
        setProjects(memberships.map(m => m.projects).filter(Boolean))
      }
    }
    load()
  }, [isPlatformAdmin, memberships])

  return (
    <div className="view-projects">
      <div className="view-header">
        <h1>Projecten</h1>
      </div>

      <div className="projects-grid">
        {projects.map(p => (
          <Link key={p.id} to={`/p/${p.id}`} className="project-card">
            {p.cover_image_url && (
              <div className="project-card-cover" style={{ backgroundImage: `url(${p.cover_image_url})` }} />
            )}
            <div className="project-card-body">
              <h3>{p.name}</h3>
              {p.location && <p className="project-card-location">📍 {p.location}</p>}
              {p.tagline && <p className="project-card-tagline">{p.tagline}</p>}
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}
