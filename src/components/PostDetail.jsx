import { useState } from 'react'
import { useComments } from '../hooks/usePosts'
import { useAuth } from '../contexts/AuthContext'
import { POST_TAG_COLORS, timeAgo } from '../lib/constants'
import Linkify from './Linkify'

export default function PostDetail({ post, onClose, onLike }) {
  const { profile } = useAuth()
  const { comments, loading, addComment } = useComments(post.id)
  const [replyText, setReplyText] = useState('')
  const [sending, setSending] = useState(false)

  async function handleReply(e) {
    e.preventDefault()
    if (!replyText.trim()) return
    setSending(true)
    try {
      await addComment(replyText.trim())
      setReplyText('')
    } catch (err) {
      console.error('Error posting comment:', err)
    }
    setSending(false)
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="post-detail-card" onClick={e => e.stopPropagation()}>
        <button className="modal-close post-detail-close" onClick={onClose}>
          <i className="fa-solid fa-xmark" />
        </button>

        {/* Post content */}
        <div className="post-detail-content">
          <div className="post-card__header">
            <div className="post-card__author">
              {post.author?.avatar_url ? (
                <img src={post.author.avatar_url} alt="" className="post-card__avatar" />
              ) : (
                <div className="post-card__avatar post-card__avatar--placeholder">
                  {(post.author?.full_name || 'U')[0]}
                </div>
              )}
              <span className="post-card__author-name">{post.author?.full_name}</span>
              <span className="post-card__time">{timeAgo(post.created_at)}</span>
            </div>
            {post.tag && <span className="post-card__tag" style={{ color: POST_TAG_COLORS[post.tag] }}>{post.tag.toUpperCase()}</span>}
          </div>

          <div className="post-detail-text"><Linkify text={post.text} /></div>

          {post.image_url && (
            <div className="post-detail-image">
              <img src={post.image_url} alt="" />
            </div>
          )}

          <div className="post-card__footer" style={{ borderTop: 'none', paddingTop: 0 }}>
            <button
              className={`post-card__action ${post.is_liked ? 'post-card__action--liked' : ''}`}
              onClick={() => onLike?.(post.id)}
            >
              <i className={`${post.is_liked ? 'fa-solid' : 'fa-regular'} fa-heart`} />
              {post.like_count > 0 && <span>{post.like_count}</span>}
            </button>
            <span className="post-card__action">
              <i className="fa-regular fa-comment" />
              <span>{comments.length}</span>
            </span>
          </div>
        </div>

        {/* Comments */}
        <div className="post-detail-comments">
          <h4>Reacties ({comments.length})</h4>

          {loading ? (
            <p className="post-detail-loading">Laden...</p>
          ) : comments.length === 0 ? (
            <p className="post-detail-empty">Nog geen reacties. Wees de eerste!</p>
          ) : (
            <div className="comments-list">
              {comments.map(c => (
                <div key={c.id} className="comment-item">
                  <div className="comment-header">
                    {c.author?.avatar_url ? (
                      <img src={c.author.avatar_url} alt="" className="comment-avatar" />
                    ) : (
                      <div className="comment-avatar comment-avatar--placeholder">
                        {(c.author?.full_name || 'U')[0]}
                      </div>
                    )}
                    <span className="comment-author">{c.author?.full_name}</span>
                    {c.author?.id === profile?.id && <span className="comment-you">jij</span>}
                    <span className="comment-time">{timeAgo(c.created_at)}</span>
                  </div>
                  <p className="comment-text"><Linkify text={c.text} /></p>
                </div>
              ))}
            </div>
          )}

          {/* Reply form */}
          <form className="reply-form" onSubmit={handleReply}>
            <div className="reply-input-row">
              {profile?.avatar_url ? (
                <img src={profile.avatar_url} alt="" className="comment-avatar" />
              ) : (
                <div className="comment-avatar comment-avatar--placeholder">
                  {(profile?.full_name || 'U')[0]}
                </div>
              )}
              <input
                type="text"
                value={replyText}
                onChange={e => setReplyText(e.target.value)}
                placeholder="Schrijf een reactie..."
                disabled={sending}
              />
              <button type="submit" className="reply-submit" disabled={sending || !replyText.trim()}>
                <i className="fa-solid fa-paper-plane" />
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
