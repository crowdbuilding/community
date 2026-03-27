import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase'
import { useProject } from '../contexts/ProjectContext'

async function sendMemberEmail(type, { memberName, memberEmail, projectName, reason }) {
  try {
    const { error } = await supabase.functions.invoke('send-member-email', {
      body: { type, memberName, memberEmail, projectName, reason },
    })
    if (error) console.error('Email send error:', error)
  } catch (err) {
    // Email is best-effort — don't block the action
    console.error('Email function error:', err)
  }
}

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
      .select('*, profile:profiles(id, full_name, avatar_url, email, is_platform_admin, company, bio, phone, website, professional_type)')
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
    const member = members.find(m => m.id === membershipId)
    await updateRole(membershipId, 'aspirant')

    // Send welcome email (best-effort)
    if (member?.profile) {
      sendMemberEmail('welcome', {
        memberName: member.profile.full_name,
        memberEmail: member.profile.email,
        projectName: project?.name,
      })
    }
  }

  async function rejectMember(membershipId, reason) {
    const member = members.find(m => m.id === membershipId)

    // Send rejection email before deleting
    if (member?.profile) {
      await sendMemberEmail('rejection', {
        memberName: member.profile.full_name,
        memberEmail: member.profile.email,
        projectName: project?.name,
        reason,
      })
    }

    await removeMember(membershipId)
  }

  return { members, loading, updateRole, removeMember, approveMember, rejectMember, refetch: fetchMembers }
}
