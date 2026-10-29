#!/usr/bin/env bash
# Reload store_bbconsult on big-vps from a fresh Supabase export.
#
#   bash scripts/migration/reload-target.sh            # uses migration-artifacts/dumps/*
#
# Steps: copy schema.sql/data.sql/verify.sql/checksum.sql to big-vps, back up
# the current database, drop + recreate the public and auth schemas, load
# schema and data in one transaction each, check every foreign key, and diff
# per-table checksums against migration-artifacts/dumps/_source_checksums.json.
# Exits non-zero on any error or mismatch. Uploaded files on the volume are
# not touched.
set -euo pipefail

cd "$(dirname "$0")/../.."
DUMPS=migration-artifacts/dumps
REMOTE=/root/bbtravel-migration
DB=store_bbconsult

for f in schema.sql data.sql verify.sql checksum.sql _source_checksums.json; do
  [ -s "$DUMPS/$f" ] || { echo "missing $DUMPS/$f — run the export first"; exit 1; }
done

ssh big-vps "mkdir -p $REMOTE && chmod 700 $REMOTE"
scp -q "$DUMPS/schema.sql" "$DUMPS/data.sql" "$DUMPS/verify.sql" "$DUMPS/checksum.sql" "big-vps:$REMOTE/"

ssh big-vps "REMOTE=$REMOTE DB=$DB bash -s" <<'REMOTE_SCRIPT'
set -euo pipefail
set -a; . /data/fleet/secrets/db-stack.env; set +a
chmod 600 "$REMOTE"/*.sql
P() { docker exec -i -e PGPASSWORD="$POSTGRES_SUPERPASS" fleet-postgres psql -U postgres -d "$DB" -v ON_ERROR_STOP=1 "$@"; }

stamp=$(date -u +%Y%m%dT%H%M%SZ)
docker exec -e PGPASSWORD="$POSTGRES_SUPERPASS" fleet-postgres pg_dump -U postgres -Fc "$DB" > "$REMOTE/$DB-before-$stamp.dump"
echo "backup: $REMOTE/$DB-before-$stamp.dump"

# Drop app connections (PgBouncer holds idle server connections), then reset schemas.
docker restart fleet-pgbouncer >/dev/null
P -q -c "select pg_terminate_backend(pid) from pg_stat_activity where datname = current_database() and pid <> pg_backend_pid();" >/dev/null
P -q <<SQL
drop schema if exists public cascade;
drop schema if exists auth cascade;
create schema public authorization store_bbconsult;
SQL

P -q < "$REMOTE/schema.sql"
P -q < "$REMOTE/data.sql"
P -q < "$REMOTE/verify.sql" 2>&1 | tee "$REMOTE/verify.log"
if grep -q "FK VIOLATION" "$REMOTE/verify.log"; then echo "foreign key violations"; exit 1; fi
P -t -A -F"|" < "$REMOTE/checksum.sql" > "$REMOTE/target_checksums.txt"
REMOTE_SCRIPT

scp -q "big-vps:$REMOTE/target_checksums.txt" "$DUMPS/_target_checksums.txt"
python3 - "$DUMPS" <<'PY'
import json, sys
d = sys.argv[1]
src = {r["t"]: (int(r["n"]), r["h"]) for r in json.load(open(f"{d}/_source_checksums.json"))}
tgt = {}
for line in open(f"{d}/_target_checksums.txt"):
    parts = line.strip().split("|")
    if len(parts) == 3:
        tgt[parts[0]] = (int(parts[1]), parts[2])
bad = [t for t in src if src[t] != tgt.get(t)] + [t for t in tgt if t not in src]
print(f"tables {len(src)} source / {len(tgt)} target, rows {sum(v[0] for v in src.values())} / {sum(v[0] for v in tgt.values())}")
if bad:
    print("MISMATCH:", ", ".join(sorted(set(bad))))
    sys.exit(1)
print("PARITY OK — every table identical to the Supabase snapshot")
PY
