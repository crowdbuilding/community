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

    // Try with reactions/comments, fall back to basic query if tables don't exist yet
    let query = supabase
      .from('updates')
      .select('*, author:profiles(id, full_name, avatar_url), update_reactions(id, emoji, profile_id), update_comments(id)')
      .eq('project_id', projectId)
      .order('created_at', { ascending: false })

    let { data, error } = await query

    if (error) {
      // Fallback: tables may not exist yet
      console.warn('Fetching updates with reactions failed, falling back:', error.message)
      const fallback = await supabase
        .from('updates')
        .select('*, author:profiles(id, full_name, avatar_url)')
        .eq('project_id', projectId)
        .order('created_at', { ascending: false })
      data = fallback.data
      error = fallback.error
    }

    if (error) {
      console.error('Error fetching updates:', error)
    } else {
      const transformed = (data || []).map(u => {
        const reactionCounts = {}
        const myReactions = new Set()
        ;(u.update_reactions || []).forEach(r => {
          reactionCounts[r.emoji] = (reactionCounts[r.emoji] || 0) + 1
          if (r.profile_id === user?.id) myReactions.add(r.emoji)
        })
        return {
          ...u,
          reactions: reactionCounts,
          myReactions,
          totalReactions: Object.values(reactionCounts).reduce((s, c) => s + c, 0),
          comment_count: u.update_comments?.length || 0,
        }
      })
      setUpdates(transformed)
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
    if (data) setUpdates(prev => prev.map(u => u.id === id ? data : u))
    return data
  }

  async function toggleReaction(updateId, emoji) {
    const update = updates.find(u => u.id === updateId)
    if (!update) return
    const hadReaction = update.myReactions.has(emoji)

    // Optimistic update
    setUpdates(prev => prev.map(u => {
      if (u.id !== updateId) return u
      const newReactions = { ...u.reactions }
      const newMyReactions = new Set(u.myReactions)
      if (hadReaction) {
        newReactions[emoji] = Math.max(0, (newReactions[emoji] || 1) - 1)
        if (newReactions[emoji] === 0) delete newReactions[emoji]
        newMyReactions.delete(emoji)
      } else {
        newReactions[emoji] = (newReactions[emoji] || 0) + 1
        newMyReactions.add(emoji)
      }
      return { ...u, reactions: newReactions, myReactions: newMyReactions, totalReactions: Object.values(newReactions).reduce((s, c) => s + c, 0) }
    }))

    if (hadReaction) {
      await supabase.from('update_reactions').delete().eq('update_id', updateId).eq('profile_id', user.id).eq('emoji', emoji)
    } else {
      await supabase.from('update_reactions').insert({ update_id: updateId, profile_id: user.id, emoji })
    }
  }

  async function deleteUpdate(id) {
    const { error } = await supabase
      .from('updates')
      .delete()
      .eq('id', id)

    if (error) throw error
  }

  return { updates, loading, createUpdate, editUpdate, deleteUpdate, toggleReaction, refetch: fetchUpdates }
}

export function useUpdateComments(updateId) {
  const { user } = useAuth()
  const [comments, setComments] = useState([])
  const [loading, setLoading] = useState(true)

  const fetchComments = useCallback(async () => {
    if (!updateId) return
    const { data, error } = await supabase
      .from('update_comments')
      .select('*, author:profiles(id, full_name, avatar_url)')
      .eq('update_id', updateId)
      .order('created_at', { ascending: true })
    if (error) console.error('Error fetching update comments:', error)
    else setComments(data || [])
    setLoading(false)
  }, [updateId])

  useEffect(() => { fetchComments() }, [fetchComments])

  async function addComment(text, replyToId, replyToName) {
    const { data, error } = await supabase
      .from('update_comments')
      .insert({
        update_id: updateId,
        author_id: user.id,
        text,
        reply_to_id: replyToId || null,
        reply_to_name: replyToName || null,
      })
      .select('*, author:profiles(id, full_name, avatar_url)')
      .single()
    if (error) throw error
    setComments(prev => [...prev, data])
    return data
  }

  return { comments, loading, addComment, refetch: fetchComments }
}
