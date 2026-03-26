import { useState } from 'react'
import { useProject } from '../contexts/ProjectContext'
import { useAuth } from '../contexts/AuthContext'
import { useMembers } from '../hooks/useMembers'
import { canDo } from '../lib/permissions'
import { ROLES, ROLE_LABELS, ROLE_COLORS, timeAgo } from '../lib/constants'

export default function Members() {
  const { role } = useProject()
  const { user } = useAuth()
  const { members, loading, updateRole, removeMember, approveMember } = useMembers()
  const [filter, setFilter] = useState('all')

  const guests = members.filter(m => m.role === 'guest')
  const active = members.filter(m => m.role !== 'guest')

  const filtered = filter === 'all' ? active
    : filter === 'pending' ? guests
    : active.filter(m => m.role === filter)

  return (
    <div className="view-members">
      <div className="view-header">
        <div className="view-header__row">
          <div>
            <h1>Leden</h1>
            <p className="view-header__subtitle">{members.length} leden • {guests.length} wachtend op goedkeuring</p>
          </div>
        </div>
      </div>

      <div className="tag-filter">
        {[
          { key: 'all', label: `Alle (${active.length})` },
          ...(guests.length > 0 ? [{ key: 'pending', label: `Wachtend (${guests.length})` }] : []),
          { key: 'admin', label: 'Admins' },
          { key: 'moderator', label: 'Moderators' },
          { key: 'member', label: 'Leden' },
        ].map(f => (
          <button
            key={f.key}
            className={`tag-filter__pill ${filter === f.key ? 'tag-filter__pill--active' : ''}`}
            onClick={() => setFilter(f.key)}
          >
            {f.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="loading-inline"><p>Leden laden...</p></div>
      ) : filtered.length === 0 ? (
        <div className="empty-inline">
          <i className="fa-solid fa-users" />
          <p>Geen leden gevonden</p>
        </div>
      ) : (
        <div className="members-list">
          {filtered.map(m => (
            <MemberRow
              key={m.id}
              membership={m}
              isMe={m.profile_id === user?.id}
              canManage={canDo(role, 'assign_roles')}
              canRemove={canDo(role, 'remove_members')}
              canApprove={canDo(role, 'invite_members')}
              onRoleChange={updateRole}
              onRemove={removeMember}
              onApprove={approveMember}
            />
          ))}
        </div>
      )}
    </div>
  )
}

function MemberRow({ membership, isMe, canManage, canRemove, canApprove, onRoleChange, onRemove, onApprove }) {
  const [showMenu, setShowMenu] = useState(false)
  const p = membership.profile

  return (
    <div className="member-row">
      <div className="member-row__left">
        {p?.avatar_url ? (
          <img src={p.avatar_url} alt="" className="member-row__avatar" />
        ) : (
          <div className="member-row__avatar member-row__avatar--placeholder">
            {(p?.full_name || 'U')[0]}
          </div>
        )}
        <div className="member-row__info">
          <span className="member-row__name">
            {p?.full_name || 'Onbekend'}
            {isMe && <span className="member-row__you">jij</span>}
          </span>
          <span className="member-row__joined">Lid sinds {timeAgo(membership.joined_at)}</span>
        </div>
      </div>

      <div className="member-row__right">
        <span className="member-role-badge" style={{ color: ROLE_COLORS[membership.role] }}>
          {ROLE_LABELS[membership.role]}
        </span>

        {membership.role === 'guest' && canApprove && (
          <button className="btn-sm btn-sm--green" onClick={() => onApprove(membership.id)}>
            <i className="fa-solid fa-check" /> Goedkeuren
          </button>
        )}

        {canManage && !isMe && membership.role !== 'guest' && (
          <div className="member-row__actions" style={{ position: 'relative' }}>
            <button className="btn-icon-sm" onClick={() => setShowMenu(!showMenu)}>
              <i className="fa-solid fa-ellipsis" />
            </button>
            {showMenu && (
              <div className="member-dropdown">
                {ROLES.filter(r => r !== 'guest' && r !== membership.role).map(r => (
                  <button key={r} className="member-dropdown__item" onClick={() => { onRoleChange(membership.id, r); setShowMenu(false) }}>
                    Maak {ROLE_LABELS[r]}
                  </button>
                ))}
                {canRemove && (
                  <>
                    <div className="sidebar-user-menu-divider" />
                    <button className="member-dropdown__item member-dropdown__item--danger" onClick={() => { onRemove(membership.id); setShowMenu(false) }}>
                      Verwijderen
                    </button>
                  </>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
