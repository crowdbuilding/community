import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase'
import { logger, friendlyError } from '../lib/logger'

export function useRoadmap(projectId) {
  const [phases, setPhases] = useState([])
  const [loading, setLoading] = useState(true)

  const fetchRoadmap = useCallback(async () => {
    if (!projectId) return
    const { data, error } = await supabase
      .from('roadmap_phases')
      .select('*, items:roadmap_items(*)')
      .eq('project_id', projectId)
      .order('sort_order')

    if (error) {
      logger.error('useRoadmap.fetch', error)
    } else {
      // Sort items within each phase
      const sorted = (data || []).map(p => ({
        ...p,
        items: (p.items || []).sort((a, b) => a.sort_order - b.sort_order),
      }))
      setPhases(sorted)
    }
    setLoading(false)
  }, [projectId])

  useEffect(() => {
    fetchRoadmap()

    // Realtime subscriptions
    const phasesSub = supabase
      .channel(`roadmap_phases_${projectId}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'roadmap_phases', filter: `project_id=eq.${projectId}` }, fetchRoadmap)
      .subscribe()

    const itemsSub = supabase
      .channel(`roadmap_items_${projectId}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'roadmap_items' }, fetchRoadmap)
      .subscribe()

    return () => {
      supabase.removeChannel(phasesSub)
      supabase.removeChannel(itemsSub)
    }
  }, [projectId, fetchRoadmap])

  // Derived data
  const activePhase = phases.find(p => p.status === 'active')
  const doneCount = phases.filter(p => p.status === 'done').length
  const totalCount = phases.length || 1
  const progressPct = Math.round((doneCount / totalCount) * 100)

  // CRUD: Phases
  async function addPhase(phase) {
    const maxOrder = phases.length > 0 ? Math.max(...phases.map(p => p.sort_order)) : 0
    const { error } = await supabase.from('roadmap_phases').insert({
      project_id: projectId,
      num: String(phases.length + 1),
      name: phase.name || 'Nieuwe fase',
      subtitle: phase.subtitle || '',
      period: phase.period || '',
      color: phase.color || '#4A90D9',
      status: 'pending',
      sort_order: maxOrder + 1,
    })
    if (error) { logger.error('useRoadmap.addPhase', error); throw new Error(friendlyError(error)) }
  }

  async function updatePhase(phaseId, updates) {
    const { error } = await supabase.from('roadmap_phases').update(updates).eq('id', phaseId)
    if (error) { logger.error('useRoadmap.updatePhase', error); throw new Error(friendlyError(error)) }
  }

  async function removePhase(phaseId) {
    setPhases(prev => prev.filter(p => p.id !== phaseId))
    const { error } = await supabase.from('roadmap_phases').delete().eq('id', phaseId)
    if (error) { logger.error('useRoadmap.removePhase', error); fetchRoadmap(); throw new Error(friendlyError(error)) }
  }

  // CRUD: Items
  async function addItem(phaseId, item) {
    const phase = phases.find(p => p.id === phaseId)
    const maxOrder = phase?.items?.length > 0 ? Math.max(...phase.items.map(i => i.sort_order)) : 0
    const { error } = await supabase.from('roadmap_items').insert({
      phase_id: phaseId,
      title: item.title || 'Nieuw item',
      snippet: item.snippet || '',
      description: item.description || '',
      type: item.type || 'milestone',
      sort_order: maxOrder + 1,
    })
    if (error) { logger.error('useRoadmap.addItem', error); throw new Error(friendlyError(error)) }
  }

  async function updateItem(itemId, updates) {
    const { error } = await supabase.from('roadmap_items').update(updates).eq('id', itemId)
    if (error) { logger.error('useRoadmap.updateItem', error); throw new Error(friendlyError(error)) }
  }

  async function removeItem(itemId) {
    const { error } = await supabase.from('roadmap_items').delete().eq('id', itemId)
    if (error) { logger.error('useRoadmap.removeItem', error); throw new Error(friendlyError(error)) }
  }

  async function toggleItemDone(itemId, isDone) {
    await updateItem(itemId, { is_done: isDone })
  }

  return {
    phases, loading, activePhase, doneCount, totalCount, progressPct,
    addPhase, updatePhase, removePhase,
    addItem, updateItem, removeItem, toggleItemDone,
    reload: fetchRoadmap,
  }
}
