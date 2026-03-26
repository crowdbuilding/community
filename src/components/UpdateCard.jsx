import { useProject } from '../contexts/ProjectContext'
import { canDo } from '../lib/permissions'
import { UPDATE_TAG_COLORS, timeAgo } from '../lib/constants'

export default function UpdateCard({ update, onEdit }) {
  const { role } = useProject()
  const tagStyle = UPDATE_TAG_COLORS[update.tag] || { bg: 'var(--bg-hover)', color: 'var(--text-secondary)' }

  return (
    <article className="update-card">
      {update.image_url && (
        <div className="update-card__image">
          <img src={update.image_url} alt="" />
        </div>
      )}
      <div className="update-card__body">
        <div className="update-card__meta">
          {update.tag && (
            <span className="update-tag" style={{ background: tagStyle.bg, color: tagStyle.color }}>
              {update.tag}
            </span>
          )}
          <span className="update-card__visibility">
            <i className={`fa-solid ${update.is_public ? 'fa-eye' : 'fa-lock'}`} />
            {update.is_public ? 'Openbaar' : 'Intern'}
          </span>
        </div>

        <h3 className="update-card__title">{update.title}</h3>
        <p className="update-card__text">{update.body}</p>

        <div className="update-card__footer">
          <div className="update-card__author">
            {update.author?.avatar_url ? (
              <img src={update.author.avatar_url} alt="" className="update-card__avatar" />
            ) : (
              <div className="update-card__avatar update-card__avatar--placeholder">
                {(update.author?.full_name || 'U')[0]}
              </div>
            )}
            <span>{update.author?.full_name || 'Onbekend'}</span>
          </div>
          <div className="update-card__date">{timeAgo(update.created_at)}</div>
        </div>

        {canDo(role, 'publish_update') && onEdit && (
          <button className="update-card__edit" onClick={() => onEdit(update)}>
            <i className="fa-solid fa-pen" />
          </button>
        )}
      </div>
    </article>
  )
}
