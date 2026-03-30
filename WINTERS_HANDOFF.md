# WINTERS_HANDOFF.md

1. Set production hosting environment variables:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`

2. In Supabase SQL editor, ensure migration `supabase/migrations/20260328_bootstrap_public_tables.sql` is applied.

3. In Supabase Auth settings, verify Google OAuth + redirect URLs include the production domain.

4. In a normal networked CI/local environment, run:
   - `npm install`
   - `npm run lint`
   - `npm run build`

5. Deploy and run a short smoke test on live domain:
   - home feed loads
   - business directory filtering/search works
   - featured/events/postcards/stories load from real DB
   - owner/admin dashboard can create post and update profile
