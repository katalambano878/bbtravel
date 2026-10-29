import "server-only";

// ============================================================================
// PostgREST-shaped query builder over node-postgres.
//
// Replaces the Supabase service-role client so the existing data-access code
// (`admin.from(table).select(...).eq(...)`) keeps working unchanged while every
// query runs in-process against plain Postgres. Covers exactly the surface the
// app uses:
//
//   .select(cols, { count, head })  incl. embeds  table(cols) / alias:table(cols)
//   .insert(row|rows) .update(patch) .upsert(row|rows, { onConflict }) .delete()
//   .eq .neq .gt .gte .lt .lte .like .ilike .is .in .match .or .not .filter
//   .order(col, { ascending, nullsFirst }) .limit(n) .range(from, to)
//   .single() .maybeSingle()
//   await builder -> { data, error, count }
//
// Embeds resolve with one batched query per relationship using the generated
// FK map (direction + target column), matching PostgREST's nesting: many-to-one
// embeds become an object (or null), one-to-many embeds become an array.
// ============================================================================

import { getPool } from "./pool";
import { FK_MAP, GENERATED_COLUMNS, JSONB_COLUMNS, PRIMARY_KEYS, type FkEdge } from "./schema-map";

type Row = Record<string, any>;
/** Untyped like supabase-js without generated types: rows are `any[]`, single rows `any`. */
type Result<T = any[]> = { data: T | null; error: DbError | null; count: number | null };

export interface DbError {
  message: string;
  code?: string;
  details?: string | null;
  hint?: string | null;
}

interface Filter {
  kind: "cmp" | "in" | "is" | "or" | "notIn" | "notIs";
  col?: string;
  op?: string;
  value?: any;
  values?: any[];
  orParts?: string;
}

interface OrderSpec {
  col: string;
  ascending: boolean;
  nullsFirst?: boolean;
}

interface ParsedSelect {
  columns: string[];
  star: boolean;
  embeds: EmbedSpec[];
}

interface EmbedSpec {
  alias: string;
  table: string;
  hint?: string;
  select: ParsedSelect;
}

interface ResolvedEmbed {
  kind: "forward" | "reverse";
  edge: FkEdge;
}

const PG_IDENT = /^[a-z_][a-z0-9_]*$/i;
const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

const SQL_OPS: Record<string, string> = {
  eq: "=",
  neq: "<>",
  gt: ">",
  gte: ">=",
  lt: "<",
  lte: "<=",
  like: "LIKE",
  ilike: "ILIKE"
};

class QueryError extends Error {
  code: string;
  constructor(message: string, code = "PGRST100") {
    super(message);
    this.code = code;
  }
}

function ident(name: string): string {
  if (!PG_IDENT.test(name)) throw new QueryError(`Unsafe SQL identifier: ${name}`);
  return `"${name}"`;
}

/** PostgREST answers `id=eq.not-a-uuid` with no rows; compare as text so Postgres does too. */
function uuidSafeLeft(col: string, value: unknown): string {
  const looksUuidCol = col === "id" || col.endsWith("_id");
  if (looksUuidCol && typeof value === "string" && value.length > 0 && !UUID_RE.test(value)) {
    return `${ident(col)}::text`;
  }
  return ident(col);
}

// split by commas that are not inside parentheses
function splitTopLevel(s: string): string[] {
  const out: string[] = [];
  let depth = 0;
  let cur = "";
  for (const ch of s) {
    if (ch === "(") depth++;
    if (ch === ")") depth--;
    if (ch === "," && depth === 0) {
      out.push(cur);
      cur = "";
    } else {
      cur += ch;
    }
  }
  if (cur.trim()) out.push(cur);
  return out;
}

function parseSelect(sel: string): ParsedSelect {
  const result: ParsedSelect = { columns: [], star: false, embeds: [] };
  for (const raw of splitTopLevel(sel)) {
    const token = raw.trim();
    if (!token) continue;
    const parenIdx = token.indexOf("(");
    if (parenIdx === -1) {
      if (token === "*") result.star = true;
      else result.columns.push(token);
      continue;
    }
    // alias:table!hint(inner) | table!hint(inner) | alias:table(inner) | table(inner)
    let head = token.slice(0, parenIdx).trim();
    const inner = token.slice(parenIdx + 1, token.lastIndexOf(")"));
    let alias: string | null = null;
    if (head.includes(":")) {
      const [a, rest] = head.split(":");
      alias = a.trim();
      head = rest.trim();
    }
    const [table, hint] = head.split("!").map((s) => s.trim());
    result.embeds.push({
      alias: alias ?? table,
      table,
      hint: hint && hint !== "inner" && hint !== "left" ? hint : undefined,
      select: parseSelect(inner)
    });
  }
  return result;
}

function resolveEmbed(parentTable: string, embed: EmbedSpec): ResolvedEmbed {
  const matches = (edge: FkEdge) => !embed.hint || edge.constraint === embed.hint || edge.column === embed.hint;
  const forward = (FK_MAP[parentTable] ?? []).filter((e) => e.foreignTable === embed.table && matches(e));
  const reverse = (FK_MAP[embed.table] ?? []).filter((e) => e.foreignTable === parentTable && matches(e));
  const candidates: ResolvedEmbed[] = [
    ...forward.map((edge) => ({ kind: "forward" as const, edge })),
    ...reverse.map((edge) => ({ kind: "reverse" as const, edge }))
  ];
  if (candidates.length === 0) {
    throw new QueryError(
      `Could not find a relationship between '${parentTable}' and '${embed.table}'`,
      "PGRST200"
    );
  }
  if (candidates.length > 1) {
    throw new QueryError(
      `Could not embed because more than one relationship was found for '${parentTable}' and '${embed.table}'`,
      "PGRST201"
    );
  }
  return candidates[0];
}

/** Columns to fetch for a select, plus the ones fetched only to resolve embeds. */
function plannedColumns(table: string, parsed: ParsedSelect): { sql: string; joinOnly: string[] } {
  if (parsed.star && parsed.embeds.length === 0 && parsed.columns.length === 0) {
    return { sql: "*", joinOnly: [] };
  }
  const requested = new Set(parsed.columns);
  const cols = new Set<string>(parsed.columns);
  const joinOnly: string[] = [];
  for (const embed of parsed.embeds) {
    const { kind, edge } = resolveEmbed(table, embed);
    const needed = kind === "forward" ? edge.column : edge.foreignColumn;
    if (!requested.has(needed) && !parsed.star) joinOnly.push(needed);
    cols.add(needed);
  }
  const list = [...cols].map(ident);
  if (parsed.star) list.unshift("*");
  return { sql: list.join(", "), joinOnly };
}

function normalizeValue(table: string, column: string, v: unknown): unknown {
  if (v === undefined || v === null) return null;
  if (JSONB_COLUMNS[table]?.has(column)) return JSON.stringify(v);
  if (Array.isArray(v) || v instanceof Date || Buffer.isBuffer(v)) return v;
  if (typeof v === "object") return JSON.stringify(v);
  return v;
}

function toDbError(err: any): DbError {
  return {
    message: err?.message ?? String(err),
    code: err?.code,
    details: err?.detail ?? null,
    hint: err?.hint ?? null
  };
}

export class QueryBuilder<T = any[]> implements PromiseLike<Result<T>> {
  private action: "select" | "insert" | "update" | "upsert" | "delete" = "select";
  private selectStr = "*";
  private wantCount = false;
  private headOnly = false;
  private filters: Filter[] = [];
  private orders: OrderSpec[] = [];
  private limitN: number | null = null;
  private rangeFrom: number | null = null;
  private rangeTo: number | null = null;
  private payload: Row | Row[] | null = null;
  private onConflictCols: string[] | null = null;
  private returnRows = false;
  private singleMode: "none" | "single" | "maybe" = "none";

  constructor(private readonly table: string) {}

  select(sel = "*", opts?: { count?: "exact" | "planned" | "estimated"; head?: boolean }) {
    this.selectStr = sel || "*";
    if (this.action !== "select") this.returnRows = true;
    if (opts?.count) this.wantCount = true;
    if (opts?.head) {
      this.headOnly = true;
      this.wantCount = true;
    }
    return this;
  }

  insert(payload: Row | Row[]) {
    this.action = "insert";
    this.payload = payload;
    return this;
  }

  update(patch: Row) {
    this.action = "update";
    this.payload = patch;
    return this;
  }

  upsert(payload: Row | Row[], opts?: { onConflict?: string }) {
    this.action = "upsert";
    this.payload = payload;
    this.onConflictCols = opts?.onConflict ? opts.onConflict.split(",").map((c) => c.trim()) : null;
    return this;
  }

  delete() {
    this.action = "delete";
    return this;
  }

  eq(col: string, value: any) {
    return this.cmp(col, "eq", value);
  }
  neq(col: string, value: any) {
    return this.cmp(col, "neq", value);
  }
  gt(col: string, value: any) {
    return this.cmp(col, "gt", value);
  }
  gte(col: string, value: any) {
    return this.cmp(col, "gte", value);
  }
  lt(col: string, value: any) {
    return this.cmp(col, "lt", value);
  }
  lte(col: string, value: any) {
    return this.cmp(col, "lte", value);
  }
  like(col: string, value: any) {
    return this.cmp(col, "like", value);
  }
  ilike(col: string, value: any) {
    return this.cmp(col, "ilike", value);
  }

  is(col: string, value: any) {
    this.filters.push({ kind: "is", col, value });
    return this;
  }

  in(col: string, values: readonly any[]) {
    this.filters.push({ kind: "in", col, values: [...values] });
    return this;
  }

  match(query: Row) {
    for (const [col, value] of Object.entries(query)) this.eq(col, value);
    return this;
  }

  or(parts: string) {
    this.filters.push({ kind: "or", orParts: parts });
    return this;
  }

  not(col: string, op: string, value: any) {
    if (op === "in") this.filters.push({ kind: "notIn", col, value });
    else if (op === "is") this.filters.push({ kind: "notIs", col, value });
    else this.filters.push({ kind: "cmp", col, op: `not_${op}`, value });
    return this;
  }

  filter(col: string, op: string, value: any) {
    if (op === "in") {
      const vals = String(value)
        .replace(/^\(|\)$/g, "")
        .split(",")
        .map((s) => s.trim());
      this.filters.push({ kind: "in", col, values: vals });
    } else if (op === "is") {
      this.filters.push({ kind: "is", col, value: value === "null" ? null : value });
    } else {
      this.filters.push({ kind: "cmp", col, op, value });
    }
    return this;
  }

  order(col: string, opts?: { ascending?: boolean; nullsFirst?: boolean }) {
    this.orders.push({ col, ascending: opts?.ascending !== false, nullsFirst: opts?.nullsFirst });
    return this;
  }

  limit(n: number) {
    this.limitN = n;
    return this;
  }

  range(from: number, to: number) {
    this.rangeFrom = from;
    this.rangeTo = to;
    return this;
  }

  single(): QueryBuilder<any> {
    this.singleMode = "single";
    this.returnRows = true;
    return this as QueryBuilder<any>;
  }

  maybeSingle(): QueryBuilder<any> {
    this.singleMode = "maybe";
    this.returnRows = true;
    return this as QueryBuilder<any>;
  }

  private cmp(col: string, op: string, value: any) {
    this.filters.push({ kind: "cmp", col, op, value });
    return this;
  }

  // ---- WHERE ------------------------------------------------------------------
  private buildWhere(params: unknown[]): string {
    const clauses: string[] = [];
    const bind = (v: unknown) => {
      params.push(v);
      return `$${params.length}`;
    };
    for (const f of this.filters) {
      if (f.kind === "cmp") {
        clauses.push(this.cmpClause(f.col!, f.op!, f.value, bind));
      } else if (f.kind === "in") {
        if (!f.values || f.values.length === 0) clauses.push("false");
        else clauses.push(`${ident(f.col!)} IN (${f.values.map(bind).join(", ")})`);
      } else if (f.kind === "notIn") {
        const raw = String(f.value).replace(/^\(|\)$/g, "").trim();
        if (!raw) continue;
        const ph = raw.split(",").map((s) => bind(s.trim()));
        clauses.push(`(${ident(f.col!)} IS NULL OR ${ident(f.col!)} NOT IN (${ph.join(", ")}))`);
      } else if (f.kind === "is") {
        clauses.push(this.isClause(f.col!, f.value));
      } else if (f.kind === "notIs") {
        clauses.push(`NOT (${this.isClause(f.col!, f.value)})`);
      } else if (f.kind === "or") {
        clauses.push(this.orGroup(f.orParts!, bind));
      }
    }
    return clauses.length ? ` WHERE ${clauses.join(" AND ")}` : "";
  }

  private isClause(col: string, value: unknown): string {
    if (value === null || value === "null") return `${ident(col)} IS NULL`;
    if (value === true || value === "true") return `${ident(col)} IS TRUE`;
    if (value === false || value === "false") return `${ident(col)} IS FALSE`;
    throw new QueryError(`Unsupported is() value: ${String(value)}`);
  }

  private cmpClause(col: string, op: string, value: unknown, bind: (v: unknown) => string): string {
    const negate = op.startsWith("not_");
    const bare = negate ? op.slice(4) : op;
    const sqlOp = SQL_OPS[bare];
    if (!sqlOp) throw new QueryError(`Unsupported operator: ${op}`);
    const clause = `${uuidSafeLeft(col, value)} ${sqlOp} ${bind(value)}`;
    return negate ? `NOT (${clause})` : clause;
  }

  // PostgREST or-filter: "a.eq.x,b.ilike.%y%,c.is.null,d.in.(1,2),and(e.eq.1,f.gt.2)"
  private orGroup(parts: string, bind: (v: unknown) => string): string {
    return `(${splitTopLevel(parts)
      .map((seg) => this.orTerm(seg.trim(), bind))
      .join(" OR ")})`;
  }

  private orTerm(seg: string, bind: (v: unknown) => string): string {
    const grp = /^(and|or)\(([\s\S]*)\)$/.exec(seg);
    if (grp) {
      const joiner = grp[1] === "and" ? " AND " : " OR ";
      return `(${splitTopLevel(grp[2])
        .map((s) => this.orTerm(s.trim(), bind))
        .join(joiner)})`;
    }
    const first = seg.indexOf(".");
    const col = seg.slice(0, first).trim();
    const rest = seg.slice(first + 1).trim();
    if (rest.startsWith("in.(") && rest.endsWith(")")) {
      const vals = rest
        .slice(4, -1)
        .split(",")
        .map((v) => v.trim())
        .filter(Boolean);
      return vals.length ? `${ident(col)} IN (${vals.map(bind).join(", ")})` : "false";
    }
    const second = rest.indexOf(".");
    const op = rest.slice(0, second).trim();
    const val = rest.slice(second + 1).trim();
    if (op === "is") return this.isClause(col, val);
    const sqlOp = SQL_OPS[op];
    if (!sqlOp) throw new QueryError(`Unsupported or() operator: ${op}`);
    return `${uuidSafeLeft(col, val)} ${sqlOp} ${bind(val)}`;
  }

  private buildOrderLimit(): string {
    let sql = "";
    if (this.orders.length) {
      sql += ` ORDER BY ${this.orders
        .map((o) => {
          const nullsFirst = o.nullsFirst ?? !o.ascending; // Postgres default
          return `${ident(o.col)} ${o.ascending ? "ASC" : "DESC"} NULLS ${nullsFirst ? "FIRST" : "LAST"}`;
        })
        .join(", ")}`;
    }
    if (this.rangeFrom !== null && this.rangeTo !== null) {
      sql += ` LIMIT ${Math.max(this.rangeTo - this.rangeFrom + 1, 0)} OFFSET ${this.rangeFrom}`;
    } else if (this.limitN !== null) {
      sql += ` LIMIT ${Math.max(Math.trunc(this.limitN), 0)}`;
    }
    return sql;
  }

  // ---- execution ------------------------------------------------------------
  async exec(): Promise<Result<T>> {
    try {
      let rows: Row[] = [];
      let count: number | null = null;

      if (this.action === "select") {
        const params: unknown[] = [];
        const where = this.buildWhere(params);
        if (this.wantCount) {
          const res = await getPool().query(`SELECT count(*)::int AS c FROM ${ident(this.table)}${where}`, params);
          count = res.rows[0]?.c ?? 0;
        }
        if (!this.headOnly) {
          rows = await selectRows(this.table, parseSelect(this.selectStr), where, params, this.buildOrderLimit());
        }
      } else if (this.action === "insert" || this.action === "upsert") {
        rows = await this.execInsert();
      } else if (this.action === "update") {
        rows = await this.execUpdate();
      } else {
        rows = await this.execDelete();
      }

      if (this.singleMode === "single") {
        if (rows.length !== 1) {
          return {
            data: null,
            error: {
              message: "JSON object requested, multiple (or no) rows returned",
              code: "PGRST116",
              details: `The result contains ${rows.length} rows`,
              hint: null
            },
            count
          };
        }
        return { data: rows[0] as T, error: null, count };
      }
      if (this.singleMode === "maybe") {
        if (rows.length > 1) {
          return {
            data: null,
            error: {
              message: "JSON object requested, multiple (or no) rows returned",
              code: "PGRST116",
              details: `The result contains ${rows.length} rows`,
              hint: null
            },
            count
          };
        }
        return { data: (rows[0] ?? null) as T | null, error: null, count };
      }
      if (this.action !== "select" && !this.returnRows) return { data: null, error: null, count };
      return { data: this.headOnly ? null : (rows as T), error: null, count };
    } catch (err) {
      const error = toDbError(err);
      console.error(`[db] ${this.action} ${this.table}: ${error.message}`, error.code ?? "");
      return { data: null, error, count: null };
    }
  }

  private writableColumns(rows: Row[]): string[] {
    const generated = GENERATED_COLUMNS[this.table];
    const cols = new Set<string>();
    for (const r of rows) for (const k of Object.keys(r)) if (!generated?.has(k)) cols.add(k);
    return [...cols];
  }

  private returning(): string {
    return this.returnRows ? " RETURNING *" : "";
  }

  private async execInsert(): Promise<Row[]> {
    const rowsIn = Array.isArray(this.payload) ? this.payload : [this.payload ?? {}];
    if (rowsIn.length === 0) return [];
    const cols = this.writableColumns(rowsIn);
    const params: unknown[] = [];
    let sql: string;
    if (cols.length === 0) {
      sql = `INSERT INTO ${ident(this.table)} DEFAULT VALUES`;
    } else {
      // A key missing from one row of a bulk insert uses the column default.
      const values = rowsIn
        .map(
          (r) =>
            `(${cols
              .map((c) => {
                if (!(c in r) || r[c] === undefined) return "DEFAULT";
                params.push(normalizeValue(this.table, c, r[c]));
                return `$${params.length}`;
              })
              .join(", ")})`
        )
        .join(", ");
      sql = `INSERT INTO ${ident(this.table)} (${cols.map(ident).join(", ")}) VALUES ${values}`;
    }
    if (this.action === "upsert") {
      // PostgREST resolves conflicts on the primary key unless onConflict is given.
      const conflict = this.onConflictCols ?? [...(PRIMARY_KEYS[this.table] ?? ["id"])];
      const updates = cols.filter((c) => !conflict.includes(c)).map((c) => `${ident(c)} = EXCLUDED.${ident(c)}`);
      sql += ` ON CONFLICT (${conflict.map(ident).join(", ")}) DO ${
        updates.length ? `UPDATE SET ${updates.join(", ")}` : "NOTHING"
      }`;
    }
    const res = await getPool().query(sql + this.returning(), params);
    return res.rows;
  }

  private async execUpdate(): Promise<Row[]> {
    const patch = (this.payload ?? {}) as Row;
    const cols = this.writableColumns([patch]).filter((c) => patch[c] !== undefined);
    if (cols.length === 0) return [];
    const params: unknown[] = [];
    const sets = cols.map((c) => {
      params.push(normalizeValue(this.table, c, patch[c]));
      return `${ident(c)} = $${params.length}`;
    });
    const where = this.buildWhere(params);
    const res = await getPool().query(`UPDATE ${ident(this.table)} SET ${sets.join(", ")}${where}${this.returning()}`, params);
    return res.rows;
  }

  private async execDelete(): Promise<Row[]> {
    const params: unknown[] = [];
    const where = this.buildWhere(params);
    const res = await getPool().query(`DELETE FROM ${ident(this.table)}${where}${this.returning()}`, params);
    return res.rows;
  }

  then<TResult1 = Result<T>, TResult2 = never>(
    onfulfilled?: ((value: Result<T>) => TResult1 | PromiseLike<TResult1>) | null,
    onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | null
  ): PromiseLike<TResult1 | TResult2> {
    return this.exec().then(onfulfilled, onrejected);
  }
}

async function selectRows(
  table: string,
  parsed: ParsedSelect,
  where: string,
  params: unknown[],
  orderLimit: string
): Promise<Row[]> {
  const { sql, joinOnly } = plannedColumns(table, parsed);
  const res = await getPool().query(`SELECT ${sql} FROM ${ident(table)}${where}${orderLimit}`, params);
  const rows: Row[] = res.rows;
  await resolveEmbeds(table, rows, parsed);
  for (const r of rows) for (const c of joinOnly) delete r[c];
  return rows;
}

async function resolveEmbeds(table: string, rows: Row[], parsed: ParsedSelect): Promise<void> {
  if (parsed.embeds.length === 0) return;
  for (const embed of parsed.embeds) {
    const { kind, edge } = resolveEmbed(table, embed);
    // forward: parent.<edge.column> -> child.<edge.foreignColumn>  (object)
    // reverse: child.<edge.column>  -> parent.<edge.foreignColumn> (array)
    const parentKey = kind === "forward" ? edge.column : edge.foreignColumn;
    const childKey = kind === "forward" ? edge.foreignColumn : edge.column;
    const keys = [...new Set(rows.map((r) => r[parentKey]).filter((v) => v !== null && v !== undefined))];

    let related: Row[] = [];
    if (keys.length) {
      const inner = { ...embed.select, columns: [...embed.select.columns] };
      const addedChildKey = !inner.star && !inner.columns.includes(childKey);
      if (addedChildKey) inner.columns.push(childKey);
      const ph = keys.map((_, i) => `$${i + 1}`).join(", ");
      related = await selectRows(embed.table, inner, ` WHERE ${ident(childKey)} IN (${ph})`, keys, "");
      if (addedChildKey) {
        // remember to strip after grouping
        for (const r of related) Object.defineProperty(r, "__joinKey", { value: r[childKey], enumerable: false });
        for (const r of related) delete r[childKey];
      }
    }
    const keyOf = (r: Row) => ("__joinKey" in r ? (r as any).__joinKey : r[childKey]);

    if (kind === "forward") {
      const byKey = new Map(related.map((r) => [keyOf(r), r]));
      for (const r of rows) r[embed.alias] = r[parentKey] == null ? null : byKey.get(r[parentKey]) ?? null;
    } else {
      const grouped = new Map<unknown, Row[]>();
      for (const r of related) {
        const k = keyOf(r);
        if (!grouped.has(k)) grouped.set(k, []);
        grouped.get(k)!.push(r);
      }
      for (const r of rows) r[embed.alias] = grouped.get(r[parentKey]) ?? [];
    }
  }
}

export function createQueryClient() {
  return {
    from(table: string) {
      if (!PG_IDENT.test(table)) throw new Error(`Unsafe table name: ${table}`);
      return new QueryBuilder<any[]>(table);
    }
  };
}

export type QueryClient = ReturnType<typeof createQueryClient>;
