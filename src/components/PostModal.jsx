import { useState, useRef } from 'react'
import { uploadPostImage } from '../hooks/usePosts'
import { POST_TAGS } from '../lib/constants'

export default function PostModal({ onSave, onClose }) {
  const [text, setText] = useState('')
  const [tag, setTag] = useState('')
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
    if (!text.trim()) return

    setSaving(true)
    try {
      let image_url = null
      if (imageFile) {
        image_url = await uploadPostImage(imageFile)
      }
      await onSave({ text: text.trim(), tag: tag || null, image_url })
      onClose()
    } catch (err) {
      console.error('Error saving post:', err)
      alert('Er ging iets mis bij het plaatsen.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-card" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Nieuw bericht</h2>
          <button className="modal-close" onClick={onClose}>
            <i className="fa-solid fa-xmark" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="modal-form">
          {/* Tag selection */}
          <div className="post-tag-select">
            {POST_TAGS.map(t => (
              <button
                key={t}
                type="button"
                className={`post-tag-option ${tag === t ? 'post-tag-option--active' : ''}`}
                onClick={() => setTag(tag === t ? '' : t)}
              >
                {t}
              </button>
            ))}
          </div>

          <div className="form-group">
            <textarea
              value={text}
              onChange={e => setText(e.target.value)}
              placeholder="Wat wil je delen met de community?"
              rows={4}
              required
              autoFocus
            />
          </div>

          {/* Image upload */}
          {imagePreview ? (
            <div className="post-image-preview">
              <img src={imagePreview} alt="Preview" />
              <button type="button" className="post-image-remove" onClick={removeImage}>
                <i className="fa-solid fa-xmark" />
              </button>
            </div>
          ) : null}

          <div className="modal-actions modal-actions--spread">
            <button
              type="button"
              className="btn-icon"
              onClick={() => fileRef.current?.click()}
              title="Afbeelding toevoegen"
            >
              <i className="fa-solid fa-image" />
            </button>
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              onChange={handleImageSelect}
              style={{ display: 'none' }}
            />
            <div className="modal-actions__right">
              <button type="button" className="btn-secondary" onClick={onClose}>Annuleren</button>
              <button type="submit" className="btn-primary" disabled={saving || !text.trim()}>
                {saving ? 'Plaatsen...' : 'Plaatsen'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  )
}
