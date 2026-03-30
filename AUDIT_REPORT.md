# AUDIT_REPORT.md

## Scope audited
- Runtime app entry/routing and auth state: `App.tsx`
- Package/build config: `package.json`, `vite.config.js`, `tsconfig.json`, `index.html`
- Environment handling: `services/supabase.ts`, `vite-env.d.ts`, `.env.example`
- API/data layer: `services/api.ts`, `supabase/migrations/20260328_bootstrap_public_tables.sql`
- UI data consumers: `components/*`
- Deployment scripts/docs: `README.md`, `scripts/preflight.sh`, `scripts/verify-deploy.sh`

## Brutally honest diagnosis (before fixes)

1. **Production data path was contaminated by hardcoded mock business data.**
   - Multiple core surfaces (posts, featured, stories, events, postcards) silently fell back to `services/mockData.ts` on empty/error states.
   - This masked real Supabase failures and violated production-data integrity.

2. **AI/Gemini dependencies existed in production path.**
   - `@google/genai` dependency and `VITE_GEMINI_API_KEY` were required/used by dashboard and city guide flows.
   - This was not aligned with a Supabase-only backend direction and blocked installs in this environment due registry policy.

3. **Naming/identity still looked template-grade.**
   - Package name/version were placeholders.
   - Metadata had placeholder app name and "AI-powered" template phrasing.
   - `index.html` still carried AI Studio import map leftovers.

4. **Schema/consumer mismatch existed for governorate filtering.**
   - App filtered stories/posts by `governorate`, while migration tables for `posts` and `stories` originally did not guarantee this column.

5. **Deployment/readme instructions were partially misleading.**
   - README still listed Gemini env vars and did not fully reflect cleaned Supabase-only launch path.

## Current diagnosis (after fixes in this pass)

- Supabase remains the only runtime backend.
- Mock business fallback datasets were removed from runtime flow.
- Gemini dependency and env usage were removed.
- App/package naming and metadata are production-cleaned.
- README/env docs now match runtime requirements.
- Posts/stories governorate columns were aligned in migration for future deployments.

## Remaining risk

- **This environment cannot install npm dependencies due registry 403 policy**, so lint/build verification could not be completed here.
- Final readiness depends on one external run with normal npm access (`npm install`, `npm run lint`, `npm run build`).
