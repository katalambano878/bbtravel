# B.B. Travel Consult Platform

Premium travel + visa + recruitment + tours + business export platform built with Next.js App Router and plain Postgres.

## Stack

- Next.js (App Router) + TypeScript
- TailwindCSS + shadcn-style component primitives
- Framer Motion (subtle interaction motion)
- PostgreSQL via `pg` (in-process query builder in `src/lib/db`)
- Email + password auth on `auth.users` (bcrypt, signed httpOnly session cookie) in `src/lib/auth/session.ts`
- File storage on a persistent volume (`STORAGE_ROOT`) in `src/lib/storage/local.ts`
- Resend email abstraction

## Environment

Copy `.env.example` to `.env.local`:

```bash
cp .env.example .env.local
```

Fill:

- `DATABASE_URL`
- `AUTH_JWT_SECRET`
- `STORAGE_ROOT`
- `RESEND_API_KEY` / `RESEND_FROM`
- `APP_BASE_URL`

## Local development

```bash
npm install
npm run dev
```

## Database

The schema was migrated from Supabase on 2026-10-29 (see `scripts/migration/`).
`supabase/migrations/` is kept as history only; the live schema is the
`store_bbconsult` database on big-vps.

Storage buckets are folders under `STORAGE_ROOT`:
- `client-documents` (private, served via `/api/documents/<id>/file`)
- `site-media`, `tour-media`, `blog-covers` (public, served at `/storage/v1/object/public/<bucket>/...`)

## Deployment

Coolify on big-vps (Nixpacks: `npm ci`, `npm run build`, `npm run start`).
Mount a persistent volume at `STORAGE_ROOT` and set `DATABASE_URL` as a
build-time variable too (static pages read tours during the build).

## Security model

- The database is reached only from the app server; there is no public database API.
- Staff access is enforced in code by role-permission mapping (`requirePermission`).
- Portal clients only see their own cases and documents (`isOwnCase`).

## Feature highlights

- High-conversion premium public site
- Smart onboarding wizard with readiness scoring
- Client portal with timeline, docs, and live updates (polling)
- Admin operations dashboard with RBAC
- Tours and blog SEO routes with sitemap/robots
