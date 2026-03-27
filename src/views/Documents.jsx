import { useState, useMemo, useRef } from 'react'
import { useProject } from '../contexts/ProjectContext'
import { useAuth } from '../contexts/AuthContext'
import { canDo } from '../lib/permissions'
import { useConfirm } from '../components/ConfirmDialog'
import { useAllDocuments } from '../hooks/useAllDocuments'
import {
  PROJECT_PHASES, PROFESSIONAL_TYPES, PROFESSIONAL_LABELS, PROFESSIONAL_COLORS,
  formatFileSize, fileIcon, fileIconColor, linkInfo, timeAgo,
} from '../lib/constants'

const TABS = [
  { key: 'alles', label: 'Alles' },
  { key: 'adviseur', label: 'Adviseurs' },
  { key: 'vergadering', label: 'Vergaderingen' },
  { key: 'dossier', label: 'Dossier' },
]

const DOSSIER_CATEGORIES = [
  { key: 'all', label: 'Alles' },
  { key: 'contract', label: 'Contract' },
  { key: 'reglement', label: 'Reglement' },
  { key: 'presentatie', label: 'Presentatie' },
  { key: 'handleiding', label: 'Handleiding' },
  { key: 'overig', label: 'Overig' },
]

const MEETING_FILE_CATS = [
  { key: 'all', label: 'Alles' },
  { key: 'agenda', label: 'Agenda' },
  { key: 'minutes', label: 'Notulen' },
  { key: 'presentation', label: 'Presentatie' },
  { key: 'attachment', label: 'Bijlage' },
]

export default function Documents() {
  const { role } = useProject()
  const { profile } = useAuth()
  const confirm = useConfirm()
  const { allDocuments, adviseurDocs, vergaderingDocs, dossierDocs, loading, uploadArchiveDoc, saveLink, removeDoc } = useAllDocuments()

  async function handleRemove(id, source, filePath) {
    if (await confirm('Dit document verwijderen?', { danger: true })) {
      removeDoc(id, source, filePath)
    }
  }

  const [tab, setTab] = useState(role === 'professional' ? 'adviseur' : 'alles')
  const [search, setSearch] = useState('')
  const [phaseFilter, setPhaseFilter] = useState('all')
  const [sourceFilter, setSourceFilter] = useState('all')
  const [proTypeFilter, setProTypeFilter] = useState('all')
  const [dossierCat, setDossierCat] = useState('all')
  const [meetingCat, setMeetingCat] = useState('all')
  const [uploadOpen, setUploadOpen] = useState(false)
  const [linkOpen, setLinkOpen] = useState(false)

  const isProfessional = !!profile?.professional_type
  const isProfessionalRole = role === 'professional'
  const canUpload = canDo(role, 'moderate_board') || isProfessional

  // Professional role only sees Adviseurs tab
  const visibleTabs = isProfessionalRole ? TABS.filter(t => t.key === 'adviseur') : TABS

  // Get the right source based on tab
  const sourceList = useMemo(() => {
    switch (tab) {
      case 'adviseur': return adviseurDocs
      case 'vergadering': return vergaderingDocs
      case 'dossier': return dossierDocs
      default: return allDocuments
    }
  }, [tab, allDocuments, adviseurDocs, vergaderingDocs, dossierDocs])

  // Apply sub-filters
  const filtered = useMemo(() => {
    let result = sourceList

    // Source filter (alles tab)
    if (tab === 'alles' && sourceFilter !== 'all') {
      result = result.filter(d => d.source === sourceFilter)
    }
    // Phase filter (alles + adviseur tab)
    if ((tab === 'alles' || tab === 'adviseur') && phaseFilter !== 'all') {
      result = result.filter(d => d.phase === phaseFilter)
    }
    // Professional type filter (adviseur tab)
    if (tab === 'adviseur' && proTypeFilter !== 'all') {
      result = result.filter(d => d.professional_type === proTypeFilter)
    }
    // Dossier category
    if (tab === 'dossier' && dossierCat !== 'all') {
      result = result.filter(d => d.subcategory === dossierCat)
    }
    // Meeting file category
    if (tab === 'vergadering' && meetingCat !== 'all') {
      result = result.filter(d => d.subcategory === meetingCat)
    }
    // Search
    if (search.trim()) {
      const q = search.toLowerCase()
      result = result.filter(d =>
        d.file_name?.toLowerCase().includes(q) ||
        d.title?.toLowerCase().includes(q) ||
        d.description?.toLowerCase().includes(q) ||
        d.author?.full_name?.toLowerCase().includes(q) ||
        d.meeting_title?.toLowerCase().includes(q)
      )
    }

    return result
  }, [sourceList, tab, phaseFilter, proTypeFilter, dossierCat, meetingCat, search])

  // Count per tab
  const counts = useMemo(() => ({
    alles: allDocuments.length,
    adviseur: adviseurDocs.length,
    vergadering: vergaderingDocs.length,
    dossier: dossierDocs.length,
  }), [allDocuments, adviseurDocs, vergaderingDocs, dossierDocs])

  return (
    <div className="view-documents-unified">
      <div className="view-header">
        <div className="view-header__row">
          <h1>Documenten</h1>
          {canDo(role, 'moderate_board') && (
            <div className="view-header__actions">
              <button className="btn-secondary" onClick={() => setLinkOpen(true)}>
                <i className="fa-solid fa-link" /> Link
              </button>
              <button className="btn-primary" onClick={() => setUploadOpen(true)}>
                <i className="fa-solid fa-plus" /> Bestand
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="doc-tabs">
        {visibleTabs.map(t => (
          <button
            key={t.key}
            className={`doc-tab ${tab === t.key ? 'doc-tab--active' : ''}`}
            onClick={() => { setTab(t.key); setPhaseFilter('all'); setSourceFilter('all'); setProTypeFilter('all'); setDossierCat('all'); setMeetingCat('all') }}
          >
            {t.label}
            {counts[t.key] > 0 && <span className="doc-tab__count">{counts[t.key]}</span>}
          </button>
        ))}
      </div>

      {/* Filters + search row */}
      <div className="doc-filters-row">
        <div className="doc-filters">
          {(tab === 'alles' || tab === 'adviseur') && (
            <select value={phaseFilter} onChange={e => setPhaseFilter(e.target.value)}>
              <option value="all">Alle fasen</option>
              {PROJECT_PHASES.map(p => (
                <option key={p.key} value={p.key}>{p.label}</option>
              ))}
            </select>
          )}
          {tab === 'alles' && (
            <select value={sourceFilter} onChange={e => setSourceFilter(e.target.value)}>
              <option value="all">Alle types</option>
              <option value="adviseur">Adviseur</option>
              <option value="vergadering">Vergadering</option>
              <option value="dossier">Dossier</option>
            </select>
          )}
          {tab === 'adviseur' && (
            <select value={proTypeFilter} onChange={e => setProTypeFilter(e.target.value)}>
              <option value="all">Alle rollen</option>
              {PROFESSIONAL_TYPES.map(t => (
                <option key={t} value={t}>{PROFESSIONAL_LABELS[t]}</option>
              ))}
            </select>
          )}
          {tab === 'vergadering' && (
            <select value={meetingCat} onChange={e => setMeetingCat(e.target.value)}>
              {MEETING_FILE_CATS.map(c => (
                <option key={c.key} value={c.key}>{c.label}</option>
              ))}
            </select>
          )}
          {tab === 'dossier' && (
            <select value={dossierCat} onChange={e => setDossierCat(e.target.value)}>
              {DOSSIER_CATEGORIES.map(c => (
                <option key={c.key} value={c.key}>{c.label}</option>
              ))}
            </select>
          )}
        </div>
        <div className="doc-search">
          <i className="fa-solid fa-magnifying-glass" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Zoeken in documenten..."
          />
        </div>
      </div>

      {/* Document list */}
      {loading ? (
        <div className="loading-inline"><p>Documenten laden...</p></div>
      ) : filtered.length === 0 ? (
        <div className="empty-inline">
          <i className="fa-solid fa-folder-open" />
          <p>{search ? `Geen resultaten voor "${search}"` : 'Nog geen documenten'}</p>
        </div>
      ) : (
        <div className="doc-list">
          {filtered.map(doc => (
            <DocumentRow
              key={`${doc.source}-${doc.id}`}
              doc={doc}
              canDelete={canDo(role, 'moderate_board')}
              onRemove={handleRemove}
            />
          ))}
        </div>
      )}

      {uploadOpen && (
        <UploadModal onSave={uploadArchiveDoc} onClose={() => setUploadOpen(false)} />
      )}
      {linkOpen && (
        <LinkModal onSave={saveLink} onClose={() => setLinkOpen(false)} />
      )}
    </div>
  )
}

// ===== Document Row =====
function DocumentRow({ doc, canDelete, onRemove }) {
  const sourceLabels = { adviseur: 'Adviseur', vergadering: 'Vergadering', dossier: 'Dossier' }
  const sourceColors = { adviseur: '#4A90D9', vergadering: '#F09020', dossier: '#7B5EA7' }
  const isLink = doc.doc_type === 'link'
  const link = isLink ? linkInfo(doc.url) : null
  const href = isLink ? doc.url : doc.file_path

  return (
    <div className="doc-row">
      <div className="doc-row__icon">
        {isLink
          ? <i className={link.icon} style={{ color: link.color }} />
          : <i className={fileIcon(doc.file_type)} style={{ color: fileIconColor(doc.file_type) }} />
        }
      </div>
      <div className="doc-row__info">
        <a href={href} target="_blank" rel="noopener noreferrer" className="doc-row__title">
          {doc.title || doc.file_name}
          {isLink && <i className="fa-solid fa-arrow-up-right-from-square doc-row__external" />}
        </a>
        <div className="doc-row__meta">
          <span className="doc-row__source" style={{ background: `${sourceColors[doc.source]}14`, color: sourceColors[doc.source] }}>
            {sourceLabels[doc.source]}
          </span>
          {isLink && <span className="doc-row__badge">{link.label}</span>}
          {doc.phase && <span className="doc-row__badge">{doc.phase}</span>}
          {doc.subcategory && doc.source !== 'dossier' && (
            <span className="doc-row__badge">{doc.subcategory}</span>
          )}
          {doc.meeting_title && <span>{doc.meeting_title}</span>}
          {doc.author?.full_name && <span>{doc.author.full_name}</span>}
          {!isLink && doc.file_size > 0 && <span>{formatFileSize(doc.file_size)}</span>}
          <span>{timeAgo(doc.created_at)}</span>
        </div>
      </div>
      <div className="doc-row__actions">
        {isLink ? (
          <a href={href} target="_blank" rel="noopener noreferrer" className="doc-row__btn" title="Openen">
            <i className="fa-solid fa-arrow-up-right-from-square" />
          </a>
        ) : (
          <a href={href} download className="doc-row__btn" title="Download">
            <i className="fa-solid fa-download" />
          </a>
        )}
        {canDelete && (
          <button className="doc-row__btn doc-row__btn--danger" onClick={() => onRemove(doc.id, doc.source, doc.file_path)} title="Verwijder">
            <i className="fa-solid fa-trash" />
          </button>
        )}
      </div>
    </div>
  )
}

// ===== Upload Modal (for Dossier/Archive docs) =====
function UploadModal({ onSave, onClose }) {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [category, setCategory] = useState('overig')
  const [file, setFile] = useState(null)
  const [saving, setSaving] = useState(false)
  const fileRef = useRef(null)

  async function handleSubmit(e) {
    e.preventDefault()
    if (!title.trim() || !file) return
    setSaving(true)
    try {
      await onSave({ title: title.trim(), description: description.trim(), category, file })
      onClose()
    } catch {
      alert('Er ging iets mis bij het uploaden.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-card" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Document toevoegen</h2>
          <button className="modal-close" onClick={onClose}><i className="fa-solid fa-xmark" /></button>
        </div>
        <form onSubmit={handleSubmit} className="modal-form">
          <div className="form-group">
            <label>Titel</label>
            <input type="text" value={title} onChange={e => setTitle(e.target.value)} placeholder="Naam van het document" required autoFocus />
          </div>
          <div className="form-group">
            <label>Beschrijving</label>
            <textarea value={description} onChange={e => setDescription(e.target.value)} placeholder="Optionele toelichting" rows={2} />
          </div>
          <div className="form-group">
            <label>Categorie</label>
            <select value={category} onChange={e => setCategory(e.target.value)}>
              <option value="contract">Contract</option>
              <option value="reglement">Reglement</option>
              <option value="presentatie">Presentatie</option>
              <option value="handleiding">Handleiding</option>
              <option value="overig">Overig</option>
            </select>
          </div>
          <div className="form-group">
            <label>Bestand</label>
            {file ? (
              <div className="file-selected">
                <i className={fileIcon(file.type)} style={{ color: fileIconColor(file.type) }} />
                <span>{file.name}</span>
                <span className="file-selected__size">{formatFileSize(file.size)}</span>
                <button type="button" onClick={() => { setFile(null); if (fileRef.current) fileRef.current.value = '' }}>
                  <i className="fa-solid fa-xmark" />
                </button>
              </div>
            ) : (
              <button type="button" className="btn-secondary" onClick={() => fileRef.current?.click()}>
                <i className="fa-solid fa-cloud-arrow-up" /> Bestand kiezen
              </button>
            )}
            <input ref={fileRef} type="file" onChange={e => setFile(e.target.files?.[0] || null)} style={{ display: 'none' }} />
          </div>
          <div className="modal-actions">
            <button type="button" className="btn-secondary" onClick={onClose}>Annuleren</button>
            <button type="submit" className="btn-primary" disabled={saving || !title.trim() || !file}>
              {saving ? 'Uploaden...' : 'Toevoegen'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

// ===== Link Modal =====
function LinkModal({ onSave, onClose }) {
  const [title, setTitle] = useState('')
  const [url, setUrl] = useState('')
  const [description, setDescription] = useState('')
  const [category, setCategory] = useState('overig')
  const [saving, setSaving] = useState(false)

  const detectedService = url ? linkInfo(url) : null

  async function handleSubmit(e) {
    e.preventDefault()
    if (!title.trim() || !url.trim()) return
    setSaving(true)
    try {
      await onSave({ title: title.trim(), description: description.trim(), category, url: url.trim() })
      onClose()
    } catch {
      alert('Er ging iets mis bij het opslaan.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-card" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Link toevoegen</h2>
          <button className="modal-close" onClick={onClose}><i className="fa-solid fa-xmark" /></button>
        </div>
        <form onSubmit={handleSubmit} className="modal-form">
          <div className="form-group">
            <label>URL</label>
            <input type="url" value={url} onChange={e => setUrl(e.target.value)} placeholder="https://docs.google.com/..." required autoFocus />
            {url && detectedService && (
              <div className="link-detected">
                <i className={detectedService.icon} style={{ color: detectedService.color }} />
                <span>{detectedService.label}</span>
              </div>
            )}
          </div>
          <div className="form-group">
            <label>Titel</label>
            <input type="text" value={title} onChange={e => setTitle(e.target.value)} placeholder="Naam van het document" required />
          </div>
          <div className="form-group">
            <label>Beschrijving</label>
            <textarea value={description} onChange={e => setDescription(e.target.value)} placeholder="Optionele toelichting" rows={2} />
          </div>
          <div className="form-group">
            <label>Categorie</label>
            <select value={category} onChange={e => setCategory(e.target.value)}>
              <option value="contract">Contract</option>
              <option value="reglement">Reglement</option>
              <option value="presentatie">Presentatie</option>
              <option value="handleiding">Handleiding</option>
              <option value="overig">Overig</option>
            </select>
          </div>
          <div className="modal-actions">
            <button type="button" className="btn-secondary" onClick={onClose}>Annuleren</button>
            <button type="submit" className="btn-primary" disabled={saving || !title.trim() || !url.trim()}>
              {saving ? 'Opslaan...' : 'Link toevoegen'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
