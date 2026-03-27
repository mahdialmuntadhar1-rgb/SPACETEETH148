# Phase 3 data/auth mapping to Supabase

This document records the current architecture after completing migration to Supabase for both data and authentication.

## Current architecture

- **Auth provider:** Supabase Auth
- **Data provider:** Supabase Postgres (via `@supabase/supabase-js`)
- **Shared client:** `services/supabase.ts`

## Auth/session flow

- `hooks/useAuth.tsx`
  - Reads initial session with `supabase.auth.getSession()`.
  - Subscribes to state changes with `supabase.auth.onAuthStateChange(...)`.
  - Exposes helpers for:
    - `signUpWithEmail`
    - `signInWithEmail`
    - `signInWithGoogle`
    - `signOut`
- `index.tsx`
  - Wraps app with `AuthProvider`.
- `App.tsx`
  - Uses `useAuth()` to read authenticated user.
  - Calls `api.getOrCreateProfile` to synchronize `users` profile row.

## Profile identity alignment

- `services/api.ts#getOrCreateProfile` stores profiles with:
  - `users.id = authUser.id`
- This aligns profile ownership with policy checks using `auth.uid()`.

## Role bootstrap logic

- App role selection (`user` / `owner`) is stored in `sessionStorage` as `pending_role` during sign-in/up initiation.
- On successful session availability, profile creation consumes that role value.

## RLS policy guidance

Use policy predicates based on current session identity, for example:

- `auth.uid() = id` for self profile access.
- `auth.uid() = user_id` for user-owned rows.
- Role gates by joining/reading from `users` table where needed.

## Manual verification checklist

- Sign up with email/password and confirm profile row creation.
- Sign in with email/password and verify protected dashboard access.
- Sign in with Google OAuth and verify callback/redirect.
- Sign out and confirm protected route lockout.
- Confirm all user-scoped queries operate under RLS with `auth.uid()`.
