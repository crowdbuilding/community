import { createContext, useContext, useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useAuth } from './AuthContext'

const ProjectContext = createContext(null)

export function ProjectProvider({ children }) {
  const { projectId } = useParams()
  const { user, memberships } = useAuth()
  const [project, setProject] = useState(null)
  const [milestones, setMilestones] = useState([])
  const [loading, setLoading] = useState(true)

  const membership = memberships.find(m => m.project_id === projectId)
  const role = membership?.role || 'guest'

  useEffect(() => {
    if (!projectId) return

    async function load() {
      setLoading(true)
      const [projectRes, milestonesRes] = await Promise.all([
        supabase.from('projects').select('*').eq('id', projectId).single(),
        supabase.from('milestones').select('*').eq('project_id', projectId).order('sort_order'),
      ])
      setProject(projectRes.data)
      setMilestones(milestonesRes.data || [])
      setLoading(false)
    }

    load()
  }, [projectId])

  const branding = project ? {
    brand_primary_color: project.brand_primary_color,
    brand_accent_color: project.brand_accent_color,
    default_theme: project.default_theme,
  } : {}

  return (
    <ProjectContext.Provider value={{ project, milestones, role, membership, loading, branding }}>
      {children}
    </ProjectContext.Provider>
  )
}

export function useProject() {
  const ctx = useContext(ProjectContext)
  if (!ctx) throw new Error('useProject must be used within ProjectProvider')
  return ctx
}
