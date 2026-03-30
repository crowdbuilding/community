import { createContext, useContext, useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useAuth } from './AuthContext'

const ProjectContext = createContext(null)

export function ProjectProvider({ children }) {
  const { slug } = useParams()
  const { user, memberships, orgMemberships, isOrgAdmin, reload: reloadAuth } = useAuth()
  const [project, setProject] = useState(null)
  const [milestones, setMilestones] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // Membership is keyed by UUID; wait for project to load first
  const membership = project ? memberships.find(m => m.project_id === project.id) : null

  // Org admins get admin access to all projects in their org
  const isOrgAdminOfProject = isOrgAdmin && project?.organization_id &&
    orgMemberships.some(om => om.organization_id === project.organization_id && om.role === 'admin')

  const role = membership?.role || (isOrgAdminOfProject ? 'admin' : 'guest')

  useEffect(() => {
    if (!slug || !user) return

    async function load() {
      setLoading(true)
      setError(null)

      // Fetch project by slug first, then fetch milestones using the UUID
      const projectRes = await supabase.from('projects').select('*').eq('slug', slug).single()
      if (projectRes.error || !projectRes.data) {
        console.error('ProjectContext: failed to load project', projectRes.error)
        setError(projectRes.error || new Error('Project niet gevonden'))
        setLoading(false)
        return
      }
      setProject(projectRes.data)

      const milestonesRes = await supabase
        .from('milestones')
        .select('*')
        .eq('project_id', projectRes.data.id)
        .order('sort_order')
      setMilestones(milestonesRes.data || [])
      setLoading(false)
    }

    load()
  }, [slug, user])

  const branding = project ? {
    brand_primary_color: project.brand_primary_color,
    brand_accent_color: project.brand_accent_color,
    default_theme: project.default_theme,
  } : {}

  return (
    <ProjectContext.Provider value={{ project, milestones, role, membership, loading, error, branding }}>
      {children}
    </ProjectContext.Provider>
  )
}

export function useProject() {
  const ctx = useContext(ProjectContext)
  if (!ctx) throw new Error('useProject must be used within ProjectProvider')
  return ctx
}
