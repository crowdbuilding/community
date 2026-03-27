import { createContext, useContext, useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useAuth } from './AuthContext'

const ProjectContext = createContext(null)

export function ProjectProvider({ children }) {
  const { projectId } = useParams()
  const { user, memberships, orgMemberships, isOrgAdmin, reload: reloadAuth } = useAuth()
  const [project, setProject] = useState(null)
  const [milestones, setMilestones] = useState([])
  const [loading, setLoading] = useState(true)

  const membership = memberships.find(m => m.project_id === projectId)

  // Org admins get admin access to all projects in their org
  const isOrgAdminOfProject = isOrgAdmin && project?.organization_id &&
    orgMemberships.some(om => om.organization_id === project.organization_id && om.role === 'admin')

  const role = membership?.role || (isOrgAdminOfProject ? 'admin' : 'guest')

  useEffect(() => {
    if (!projectId || !user) return

    async function load() {
      setLoading(true)
      const [projectRes, milestonesRes] = await Promise.all([
        supabase.from('projects').select('*').eq('id', projectId).single(),
        supabase.from('milestones').select('*').eq('project_id', projectId).order('sort_order'),
      ])
      setProject(projectRes.data)
      setMilestones(milestonesRes.data || [])

      // Auto-create admin membership for org admins visiting a project without membership
      const proj = projectRes.data
      const hasMembership = memberships.some(m => m.project_id === projectId)
      if (!hasMembership && proj?.organization_id && isOrgAdmin) {
        const isAdminOfOrg = orgMemberships.some(om =>
          om.organization_id === proj.organization_id && om.role === 'admin'
        )
        if (isAdminOfOrg) {
          const { error } = await supabase.from('memberships').insert({
            profile_id: user.id,
            project_id: projectId,
            role: 'admin',
          })
          if (!error) {
            // Reload auth to pick up new membership
            reloadAuth()
          }
        }
      }

      setLoading(false)
    }

    load()
  }, [projectId, user])

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
