import { POST_TAG_COLORS, timeAgoShort } from '../lib/constants'
import Linkify from './Linkify'

export default function PostCard({ post, onLike, onClick }) {
  const tagColor = POST_TAG_COLORS[post.tag]

  return (
    <article className="post-card" onClick={onClick}>
      {post.is_pinned && (
        <div className="post-card__pinned">
          <i className="fa-solid fa-thumbtack" /> Vastgepind
        </div>
      )}

      {post.image_url && (
        <div className="post-card__image">
          <img src={post.image_url} alt="" loading="lazy" />
        </div>
      )}

      <div className="post-card__body">
        <div className="post-card__header">
          <div className="post-card__author">
            {post.author?.avatar_url ? (
              <img src={post.author.avatar_url} alt="" className="post-card__avatar" />
            ) : (
              <div className="post-card__avatar post-card__avatar--placeholder">
                {(post.author?.full_name || 'U')[0]}
              </div>
            )}
            <span className="post-card__author-name">{post.author?.full_name || 'Onbekend'}</span>
            <span className="post-card__time">{timeAgoShort(post.created_at)}</span>
          </div>
          {post.tag && (
            <span className="post-card__tag" style={{ color: tagColor }}>
              {post.tag.toUpperCase()}
            </span>
          )}
        </div>

        <p className="post-card__text"><Linkify text={post.text} /></p>

        <div className="post-card__footer">
          <button
            className={`post-card__action ${post.is_liked ? 'post-card__action--liked' : ''}`}
            onClick={e => { e.stopPropagation(); onLike?.(post.id) }}
          >
            <i className={`${post.is_liked ? 'fa-solid' : 'fa-regular'} fa-heart`} />
            {post.like_count > 0 && <span>{post.like_count}</span>}
          </button>
          <button className="post-card__action" onClick={onClick}>
            <i className="fa-regular fa-comment" />
            {post.comment_count > 0 && <span>{post.comment_count}</span>}
          </button>
        </div>
      </div>
    </article>
  )
}
