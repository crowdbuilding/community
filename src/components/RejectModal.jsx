import { useState } from 'react'

export default function RejectModal({ memberName, onReject, onClose }) {
  const [reason, setReason] = useState('')
  const [sending, setSending] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    if (!reason.trim()) return
    setSending(true)
    try {
      await onReject(reason.trim())
    } catch (err) {
      console.error('Reject error:', err)
      setSending(false)
    }
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-card" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Aanvraag afwijzen</h2>
          <button className="modal-close" onClick={onClose} aria-label="Sluiten">
            <i className="fa-solid fa-xmark" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="modal-form">
          <p className="reject-modal__desc">
            Je staat op het punt om de aanvraag van <strong>{memberName}</strong> af te wijzen.
            Geef een reden zodat deze persoon weet waarom.
          </p>

          <div className="form-group">
            <label htmlFor="reject-reason">Reden voor afwijzing</label>
            <textarea
              id="reject-reason"
              value={reason}
              onChange={e => setReason(e.target.value)}
              placeholder="Leg kort uit waarom de aanvraag wordt afgewezen..."
              rows={4}
              required
              autoFocus
            />
          </div>

          <p className="reject-modal__note">
            <i className="fa-solid fa-envelope" /> Dit bericht wordt per e-mail verstuurd naar {memberName}.
          </p>

          <div className="modal-actions">
            <button type="button" className="btn-secondary" onClick={onClose}>Annuleren</button>
            <button type="submit" className="btn-danger" disabled={sending || !reason.trim()}>
              {sending ? 'Versturen...' : 'Afwijzen en versturen'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
