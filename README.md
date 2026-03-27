# Iraq Compass (Supabase Edition)

A React + TypeScript directory and community platform focused on Iraqi businesses, events, stories, and deals.

## Features

- Supabase Auth (Google OAuth + email/password + password reset).
- Supabase Postgres-backed business directory, social feed, deals, stories, events, and postcards.
- Role-aware profile bootstrap (`user`, `owner`, `admin`).
- Live social feed refresh using Supabase Realtime (`postgres_changes`).
- Jest + React Testing Library setup for key integration points.

## Tech Stack

- React 19 + TypeScript + Vite
- Supabase (`@supabase/supabase-js`)
- Jest + React Testing Library

## Environment Variables

Create a `.env.local` file:

```bash
VITE_SUPABASE_URL=https://YOUR_PROJECT_REF.supabase.co
VITE_SUPABASE_ANON_KEY=YOUR_SUPABASE_ANON_KEY
GEMINI_API_KEY=YOUR_GEMINI_KEY
```

## Local Setup

1. Install dependencies:
   ```bash
   npm install
   ```
2. Configure Supabase schema + RLS (see migration below).
3. Start the app:
   ```bash
   npm run dev
   ```

## Database Setup (Supabase)

- Migration file: `supabase/migrations/20260327_initial_schema.sql`
- Documentation: `docs/supabase-schema-and-rls.md`

Apply migration:

```bash
supabase db push
```

Or paste migration SQL into the Supabase SQL editor and run.

## Testing

Run all tests:

```bash
npm test
```

## Build

```bash
npm run build
```

## Deploy

### Vercel

- Build command: `npm run build`
- Output directory: `dist`
- Set `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`, `GEMINI_API_KEY`.

### Cloudflare Pages

- Build command: `npm run build`
- Build output directory: `dist`
- Configure same environment variables in project settings.

### Netlify

- Build command: `npm run build`
- Publish directory: `dist`
- Configure same environment variables.

## Notes on unrelated artifacts

`package.json` name still references an older project string (`copy-of-iraq-compassamazingfinal2`), but runtime code now targets this Supabase-based project.
