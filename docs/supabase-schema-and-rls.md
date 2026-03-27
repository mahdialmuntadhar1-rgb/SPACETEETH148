# Supabase schema and RLS mapping

This repository now targets Supabase Auth + Supabase Postgres.

## Firestore collection to Supabase table mapping

- `users` → `public.users`
- `businesses` → `public.businesses`
- `posts` → `public.posts`
- `likes` → `public.likes`
- `business_postcards` → `public.business_postcards`
- `deals` → `public.deals`
- `stories` → `public.stories`
- `events` → `public.events`

## Migration

Run SQL in `supabase/migrations/20260327_initial_schema.sql` using either:

1. Supabase SQL editor (paste + run), or
2. Supabase CLI:

```bash
supabase db push
```

## RLS parity notes

The policy set in the migration mirrors the intent of `firestore.rules`:

- Public read for social/discovery tables (`posts`, `businesses`, `stories`, `events`, `deals`, `business_postcards`).
- Self read/update for profile data (`users` row bound to `auth.uid()`).
- Owner-bound writes (`posts`, `deals`) using `users.business_id` ownership checks.
- Admin override through `public.is_admin()` helper.

## Known gap / required verification

`firestore.rules` contained strict data-shape validation (field presence and value checks).
SQL constraints cover core checks, but parity for every Firestore validation rule should be confirmed with additional `check` constraints and/or database triggers before production.

## Cloudflare Worker audit

The requested Worker target (`xalat.mahdialmuntadhar1.workers.dev`) is **not present in this repository**. No worker script or Cloudflare deployment config was found, so no code-level Worker migration/removal was applied in this codebase.
