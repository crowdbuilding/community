import { useState } from 'react'
import { useProject } from '../contexts/ProjectContext'
import { useUpdates } from '../hooks/useUpdates'
import { canDo } from '../lib/permissions'
import UpdateCard from '../components/UpdateCard'
import UpdateModal from '../components/UpdateModal'

import { UPDATE_TAGS } from '../lib/constants'
const FILTER_TAGS = ['Alles', ...UPDATE_TAGS]

export default function Updates() {
  const { role } = useProject()
  const { updates, loading, createUpdate, editUpdate } = useUpdates()
  const [activeTag, setActiveTag] = useState('Alles')
  const [modalOpen, setModalOpen] = useState(false)
  const [editingUpdate, setEditingUpdate] = useState(null)

  const filtered = activeTag === 'Alles'
    ? updates
    : updates.filter(u => u.tag === activeTag)

  function handleNew() {
    setEditingUpdate(null)
    setModalOpen(true)
  }

  function handleEdit(update) {
    setEditingUpdate(update)
    setModalOpen(true)
  }

  async function handleSave(data) {
    if (data.id) {
      await editUpdate(data.id, data)
    } else {
      await createUpdate(data)
    }
  }

  return (
    <div className="view-updates">
      <div className="view-header">
        <div className="view-header__row">
          <h1>Updates</h1>
          {canDo(role, 'publish_update') && (
            <button className="btn-primary" onClick={handleNew}>
              <i className="fa-solid fa-plus" /> Nieuwe update
            </button>
          )}
        </div>
      </div>

      <div className="tag-filter">
        {FILTER_TAGS.map(tag => (
          <button
            key={tag}
            className={`tag-filter__pill ${activeTag === tag ? 'tag-filter__pill--active' : ''}`}
            onClick={() => setActiveTag(tag)}
          >
            {tag}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="loading-inline"><p>Updates laden...</p></div>
      ) : filtered.length === 0 ? (
        <div className="empty-inline">
          <i className="fa-solid fa-bullhorn" />
          <p>Nog geen updates{activeTag !== 'Alles' ? ` met tag "${activeTag}"` : ''}</p>
          {canDo(role, 'publish_update') && (
            <button className="btn-secondary" onClick={handleNew}>Eerste update plaatsen</button>
          )}
        </div>
      ) : (
        <div className="updates-list">
          {filtered.map(update => (
            <UpdateCard key={update.id} update={update} onEdit={handleEdit} />
          ))}
        </div>
      )}

      {modalOpen && (
        <UpdateModal
          update={editingUpdate}
          onSave={handleSave}
          onClose={() => setModalOpen(false)}
        />
      )}
    </div>
  )
}
