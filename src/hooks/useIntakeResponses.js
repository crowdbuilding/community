import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { logger, friendlyError } from '../lib/logger'

export default function useIntakeResponses(projectId, projectName) {
  const [responses, setResponses] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!projectId) return
    fetchResponses()
  }, [projectId])

  async function fetchResponses() {
    setLoading(true)
    const { data, error } = await supabase
      .from('intake_responses')
      .select('*')
      .eq('project_id', projectId)
      .order('created_at', { ascending: false })
    if (error) logger.error('useIntakeResponses.fetch', error)
    setResponses(data || [])
    setLoading(false)
  }

  async function updateStatus(id, status, reason = null) {
    const updates = { status }
    if (status === 'invited') updates.invited_at = new Date().toISOString()

    const { error } = await supabase.from('intake_responses').update(updates).eq('id', id)
    if (error) { logger.error('useIntakeResponses.updateStatus', error); throw new Error(friendlyError(error)) }

    // Send rejection email (best-effort, non-blocking)
    if (status === 'rejected') {
      const response = responses.find(r => r.id === id)
      if (response?.email) {
        supabase.functions.invoke('send-member-email', {
          body: {
            type: 'rejection',
            memberName: response.name,
            memberEmail: response.email,
            projectName: projectName || 'het project',
            reason: reason || null,
          },
        }).catch(err => logger.error('useIntakeResponses.rejectEmail', err))
      }
    }

    setResponses(prev => prev.map(r => r.id === id ? { ...r, ...updates } : r))
    return true
  }

  const pending = responses.filter(r => r.status === 'pending')
  const invited = responses.filter(r => r.status === 'invited')
  const joined = responses.filter(r => r.status === 'joined')
  const rejected = responses.filter(r => r.status === 'rejected')

  return { responses, pending, invited, joined, rejected, loading, updateStatus, refetch: fetchResponses }
}
