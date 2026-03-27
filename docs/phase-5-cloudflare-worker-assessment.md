# Phase 5 — Cloudflare Worker assessment and action

## Scope checked
- Repository file inventory (no `wrangler.toml`, Worker source, or Worker deploy config files found).
- Frontend runtime call paths in `services/api.ts` and component usage.
- Deployment scripts and environment expectations.

## Findings
1. **Is the Worker actually used?**
   - **No.** There is no Worker code or config in this repository.

2. **Does frontend call it?**
   - **No.** Frontend calls are implemented via Firebase SDK / Firestore in `services/api.ts`.

3. **Does it provide required API behavior?**
   - **No.** Required behavior is provided by Firestore queries/mutations and Firebase Auth flows.

## Decision
- Chosen path: **(2) remove Worker from active architecture**.
- Rationale: Worker is not present and not required by active runtime behavior.

## Actions taken
- Removed stale Supabase preflight assumptions and aligned preflight with current runtime env.
- Added a deploy-time verification guard that fails when frontend source reintroduces Worker endpoint usage strings.
- Documented architecture status in README.

## Files changed in this phase
- `scripts/preflight.sh`
- `scripts/verify-deploy.sh`
- `README.md`
- `docs/phase-5-cloudflare-worker-assessment.md`

## Environment changes
- Required in preflight: `GEMINI_API_KEY`.
- Removed from preflight requirements: `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`.

## Deployment note
Deploy frontend + Firebase services. Do not provision or deploy Cloudflare Worker for this application unless a new requirement is introduced and implemented in source.
