import { useState, useEffect, useCallback, useMemo } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'
import { useProject } from '../contexts/ProjectContext'

/**
 * Unified document hook that combines:
 * - Professional updates (advisor docs with files)
 * - Meeting files (agendas, minutes, presentations from events)
 * - Archive documents (contracts, regulations, manuals)
 */
export function useAllDocuments() {
  const { user } = useAuth()
  const { project } = useProject()
  const [proUpdates, setProUpdates] = useState([])
  const [meetingFiles, setMeetingFiles] = useState([])
  const [archiveDocs, setArchiveDocs] = useState([])
  const [loading, setLoading] = useState(true)

  const projectId = project?.id

  const fetchAll = useCallback(async () => {
    if (!projectId) return
    setLoading(true)

    const [proRes, meetingRes, archiveRes] = await Promise.all([
      // Professional update files (joined with update + author)
      supabase
        .from('update_files')
        .select(`
          id, file_name, file_path, file_size, file_type, created_at,
          update:professional_updates(
            id, title, phase, author_id, created_at,
            author:profiles(id, full_name, avatar_url, professional_type, professional_label)
          )
        `)
        .order('created_at', { ascending: false }),

      // Meeting files (joined with meeting)
      supabase
        .from('meeting_files')
        .select(`
          id, file_name, file_path, file_size, file_type, category, created_at,
          meeting:meetings(id, title, date, project_id),
          uploader:profiles(id, full_name, avatar_url)
        `)
        .order('created_at', { ascending: false }),

      // Archive documents
      supabase
        .from('documents')
        .select('*, uploader:profiles(id, full_name, avatar_url)')
        .eq('project_id', projectId)
        .order('created_at', { ascending: false }),
    ])

    // Filter pro files to this project
    const proFiles = (proRes.data || []).filter(f =>
      f.update?.author_id && f.update
    ).map(f => ({
      id: f.id,
      source: 'adviseur',
      file_name: f.file_name,
      file_path: f.file_path,
      file_size: f.file_size,
      file_type: f.file_type,
      title: f.update?.title || f.file_name,
      phase: f.update?.phase,
      author: f.update?.author,
      professional_type: f.update?.author?.professional_type,
      created_at: f.created_at,
    }))

    // Filter meeting files to this project
    const mFiles = (meetingRes.data || []).filter(f =>
      f.meeting?.project_id === projectId
    ).map(f => ({
      id: f.id,
      source: 'vergadering',
      file_name: f.file_name,
      file_path: f.file_path,
      file_size: f.file_size,
      file_type: f.file_type,
      title: f.file_name,
      subcategory: f.category, // agenda, minutes, presentation, attachment
      meeting_title: f.meeting?.title,
      meeting_date: f.meeting?.date,
      author: f.uploader,
      created_at: f.created_at,
    }))

    // Archive docs (files + links)
    const aDocs = (archiveRes.data || []).map(d => ({
      id: d.id,
      source: 'dossier',
      doc_type: d.doc_type || 'file',
      url: d.url,
      file_name: d.file_name,
      file_path: d.file_path,
      file_size: d.file_size,
      file_type: d.file_type,
      title: d.title,
      description: d.description,
      subcategory: d.category,
      author: d.uploader,
      created_at: d.created_at,
    }))

    setProUpdates(proFiles)
    setMeetingFiles(mFiles)
    setArchiveDocs(aDocs)
    setLoading(false)
  }, [projectId])

  useEffect(() => { fetchAll() }, [fetchAll])

  // All combined, sorted newest first
  const allDocuments = useMemo(() => {
    return [...proUpdates, ...meetingFiles, ...archiveDocs]
      .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
  }, [proUpdates, meetingFiles, archiveDocs])

  // Upload a new archive document
  async function uploadArchiveDoc({ title, description, category, file }) {
    const path = `documents/${projectId}/${Date.now()}-${file.name}`
    const { error: upErr } = await supabase.storage.from('project-files').upload(path, file)
    if (upErr) throw upErr

    const { data: { publicUrl } } = supabase.storage.from('project-files').getPublicUrl(path)

    const { error } = await supabase.from('documents').insert({
      project_id: projectId, title, description: description || null,
      category, file_name: file.name, file_path: publicUrl,
      file_size: file.size, file_type: file.type, uploaded_by: user?.id,
    })
    if (error) throw error
    fetchAll()
  }

  // Save a link
  async function saveLink({ title, description, category, url }) {
    const { error } = await supabase.from('documents').insert({
      project_id: projectId, title, description: description || null,
      category, doc_type: 'link', url,
      file_name: title, file_path: url,
      uploaded_by: user?.id,
    })
    if (error) throw error
    fetchAll()
  }

  async function removeDoc(id, source, filePath) {

    const storagePath = filePath?.split('/project-files/')[1]
    if (storagePath) {
      await supabase.storage.from('project-files').remove([storagePath])
    }

    if (source === 'dossier') {
      await supabase.from('documents').delete().eq('id', id)
    } else if (source === 'vergadering') {
      await supabase.from('meeting_files').delete().eq('id', id)
    } else if (source === 'adviseur') {
      await supabase.from('update_files').delete().eq('id', id)
    }
    fetchAll()
  }

  return {
    allDocuments,
    adviseurDocs: proUpdates,
    vergaderingDocs: meetingFiles,
    dossierDocs: archiveDocs,
    loading,
    uploadArchiveDoc,
    saveLink,
    removeDoc,
    refetch: fetchAll,
  }
}
