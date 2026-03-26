const MONTHS = ['JAN', 'FEB', 'MRT', 'APR', 'MEI', 'JUN', 'JUL', 'AUG', 'SEP', 'OKT', 'NOV', 'DEC']

export default function EventCard({ event, onClick }) {
  const date = new Date(event.date)
  const day = date.getDate()
  const month = MONTHS[date.getMonth()]
  const time = date.toLocaleTimeString('nl-NL', { hour: '2-digit', minute: '2-digit' })
  const isPast = date < new Date()

  return (
    <article className={`event-card ${isPast ? 'event-card--past' : ''}`} onClick={onClick}>
      <div className="event-card__date-badge">
        <span className="event-card__day">{day}</span>
        <span className="event-card__month">{month}</span>
      </div>
      <div className="event-card__info">
        <h3 className="event-card__title">{event.title}</h3>
        <div className="event-card__meta">
          <span><i className="fa-regular fa-clock" /> {time}</span>
          {event.online_url ? (
            <span><i className="fa-solid fa-video" /> Online</span>
          ) : event.location ? (
            <span><i className="fa-solid fa-location-dot" /> {event.location}</span>
          ) : null}
          {event.image_url && <span><i className="fa-solid fa-image" /></span>}
        </div>
        <div className="event-card__footer">
          <span className="event-card__attendees">
            <i className="fa-solid fa-users" /> {event.going_count}{event.max_attendees ? ` / ${event.max_attendees}` : ''}
          </span>
          {!isPast && (
            <span className={`event-card__rsvp ${event.my_rsvp === 'going' ? 'event-card__rsvp--going' : ''}`}>
              {event.my_rsvp === 'going' ? '✓ Aangemeld' : 'Aanmelden →'}
            </span>
          )}
        </div>
      </div>
    </article>
  )
}
