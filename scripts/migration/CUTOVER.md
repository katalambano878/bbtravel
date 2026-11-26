# Go-live: bbtravelconsult.com → big-vps (plain Postgres)

**No final sync is needed or possible.** The Supabase Cloud project
`wjyymprcjzgllfowsidm` no longer exists (DNS NXDOMAIN, checked 2026-11-26), so
`export-supabase.py` cannot run again. The only copy of the production data is the
snapshot taken on **2026-10-29 20:22 UTC** (86 tables, 637 rows, 1 auth user), whose
per-table md5 checksums were recorded against Supabase at the time
(`_source_checksums.json`). Anything written to Supabase after that moment is lost.

## Where things are

| What | Where |
|------|-------|
| Snapshot (schema.sql, data.sql, checksum.sql, verify.sql, checksums, SHA256SUMS) | big-vps `/root/bbtravel-migration/snapshot-2026-10-29/` (+ owner's `migration-artifacts/dumps/`) |
| Cutover script | big-vps `/root/bbtravel-migration/cutover.sh` (copy in `scripts/migration/cutover.sh`) |
| Database | `store_bbconsult` on `fleet-postgres` (role `store_bbconsult`, via `fleet-pgbouncer:6432`) |
| Uploaded files | `/data/fleet/storage/bbtravel` (owner uid 100 = image user `app`) → `/app/storage` |
| Staging app | Coolify `bbtravel-staging` `pqmlk37j15hf3j6eitkd5x1l`, Dockerfile build, branch `staging/plain-postgres` of `Drrbarns/bbtravel`, `https://bbtravel-staging.169-58-8-203.sslip.io` + `https://staging.bbtravelconsult.com` |
| Live today | coolify-vps app `bbtravel` `vxmcz7meleuuz6opzkt4pm0q` (its data calls fail: Supabase is gone) |

## QA rows (must not reach production)

`store_bbconsult` today = the snapshot **plus staging QA writes** (2026-10-29 22:42–00:02
UTC and 2026-11-26). They include 3 QA auth users with passwords
(`qa.admin@`, `qa.customer@`, `qa.other@bbtravelconsult.test`), the passwordless QA admin
`qa-admin@bbtravel.test`, QA leads/clients/cases/form submissions (`qa*@bbtravel*.test`),
test invoices/payments/expenses/petty cash/vendors/refunds/payroll, audit and login
events, and edits to real rows (petty-cash balances, one employee salary, partner and
settings `updated_at`). Full per-row list: `/root/bbtravel-migration/qa-rows-2026-11-26.txt`.

Deleting them one by one would not undo the edits to real rows, so **the cutover rebuilds
production from the snapshot** instead: every QA row and QA edit disappears, and parity
with Supabase is re-proven table by table.

## Cutover steps

1. Rehearse (safe any time, changes nothing but a backup):
   `ssh big-vps bash /root/bbtravel-migration/cutover.sh rehearse` → must end `REHEARSAL OK`.
2. Run it: `ssh big-vps bash /root/bbtravel-migration/cutover.sh cutover`. It
   - backs up `store_bbconsult` to `/data/fleet/backups/store_bbconsult_pre-cutover_<stamp>.dump`,
   - builds `store_bbconsult_new` from the snapshot, checks every FK and every table's
     count + md5 against `_source_checksums.json`, and the function/trigger counts (12/40),
   - swaps names (`store_bbconsult` → `store_bbconsult_old`, `_new` → `store_bbconsult`)
     using `ALLOW_CONNECTIONS false` + terminate (no pgbouncer/postgres restart),
   - re-checks parity on the renamed database,
   - moves every uploaded file the new database doesn't reference (all of them are QA
     uploads; Supabase `storage.objects` was 0) to `/data/fleet/storage/bbtravel-qa-quarantine-<stamp>`.
   It aborts before the swap on any error/mismatch and refuses to run twice.
3. Production app: merge `staging/plain-postgres` into `main` and either create a prod app
   like `bbtravel-staging` or move the domains onto it. Envs: `DATABASE_URL`
   (`postgresql://store_bbconsult:<pw>@fleet-pgbouncer:6432/store_bbconsult`), a new
   `AUTH_JWT_SECRET` (`openssl rand -hex 32`), `STORAGE_ROOT=/app/storage`,
   `APP_BASE_URL=https://bbtravelconsult.com`, `NIXPACKS_NODE_VERSION=22` (unused by the
   Dockerfile, harmless), **no** `SITE_NOINDEX`. Build pack Dockerfile, port 3000, health
   check `/robots.txt` with `health_check_host=127.0.0.1`, volume
   `/data/fleet/storage/bbtravel` → `/app/storage`.
   Domains `https://bbtravelconsult.com,https://www.bbtravelconsult.com`.
4. After the swap the staging app also points at `store_bbconsult` (production). Stop it,
   or point its `DATABASE_URL` at `store_bbconsult_old` and its volume at a copy, so staging
   tests never write to production.
5. DNS (Hostinger): `@` A → `169.58.8.203`; `www` CNAME → apex.
6. Email: the live app's `RESEND_API_KEY` is empty, so no email is sent today or after the
   move (form notifications, portal sign-up confirmation, password reset). Portal sign-up
   needs the confirmation email to finish; set `RESEND_API_KEY` + `RESEND_FROM` when the
   owner provides a key.

## Rollback

Point `@` back to `84.247.165.196` (its data calls fail either way). To undo the database
swap: rename `store_bbconsult` → `store_bbconsult_new`, `store_bbconsult_old` →
`store_bbconsult`; move files back from the quarantine folder.
