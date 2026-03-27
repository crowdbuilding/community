import { useState } from 'react'

export default function IntakeResponseDetail({ response: initialResponse, questions, onClose, onInvite, onReject, projectId }) {
  const joinUrl = `${window.location.origin}/p/${projectId}`
  const [response, setResponse] = useState(initialResponse)
  const [loading, setLoading] = useState(false)
  const [copied, setCopied] = useState(false)

  const timeAgo = getTimeAgo(response.created_at)

  function handleCopyLink() {
    navigator.clipboard.writeText(joinUrl)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  async function handleInvite() {
    setLoading(true)
    await onInvite()
    setResponse(prev => ({ ...prev, status: 'invited', invited_at: new Date().toISOString() }))
    setLoading(false)
  }

  async function handleReject() {
    setLoading(true)
    await onReject()
    setResponse(prev => ({ ...prev, status: 'rejected' }))
    setLoading(false)
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-card modal-card--profile" onClick={e => e.stopPropagation()}>
        <div className="modal-detail-actions">
          <button onClick={onClose}>
            <i className="fa-solid fa-xmark" />
          </button>
        </div>

        <div className="intake-detail">
          <div className="intake-detail__header">
            <div className="intake-detail__avatar">
              {response.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
            </div>
            <div>
              <h2 className="intake-detail__name">{response.name}</h2>
              <p className="intake-detail__meta">{timeAgo}</p>
            </div>
          </div>

          <div className="intake-detail__status-badge" data-status={response.status}>
            {response.status === 'pending' && 'Nieuw'}
            {response.status === 'invited' && 'Uitgenodigd'}
            {response.status === 'joined' && 'Lid geworden'}
            {response.status === 'rejected' && 'Afgewezen'}
          </div>

          {/* Contact info */}
          <div className="intake-detail__section">
            <div className="intake-detail__field">
              <i className="fa-solid fa-envelope" />
              <a href={`mailto:${response.email}`}>{response.email}</a>
            </div>
            {response.phone && (
              <div className="intake-detail__field">
                <i className="fa-solid fa-phone" />
                <a href={`tel:${response.phone}`}>{response.phone}</a>
              </div>
            )}
          </div>

          {/* Answers */}
          {questions.length > 0 && (
            <div className="intake-detail__answers">
              <h3>Antwoorden</h3>
              {questions.map(q => {
                const answer = response.answers?.[q.id]
                if (!answer) return null
                return (
                  <div key={q.id} className="intake-detail__answer">
                    <span className="intake-detail__answer-label">{q.question_text}</span>
                    <span className="intake-detail__answer-value">{answer}</span>
                  </div>
                )
              })}
            </div>
          )}

          {/* Pending: show action buttons */}
          {response.status === 'pending' && (
            <div className="intake-detail__actions">
              <button className="btn-secondary" onClick={handleReject} disabled={loading}>
                <i className="fa-solid fa-xmark" /> Afwijzen
              </button>
              <button className="btn-primary" onClick={handleInvite} disabled={loading}>
                <i className="fa-solid fa-paper-plane" /> {loading ? 'Bezig...' : 'Uitnodigen'}
              </button>
            </div>
          )}

          {/* Invited: show success + link */}
          {response.status === 'invited' && (
            <div className="intake-detail__invite-info">
              <p>
                <i className="fa-solid fa-circle-check" style={{ color: 'var(--accent-green)' }} />{' '}
                Uitgenodigd{response.invited_at ? ` op ${new Date(response.invited_at).toLocaleDateString('nl-NL')}` : ''}
              </p>
              <p className="intake-detail__invite-hint">
                Deel onderstaande link met {response.name.split(' ')[0]} om een account aan te maken:
              </p>
              <div className="intake-detail__link-row">
                <input type="text" readOnly value={joinUrl} className="intake-detail__link-input" />
                <button className="btn-secondary btn-sm" onClick={handleCopyLink}>
                  <i className={`fa-solid ${copied ? 'fa-check' : 'fa-copy'}`} /> {copied ? 'Gekopieerd!' : 'Kopieer'}
                </button>
              </div>
            </div>
          )}

          {/* Rejected: show status */}
          {response.status === 'rejected' && (
            <div className="intake-detail__rejected-info">
              <p><i className="fa-solid fa-circle-xmark" /> Aanmelding is afgewezen</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function getTimeAgo(dateStr) {
  const diff = Date.now() - new Date(dateStr).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 60) return `${mins} min geleden`
  const hours = Math.floor(mins / 60)
  if (hours < 24) return `${hours} uur geleden`
  const days = Math.floor(hours / 24)
  if (days === 1) return 'gisteren'
  return `${days} dagen geleden`
}
