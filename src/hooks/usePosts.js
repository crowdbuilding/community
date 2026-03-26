import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'
import { useProject } from '../contexts/ProjectContext'

export function usePosts() {
  const { user } = useAuth()
  const { project } = useProject()
  const [posts, setPosts] = useState([])
  const [loading, setLoading] = useState(true)

  const projectId = project?.id

  const fetchPosts = useCallback(async () => {
    if (!projectId) return
    setLoading(true)

    const { data, error } = await supabase
      .from('posts')
      .select(`
        *,
        author:profiles!author_id(id, full_name, avatar_url),
        comments(count),
        post_likes(profile_id)
      `)
      .eq('project_id', projectId)
      .eq('is_hidden', false)
      .order('is_pinned', { ascending: false })
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching posts:', error)
    } else {
      // Transform: add like_count, comment_count, is_liked
      const transformed = (data || []).map(p => ({
        ...p,
        comment_count: p.comments?.[0]?.count || 0,
        like_count: p.post_likes?.length || 0,
        is_liked: p.post_likes?.some(l => l.profile_id === user?.id) || false,
      }))
      setPosts(transformed)
    }
    setLoading(false)
  }, [projectId, user?.id])

  useEffect(() => { fetchPosts() }, [fetchPosts])

  // Realtime
  useEffect(() => {
    if (!projectId) return
    const channel = supabase
      .channel(`posts:${projectId}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'posts', filter: `project_id=eq.${projectId}` }, () => fetchPosts())
      .on('postgres_changes', { event: '*', schema: 'public', table: 'comments' }, () => fetchPosts())
      .on('postgres_changes', { event: '*', schema: 'public', table: 'post_likes' }, () => fetchPosts())
      .subscribe()
    return () => supabase.removeChannel(channel)
  }, [projectId, fetchPosts])

  async function createPost({ text, tag, image_url }) {
    const { data, error } = await supabase
      .from('posts')
      .insert({ project_id: projectId, author_id: user.id, text, tag: tag || null, image_url: image_url || null })
      .select('*, author:profiles!author_id(id, full_name, avatar_url)')
      .single()
    if (error) throw error
    // Optimistic add
    setPosts(prev => [{ ...data, comment_count: 0, like_count: 0, is_liked: false }, ...prev])
    return data
  }

  async function toggleLike(postId) {
    const post = posts.find(p => p.id === postId)
    if (!post) return

    if (post.is_liked) {
      await supabase.from('post_likes').delete().eq('post_id', postId).eq('profile_id', user.id)
      setPosts(prev => prev.map(p => p.id === postId ? { ...p, is_liked: false, like_count: p.like_count - 1 } : p))
    } else {
      await supabase.from('post_likes').insert({ post_id: postId, profile_id: user.id })
      setPosts(prev => prev.map(p => p.id === postId ? { ...p, is_liked: true, like_count: p.like_count + 1 } : p))
    }
  }

  async function togglePin(postId) {
    const post = posts.find(p => p.id === postId)
    if (!post) return
    await supabase.from('posts').update({ is_pinned: !post.is_pinned }).eq('id', postId)
    fetchPosts()
  }

  return { posts, loading, createPost, toggleLike, togglePin, refetch: fetchPosts }
}

export function useComments(postId) {
  const { user } = useAuth()
  const [comments, setComments] = useState([])
  const [loading, setLoading] = useState(true)

  const fetchComments = useCallback(async () => {
    if (!postId) return
    const { data, error } = await supabase
      .from('comments')
      .select('*, author:profiles(id, full_name, avatar_url)')
      .eq('post_id', postId)
      .order('created_at', { ascending: true })
    if (error) console.error('Error fetching comments:', error)
    else setComments(data || [])
    setLoading(false)
  }, [postId])

  useEffect(() => { fetchComments() }, [fetchComments])

  async function addComment(text) {
    const { data, error } = await supabase
      .from('comments')
      .insert({ post_id: postId, author_id: user.id, text })
      .select('*, author:profiles(id, full_name, avatar_url)')
      .single()
    if (error) throw error
    setComments(prev => [...prev, data])
    return data
  }

  return { comments, loading, addComment, refetch: fetchComments }
}

// Re-export for backward compat
export { uploadImage as uploadPostImage } from '../lib/storage'
