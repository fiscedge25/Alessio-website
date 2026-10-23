# Acme Bookings
Booking app for independent barbers: clients book, barbers manage their week.

## Stack
Next.js 15 (App Router) · TypeScript strict · Supabase (Postgres + Auth) · Tailwind · Stripe · Vercel

## Commands
- dev: `npm run dev` (port 3000)
- test: `npm test` · single file: `npx vitest run path/to/file.test.ts`
- lint + types: `npm run lint && npx tsc --noEmit`
- db: `npx supabase db push` (never edit applied migrations)

## Map
- `app/` routes and pages — no business logic here
- `lib/` data access + domain logic, one file per entity
- `components/ui/` shared primitives, `components/<feature>/` feature UI
- `supabase/migrations/` append-only SQL

## Conventions
- Server components by default; `"use client"` only for interactivity
- Data fetching through `lib/*.ts`, never Supabase calls inside components
- Zod schemas next to the form that uses them (see `components/booking/schema.ts`)

## Rules
- ALWAYS run lint + types before saying a task is done
- NEVER use `any`, never add a dependency without asking
- NEVER touch `lib/stripe.ts` or webhooks without explicit approval

## Workflow
Plan in 3–5 bullets first, then code. Small PRs. Commits: `feat(scope): …`

## Gotchas
- Needs `.env.local` with SUPABASE_URL / SUPABASE_ANON_KEY (see `.env.example`)
- Times are stored in UTC, displayed in the barber's timezone
