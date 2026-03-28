import { useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'
import { useProject } from '../contexts/ProjectContext'
import { uploadImage } from '../lib/storage'

export default function JoinProject() {
  const { user, profile, reload } = useAuth()
  const { project } = useProject()
  const navigate = useNavigate()
  const [step, setStep] = useState('welcome') // welcome | profile | done
  const [joining, setJoining] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState(null)
  const [consent, setConsent] = useState(false)

  // Profile fields
  const [fullName, setFullName] = useState(profile?.full_name || '')
  const [bio, setBio] = useState('')
  const [birthYear, setBirthYear] = useState('')
  const [household, setHousehold] = useState('')
  const [housingDream, setHousingDream] = useState('')
  const [avatarUrl, setAvatarUrl] = useState(profile?.avatar_url || null)
  const [avatarPreview, setAvatarPreview] = useState(profile?.avatar_url || null)
  const [uploading, setUploading] = useState(false)
  const avatarRef = useRef(null)

  async function handleJoin() {
    setJoining(true)
    setError(null)
    try {
      const { error: joinError } = await supabase.from('memberships').insert({
        profile_id: user.id,
        project_id: project.id,
        role: 'guest',
      })

      if (joinError) {
        if (joinError.code === '23505') {
          await reload()
          navigate(0)
          return
        }
        throw joinError
      }

      setStep('profile')
    } catch (err) {
      console.error('Join error:', err)
      setError('Er ging iets mis. Probeer het opnieuw.')
      setJoining(false)
    }
  }

  async function handleAvatarSelect(e) {
    const file = e.target.files?.[0]
    if (!file) return
    setAvatarPreview(URL.createObjectURL(file))
    setUploading(true)
    try {
      const url = await uploadImage(file)
      setAvatarUrl(url)
    } catch (err) {
      console.error('Avatar upload failed:', err)
      setAvatarPreview(profile?.avatar_url || null)
    } finally {
      setUploading(false)
    }
  }

  async function handleSaveProfile(e) {
    e.preventDefault()
    setSaving(true)
    try {
      const updates = {
        full_name: fullName.trim() || profile?.full_name || null,
        avatar_url: avatarUrl,
        bio: bio.trim() || null,
        birth_year: birthYear ? parseInt(birthYear, 10) : null,
        household: household.trim() || null,
        housing_dream: housingDream.trim() || null,
      }

      const { error: saveError } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', user.id)

      if (saveError) throw saveError
      await reload()
      navigate(0) // Reload to enter project with new membership + profile
    } catch (err) {
      console.error('Profile save error:', err)
      setError('Profiel opslaan mislukt. Probeer het opnieuw.')
      setSaving(false)
    }
  }

  if (!project) {
    return (
      <div className="join-page">
        <div className="join-card">
          <div className="join-card__content">
            <div className="join-card__icon join-card__icon--error">
              <i className="fa-solid fa-circle-exclamation" />
            </div>
            <h2>Project niet gevonden</h2>
            <p className="join-card__tagline">Dit project bestaat niet of is niet toegankelijk.</p>
            <button className="btn-secondary" onClick={() => navigate('/')}>Terug naar home</button>
          </div>
        </div>
      </div>
    )
  }

  const initials = (fullName || profile?.full_name || 'U').split(' ').map(n => n[0]).join('').slice(0, 2)

  // Step 1: Welcome + Join
  if (step === 'welcome') {
    return (
      <div className="join-page">
        <div className="join-card">
          {project.cover_image_url ? (
            <div className="join-card__cover">
              <img src={project.cover_image_url} alt={project.name + ' cover'} />
            </div>
          ) : (
            <div className="join-card__header" />
          )}
          <div className="join-card__content">
            {project.logo_url ? (
              <img src={project.logo_url} alt={project.name + ' logo'} className="join-card__logo" />
            ) : (
              <div className="join-card__logo join-card__logo--placeholder">
                {(project.name || 'P')[0]}
              </div>
            )}
            <h1 className="join-card__title">{project.name}</h1>
            {project.tagline && <p className="join-card__tagline">{project.tagline}</p>}

            <div className="join-card__user">
              {profile?.avatar_url ? (
                <img src={profile.avatar_url} alt="" className="join-card__user-avatar" />
              ) : (
                <div className="join-card__user-avatar join-card__user-avatar--placeholder">
                  {initials}
                </div>
              )}
              <span>Ingelogd als <strong>{profile?.full_name || 'Gebruiker'}</strong></span>
            </div>

            <button className="btn-primary join-card__btn" onClick={handleJoin} disabled={joining}>
              {joining ? 'Aanmelden...' : 'Lid worden van deze community'}
            </button>

            <p className="join-card__note">
              Je aanvraag wordt beoordeeld door de beheerders. Na goedkeuring krijg je volledige toegang.
            </p>
            {error && <p className="join-card__error">{error}</p>}
          </div>
        </div>
      </div>
    )
  }

  // Step 2: Profile builder
  return (
    <div className="join-page">
      <div className="join-card join-card--wide">
        <div className="join-card__content">
          <div className="join-card__step-badge">Welkom bij {project.name}!</div>
          <h1 className="join-card__title">Vertel iets over jezelf</h1>
          <p className="join-card__tagline">Zo leren andere leden je alvast een beetje kennen.</p>

          <form onSubmit={handleSaveProfile} className="join-profile-form">
            {/* Avatar */}
            <div className="join-profile__avatar-row">
              {avatarPreview ? (
                <img src={avatarPreview} alt="" className="join-profile__avatar" />
              ) : (
                <div className="join-profile__avatar join-profile__avatar--placeholder">{initials}</div>
              )}
              <div>
                <button type="button" className="btn-secondary btn-sm" onClick={() => avatarRef.current?.click()} disabled={uploading}>
                  {uploading ? 'Uploaden...' : 'Profielfoto kiezen'}
                </button>
              </div>
              <input ref={avatarRef} type="file" accept="image/*" onChange={handleAvatarSelect} style={{ display: 'none' }} />
            </div>

            {/* Name */}
            <div className="form-group">
              <label htmlFor="join-name">Naam</label>
              <input id="join-name" type="text" value={fullName} onChange={e => setFullName(e.target.value)} placeholder="Je volledige naam" />
            </div>

            {/* Bio */}
            <div className="form-group">
              <label htmlFor="join-bio">Over mij</label>
              <textarea id="join-bio" value={bio} onChange={e => setBio(e.target.value)} placeholder="Vertel kort iets over jezelf..." rows={2} />
            </div>

            {/* Personal */}
            <div className="form-row">
              <div className="form-group form-group--half">
                <label htmlFor="join-year">Geboortejaar</label>
                <input id="join-year" type="number" value={birthYear} onChange={e => setBirthYear(e.target.value)} placeholder="bijv. 1985" min="1920" max={new Date().getFullYear()} />
              </div>
              <div className="form-group form-group--half">
                <label htmlFor="join-household">Gezinssamenstelling</label>
                <input id="join-household" type="text" value={household} onChange={e => setHousehold(e.target.value)} placeholder="bijv. Stel met 2 kinderen" />
              </div>
            </div>

            {/* Housing dream */}
            <div className="form-group">
              <label htmlFor="join-dream">Woondroom</label>
              <textarea id="join-dream" value={housingDream} onChange={e => setHousingDream(e.target.value)} placeholder="Beschrijf je ideale woonsituatie..." rows={3} />
            </div>

            {/* Consent */}
            <label className="join-profile__consent">
              <input type="checkbox" checked={consent} onChange={e => setConsent(e.target.checked)} />
              <span>Ik ga akkoord dat mijn profielgegevens zichtbaar zijn voor andere leden van deze community.</span>
            </label>

            <button type="submit" className="btn-primary join-card__btn" disabled={saving || uploading || !consent}>
              {saving ? 'Opslaan...' : 'Opslaan en verder'}
            </button>

            {error && <p className="join-card__error">{error}</p>}
          </form>
        </div>
      </div>
    </div>
  )
}
