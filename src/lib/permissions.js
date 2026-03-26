const ROLE_LEVELS = { guest: 0, member: 1, moderator: 2, admin: 3 }

const ACTION_REQUIREMENTS = {
  view_public_updates: 'guest',
  view_internal_updates: 'member',
  read_board: 'member',
  post_on_board: 'member',
  view_meetings: 'member',
  manage_profile: 'member',
  join_workgroup: 'member',
  publish_update: 'moderator',
  create_meeting: 'moderator',
  moderate_board: 'moderator',
  invite_members: 'moderator',
  manage_workgroups: 'moderator',
  record_decisions: 'moderator',
  edit_settings: 'admin',
  assign_roles: 'admin',
  edit_phases: 'admin',
  set_branding: 'admin',
  remove_members: 'admin',
}

export function canDo(userRole, action) {
  const required = ACTION_REQUIREMENTS[action]
  if (!required) return false
  return (ROLE_LEVELS[userRole] || 0) >= ROLE_LEVELS[required]
}
