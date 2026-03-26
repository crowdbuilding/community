import { useState, useRef } from 'react'
import { uploadPostImage } from '../hooks/usePosts'

export default function EventModal({ onSave, onClose }) {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [date, setDate] = useState('')
  const [time, setTime] = useState('')
  const [locationType, setLocationType] = useState('physical') // 'physical' | 'online'
  const [location, setLocation] = useState('')
  const [onlineUrl, setOnlineUrl] = useState('')
  const [maxAttendees, setMaxAttendees] = useState('')
  const [imageFile, setImageFile] = useState(null)
  const [imagePreview, setImagePreview] = useState(null)
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
      let image_url = null
      if (imageFile) {
        image_url = await uploadPostImage(imageFile)
      }

      const dateTime = time ? `${date}T${time}` : `${date}T00:00`
      await onSave({
        title: title.trim(),
        description: description.trim() || null,
        date: dateTime,
        location: locationType === 'physical' ? location.trim() || null : (locationType === 'online' ? 'Online' : null),
        online_url: locationType === 'online' ? onlineUrl.trim() || null : null,
        max_attendees: maxAttendees ? parseInt(maxAttendees) : null,
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
      <div className="modal-card" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Nieuw event</h2>
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
            <label>Beschrijving</label>
            <textarea value={description} onChange={e => setDescription(e.target.value)} placeholder="Waar gaat het event over?" rows={3} />
          </div>

          <div className="form-row">
            <div className="form-group form-group--half">
              <label>Datum</label>
              <input type="date" value={date} onChange={e => setDate(e.target.value)} required />
            </div>
            <div className="form-group form-group--half">
              <label>Tijd</label>
              <input type="time" value={time} onChange={e => setTime(e.target.value)} />
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
          {imagePreview ? (
            <div className="post-image-preview">
              <img src={imagePreview} alt="Preview" />
              <button type="button" className="post-image-remove" onClick={removeImage}>
                <i className="fa-solid fa-xmark" />
              </button>
            </div>
          ) : (
            <button type="button" className="btn-icon" onClick={() => fileRef.current?.click()} title="Afbeelding toevoegen" style={{ alignSelf: 'flex-start' }}>
              <i className="fa-solid fa-image" />
            </button>
          )}
          <input ref={fileRef} type="file" accept="image/*" onChange={handleImageSelect} style={{ display: 'none' }} />

          <div className="modal-actions">
            <button type="button" className="btn-secondary" onClick={onClose}>Annuleren</button>
            <button type="submit" className="btn-primary" disabled={saving || !title.trim() || !date}>
              {saving ? 'Opslaan...' : 'Aanmaken'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
