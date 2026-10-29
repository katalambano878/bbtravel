#!/usr/bin/env python3
"""Export the live Supabase database for the plain-Postgres move.

    python3 scripts/migration/export-supabase.py

Writes to migration-artifacts/dumps/ (git-ignored, contains customer data and
password hashes): _catalog.json, data.json, _source_counts.json, then builds
schema.sql / data.sql / checksum.sql / verify.sql and src/lib/db/schema-map.ts,
and records per-table checksums of the source in _source_checksums.json.

Uses the Supabase Management API SQL endpoint with the access token in
~/.config/supabase/crytoatm-access-token (never printed).
"""
import json
import subprocess
import sys
import urllib.request
from pathlib import Path

REF = "wjyymprcjzgllfowsidm"
ROOT = Path(__file__).resolve().parents[2]
DUMPS = ROOT / "migration-artifacts" / "dumps"
TOKEN = (Path.home() / ".config/supabase/crytoatm-access-token").read_text().strip()

CATALOG_SQL = """
select json_build_object(
 'enums', (select json_agg(json_build_object('name', t.typname, 'labels', (select json_agg(e.enumlabel order by e.enumsortorder) from pg_enum e where e.enumtypid=t.oid)) order by t.oid) from pg_type t join pg_namespace n on n.oid=t.typnamespace where n.nspname='public' and t.typtype='e'),
 'tables', (select json_agg(json_build_object('name', c.relname, 'columns', (
     select json_agg(json_build_object('name', a.attname, 'type', format_type(a.atttypid, a.atttypmod), 'notnull', a.attnotnull, 'default', pg_get_expr(d.adbin, d.adrelid), 'identity', a.attidentity, 'generated', a.attgenerated, 'udt', t.typname, 'typcat', t.typcategory) order by a.attnum)
     from pg_attribute a join pg_type t on t.oid=a.atttypid left join pg_attrdef d on d.adrelid=a.attrelid and d.adnum=a.attnum
     where a.attrelid=c.oid and a.attnum>0 and not a.attisdropped)) order by c.relname)
   from pg_class c join pg_namespace n on n.oid=c.relnamespace where n.nspname='public' and c.relkind='r'),
 'constraints', (select json_agg(json_build_object('table', c.conrelid::regclass::text, 'name', c.conname, 'type', c.contype, 'def', pg_get_constraintdef(c.oid)) order by c.conrelid::regclass::text, c.contype, c.conname) from pg_constraint c join pg_namespace n on n.oid=c.connamespace where n.nspname='public' and c.conrelid<>0),
 'indexes', (select json_agg(json_build_object('table', i.tablename, 'name', i.indexname, 'def', i.indexdef) order by i.tablename, i.indexname) from pg_indexes i where i.schemaname='public' and not exists (select 1 from pg_constraint c where c.conname=i.indexname and c.connamespace='public'::regnamespace)),
 'functions', (select json_agg(json_build_object('name', p.proname, 'def', pg_get_functiondef(p.oid)) order by p.proname) from pg_proc p join pg_namespace n on n.oid=p.pronamespace where n.nspname='public'),
 'triggers', (select json_agg(json_build_object('table', c.relname, 'name', t.tgname, 'def', pg_get_triggerdef(t.oid), 'enabled', t.tgenabled) order by c.relname, t.tgname) from pg_trigger t join pg_class c on c.oid=t.tgrelid join pg_namespace n on n.oid=c.relnamespace where n.nspname='public' and not t.tgisinternal),
 'policies', (select json_agg(json_build_object('table', tablename, 'name', policyname, 'cmd', cmd, 'roles', roles, 'qual', qual, 'check', with_check) order by tablename, policyname) from pg_policies where schemaname in ('public','storage')),
 'auth_users_columns', (select json_agg(json_build_object('name', a.attname, 'type', format_type(a.atttypid, a.atttypmod), 'notnull', a.attnotnull, 'default', pg_get_expr(d.adbin, d.adrelid), 'generated', a.attgenerated) order by a.attnum) from pg_attribute a left join pg_attrdef d on d.adrelid=a.attrelid and d.adnum=a.attnum where a.attrelid='auth.users'::regclass and a.attnum>0 and not a.attisdropped)
) as cat;
"""


def sql(query: str):
    req = urllib.request.Request(
        f"https://api.supabase.com/v1/projects/{REF}/database/query",
        data=json.dumps({"query": query}).encode(),
        headers={"Authorization": f"Bearer {TOKEN}", "Content-Type": "application/json", "User-Agent": "bbtravel-migration/1.0"},
        method="POST",
    )
    with urllib.request.urlopen(req, timeout=120) as res:
        return json.loads(res.read())


def run(*args: str):
    subprocess.run([sys.executable, *args], check=True, cwd=ROOT)


DUMPS.mkdir(parents=True, exist_ok=True)

catalog = sql(CATALOG_SQL)
(DUMPS / "_catalog.json").write_text(json.dumps(catalog))
cat = catalog[0]["cat"]
tables = [t["name"] for t in cat["tables"]]
print(f"catalog: {len(tables)} tables, {len(cat['constraints'])} constraints, {len(cat['triggers'])} triggers")

# One statement = one consistent snapshot. json_build_object takes <= 100 args.
pairs = [f"'{t}', (select coalesce(json_agg(x), '[]'::json) from public.\"{t}\" x)" for t in tables]
pairs += [
    "'__auth_users', (select coalesce(json_agg(u), '[]'::json) from auth.users u)",
    "'__storage_objects', (select coalesce(json_agg(o), '[]'::json) from storage.objects o)",
    "'__storage_buckets', (select coalesce(json_agg(b), '[]'::json) from storage.buckets b)",
    "'__snapshot_at', now()",
]
expr = " || ".join(f"json_build_object({', '.join(pairs[i:i + 40])})::jsonb" for i in range(0, len(pairs), 40))
data = sql(f"select ({expr}) as d")[0]["d"]
(DUMPS / "data.json").write_text(json.dumps(data))
counts = {k: len(v) for k, v in data.items() if isinstance(v, list)}
(DUMPS / "_source_counts.json").write_text(json.dumps(counts, indent=1, sort_keys=True))
print(f"snapshot {data['__snapshot_at']}: {sum(v for k, v in counts.items() if not k.startswith('__'))} rows, "
      f"{counts['__auth_users']} auth users, {counts['__storage_objects']} storage objects")
if counts["__storage_objects"]:
    print("WARNING: storage objects exist now — download them into the volume before cutover")

run("scripts/migration/build-schema.py", str(ROOT))
run("scripts/migration/build-data.py", str(ROOT))
run("scripts/migration/build-schema-map.py", str(ROOT))

source = sql((DUMPS / "checksum.sql").read_text())
(DUMPS / "_source_checksums.json").write_text(json.dumps(source))
print(f"source checksums: {len(source)} tables")
for f in DUMPS.iterdir():
    f.chmod(0o600)
