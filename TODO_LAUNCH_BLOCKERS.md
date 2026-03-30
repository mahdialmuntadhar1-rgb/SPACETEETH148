# TODO_LAUNCH_BLOCKERS.md

## Critical blockers
- [ ] Run dependency install + compile gates in a normal networked environment:
  - `npm install`
  - `npm run lint`
  - `npm run build`
- [ ] Confirm production Supabase project has migration `supabase/migrations/20260328_bootstrap_public_tables.sql` applied (including `governorate` columns for `posts` and `stories`).

## High-priority fixes
- [x] Removed runtime mock-data fallback path (`services/mockData.ts` and all consumers).
- [x] Removed Gemini package + env dependency and AI Studio import-map leftovers.
- [x] Updated package identity/version to production naming.
- [x] Rewrote README + env requirements for Supabase-only setup.
- [x] Added `.env.example` with only required runtime vars.
- [x] Added explicit error/empty handling instead of fake fallback data in key data sections.

## Nice-to-have cleanup
- [ ] Prune large unused static demo exports in `constants.tsx` that are no longer consumed at runtime.
- [ ] Replace placeholder image fallbacks with branded static assets.
- [ ] Add dedicated integration tests around governorate filtering behavior.

## Requires external credentials/manual setup
- [ ] Supabase dashboard: verify RLS policies for anon vs authenticated write paths match desired launch permissions.
- [ ] Hosting dashboard: set `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`.
- [ ] Supabase Auth dashboard: verify production OAuth redirect URLs.
- [ ] Run final production smoke test against real Supabase data.
