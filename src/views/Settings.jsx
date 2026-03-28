import { useState, useEffect, useRef } from 'react'
import { useProject } from '../contexts/ProjectContext'
import { supabase } from '../lib/supabase'
import { uploadImage } from '../lib/storage'
import useIntakeQuestions from '../hooks/useIntakeQuestions'
import IntakeQuestionEditor from '../components/IntakeQuestionEditor'

export default function Settings() {
  const { project, milestones, loading: projectLoading } = useProject()
  const [name, setName] = useState('')
  const [tagline, setTagline] = useState('')
  const [location, setLocation] = useState('')
  const [description, setDescription] = useState('')
  const [primaryColor, setPrimaryColor] = useState('#4A90D9')
  const [accentColor, setAccentColor] = useState('#3BD269')
  const [defaultTheme, setDefaultTheme] = useState('light')
  const [coverImageUrl, setCoverImageUrl] = useState('')
  const [coverPreview, setCoverPreview] = useState('')
  const [uploadingCover, setUploadingCover] = useState(false)
  const coverRef = useRef(null)
  const [intakeEnabled, setIntakeEnabled] = useState(false)
  const [intakeIntro, setIntakeIntro] = useState('')
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const { questions, addQuestion, updateQuestion, deleteQuestion, reorderQuestions } = useIntakeQuestions(project?.id)

  useEffect(() => {
    if (project) {
      setName(project.name || '')
      setTagline(project.tagline || '')
      setLocation(project.location || '')
      setDescription(project.description || '')
      setPrimaryColor(project.brand_primary_color || '#4A90D9')
      setAccentColor(project.brand_accent_color || '#3BD269')
      setDefaultTheme(project.default_theme || 'light')
      setCoverImageUrl(project.cover_image_url || '')
      setCoverPreview(project.cover_image_url || '')
      setIntakeEnabled(project.intake_enabled || false)
      setIntakeIntro(project.intake_intro_text || '')
    }
  }, [project])

  async function handleCoverSelect(e) {
    const file = e.target.files?.[0]
    if (!file) return
    setCoverPreview(URL.createObjectURL(file))
    setUploadingCover(true)
    try {
      const url = await uploadImage(file)
      setCoverImageUrl(url)
    } catch (err) {
      console.error('Cover upload failed:', err)
      setCoverPreview(coverImageUrl || '')
    } finally {
      setUploadingCover(false)
    }
  }

  function handleRemoveCover() {
    setCoverImageUrl('')
    setCoverPreview('')
  }

  async function handleSave(e) {
    e.preventDefault()
    setSaving(true)
    setSaved(false)

    const { error } = await supabase
      .from('projects')
      .update({
        name, tagline, location, description,
        brand_primary_color: primaryColor,
        brand_accent_color: accentColor,
        default_theme: defaultTheme,
        cover_image_url: coverImageUrl || null,
        intake_enabled: intakeEnabled,
        intake_intro_text: intakeIntro.trim() || null,
      })
      .eq('id', project.id)

    if (error) {
      console.error('Error saving settings:', error)
      alert('Er ging iets mis bij het opslaan.')
    } else {
      setSaved(true)
      setTimeout(() => setSaved(false), 3000)
    }
    setSaving(false)
  }

  if (projectLoading) return <div className="loading-inline"><p>Laden...</p></div>

  return (
    <div className="view-settings">
      <div className="view-header">
        <h1>Instellingen</h1>
      </div>

      <form onSubmit={handleSave} className="settings-form">
        {/* Project info */}
        <section className="settings-section">
          <h2>Project informatie</h2>

          <div className="form-group">
            <label>Naam</label>
            <input type="text" value={name} onChange={e => setName(e.target.value)} required />
          </div>

          <div className="form-group">
            <label>Tagline</label>
            <input type="text" value={tagline} onChange={e => setTagline(e.target.value)} placeholder="Korte omschrijving" />
          </div>

          <div className="form-group">
            <label>Locatie</label>
            <input type="text" value={location} onChange={e => setLocation(e.target.value)} placeholder="Stad, buurt" />
          </div>

          <div className="form-group">
            <label>Beschrijving</label>
            <textarea value={description} onChange={e => setDescription(e.target.value)} rows={4} placeholder="Uitgebreide beschrijving van het project" />
          </div>
        </section>

        {/* Branding */}
        <section className="settings-section">
          <h2>Branding</h2>

          <div className="form-row">
            <div className="form-group form-group--half">
              <label>Primaire kleur</label>
              <div className="color-input">
                <input type="color" value={primaryColor} onChange={e => setPrimaryColor(e.target.value)} />
                <input type="text" value={primaryColor} onChange={e => setPrimaryColor(e.target.value)} className="color-hex" />
              </div>
            </div>
            <div className="form-group form-group--half">
              <label>Accent kleur</label>
              <div className="color-input">
                <input type="color" value={accentColor} onChange={e => setAccentColor(e.target.value)} />
                <input type="text" value={accentColor} onChange={e => setAccentColor(e.target.value)} className="color-hex" />
              </div>
            </div>
          </div>

          <div className="form-group">
            <label>Standaard thema</label>
            <div className="theme-select">
              {[
                { value: 'light', icon: 'fa-sun', label: 'Licht' },
                { value: 'warm', icon: 'fa-cloud-sun', label: 'Warm' },
                { value: 'dark', icon: 'fa-moon', label: 'Donker' },
                { value: 'contrast', icon: 'fa-eye', label: 'Hoog contrast' },
              ].map(t => (
                <button
                  key={t.value}
                  type="button"
                  className={`theme-select__btn ${defaultTheme === t.value ? 'theme-select__btn--active' : ''}`}
                  onClick={() => setDefaultTheme(t.value)}
                >
                  <i className={`fa-solid ${t.icon}`} />
                  {t.label}
                </button>
              ))}
            </div>
          </div>

          <div className="form-group">
            <label>Cover afbeelding</label>
            <p className="form-hint">Wordt getoond op de aanmeldpagina en het intake formulier.</p>
            {coverPreview ? (
              <div className="settings-cover-preview">
                <img src={coverPreview} alt="Cover preview" />
                <div className="settings-cover-preview__actions">
                  <button type="button" className="btn-secondary btn-sm" onClick={() => coverRef.current?.click()} disabled={uploadingCover}>
                    {uploadingCover ? 'Uploaden...' : 'Wijzigen'}
                  </button>
                  <button type="button" className="btn-secondary btn-sm" onClick={handleRemoveCover} style={{ color: 'var(--accent-red)' }}>
                    Verwijderen
                  </button>
                </div>
              </div>
            ) : (
              <button type="button" className="btn-secondary" onClick={() => coverRef.current?.click()} disabled={uploadingCover}>
                <i className="fa-solid fa-image" /> {uploadingCover ? 'Uploaden...' : 'Cover afbeelding kiezen'}
              </button>
            )}
            <input ref={coverRef} type="file" accept="image/*" onChange={handleCoverSelect} style={{ display: 'none' }} />
          </div>
        </section>

        {/* Intake form */}
        <section className="settings-section">
          <h2>Intake formulier</h2>
          <p className="form-hint" style={{ marginBottom: 16 }}>
            Een publiek aanmeldformulier dat je kunt delen op je website of social media.
          </p>

          <label className="intake-toggle">
            <input
              type="checkbox"
              checked={intakeEnabled}
              onChange={e => setIntakeEnabled(e.target.checked)}
            />
            <span>Intake formulier actief</span>
          </label>

          {intakeEnabled && (
            <>
              <div className="intake-url-box">
                <label>Formulier URL</label>
                <div className="intake-url-row">
                  <input
                    type="text"
                    readOnly
                    value={`${window.location.origin}/intake/${project.id}`}
                    className="intake-url-input"
                  />
                  <button
                    type="button"
                    className="btn-secondary btn-sm"
                    onClick={() => navigator.clipboard.writeText(`${window.location.origin}/intake/${project.id}`)}
                  >
                    <i className="fa-solid fa-copy" /> Kopieer
                  </button>
                </div>
              </div>

              <div className="form-group">
                <label>Introductietekst</label>
                <textarea
                  value={intakeIntro}
                  onChange={e => setIntakeIntro(e.target.value)}
                  rows={3}
                  placeholder="Welkomstbericht dat boven het formulier verschijnt..."
                />
              </div>

              <div className="form-group">
                <label>Vragen</label>
                <IntakeQuestionEditor
                  questions={questions}
                  onAdd={addQuestion}
                  onUpdate={updateQuestion}
                  onDelete={deleteQuestion}
                  onReorder={reorderQuestions}
                />
              </div>
            </>
          )}
        </section>

        {/* Milestones overview */}
        <section className="settings-section">
          <h2>Fases</h2>
          <div className="settings-milestones">
            {milestones.map(m => (
              <div key={m.id} className="settings-milestone">
                <span className={`settings-milestone__dot settings-milestone__dot--${m.status}`} />
                <span>{m.label}</span>
                <span className="settings-milestone__status">{m.status}</span>
              </div>
            ))}
          </div>
          <p className="form-hint">Fase beheer wordt later uitgebreid.</p>
        </section>

        <div className="settings-save">
          <button type="submit" className="btn-primary" disabled={saving}>
            {saving ? 'Opslaan...' : saved ? '✓ Opgeslagen' : 'Wijzigingen opslaan'}
          </button>
        </div>
      </form>
    </div>
  )
}
