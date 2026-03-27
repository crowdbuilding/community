import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

export default function useIntakeQuestions(projectId) {
  const [questions, setQuestions] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!projectId) return
    fetchQuestions()
  }, [projectId])

  async function fetchQuestions() {
    setLoading(true)
    const { data, error } = await supabase
      .from('intake_questions')
      .select('*')
      .eq('project_id', projectId)
      .order('sort_order')
    if (error) console.error('Fetch intake questions error:', error)
    setQuestions(data || [])
    setLoading(false)
  }

  async function addQuestion(question) {
    const maxOrder = questions.reduce((max, q) => Math.max(max, q.sort_order), -1)
    const { data, error } = await supabase.from('intake_questions').insert({
      project_id: projectId,
      question_text: question.question_text,
      question_type: question.question_type || 'text',
      options: question.options || null,
      required: question.required ?? true,
      sort_order: maxOrder + 1,
    }).select().single()

    if (error) { console.error('Add question error:', error); return null }
    setQuestions(prev => [...prev, data])
    return data
  }

  async function updateQuestion(id, updates) {
    const { error } = await supabase.from('intake_questions').update(updates).eq('id', id)
    if (error) { console.error('Update question error:', error); return }
    setQuestions(prev => prev.map(q => q.id === id ? { ...q, ...updates } : q))
  }

  async function deleteQuestion(id) {
    const { error } = await supabase.from('intake_questions').delete().eq('id', id)
    if (error) { console.error('Delete question error:', error); return }
    setQuestions(prev => prev.filter(q => q.id !== id))
  }

  async function reorderQuestions(reordered) {
    setQuestions(reordered)
    const updates = reordered.map((q, i) => ({ id: q.id, sort_order: i }))
    for (const u of updates) {
      await supabase.from('intake_questions').update({ sort_order: u.sort_order }).eq('id', u.id)
    }
  }

  return { questions, loading, addQuestion, updateQuestion, deleteQuestion, reorderQuestions, refetch: fetchQuestions }
}
