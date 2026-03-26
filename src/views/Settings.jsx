import { useState, useEffect } from 'react'
import { useProject } from '../contexts/ProjectContext'
import { supabase } from '../lib/supabase'

export default function Settings() {
  const { project, milestones, loading: projectLoading } = useProject()
  const [name, setName] = useState('')
  const [tagline, setTagline] = useState('')
  const [location, setLocation] = useState('')
  const [description, setDescription] = useState('')
  const [primaryColor, setPrimaryColor] = useState('#4A90D9')
  const [accentColor, setAccentColor] = useState('#3BD269')
  const [defaultTheme, setDefaultTheme] = useState('light')
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    if (project) {
      setName(project.name || '')
      setTagline(project.tagline || '')
      setLocation(project.location || '')
      setDescription(project.description || '')
      setPrimaryColor(project.brand_primary_color || '#4A90D9')
      setAccentColor(project.brand_accent_color || '#3BD269')
      setDefaultTheme(project.default_theme || 'light')
    }
  }, [project])

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
              {['light', 'warm', 'dark'].map(t => (
                <button
                  key={t}
                  type="button"
                  className={`theme-select__btn ${defaultTheme === t ? 'theme-select__btn--active' : ''}`}
                  onClick={() => setDefaultTheme(t)}
                >
                  <i className={`fa-solid ${t === 'light' ? 'fa-sun' : t === 'warm' ? 'fa-cloud-sun' : 'fa-moon'}`} />
                  {t.charAt(0).toUpperCase() + t.slice(1)}
                </button>
              ))}
            </div>
          </div>
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
