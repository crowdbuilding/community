import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase'
import { useProject } from '../contexts/ProjectContext'

export function useMembers() {
  const { project } = useProject()
  const [members, setMembers] = useState([])
  const [loading, setLoading] = useState(true)

  const projectId = project?.id

  const fetchMembers = useCallback(async () => {
    if (!projectId) return
    setLoading(true)

    const { data, error } = await supabase
      .from('memberships')
      .select('*, profile:profiles(id, full_name, avatar_url, is_platform_admin)')
      .eq('project_id', projectId)
      .order('joined_at', { ascending: true })

    if (error) {
      console.error('Error fetching members:', error)
    } else {
      setMembers(data || [])
    }
    setLoading(false)
  }, [projectId])

  useEffect(() => { fetchMembers() }, [fetchMembers])

  async function updateRole(membershipId, newRole) {
    const { error } = await supabase
      .from('memberships')
      .update({ role: newRole })
      .eq('id', membershipId)

    if (error) throw error
    setMembers(prev => prev.map(m => m.id === membershipId ? { ...m, role: newRole } : m))
  }

  async function removeMember(membershipId) {
    const { error } = await supabase
      .from('memberships')
      .delete()
      .eq('id', membershipId)

    if (error) throw error
    setMembers(prev => prev.filter(m => m.id !== membershipId))
  }

  async function approveMember(membershipId) {
    return updateRole(membershipId, 'member')
  }

  return { members, loading, updateRole, removeMember, approveMember, refetch: fetchMembers }
}
