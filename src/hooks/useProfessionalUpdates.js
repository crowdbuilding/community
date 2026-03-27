import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'
import { useProject } from '../contexts/ProjectContext'

export function useProfessionalUpdates() {
  const { user } = useAuth()
  const { project } = useProject()
  const [updates, setUpdates] = useState([])
  const [loading, setLoading] = useState(true)

  const projectId = project?.id

  const fetchUpdates = useCallback(async () => {
    if (!projectId) return
    setLoading(true)

    const { data, error } = await supabase
      .from('professional_updates')
      .select(`
        *,
        author:profiles(id, full_name, avatar_url, professional_type, professional_label),
        files:update_files(*)
      `)
      .eq('project_id', projectId)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching professional updates:', error)
    } else {
      // Sort files by sort_order within each update
      const sorted = (data || []).map(u => ({
        ...u,
        files: (u.files || []).sort((a, b) => a.sort_order - b.sort_order)
      }))
      setUpdates(sorted)
    }
    setLoading(false)
  }, [projectId])

  useEffect(() => {
    fetchUpdates()
  }, [fetchUpdates])

  // Realtime subscription
  useEffect(() => {
    if (!projectId) return

    const channel = supabase
      .channel(`pro-updates:${projectId}`)
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'professional_updates',
        filter: `project_id=eq.${projectId}`,
      }, () => {
        fetchUpdates()
      })
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [projectId, fetchUpdates])

  async function createUpdate({ title, body, phase, image_url, files = [] }) {
    // 1. Insert the update
    const { data: update, error } = await supabase
      .from('professional_updates')
      .insert({
        project_id: projectId,
        author_id: user.id,
        title,
        body,
        phase: phase || 'ALG',
        image_url: image_url || null,
      })
      .select(`
        *,
        author:profiles(id, full_name, avatar_url, professional_type, professional_label)
      `)
      .single()

    if (error) throw error

    // 2. Insert file records if any
    if (files.length > 0) {
      const fileRecords = files.map((f, i) => ({
        update_id: update.id,
        file_name: f.file_name,
        file_path: f.file_path,
        file_size: f.file_size,
        file_type: f.file_type,
        sort_order: i,
      }))

      const { data: insertedFiles, error: filesError } = await supabase
        .from('update_files')
        .insert(fileRecords)
        .select()

      if (filesError) console.error('Error inserting files:', filesError)
      update.files = insertedFiles || []
    } else {
      update.files = []
    }

    setUpdates(prev => [update, ...prev])
    return update
  }

  async function editUpdate(id, { title, body, phase, image_url }) {
    const { data, error } = await supabase
      .from('professional_updates')
      .update({ title, body, phase, image_url, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select(`
        *,
        author:profiles(id, full_name, avatar_url, professional_type, professional_label),
        files:update_files(*)
      `)
      .single()

    if (error) throw error
    return data
  }

  async function deleteUpdate(id) {
    const { error } = await supabase
      .from('professional_updates')
      .delete()
      .eq('id', id)

    if (error) throw error
    setUpdates(prev => prev.filter(u => u.id !== id))
  }

  return { updates, loading, createUpdate, editUpdate, deleteUpdate, refetch: fetchUpdates }
}
