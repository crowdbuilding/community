import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'
import { useProject } from '../contexts/ProjectContext'

export function useUpdates() {
  const { user } = useAuth()
  const { project } = useProject()
  const [updates, setUpdates] = useState([])
  const [loading, setLoading] = useState(true)

  const projectId = project?.id

  const fetchUpdates = useCallback(async () => {
    if (!projectId) return
    setLoading(true)

    const { data, error } = await supabase
      .from('updates')
      .select('*, author:profiles(id, full_name, avatar_url)')
      .eq('project_id', projectId)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching updates:', error)
    } else {
      setUpdates(data || [])
    }
    setLoading(false)
  }, [projectId])

  // Initial fetch
  useEffect(() => {
    fetchUpdates()
  }, [fetchUpdates])

  // Realtime subscription
  useEffect(() => {
    if (!projectId) return

    const channel = supabase
      .channel(`updates:${projectId}`)
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'updates',
        filter: `project_id=eq.${projectId}`,
      }, () => {
        // Refetch on any change to get full joined data
        fetchUpdates()
      })
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [projectId, fetchUpdates])

  async function createUpdate({ title, body, tag, is_public, image_url }) {
    const { data, error } = await supabase
      .from('updates')
      .insert({
        project_id: projectId,
        author_id: user.id,
        title,
        body,
        tag: tag || null,
        is_public: is_public || false,
        image_url: image_url || null,
      })
      .select('*, author:profiles(id, full_name, avatar_url)')
      .single()

    if (error) throw error
    // Optimistic: add to local state immediately
    if (data) setUpdates(prev => [data, ...prev])
    return data
  }

  async function editUpdate(id, { title, body, tag, is_public, image_url }) {
    const { data, error } = await supabase
      .from('updates')
      .update({ title, body, tag, is_public, image_url })
      .eq('id', id)
      .select('*, author:profiles(id, full_name, avatar_url)')
      .single()

    if (error) throw error
    return data
  }

  async function deleteUpdate(id) {
    const { error } = await supabase
      .from('updates')
      .delete()
      .eq('id', id)

    if (error) throw error
  }

  return { updates, loading, createUpdate, editUpdate, deleteUpdate, refetch: fetchUpdates }
}
