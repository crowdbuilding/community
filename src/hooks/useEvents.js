import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'
import { useProject } from '../contexts/ProjectContext'

export function useEvents() {
  const { user } = useAuth()
  const { project } = useProject()
  const [events, setEvents] = useState([])
  const [loading, setLoading] = useState(true)

  const projectId = project?.id

  const fetchEvents = useCallback(async () => {
    if (!projectId) return
    setLoading(true)

    const { data, error } = await supabase
      .from('meetings')
      .select('*, event_rsvps(profile_id, status)')
      .eq('project_id', projectId)
      .order('date', { ascending: true })

    if (error) {
      console.error('Error fetching events:', error)
    } else {
      const transformed = (data || []).map(e => ({
        ...e,
        going_count: e.event_rsvps?.filter(r => r.status === 'going').length || 0,
        maybe_count: e.event_rsvps?.filter(r => r.status === 'maybe').length || 0,
        my_rsvp: e.event_rsvps?.find(r => r.profile_id === user?.id)?.status || null,
      }))
      setEvents(transformed)
    }
    setLoading(false)
  }, [projectId, user?.id])

  useEffect(() => { fetchEvents() }, [fetchEvents])

  // Realtime
  useEffect(() => {
    if (!projectId) return
    const channel = supabase
      .channel(`events:${projectId}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'meetings', filter: `project_id=eq.${projectId}` }, () => fetchEvents())
      .on('postgres_changes', { event: '*', schema: 'public', table: 'event_rsvps' }, () => fetchEvents())
      .subscribe()
    return () => supabase.removeChannel(channel)
  }, [projectId, fetchEvents])

  const upcoming = events.filter(e => new Date(e.date) >= new Date() || e.status === 'upcoming')
  const past = events.filter(e => new Date(e.date) < new Date() && e.status !== 'upcoming')

  async function createEvent({ title, description, date, location, online_url, max_attendees, image_url }) {
    const { data, error } = await supabase
      .from('meetings')
      .insert({ project_id: projectId, title, description, date, location, online_url, max_attendees, image_url })
      .select('*')
      .single()
    if (error) throw error
    fetchEvents()
    return data
  }

  async function rsvp(meetingId, status) {
    // Upsert: insert or update
    if (status === null) {
      // Remove RSVP
      await supabase.from('event_rsvps').delete().eq('meeting_id', meetingId).eq('profile_id', user.id)
    } else {
      await supabase.from('event_rsvps').upsert({
        meeting_id: meetingId,
        profile_id: user.id,
        status,
      }, { onConflict: 'profile_id,meeting_id' })
    }
    // Optimistic update
    setEvents(prev => prev.map(e => {
      if (e.id !== meetingId) return e
      const rsvps = (e.event_rsvps || []).filter(r => r.profile_id !== user.id)
      if (status) rsvps.push({ profile_id: user.id, status })
      return {
        ...e,
        event_rsvps: rsvps,
        going_count: rsvps.filter(r => r.status === 'going').length,
        maybe_count: rsvps.filter(r => r.status === 'maybe').length,
        my_rsvp: status,
      }
    }))
  }

  return { events, upcoming, past, loading, createEvent, rsvp, refetch: fetchEvents }
}
