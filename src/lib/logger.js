/**
 * Production-safe logger.
 * In development: logs everything to console.
 * In production: suppresses verbose output, sanitizes errors.
 *
 * Usage: import { logger } from '../lib/logger'
 *        logger.error('Upload failed', err)
 */

const isDev = import.meta.env.DEV

function sanitizeError(err) {
  if (!err) return 'Unknown error'
  if (typeof err === 'string') return err
  // Don't leak SQL errors, full stack traces, or internal details
  return err.message || err.code || 'Onbekende fout'
}

export const logger = {
  error(context, err) {
    if (isDev) {
      console.error(`[${context}]`, err)
    }
    // TODO: In production, send to error monitoring (Sentry, LogRocket, etc.)
    // if (!isDev) sendToErrorService(context, sanitizeError(err))
  },

  warn(context, msg) {
    if (isDev) console.warn(`[${context}]`, msg)
  },

  info(context, msg) {
    if (isDev) console.log(`[${context}]`, msg)
  },
}

/** User-friendly error message from a Supabase/generic error */
export function friendlyError(err) {
  if (!err) return 'Er ging iets mis'
  if (typeof err === 'string') return err

  const msg = err.message || ''

  // Common Supabase errors → Dutch user-friendly messages
  if (msg.includes('duplicate key')) return 'Dit item bestaat al'
  if (msg.includes('violates foreign key')) return 'Gerelateerd item niet gevonden'
  if (msg.includes('permission denied') || msg.includes('row-level security')) return 'Je hebt geen toegang tot deze actie'
  if (msg.includes('JWT expired')) return 'Je sessie is verlopen. Log opnieuw in.'
  if (msg.includes('Failed to fetch') || msg.includes('NetworkError')) return 'Geen internetverbinding'
  if (msg.includes('te groot')) return msg // Already friendly (file size)
  if (msg.includes('niet toegestaan')) return msg // Already friendly (file type)

  return 'Er ging iets mis. Probeer het opnieuw.'
}
