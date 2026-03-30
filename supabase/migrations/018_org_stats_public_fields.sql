-- ============================================================================
-- Extend get_org_project_stats to include public page + intake fields
-- ============================================================================

DROP FUNCTION IF EXISTS get_org_project_stats(UUID);

CREATE OR REPLACE FUNCTION get_org_project_stats(p_org_id UUID)
RETURNS TABLE(
  project_id UUID,
  project_name TEXT,
  project_location TEXT,
  project_tagline TEXT,
  project_logo_url TEXT,
  project_cover_image_url TEXT,
  project_description TEXT,
  is_public BOOLEAN,
  slug TEXT,
  public_description TEXT,
  public_contact_email TEXT,
  intake_enabled BOOLEAN,
  intake_intro_text TEXT,
  active_phase TEXT,
  member_count BIGINT,
  update_count BIGINT,
  post_count BIGINT,
  advisor_count BIGINT,
  new_updates_week BIGINT,
  new_posts_week BIGINT,
  new_members_week BIGINT
) AS $$
  SELECT
    p.id,
    p.name,
    p.location,
    p.tagline,
    p.logo_url,
    p.cover_image_url,
    p.description,
    p.is_public,
    p.slug,
    p.public_description,
    p.public_contact_email,
    p.intake_enabled,
    p.intake_intro_text,
    (SELECT m.label FROM milestones m WHERE m.project_id = p.id AND m.status = 'active' LIMIT 1),
    (SELECT COUNT(*) FROM memberships mb WHERE mb.project_id = p.id AND mb.role != 'guest'),
    (SELECT COUNT(*) FROM updates u WHERE u.project_id = p.id),
    (SELECT COUNT(*) FROM posts po WHERE po.project_id = p.id AND po.is_hidden = false),
    (SELECT COUNT(*) FROM memberships mb2 JOIN profiles pr ON pr.id = mb2.profile_id WHERE mb2.project_id = p.id AND pr.professional_type IS NOT NULL),
    (SELECT COUNT(*) FROM updates u2 WHERE u2.project_id = p.id AND u2.created_at > now() - interval '7 days'),
    (SELECT COUNT(*) FROM posts po2 WHERE po2.project_id = p.id AND po2.created_at > now() - interval '7 days'),
    (SELECT COUNT(*) FROM memberships mb3 WHERE mb3.project_id = p.id AND mb3.joined_at > now() - interval '7 days')
  FROM projects p
  WHERE p.organization_id = p_org_id
  ORDER BY p.created_at DESC;
$$ LANGUAGE sql SECURITY DEFINER;
