const ROLE_LEVELS = { interested: -1, guest: 0, professional: 1, aspirant: 2, member: 3, moderator: 4, admin: 5 }

const ACTION_REQUIREMENTS = {
  // Guest level — net aangemeld, wacht op goedkeuring
  view_public_updates: 'guest',
  view_public_docs: 'guest',

  // Guest level — public events
  view_public_events: 'guest',

  // Professional level — adviseur/teamlid, beperkte toegang
  view_team: 'professional',
  view_advisor_docs: 'professional',

  // Aspirant level — goedgekeurd, kennismakingsperiode
  view_internal_updates: 'aspirant',
  view_all_docs: 'aspirant',
  view_member_profiles: 'aspirant',
  view_members_list: 'aspirant',
  read_board: 'aspirant',
  post_on_board: 'aspirant',
  view_meetings: 'aspirant',
  manage_profile: 'aspirant',
  join_workgroup: 'aspirant',
  view_roadmap: 'aspirant',
  view_events: 'aspirant',

  // Member level — volledig lid (na betaling/acceptatie)
  // (aspirant heeft al bijna alles, members kunnen in de toekomst extra rechten krijgen)

  // Moderator level
  publish_update: 'moderator',
  create_meeting: 'moderator',
  moderate_board: 'moderator',
  invite_members: 'moderator',
  manage_workgroups: 'moderator',
  record_decisions: 'moderator',
  invite_professional: 'moderator',
  manage_intake: 'moderator',
  manage_settings: 'moderator',

  // Admin level
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
