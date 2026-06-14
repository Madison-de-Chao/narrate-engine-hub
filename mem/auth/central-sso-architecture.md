---
name: Central SSO Architecture
description: Local auth UI deprecated; all sign-in/up/subscribe redirects to story_builder_hub via /auth and /auth/callback
type: feature
---
## Architecture
- Local Supabase auth UI is deprecated. Local DB only stores data (bazi_calculations, legion_stories, story_regeneration_credits, profiles).
- All sign-in/sign-up/password-reset/subscribe flows redirect to the central site (story_builder_hub).
- Local Supabase `disable_signup = true` (configured).

## Routes
- `/auth` → Auto-redirects to central login (handles already-signed-in case + guest mode).
- `/auth/callback` → Receives `#access_token=...&refresh_token=...` from central, calls `supabase.auth.setSession()`, then redirects to `?return_to=`.
- `/subscribe` → Auto-redirects to central subscribe page.

## Config
- `src/config/centralAuth.ts` holds `CENTRAL_SITE_URL`, `CENTRAL_AUTH_URL`, `CENTRAL_SUBSCRIBE_URL`, etc.
- Defaults to `https://story-builder-hub.lovable.app`; override via Vite env vars `VITE_CENTRAL_SITE_URL` / `VITE_CENTRAL_AUTH_URL` / `VITE_CENTRAL_SUBSCRIBE_URL`.
- Helper functions: `redirectToCentralLogin(returnTo)`, `redirectToCentralSubscribe()`, `redirectToCentralAccount()`.

## Membership
- `useUnifiedMembership` now ONLY trusts central `check-entitlement` edge function.
- Local `subscriptions` table no longer queried as fallback (table kept for historical data only).
- `usePremiumStatus` (deprecated) still reads local `subscriptions`; new code must use `useUnifiedMembership`.

## Required main-site contract (TODO)
The central site must implement:
1. Accept `?return_to=<callback>&source=rsbzs` on its `/auth` page.
2. After successful sign-in, redirect to `<callback>#access_token=...&refresh_token=...` (Supabase implicit flow format).
3. Central must issue tokens valid for the LOCAL Supabase project (ncpqlfwllxkwkxcqmrdi), OR both projects must share a common auth backend.

If main site is on a different Supabase project, full SSO requires cross-project session exchange (e.g. an edge function on local side that validates the central JWT and mints a local one).