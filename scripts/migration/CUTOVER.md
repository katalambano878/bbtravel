# Go-live: Supabase → big-vps (plain Postgres)

Staging (`https://staging.bbtravelconsult.com`, Coolify app `bbtravel-staging`,
uuid `pqmlk37j15hf3j6eitkd5x1l`, branch `staging/plain-postgres`) runs on the
same database production will use: `store_bbconsult` on big-vps. Staging tests
write test rows, so the database is reloaded fresh from Supabase at go-live.

Production today: coolify-vps app `bbtravel` (uuid `vxmcz7meleuuz6opzkt4pm0q`,
branch `main`) on Supabase `wjyymprcjzgllfowsidm`; DNS on Hostinger
(`@` A → 84.247.165.196, `www` CNAME → apex).

## 1. Freeze writes (5–10 minutes)

New leads, form submissions and logins write to Supabase until DNS moves.
Pick a quiet time. Optional: tell staff not to use the admin during the window.

## 2. Export and reload

```bash
python3 scripts/migration/export-supabase.py
git diff --stat src/lib/db/schema-map.ts   # must be empty; if not, the schema changed: commit + redeploy
bash scripts/migration/reload-target.sh    # must end with "PARITY OK"
```

If the export reports storage objects, download them into
`/data/coolify/bbtravel/storage/<bucket>/...` (the Supabase buckets were empty
on 2026-10-29).

If `reload-target.sh` reports a mismatch, a write landed between the snapshot
and the checksum: run both commands again.

## 3. Production app on big-vps

Merge `staging/plain-postgres` into `main`, then create the production app the
same way as staging (see `bbtravel-staging` in Coolify) with:

| Key | Value |
|-----|-------|
| `DATABASE_URL` | `postgres://store_bbconsult:<pw>@fleet-pgbouncer:6432/store_bbconsult` (build + runtime) |
| `AUTH_JWT_SECRET` | new `openssl rand -hex 32` (store in `~/.config/coolify-vps/bbtravel-prod-jwt`) |
| `STORAGE_ROOT` | `/app/storage` (volume `/data/coolify/bbtravel/storage`) |
| `APP_BASE_URL` | `https://bbtravelconsult.com` |
| `RESEND_API_KEY`, `RESEND_FROM` | same as staging |
| `GOOGLE_SITE_VERIFICATION`, `NIXPACKS_NODE_VERSION=22` | |
| `SITE_NOINDEX` | **unset** |

Domains: `https://bbtravelconsult.com,https://www.bbtravelconsult.com`.

## 4. DNS (Hostinger)

`@` A → `169.58.8.203` (keep TTL 60). `www` stays a CNAME to the apex.
Wait for Let's Encrypt, then:

```bash
node scripts/migration/smoke.mjs --base https://bbtravelconsult.com --accounts <accounts file>
```

## 5. Rollback

Point `@` back to `84.247.165.196`. The coolify-vps app and Supabase are left
untouched, so rollback is DNS only (writes made on big-vps after cutover would
need copying back).

## 6. After a week

Remove the staging QA account if staging is kept, stop the coolify-vps
`bbtravel` app, and pause the Supabase project.
