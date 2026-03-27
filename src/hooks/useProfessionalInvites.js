import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase'
import { logger, friendlyError } from '../lib/logger'
import { useAuth } from '../contexts/AuthContext'
import { useProject } from '../contexts/ProjectContext'

export function useProfessionalInvites() {
  const { user } = useAuth()
  const { project } = useProject()
  const [invites, setInvites] = useState([])
  const [loading, setLoading] = useState(true)

  const projectId = project?.id

  const fetchInvites = useCallback(async () => {
    if (!projectId) return
    setLoading(true)

    const { data, error } = await supabase
      .from('professional_invites')
      .select('*, inviter:profiles!invited_by(full_name)')
      .eq('project_id', projectId)
      .order('created_at', { ascending: false })

    if (error) {
      logger.error('useProfessionalInvites.fetch', error)
    } else {
      setInvites(data || [])
    }
    setLoading(false)
  }, [projectId])

  useEffect(() => {
    fetchInvites()
  }, [fetchInvites])

  async function createInvite({ email, name, professional_type }) {
    const { data, error } = await supabase
      .from('professional_invites')
      .insert({
        project_id: projectId,
        email,
        name: name || null,
        professional_type,
        invited_by: user.id,
      })
      .select('*, inviter:profiles!invited_by(full_name)')
      .single()

    if (error) { logger.error('useProfessionalInvites.createInvite', error); throw new Error(friendlyError(error)) }
    setInvites(prev => [data, ...prev])
    return data
  }

  async function revokeInvite(id) {
    const { error } = await supabase
      .from('professional_invites')
      .update({ status: 'revoked' })
      .eq('id', id)

    if (error) { logger.error('useProfessionalInvites.revokeInvite', error); throw new Error(friendlyError(error)) }
    setInvites(prev => prev.map(i => i.id === id ? { ...i, status: 'revoked' } : i))
  }

  return { invites, loading, createInvite, revokeInvite, refetch: fetchInvites }
}
