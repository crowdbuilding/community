import { useState } from 'react'
import { useProject } from '../contexts/ProjectContext'
import { useRoadmap } from '../hooks/useRoadmap'
import { canDo } from '../lib/permissions'
import ConfirmModal from '../components/ConfirmModal'

const TAG_MAP = {
  workshop:  { label: 'Workshop',  cls: 'roadmap-tag--blue' },
  milestone: { label: 'Milestone', cls: 'roadmap-tag--orange' },
  key:       { label: 'Mijlpaal',  cls: 'roadmap-tag--pink' },
  formeel:   { label: 'Formeel',   cls: 'roadmap-tag--green' },
  team:      { label: 'Team',      cls: 'roadmap-tag--muted' },
  special:   { label: 'Document',  cls: 'roadmap-tag--green' },
}

const ITEM_TYPES = Object.keys(TAG_MAP)

const STATUS_OPTIONS = [
  { value: 'done', label: 'Afgerond', color: '#3BD269' },
  { value: 'active', label: 'Actief', color: '#4A90D9' },
  { value: 'pending', label: 'Gepland', color: '#9ba1b0' },
]

function RoadmapItem({ item, canEdit, onUpdate, onRemove, onToggleDone }) {
  const [open, setOpen] = useState(false)
  const [editing, setEditing] = useState(false)
  const [form, setForm] = useState({})
  const tag = TAG_MAP[item.type] || TAG_MAP.milestone
  const dotCls = item.type === 'key' ? 'roadmap-dot--key' : item.type === 'milestone' ? 'roadmap-dot--milestone' : 'roadmap-dot--step'

  function startEdit(e) {
    e.stopPropagation()
    setForm({ title: item.title, snippet: item.snippet || '', description: item.description || '', type: item.type })
    setEditing(true)
  }

  function saveEdit() {
    onUpdate(item.id, form)
    setEditing(false)
  }

  if (editing) {
    return (
      <div className="roadmap-item roadmap-item--editing">
        <div className="roadmap-dot roadmap-dot--step" />
        <div className="roadmap-item__edit-form">
          <input className="input" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} placeholder="Titel" />
          <input className="input" value={form.snippet} onChange={e => setForm({ ...form, snippet: e.target.value })} placeholder="Korte beschrijving" />
          <textarea className="input" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} placeholder="Uitgebreide beschrijving" rows={3} />
          <div className="roadmap-item__edit-row">
            <select className="input" value={form.type} onChange={e => setForm({ ...form, type: e.target.value })}>
              {ITEM_TYPES.map(t => <option key={t} value={t}>{TAG_MAP[t].label}</option>)}
            </select>
            <div className="roadmap-item__edit-actions">
              <button className="btn-secondary btn-sm" onClick={() => setEditing(false)}>Annuleren</button>
              <button className="btn-primary btn-sm" onClick={saveEdit}>Opslaan</button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className={`roadmap-item ${open ? 'roadmap-item--open' : ''} ${item.is_done ? 'roadmap-item--done' : ''}`} onClick={() => setOpen(!open)}>
      {canEdit && (
        <button className="roadmap-item__check" onClick={e => { e.stopPropagation(); onToggleDone(item.id, !item.is_done) }} title={item.is_done ? 'Markeer als open' : 'Markeer als afgerond'}>
          <i className={`fa-${item.is_done ? 'solid' : 'regular'} fa-circle-check`} />
        </button>
      )}
      <div className={`roadmap-dot ${item.type === 'special' ? 'roadmap-dot--special' : dotCls} ${item.is_done ? 'roadmap-dot--done' : ''}`} />
      <div className="roadmap-item__content">
        <div className="roadmap-item__top">
          <span className={`roadmap-item__title ${item.type === 'key' ? 'roadmap-item__title--key' : ''} ${item.is_done ? 'roadmap-item__title--done' : ''}`}>
            {item.title}
          </span>
          <span className={`roadmap-tag ${tag.cls}`}>{tag.label}</span>
        </div>
        {item.snippet && <div className="roadmap-item__snippet">{item.snippet}</div>}
        {open && item.description && (
          <div className="roadmap-item__detail">{item.description}</div>
        )}
      </div>
      {canEdit && (
        <div className="roadmap-item__admin" onClick={e => e.stopPropagation()}>
          <button className="btn-icon btn-sm" onClick={startEdit} title="Bewerken" aria-label="Bewerken"><i className="fa-solid fa-pen" /></button>
          <button className="btn-icon btn-sm" onClick={() => onRemove(item.id)} title="Verwijderen" aria-label="Verwijderen"><i className="fa-solid fa-trash" /></button>
        </div>
      )}
      <i className={`fa-solid fa-chevron-down roadmap-item__chevron ${open ? 'roadmap-item__chevron--open' : ''}`} />
    </div>
  )
}

function RoadmapPhase({ phase, canEdit, onUpdatePhase, onRemovePhase, onAddItem, onUpdateItem, onRemoveItem, onToggleItemDone }) {
  const [open, setOpen] = useState(phase.status === 'active')
  const [editingPhase, setEditingPhase] = useState(false)
  const [form, setForm] = useState({})
  const [addingItem, setAddingItem] = useState(false)
  const [newItem, setNewItem] = useState({ title: '', snippet: '', description: '', type: 'milestone' })
  const [confirmDelete, setConfirmDelete] = useState(false)

  const doneItems = phase.items?.filter(i => i.is_done).length || 0
  const totalItems = phase.items?.length || 0

  function startEditPhase(e) {
    e.stopPropagation()
    setForm({ name: phase.name, subtitle: phase.subtitle || '', period: phase.period || '', color: phase.color || '#4A90D9', status: phase.status })
    setEditingPhase(true)
  }

  function savePhase() {
    onUpdatePhase(phase.id, form)
    setEditingPhase(false)
  }

  function handleAddItem() {
    if (!newItem.title.trim()) return
    onAddItem(phase.id, newItem)
    setNewItem({ title: '', snippet: '', description: '', type: 'milestone' })
    setAddingItem(false)
  }

  const statusInfo = STATUS_OPTIONS.find(s => s.value === phase.status) || STATUS_OPTIONS[2]

  return (
    <div className={`roadmap-phase ${open ? 'roadmap-phase--open' : ''} roadmap-phase--${phase.status}`}>
      <div className="roadmap-phase__head" onClick={() => setOpen(!open)}>
        <div className="roadmap-phase__num" style={{ background: phase.color }}>{phase.num}</div>
        <div className="roadmap-phase__info">
          <div className="roadmap-phase__name">
            {phase.name}{phase.subtitle ? ` — ${phase.subtitle}` : ''}
          </div>
          <div className="roadmap-phase__period">
            {phase.period}
            {totalItems > 0 && (
              <span className="roadmap-phase__progress"> · {doneItems}/{totalItems} afgerond</span>
            )}
          </div>
        </div>
        <div className="roadmap-phase__meta">
          <span className="roadmap-phase__status" style={{ color: statusInfo.color }}>{statusInfo.label}</span>
          {phase.expected_members && (
            <span className="roadmap-phase__members">
              <i className="fa-solid fa-users" /> {phase.expected_members}
            </span>
          )}
          {canEdit && (
            <button className="btn-icon btn-sm" onClick={startEditPhase} title="Fase bewerken">
              <i className="fa-solid fa-pen" />
            </button>
          )}
          <i className={`fa-solid fa-chevron-down roadmap-phase__chevron ${open ? 'roadmap-phase__chevron--open' : ''}`} />
        </div>
      </div>

      {/* Phase edit form */}
      {editingPhase && (
        <div className="roadmap-phase__edit" onClick={e => e.stopPropagation()}>
          <div className="roadmap-phase__edit-grid">
            <div className="form-group">
              <label>Naam</label>
              <input className="input" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
            </div>
            <div className="form-group">
              <label>Subtitel</label>
              <input className="input" value={form.subtitle} onChange={e => setForm({ ...form, subtitle: e.target.value })} />
            </div>
            <div className="form-group">
              <label>Periode</label>
              <input className="input" value={form.period} onChange={e => setForm({ ...form, period: e.target.value })} />
            </div>
            <div className="form-group">
              <label>Status</label>
              <select className="input" value={form.status} onChange={e => setForm({ ...form, status: e.target.value })}>
                {STATUS_OPTIONS.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label>Kleur</label>
              <input className="input" type="color" value={form.color} onChange={e => setForm({ ...form, color: e.target.value })} />
            </div>
          </div>
          <div className="roadmap-phase__edit-actions">
            <button className="btn-danger btn-sm" onClick={() => setConfirmDelete(true)}>
              <i className="fa-solid fa-trash" /> Verwijder fase
            </button>
            <div className="roadmap-phase__edit-right">
              <button className="btn-secondary btn-sm" onClick={() => setEditingPhase(false)}>Annuleren</button>
              <button className="btn-primary btn-sm" onClick={savePhase}>Opslaan</button>
            </div>
          </div>
        </div>
      )}

      {/* Items */}
      {open && (
        <div className="roadmap-phase__body">
          {(phase.items || []).map(item => (
            <RoadmapItem
              key={item.id}
              item={item}
              canEdit={canEdit}
              onUpdate={onUpdateItem}
              onRemove={onRemoveItem}
              onToggleDone={onToggleItemDone}
            />
          ))}

          {canEdit && !addingItem && (
            <button className="roadmap-add-item" onClick={() => setAddingItem(true)}>
              <i className="fa-solid fa-plus" /> Stap toevoegen
            </button>
          )}

          {addingItem && (
            <div className="roadmap-item roadmap-item--editing">
              <div className="roadmap-dot roadmap-dot--step" />
              <div className="roadmap-item__edit-form">
                <input className="input" value={newItem.title} onChange={e => setNewItem({ ...newItem, title: e.target.value })} placeholder="Titel" autoFocus />
                <input className="input" value={newItem.snippet} onChange={e => setNewItem({ ...newItem, snippet: e.target.value })} placeholder="Korte beschrijving" />
                <div className="roadmap-item__edit-row">
                  <select className="input" value={newItem.type} onChange={e => setNewItem({ ...newItem, type: e.target.value })}>
                    {ITEM_TYPES.map(t => <option key={t} value={t}>{TAG_MAP[t].label}</option>)}
                  </select>
                  <div className="roadmap-item__edit-actions">
                    <button className="btn-secondary btn-sm" onClick={() => setAddingItem(false)}>Annuleren</button>
                    <button className="btn-primary btn-sm" onClick={handleAddItem}>Toevoegen</button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {confirmDelete && (
        <ConfirmModal
          message={`Fase "${phase.name}" en alle stappen verwijderen?`}
          confirmLabel="Verwijderen"
          danger
          onConfirm={() => { onRemovePhase(phase.id); setConfirmDelete(false) }}
          onCancel={() => setConfirmDelete(false)}
        />
      )}
    </div>
  )
}

export default function Roadmap() {
  const { project, role } = useProject()
  const { phases, loading, addPhase, updatePhase, removePhase, addItem, updateItem, removeItem, toggleItemDone } = useRoadmap(project?.id)
  const isEditor = canDo(role, 'edit_phases')

  if (loading) return <div className="skeleton-page" style={{ padding: 32 }}><div className="skeleton-line" style={{ width: 200, height: 26 }} /><div style={{ height: 16 }} />{[1,2,3].map(i => <div key={i} className="skeleton-card" style={{ marginBottom: 12 }}><div className="skeleton-line" style={{ width: '60%', height: 18 }} /><div className="skeleton-line" style={{ width: '40%' }} /></div>)}</div>

  return (
    <div className="view-roadmap">
      <div className="view-header">
        <div className="view-header__row">
          <div>
            <span className="view-header__eyebrow">Ontwikkeltraject</span>
            <h1>Roadmap</h1>
          </div>
          {isEditor && (
            <button className="btn-primary" onClick={() => addPhase({ name: 'Nieuwe fase' })}>
              <i className="fa-solid fa-plus" /> Fase toevoegen
            </button>
          )}
        </div>
        <p className="view-header__subtitle">
          Van structuurontwerp tot oplevering — workshops, milestones en formele stappen in {phases.length} fasen.
        </p>
      </div>

      {phases.length === 0 ? (
        <div className="empty-state">
          <i className="fa-solid fa-route empty-state__icon" />
          <p>Nog geen roadmap aangemaakt.</p>
          {isEditor && (
            <button className="btn-primary" onClick={() => addPhase({ name: 'Eerste fase' })}>
              <i className="fa-solid fa-plus" /> Eerste fase aanmaken
            </button>
          )}
        </div>
      ) : (
        <div className="roadmap-phases">
          {phases.map((phase, i) => (
            <div key={phase.id}>
              {i > 0 && <div className="roadmap-connector" />}
              <RoadmapPhase
                phase={phase}
                canEdit={isEditor}
                onUpdatePhase={updatePhase}
                onRemovePhase={removePhase}
                onAddItem={addItem}
                onUpdateItem={updateItem}
                onRemoveItem={removeItem}
                onToggleItemDone={toggleItemDone}
              />
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
