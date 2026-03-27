import { useState, useRef } from 'react'
import { uploadPostImage } from '../hooks/usePosts'
import { EVENT_TYPES, EVENT_VISIBILITY } from '../lib/constants'

export default function EventModal({ event, onSave, onClose }) {
  const isEdit = !!event

  // Parse existing event data for edit mode
  const existingDate = event ? new Date(event.date) : null
  const existingDateStr = existingDate ? existingDate.toISOString().split('T')[0] : ''
  const existingTime = existingDate ? existingDate.toTimeString().slice(0, 5) : ''
  const existingEndDate = existingDate && event?.duration_hours
    ? new Date(existingDate.getTime() + event.duration_hours * 60 * 60 * 1000)
    : null
  const existingEndTime = existingEndDate ? existingEndDate.toTimeString().slice(0, 5) : ''

  const [title, setTitle] = useState(event?.title || '')
  const [description, setDescription] = useState(event?.description || '')
  const [eventType, setEventType] = useState(event?.event_type || 'overig')
  const [date, setDate] = useState(existingDateStr)
  const [time, setTime] = useState(existingTime)
  const [endTime, setEndTime] = useState(existingEndTime)
  const [locationType, setLocationType] = useState(event?.online_url ? 'online' : 'physical')
  const [location, setLocation] = useState(event?.location || '')
  const [onlineUrl, setOnlineUrl] = useState(event?.online_url || '')
  const [maxAttendees, setMaxAttendees] = useState(event?.max_attendees ? String(event.max_attendees) : '')
  const [visibility, setVisibility] = useState(event?.visibility || 'members')
  const [imageFile, setImageFile] = useState(null)
  const [imagePreview, setImagePreview] = useState(event?.image_url || null)
  const [saving, setSaving] = useState(false)
  const fileRef = useRef(null)

  function handleImageSelect(e) {
    const file = e.target.files?.[0]
    if (!file) return
    setImageFile(file)
    setImagePreview(URL.createObjectURL(file))
  }

  function removeImage() {
    setImageFile(null)
    setImagePreview(null)
    if (fileRef.current) fileRef.current.value = ''
  }

  async function handleSubmit(e) {
    e.preventDefault()
    if (!title.trim() || !date) return

    setSaving(true)
    try {
      let image_url = isEdit ? event.image_url : null
      if (imageFile) {
        image_url = await uploadPostImage(imageFile)
      } else if (!imagePreview) {
        image_url = null // user removed the image
      }

      const dateTime = time ? `${date}T${time}` : `${date}T00:00`

      // Calculate duration from start/end time
      let durationHours = 2
      if (time && endTime) {
        const [sh, sm] = time.split(':').map(Number)
        const [eh, em] = endTime.split(':').map(Number)
        durationHours = Math.max(0.5, (eh * 60 + em - sh * 60 - sm) / 60)
      }

      await onSave({
        title: title.trim(),
        description: description.trim() || null,
        date: dateTime,
        location: locationType === 'physical' ? location.trim() || null : (locationType === 'online' ? 'Online' : null),
        online_url: locationType === 'online' ? onlineUrl.trim() || null : null,
        max_attendees: maxAttendees ? parseInt(maxAttendees) : null,
        duration_hours: durationHours,
        event_type: eventType,
        visibility,
        image_url,
      })
      onClose()
    } catch (err) {
      console.error('Error saving event:', err)
      alert('Er ging iets mis bij het opslaan.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-card modal-card--event" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h2>{isEdit ? 'Event bewerken' : 'Nieuw event'}</h2>
          <button className="modal-close" onClick={onClose}>
            <i className="fa-solid fa-xmark" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="modal-form">
          <div className="form-group">
            <label>Titel</label>
            <input type="text" value={title} onChange={e => setTitle(e.target.value)} placeholder="Naam van het event" required autoFocus />
          </div>

          <div className="form-group">
            <label>Type</label>
            <select value={eventType} onChange={e => setEventType(e.target.value)}>
              {EVENT_TYPES.map(t => (
                <option key={t.key} value={t.key}>{t.label}</option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label>Zichtbaarheid</label>
            <select value={visibility} onChange={e => setVisibility(e.target.value)}>
              {EVENT_VISIBILITY.map(v => (
                <option key={v.key} value={v.key}>{v.label}</option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label>Beschrijving</label>
            <textarea value={description} onChange={e => setDescription(e.target.value)} placeholder="Waar gaat het event over?" rows={3} />
          </div>

          <div className="form-group">
            <label>Datum</label>
            <input type="date" value={date} onChange={e => setDate(e.target.value)} required />
          </div>
          <div className="form-row">
            <div className="form-group form-group--half">
              <label>Begintijd</label>
              <input type="time" value={time} onChange={e => setTime(e.target.value)} />
            </div>
            <div className="form-group form-group--half">
              <label>Eindtijd</label>
              <input type="time" value={endTime} onChange={e => setEndTime(e.target.value)} />
            </div>
          </div>

          {/* Location type toggle */}
          <div className="form-group">
            <label>Type locatie</label>
            <div className="location-toggle">
              <button type="button" className={`location-toggle__btn ${locationType === 'physical' ? 'location-toggle__btn--active' : ''}`} onClick={() => setLocationType('physical')}>
                <i className="fa-solid fa-location-dot" /> Fysiek
              </button>
              <button type="button" className={`location-toggle__btn ${locationType === 'online' ? 'location-toggle__btn--active' : ''}`} onClick={() => setLocationType('online')}>
                <i className="fa-solid fa-video" /> Online
              </button>
            </div>
          </div>

          {locationType === 'physical' ? (
            <div className="form-group">
              <label>Adres</label>
              <input type="text" value={location} onChange={e => setLocation(e.target.value)} placeholder="Straat, stad" />
            </div>
          ) : (
            <div className="form-group">
              <label>Meeting link</label>
              <input type="url" value={onlineUrl} onChange={e => setOnlineUrl(e.target.value)} placeholder="https://meet.google.com/... of https://zoom.us/..." />
            </div>
          )}

          <div className="form-group">
            <label>Max. deelnemers</label>
            <input type="number" value={maxAttendees} onChange={e => setMaxAttendees(e.target.value)} placeholder="Onbeperkt" min={1} />
          </div>

          {/* Image */}
          <div className="form-group">
            <label>Afbeelding</label>
            {imagePreview ? (
              <div className="post-image-preview">
                <img src={imagePreview} alt="Preview" />
                <button type="button" className="post-image-remove" onClick={removeImage}>
                  <i className="fa-solid fa-xmark" />
                </button>
              </div>
            ) : (
              <button type="button" className="btn-secondary" onClick={() => fileRef.current?.click()}>
                <i className="fa-solid fa-image" /> Afbeelding toevoegen
              </button>
            )}
          </div>
          <input ref={fileRef} type="file" accept="image/*" onChange={handleImageSelect} style={{ display: 'none' }} />

          <div className="modal-actions">
            <button type="button" className="btn-secondary" onClick={onClose}>Annuleren</button>
            <button type="submit" className="btn-primary" disabled={saving || !title.trim() || !date}>
              {saving ? 'Opslaan...' : isEdit ? 'Opslaan' : 'Aanmaken'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
