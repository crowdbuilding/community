# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev          # Start dev server on http://localhost:5190
npm run build        # Production build (outputs to dist/)
npm run preview      # Preview production build
```

No test runner or linter configured.

## Tech Stack

- React 19 + Vite 6 (port 5190, strict)
- Supabase (Frankfurt region) — Auth, Database, Storage, Realtime
- Font Awesome 6 icons
- CSS variables from Clean DS tokens (no CSS-in-JS, no Tailwind)
- All UI text is in Dutch

## Architecture

### Routing (App.jsx)

Three route layers:
1. **Public**: `/login`, `/intake/:projectId`, `/project/:slug`, `/auth/callback`
2. **Org-level** (authenticated): `/org/:orgId`, `/org/:orgId/settings`, `/org/:orgId/new-project`
3. **Project-level** (authenticated + ProjectProvider): `/p/:slug/updates`, `/p/:slug/community`, etc.

Subdomain routing: org domains load OrgDashboard, project domains load project views directly.

### Contexts

- **AuthContext** — User session, profile, memberships, orgMemberships, `isPlatformAdmin`, `isOrgAdmin`. Provides `reload()` to refresh after changes.
- **ProjectContext** — Current project, membership, computed `role` (membership role OR 'admin' for org admins OR 'guest' fallback). Wraps all `/p/:slug/*` routes.
- **ThemeContext** — Light/dark mode with per-project branding colors.

### Role Hierarchy

```
interested(-1) → guest(0) → professional(1) → aspirant(2) → member(3) → moderator(4) → admin(5)
```

- `professional`: Team-only role for adviseurs — sees Dashboard, Updates (public only), Events, Documents (adviseur tag), Team
- `aspirant`: Prospective member — sees most content, no moderation
- `moderator`: Can publish updates, manage intake, invite members, moderate board
- `admin`: Full project control (settings, roles, branding, phases)
- Org admins get implicit admin access to all org projects via `has_membership()` SQL function

Permission checks: `canDo(role, action)` in `src/lib/permissions.js`. Actions map to minimum role levels.

### Data Hooks Pattern

All hooks in `src/hooks/` follow this structure:

```javascript
export function useX() {
  const { project } = useProject()
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)

  const fetch = useCallback(async () => { /* supabase query */ }, [project?.id])

  useEffect(() => { fetch() }, [fetch])               // initial fetch
  useEffect(() => { /* realtime subscription */ }, []) // live updates

  async function create(data) { /* insert + throw friendlyError on fail */ }
  async function update(id, data) { /* update */ }
  async function remove(id) { /* delete */ }

  return { items, loading, create, update, remove }
}
```

Key conventions:
- Fetch errors: `logger.error()` only (don't throw — let UI show empty state)
- CRUD errors: `logger.error()` + `throw new Error(friendlyError(error))` — callers show toast
- Realtime: subscribe to Supabase channel, call `fetch()` on changes, cleanup on unmount

### Error Handling

- `src/lib/logger.js` — Wraps console in dev, sends to Sentry in prod. `friendlyError(err)` maps Supabase errors to Dutch user messages.
- `src/components/ErrorBoundary.jsx` — Wraps entire app, catches React render errors.
- Toast system via `useToast()` context — call `toast.error(message)` or `toast.success(message)`.

### File Uploads

`src/lib/storage.js`:
- `uploadImage(file, bucket)` — Compresses to max 1200px JPEG, uploads to Supabase Storage
- `uploadFile(file, bucket)` — Validates extension whitelist + 10MB size limit
- Buckets: `post-images`, `project-files`, `avatars`

### Supabase / RLS

- All tables have RLS enabled with policies using helper functions: `is_platform_admin()`, `has_membership(project_id, min_role)`, `is_org_admin(org_id)`
- `has_membership()` grants org admins implicit access (no physical membership row needed)
- Migrations are in `supabase/migrations/` (001-014), run manually in Supabase SQL Editor

## Design System: Clean DS

All styling MUST follow the Clean Design System. Full token reference: `CLEAN-DS-TOKENS.md`.

Core rules:
- **Shadows over borders** — cards defined by shadow depth, NEVER visible borders
- **Color is earned** — only for status, data, active nav, CTAs. Never decorative.
- **Max 3 accent colors per view**
- **Whitespace is intentional** — don't fill it
- Always use CSS variables (`var(--token-name)`), never hardcoded values
- Hover: `translateY(-1px)` + shadow lift, 150ms. No hover on mobile.
- Tags: 14% opacity background, darker text (see CLEAN-DS-TOKENS.md)
- Modal detail actions: top-right corner, 32×32px icon buttons, close always rightmost
- All create/edit modals: `max-width: 720px`
- Danger buttons: `--accent-red`, never pink

## Conventions

- Components in `src/components/`, views in `src/views/`, hooks in `src/hooks/`
- Shared constants (roles, tag colors, time formatting) in `src/lib/constants.js`
- All new views: add to max-width list in `index.css`
- `safeStorage.js` for localStorage (try/catch for private browsing)
- Confirm destructive actions with `ConfirmModal` before executing
