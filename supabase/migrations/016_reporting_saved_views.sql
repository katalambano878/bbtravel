create table if not exists public.saved_report_views (
  id uuid primary key default gen_random_uuid(),
  report_key text not null,
  view_name text not null,
  filters jsonb not null default '{}'::jsonb,
  is_default boolean not null default false,
  owner_user_id uuid references auth.users(id) on delete cascade,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.report_exports (
  id uuid primary key default gen_random_uuid(),
  report_key text not null,
  export_format text not null check (export_format in ('CSV', 'XLSX', 'PDF', 'JSON')),
  filters jsonb not null default '{}'::jsonb,
  status text not null default 'QUEUED' check (status in ('QUEUED', 'PROCESSING', 'COMPLETED', 'FAILED')),
  file_url text,
  requested_by uuid references auth.users(id) on delete set null,
  completed_at timestamptz,
  created_at timestamptz not null default now()
);

create table if not exists public.kpi_snapshots (
  id uuid primary key default gen_random_uuid(),
  snapshot_key text not null,
  snapshot_date date not null,
  payload jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  unique (snapshot_key, snapshot_date)
);

create index if not exists idx_saved_report_views_owner on public.saved_report_views(owner_user_id, report_key);
create index if not exists idx_report_exports_status on public.report_exports(status);
create index if not exists idx_kpi_snapshots_key_date on public.kpi_snapshots(snapshot_key, snapshot_date desc);

drop trigger if exists trg_saved_report_views_updated_at on public.saved_report_views;
create trigger trg_saved_report_views_updated_at before update on public.saved_report_views for each row execute function public.set_updated_at();

alter table public.saved_report_views enable row level security;
alter table public.report_exports enable row level security;
alter table public.kpi_snapshots enable row level security;

create policy "staff read own saved report views" on public.saved_report_views
for select using (owner_user_id = auth.uid() or public.has_permission('reports.view') or public.is_super_admin());
create policy "staff manage own saved report views" on public.saved_report_views
for all using (owner_user_id = auth.uid() or public.has_permission('reports.view') or public.is_super_admin())
with check (owner_user_id = auth.uid() or public.has_permission('reports.view') or public.is_super_admin());

create policy "staff read report exports" on public.report_exports
for select using (requested_by = auth.uid() or public.has_permission('reports.view') or public.is_super_admin());
create policy "staff create report exports" on public.report_exports
for insert with check (public.has_permission('reports.export') or public.is_super_admin());
create policy "staff update report exports" on public.report_exports
for update using (public.has_permission('reports.export') or public.is_super_admin())
with check (public.has_permission('reports.export') or public.is_super_admin());

create policy "staff read kpi snapshots" on public.kpi_snapshots
for select using (public.has_permission('reports.view') or public.is_super_admin());
create policy "staff manage kpi snapshots" on public.kpi_snapshots
for all using (public.has_permission('reports.scheduled') or public.is_super_admin())
with check (public.has_permission('reports.scheduled') or public.is_super_admin());
