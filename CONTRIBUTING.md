# Contributing

## Prerequisites

- Node.js 20+
- npm
- Supabase project credentials

## Development Flow

1. Create a feature branch.
2. Install dependencies with `npm install`.
3. Add/update Supabase schema in `supabase/migrations/`.
4. Run checks:
   - `npm run lint`
   - `npm test`
   - `npm run build`
5. Open a PR with summary, migration notes, and testing output.

## Code Standards

- TypeScript-first changes.
- Keep API layer logic in `services/api.ts`.
- Keep auth/session logic in hooks under `hooks/`.
- Include tests for behavior changes.
