import { supabase } from './supabase'

/**
 * Log an audit event. Fails silently to not block user actions.
 *
 * @param {string} action - e.g. 'post.created', 'update.deleted', 'settings.changed'
 * @param {string} resourceType - e.g. 'post', 'update', 'meeting', 'project'
 * @param {object} options
 * @param {string} [options.resourceId] - UUID of the affected resource
 * @param {string} [options.projectId] - UUID of the project context
 * @param {object} [options.metadata] - Additional context (no PII)
 */
export async function logAudit(action, resourceType, { resourceId = null, projectId = null, metadata = {} } = {}) {
  try {
    await supabase.rpc('log_audit_event', {
      p_action: action,
      p_resource_type: resourceType,
      p_resource_id: resourceId,
      p_project_id: projectId,
      p_metadata: metadata,
    })
  } catch {
    // Audit logging should never block the user
  }
}
