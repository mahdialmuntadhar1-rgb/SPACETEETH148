# Iraq Compass (Production: Frontend → Supabase)

Iraq Compass is deployed as a **simple frontend-only app**:

- **Frontend:** Vite + React
- **Backend/Data:** Supabase (Auth + Postgres + Realtime)
- **Deployment target:** Cloudflare Pages (static site)
- **No worker/proxy runtime required**
- **No AI agent runtime**

## 1) Local Run

Prerequisites:
- Node.js 20+

```bash
npm install
cp .env.example .env.local
npm run dev
```

Open `http://localhost:3000`.

## 2) Required Environment Variables

Required for launch:
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`

Optional:
- none currently required by runtime

Obsolete for private-test runtime (do not set as required vars):
- `VITE_AI_API_BASE_URL`
- `VITE_CLOUDFLARE_ACCOUNT_ID`
- `VITE_CLOUDFLARE_PROJECT_NAME`
- `VITE_CLOUDFLARE_WORKER_NAME`
- `GEMINI_API_KEY`

## 3) Build / Preflight

```bash
npm run lint
npm run build
./scripts/preflight.sh
```

## 4) Supabase Setup

Migrations are under `supabase/migrations`.

Apply:

```bash
supabase db push
```

Current launch-baseline includes:
- Core tables (`users`, `businesses`, `posts`, `events`, `deals`, `stories`, `business_postcards`)
- RLS enabled for all tables
- Public read policies for discovery tables
- Owner/admin write protections
- Listing/search indexes (category, governorate, city, name)

## 5) Cloudflare Pages Configuration

Use these settings in Cloudflare Pages:
- Framework preset: **Vite**
- Build command: `npm run build`
- Build output directory: `dist`

Set runtime environment variables in Pages project settings:
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`

## 6) Launch Scope Notes

This release hardening focuses on:
- production-safe frontend + Supabase integration
- listings/search/details/filtering flows
- removal of misleading or dead launch-time features

Large-scale data cleanup is intentionally out-of-scope for this pass.
