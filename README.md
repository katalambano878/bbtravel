# B.B. Travel Consult Platform

Premium travel + visa + recruitment + tours + business export platform built with Next.js App Router and Supabase.

## Stack

- Next.js (App Router) + TypeScript
- TailwindCSS + shadcn-style component primitives
- Framer Motion (subtle interaction motion)
- Supabase (Auth, Postgres, Storage, Realtime)
- Resend email abstraction

## Environment

Copy `.env.example` to `.env.local`:

```bash
cp .env.example .env.local
```

Fill:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `RESEND_API_KEY`
- `APP_BASE_URL`

## Local development

```bash
npm install
npm run dev
```

## Supabase setup

1. Run SQL migration in `supabase/migrations/001_initial_schema.sql`
2. Run seed script in `supabase/seed.sql`
3. Ensure storage buckets exist:
   - `client-documents` (private)
   - `site-media` (public)
   - `tour-media` (public)
   - `blog-covers` (public)

## Deployment

### Vercel

1. Import repository into Vercel.
2. Set environment variables from `.env.example`.
3. Build command: `npm run build`
4. Output: default Next.js

### VPS / Coolify

1. Build image or Node app with:
   - Install: `npm ci`
   - Build: `npm run build`
   - Start: `npm run start`
2. Set reverse proxy to app port.
3. Add same environment variables.
4. Ensure Supabase egress and DNS are reachable from VPS.

## Security model

- RLS enabled on application tables.
- Helper functions:
  - `is_super_admin()`
  - `has_permission(key)`
  - `is_case_assignee(case_id)`
- Client access limited to own cases/documents.
- Staff access enforced by role-permission mapping and assignment.

## Feature highlights

- High-conversion premium public site
- Smart onboarding wizard with readiness scoring
- Client portal with timeline, docs, and realtime updates
- Admin operations dashboard with RBAC
- Tours and blog SEO routes with sitemap/robots
