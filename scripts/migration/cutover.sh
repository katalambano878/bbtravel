#!/usr/bin/env bash
# B.B. Travel Consult (bbtravelconsult.com) — database + storage cutover on big-vps.
#
#   bash /root/bbtravel-migration/cutover.sh rehearse   # build store_bbconsult_new, prove parity, drop it again
#   bash /root/bbtravel-migration/cutover.sh cutover    # build, prove parity, swap names, quarantine QA files
#
# There is NO final sync: the Supabase Cloud project (wjyymprcjzgllfowsidm) no longer
# exists. The only copy of the production data is the 2026-10-29 20:22 UTC snapshot in
# ./snapshot-2026-10-29 (schema.sql + data.sql, checksummed against Supabase at the time:
# _source_checksums.json). The current store_bbconsult = that snapshot + staging QA rows,
# so production is rebuilt from the snapshot, which drops every QA row and QA edit.
#
# Safe by construction:
#   - never restarts fleet-postgres / fleet-pgbouncer / coolify-proxy
#   - backs up store_bbconsult first, keeps it as store_bbconsult_old (rename, not drop)
#   - moves QA files to a quarantine folder (no deletes)
#   - exits non-zero on any SQL error, FK violation or checksum mismatch (before the swap)
set -euo pipefail

MODE="${1:-}"
[[ "$MODE" == "rehearse" || "$MODE" == "cutover" ]] || { echo "usage: $0 rehearse|cutover"; exit 2; }

HERE=/root/bbtravel-migration
SNAP=$HERE/snapshot-2026-10-29
DB=store_bbconsult
NEW=${DB}_new
OLD=${DB}_old
ROLE=store_bbconsult
STORAGE=/data/fleet/storage/bbtravel
STAMP=$(date -u +%Y%m%dT%H%M%SZ)
LOG=$HERE/cutover-$MODE-$STAMP.log
exec > >(tee -a "$LOG") 2>&1

set -a; . /data/fleet/secrets/db-stack.env; set +a
PSQL() { docker exec -i -e PGPASSWORD="$POSTGRES_SUPERPASS" fleet-postgres psql -U postgres -v ON_ERROR_STOP=1 -X "$@"; }

echo "== $MODE $STAMP"
( cd "$SNAP" && sha256sum -c SHA256SUMS )

if [[ "$MODE" == "cutover" ]]; then
  # Refuse to run twice: after a cutover store_bbconsult_old exists.
  if [[ "$(PSQL -d postgres -tAc "select 1 from pg_database where datname='$OLD'")" == "1" ]]; then
    echo "ABORT: $OLD already exists — cutover already ran (or rename it out of the way first)"; exit 1
  fi
fi

# 1. Back up the current database.
BK=/data/fleet/backups/${DB}_pre-cutover_${STAMP}.dump
docker exec -e PGPASSWORD="$POSTGRES_SUPERPASS" fleet-postgres pg_dump -U postgres -Fc "$DB" > "$BK"
echo "backup: $BK ($(stat -c %s "$BK") bytes)"

# 2. Build store_bbconsult_new from the snapshot.
PSQL -d postgres -qc "select pg_terminate_backend(pid) from pg_stat_activity where datname='$NEW'" >/dev/null
PSQL -d postgres -qc "drop database if exists $NEW"
PSQL -d postgres -qc "create database $NEW owner $ROLE"
# Same ACLs as scripts/provision-store-db.sh gives every store database.
PSQL -d postgres -qc "revoke connect on database $NEW from public; grant connect on database $NEW to $ROLE"
PSQL -d "$NEW" -qc "revoke all on schema public from public; grant all on schema public to $ROLE"
PSQL -d "$NEW" -q < "$SNAP/schema.sql" 2>&1 | tee "$HERE/schema-$STAMP.log"
PSQL -d "$NEW" -q < "$SNAP/data.sql"   2>&1 | tee "$HERE/data-$STAMP.log"
PSQL -d "$NEW" -q < "$SNAP/verify.sql" 2>&1 | tee "$HERE/verify-$STAMP.log"
if grep -qE "ERROR|FATAL|FK VIOLATION" "$HERE/schema-$STAMP.log" "$HERE/data-$STAMP.log" "$HERE/verify-$STAMP.log"; then
  echo "ABORT: errors while building $NEW"; exit 1
fi

# 3. Parity: every table's row count + md5 must equal the Supabase snapshot.
parity() {
  PSQL -d "$1" -tA -F'|' < "$SNAP/checksum.sql" | grep '|' > "$HERE/checksums-$1-$STAMP.txt"
  python3 - "$SNAP/_source_checksums.json" "$HERE/checksums-$1-$STAMP.txt" <<'PY'
import json, sys
src = {r["t"]: (int(r["n"]), r["h"]) for r in json.load(open(sys.argv[1]))}
tgt = {}
for line in open(sys.argv[2]):
    p = line.strip().split("|")
    if len(p) == 3: tgt[p[0]] = (int(p[1]), p[2])
bad = sorted({t for t in src if src[t] != tgt.get(t)} | {t for t in tgt if t not in src})
print(f"tables {len(src)} source / {len(tgt)} target; rows {sum(v[0] for v in src.values())} / {sum(v[0] for v in tgt.values())}")
for t in bad: print(f"  MISMATCH {t}: source {src.get(t)} target {tgt.get(t)}")
sys.exit(1 if bad else 0)
PY
}
parity "$NEW" || { echo "ABORT: $NEW does not match the snapshot"; exit 1; }

# Same functions/triggers as the database the app has been running on.
objs() { PSQL -d "$1" -tAc "select (select count(*) from pg_proc p join pg_namespace n on n.oid=p.pronamespace where n.nspname in ('public','auth'))||'/'||(select count(*) from pg_trigger t join pg_class c on c.oid=t.tgrelid join pg_namespace n on n.oid=c.relnamespace where not t.tgisinternal and n.nspname in ('public','auth'))"; }
echo "functions/triggers: $DB $(objs "$DB"), $NEW $(objs "$NEW")"
[[ "$(objs "$DB")" == "$(objs "$NEW")" ]] || { echo "ABORT: function/trigger count differs"; exit 1; }
PSQL -d "$NEW" -tAc "select 'admin users with bcrypt hash: '||count(*) from auth.users where encrypted_password ~ '^\\\$2[aby]\\\$' and length(encrypted_password)=60"

# Rows the staging DB has that production will not (QA rows), for the record.
PSQL -d "$DB" -tA -F'|' < "$SNAP/checksum.sql" | grep '|' > "$HERE/checksums-$DB-$STAMP.txt" || true
echo "tables that differ in the current $DB (QA writes, dropped by the cutover):"
python3 - "$SNAP/_source_checksums.json" "$HERE/checksums-$DB-$STAMP.txt" <<'PY' || true
import json, sys
src = {r["t"]: int(r["n"]) for r in json.load(open(sys.argv[1]))}
src_h = {r["t"]: r["h"] for r in json.load(open(sys.argv[1]))}
for line in open(sys.argv[2]):
    p = line.strip().split("|")
    if len(p) == 3 and (int(p[1]), p[2]) != (src.get(p[0]), src_h.get(p[0])):
        print(f"  {p[0]}: snapshot {src.get(p[0])} rows, now {p[1]}")
PY

if [[ "$MODE" == "rehearse" ]]; then
  PSQL -d postgres -qc "drop database $NEW"
  echo "REHEARSAL OK — $NEW built, parity proven, dropped again. Nothing else changed. Log: $LOG"
  exit 0
fi

# 4. Swap names. Connections (via fleet-pgbouncer) are refused for a few seconds; no restarts.
PSQL -d postgres -v ON_ERROR_STOP=1 <<SQL
alter database $DB with allow_connections false;
alter database $NEW with allow_connections false;
select pg_terminate_backend(pid) from pg_stat_activity where datname in ('$DB','$NEW') and pid <> pg_backend_pid();
alter database $DB rename to $OLD;
alter database $NEW rename to $DB;
alter database $DB with allow_connections true;
alter database $OLD with allow_connections true;
SQL
parity "$DB" || { echo "!! $DB does not match after the swap — investigate (old data is in $OLD)"; exit 1; }
echo "swap done: $DB = clean snapshot, $OLD = previous staging database (QA rows)"

# 5. Storage: the snapshot references no uploaded files (Supabase storage.objects was 0),
#    so every file in the production folder is a staging QA upload. Move unreferenced ones out.
if [[ -d "$STORAGE" ]]; then
  Q=/data/fleet/storage/bbtravel-qa-quarantine-$STAMP
  docker exec -e PGPASSWORD="$POSTGRES_SUPERPASS" fleet-postgres pg_dump -U postgres --data-only "$DB" > "$HERE/refcheck-$STAMP.sql"
  moved=0; kept=0
  while IFS= read -r -d '' f; do
    rel=${f#"$STORAGE"/}; obj=${rel%.meta.json}; objpath=${obj#*/}
    if grep -qF -- "$objpath" "$HERE/refcheck-$STAMP.sql"; then kept=$((kept+1)); continue; fi
    mkdir -p "$Q/$(dirname "$rel")"; mv "$f" "$Q/$rel"; moved=$((moved+1))
  done < <(find "$STORAGE" -type f -print0)
  rm -f "$HERE/refcheck-$STAMP.sql"
  echo "storage: kept $kept referenced files, moved $moved QA files to $Q"
fi

echo "CUTOVER DB+STORAGE OK. Next: point the production app at $DB (it already is, by name), see CUTOVER.md. Log: $LOG"
