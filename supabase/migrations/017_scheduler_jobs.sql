create table if not exists public.scheduled_reports (
  id uuid primary key default gen_random_uuid(),
  report_key text not null,
  schedule_cron text not null,
  recipients text[] not null default '{}',
  export_format text not null check (export_format in ('CSV', 'XLSX', 'PDF', 'JSON')),
  filters jsonb not null default '{}'::jsonb,
  active boolean not null default true,
  last_run_at timestamptz,
  next_run_at timestamptz,
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.job_queue (
  id uuid primary key default gen_random_uuid(),
  job_type text not null,
  status text not null default 'QUEUED' check (status in ('QUEUED', 'RUNNING', 'DONE', 'FAILED', 'RETRYING')),
  payload jsonb not null default '{}'::jsonb,
  attempts int not null default 0,
  max_attempts int not null default 5,
  run_after timestamptz not null default now(),
  started_at timestamptz,
  completed_at timestamptz,
  failure_reason text,
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_scheduled_reports_active_next_run on public.scheduled_reports(active, next_run_at);
create index if not exists idx_job_queue_status_run_after on public.job_queue(status, run_after);

drop trigger if exists trg_scheduled_reports_updated_at on public.scheduled_reports;
create trigger trg_scheduled_reports_updated_at before update on public.scheduled_reports for each row execute function public.set_updated_at();
drop trigger if exists trg_job_queue_updated_at on public.job_queue;
create trigger trg_job_queue_updated_at before update on public.job_queue for each row execute function public.set_updated_at();

alter table public.scheduled_reports enable row level security;
alter table public.job_queue enable row level security;

create policy "staff read scheduled reports" on public.scheduled_reports
for select using (public.has_permission('reports.scheduled') or public.is_super_admin());
create policy "staff manage scheduled reports" on public.scheduled_reports
for all using (public.has_permission('reports.scheduled') or public.is_super_admin())
with check (public.has_permission('reports.scheduled') or public.is_super_admin());

create policy "staff read job queue" on public.job_queue
for select using (public.has_permission('reports.scheduled') or public.is_super_admin());
create policy "staff manage job queue" on public.job_queue
for all using (public.has_permission('reports.scheduled') or public.is_super_admin())
with check (public.has_permission('reports.scheduled') or public.is_super_admin());
