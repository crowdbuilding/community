import { useState } from 'react'
import { useProject } from '../contexts/ProjectContext'
import { useEvents } from '../hooks/useEvents'
import { canDo } from '../lib/permissions'
import EventCard from '../components/EventCard'
import EventModal from '../components/EventModal'
import EventDetail from '../components/EventDetail'

export default function Events() {
  const { role } = useProject()
  const { upcoming, past, loading, createEvent, rsvp } = useEvents()
  const [modalOpen, setModalOpen] = useState(false)
  const [selectedEvent, setSelectedEvent] = useState(null)

  // Keep selectedEvent in sync with updated data
  const allEvents = [...upcoming, ...past]
  const activeSelected = selectedEvent ? allEvents.find(e => e.id === selectedEvent.id) || selectedEvent : null

  return (
    <div className="view-events">
      <div className="view-header">
        <div className="view-header__row">
          <h1>Events</h1>
          {canDo(role, 'create_meeting') && (
            <button className="btn-primary" onClick={() => setModalOpen(true)}>
              <i className="fa-solid fa-plus" /> Nieuw event
            </button>
          )}
        </div>
      </div>

      {loading ? (
        <div className="loading-inline"><p>Events laden...</p></div>
      ) : upcoming.length === 0 && past.length === 0 ? (
        <div className="empty-inline">
          <i className="fa-solid fa-calendar-check" />
          <p>Nog geen events gepland</p>
          {canDo(role, 'create_meeting') && (
            <button className="btn-secondary" onClick={() => setModalOpen(true)}>Eerste event aanmaken</button>
          )}
        </div>
      ) : (
        <>
          {upcoming.length > 0 && (
            <section className="events-section">
              <h2 className="events-section__title">Aankomende events</h2>
              <div className="events-list">
                {upcoming.map(event => (
                  <EventCard key={event.id} event={event} onClick={() => setSelectedEvent(event)} />
                ))}
              </div>
            </section>
          )}

          {past.length > 0 && (
            <section className="events-section">
              <h2 className="events-section__title">Afgelopen events</h2>
              <div className="events-list">
                {past.map(event => (
                  <EventCard key={event.id} event={event} onClick={() => setSelectedEvent(event)} />
                ))}
              </div>
            </section>
          )}
        </>
      )}

      {modalOpen && (
        <EventModal onSave={createEvent} onClose={() => setModalOpen(false)} />
      )}

      {activeSelected && (
        <EventDetail event={activeSelected} onClose={() => setSelectedEvent(null)} onRsvp={rsvp} />
      )}
    </div>
  )
}
