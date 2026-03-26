import { useState } from 'react'
import { useProject } from '../contexts/ProjectContext'
import { usePosts } from '../hooks/usePosts'
import { canDo } from '../lib/permissions'
import PostCard from '../components/PostCard'
import PostModal from '../components/PostModal'
import PostDetail from '../components/PostDetail'

import { POST_TAGS } from '../lib/constants'
const FILTER_TAGS = ['Alles', ...POST_TAGS]

export default function Community() {
  const { role } = useProject()
  const { posts, loading, createPost, toggleLike } = usePosts()
  const [activeTag, setActiveTag] = useState('Alles')
  const [modalOpen, setModalOpen] = useState(false)
  const [selectedPostId, setSelectedPostId] = useState(null)
  const selectedPost = posts.find(p => p.id === selectedPostId) || null

  const filtered = activeTag === 'Alles'
    ? posts
    : posts.filter(p => p.tag === activeTag)

  return (
    <div className="view-community">
      <div className="view-header">
        <div className="view-header__row">
          <div>
            <h1>Prikbord</h1>
            <p className="view-header__subtitle">Vragen, ideeën en updates van de community</p>
          </div>
          {canDo(role, 'post_on_board') && (
            <button className="btn-primary" onClick={() => setModalOpen(true)}>
              <i className="fa-solid fa-plus" /> Nieuw bericht
            </button>
          )}
        </div>
      </div>

      <div className="tag-filter">
        {FILTER_TAGS.map(tag => (
          <button
            key={tag}
            className={`tag-filter__pill ${activeTag === tag ? 'tag-filter__pill--active' : ''}`}
            onClick={() => setActiveTag(tag)}
          >
            {tag}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="loading-inline"><p>Berichten laden...</p></div>
      ) : filtered.length === 0 ? (
        <div className="empty-inline">
          <i className="fa-solid fa-comments" />
          <p>Nog geen berichten{activeTag !== 'Alles' ? ` met tag "${activeTag}"` : ''}</p>
          {canDo(role, 'post_on_board') && (
            <button className="btn-secondary" onClick={() => setModalOpen(true)}>Eerste bericht plaatsen</button>
          )}
        </div>
      ) : (
        <div className="posts-grid">
          {filtered.map(post => (
            <PostCard
              key={post.id}
              post={post}
              onLike={toggleLike}
              onClick={() => setSelectedPostId(post.id)}
            />
          ))}
        </div>
      )}

      {modalOpen && (
        <PostModal
          onSave={createPost}
          onClose={() => setModalOpen(false)}
        />
      )}

      {selectedPost && (
        <PostDetail
          post={selectedPost}
          onClose={() => setSelectedPostId(null)}
          onLike={toggleLike}
        />
      )}
    </div>
  )
}
