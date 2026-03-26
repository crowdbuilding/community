import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

const MONTHS = ['januari', 'februari', 'maart', 'april', 'mei', 'juni', 'juli', 'augustus', 'september', 'oktober', 'november', 'december']

function buildGoogleCalUrl(event) {
  const date = new Date(event.date)
  const fmt = d => d.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '')
  const start = fmt(date)
  const end = fmt(new Date(date.getTime() + 2 * 60 * 60 * 1000)) // 2h duration
  const loc = event.online_url ? event.online_url : (event.location || '')
  const params = new URLSearchParams({
    action: 'TEMPLATE',
    text: event.title,
    dates: `${start}/${end}`,
    details: event.description || '',
    location: loc,
  })
  return `https://calendar.google.com/calendar/render?${params}`
}

export default function EventDetail({ event, onClose, onRsvp }) {
  const [attendees, setAttendees] = useState([])
  const date = new Date(event.date)
  const dateStr = `${date.getDate()} ${MONTHS[date.getMonth()]} ${date.getFullYear()}`
  const time = date.toLocaleTimeString('nl-NL', { hour: '2-digit', minute: '2-digit' })
  const isPast = date < new Date()
  const isOnline = !!event.online_url

  // Fetch attendee profiles
  useEffect(() => {
    async function fetchAttendees() {
      const { data } = await supabase
        .from('event_rsvps')
        .select('status, profile:profiles(id, full_name, avatar_url)')
        .eq('meeting_id', event.id)
        .in('status', ['going', 'maybe'])
      setAttendees(data || [])
    }
    fetchAttendees()
  }, [event.id, event.going_count, event.maybe_count])

  const goingAttendees = attendees.filter(a => a.status === 'going')
  const maybeAttendees = attendees.filter(a => a.status === 'maybe')

  const rsvpButtons = [
    { status: 'going', label: 'Aanwezig', icon: 'fa-check' },
    { status: 'maybe', label: 'Misschien', icon: 'fa-question' },
    { status: 'not_going', label: 'Niet', icon: 'fa-xmark' },
  ]

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="event-detail-card" onClick={e => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose} style={{ position: 'absolute', top: 16, right: 16, zIndex: 1 }}>
          <i className="fa-solid fa-xmark" />
        </button>

        {event.image_url && (
          <div className="event-detail-image">
            <img src={event.image_url} alt="" />
          </div>
        )}

        <div className="event-detail-body">
          <div className="event-detail-header">
            <div className="event-card__date-badge event-card__date-badge--lg">
              <span className="event-card__day">{date.getDate()}</span>
              <span className="event-card__month">{MONTHS[date.getMonth()].slice(0, 3).toUpperCase()}</span>
            </div>
            <div>
              <h2>{event.title}</h2>
              <div className="event-detail-meta">
                <span><i className="fa-regular fa-calendar" /> {dateStr}</span>
                <span><i className="fa-regular fa-clock" /> {time}</span>
                {isOnline ? (
                  <span><i className="fa-solid fa-video" /> Online</span>
                ) : event.location ? (
                  <span><i className="fa-solid fa-location-dot" /> {event.location}</span>
                ) : null}
              </div>
            </div>
          </div>

          {/* Online meeting link */}
          {isOnline && event.online_url && (
            <a href={event.online_url} target="_blank" rel="noopener noreferrer" className="event-online-link">
              <i className="fa-solid fa-video" />
              <span>Deelnemen via {event.online_url.includes('zoom') ? 'Zoom' : event.online_url.includes('meet.google') ? 'Google Meet' : 'meeting link'}</span>
              <i className="fa-solid fa-arrow-up-right-from-square" />
            </a>
          )}

          {event.description && (
            <div className="event-detail-desc">
              <p>{event.description}</p>
            </div>
          )}

          {/* Google Calendar export */}
          <a href={buildGoogleCalUrl(event)} target="_blank" rel="noopener noreferrer" className="event-cal-link">
            <i className="fa-solid fa-calendar-plus" /> Toevoegen aan Google Agenda
          </a>

          <div className="event-detail-stats">
            <div className="event-detail-stat">
              <strong>{event.going_count}</strong>
              <span>Aanwezig</span>
            </div>
            <div className="event-detail-stat">
              <strong>{event.maybe_count}</strong>
              <span>Misschien</span>
            </div>
            {event.max_attendees && (
              <div className="event-detail-stat">
                <strong>{event.max_attendees}</strong>
                <span>Max</span>
              </div>
            )}
          </div>

          {/* Attendee avatars */}
          {goingAttendees.length > 0 && (
            <div className="event-attendees">
              <h4>Aanwezig ({goingAttendees.length})</h4>
              <div className="attendee-avatars">
                {goingAttendees.map(a => (
                  <div key={a.profile.id} className="attendee-chip" title={a.profile.full_name}>
                    {a.profile.avatar_url ? (
                      <img src={a.profile.avatar_url} alt="" className="attendee-avatar" />
                    ) : (
                      <div className="attendee-avatar attendee-avatar--placeholder">
                        {(a.profile.full_name || 'U')[0]}
                      </div>
                    )}
                    <span>{a.profile.full_name?.split(' ')[0]}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {maybeAttendees.length > 0 && (
            <div className="event-attendees">
              <h4>Misschien ({maybeAttendees.length})</h4>
              <div className="attendee-avatars">
                {maybeAttendees.map(a => (
                  <div key={a.profile.id} className="attendee-chip" title={a.profile.full_name}>
                    {a.profile.avatar_url ? (
                      <img src={a.profile.avatar_url} alt="" className="attendee-avatar" />
                    ) : (
                      <div className="attendee-avatar attendee-avatar--placeholder">
                        {(a.profile.full_name || 'U')[0]}
                      </div>
                    )}
                    <span>{a.profile.full_name?.split(' ')[0]}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* RSVP */}
          {!isPast && (
            <div className="event-detail-rsvp">
              <h4>Ben je erbij?</h4>
              <div className="rsvp-buttons">
                {rsvpButtons.map(btn => (
                  <button
                    key={btn.status}
                    className={`rsvp-btn ${event.my_rsvp === btn.status ? `rsvp-btn--${btn.status}` : ''}`}
                    onClick={() => onRsvp(event.id, event.my_rsvp === btn.status ? null : btn.status)}
                  >
                    <i className={`fa-solid ${btn.icon}`} />
                    {btn.label}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
