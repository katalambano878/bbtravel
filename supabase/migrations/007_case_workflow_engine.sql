create type public.case_priority as enum ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL');
create type public.case_note_visibility as enum ('INTERNAL', 'CLIENT_VISIBLE');

create table if not exists public.workflow_templates (
  id uuid primary key default gen_random_uuid(),
  template_key text not null unique,
  service_type public.service_type not null,
  template_name text not null,
  default_sla_hours int not null default 72,
  active boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists public.workflow_template_steps (
  id uuid primary key default gen_random_uuid(),
  template_id uuid not null references public.workflow_templates(id) on delete cascade,
  step_key text not null,
  title text not null,
  description text,
  display_order int not null,
  sla_hours int,
  required_documents text[] not null default '{}',
  allow_client_visibility boolean not null default false,
  created_at timestamptz not null default now(),
  unique (template_id, step_key)
);

create table if not exists public.case_workflows (
  id uuid primary key default gen_random_uuid(),
  case_id uuid not null unique references public.cases(id) on delete cascade,
  template_id uuid references public.workflow_templates(id) on delete set null,
  current_step_key text,
  started_at timestamptz not null default now(),
  due_at timestamptz,
  status text not null default 'ACTIVE' check (status in ('ACTIVE', 'PAUSED', 'COMPLETED', 'CLOSED')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.case_tasks (
  id uuid primary key default gen_random_uuid(),
  case_id uuid not null references public.cases(id) on delete cascade,
  title text not null,
  description text,
  priority public.case_priority not null default 'MEDIUM',
  status text not null default 'OPEN' check (status in ('OPEN', 'IN_PROGRESS', 'BLOCKED', 'DONE', 'CANCELLED')),
  due_at timestamptz,
  assigned_to uuid references auth.users(id) on delete set null,
  created_by uuid references auth.users(id) on delete set null,
  completed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.case_notes (
  id uuid primary key default gen_random_uuid(),
  case_id uuid not null references public.cases(id) on delete cascade,
  visibility public.case_note_visibility not null default 'INTERNAL',
  note text not null,
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now()
);

create table if not exists public.case_links (
  id uuid primary key default gen_random_uuid(),
  primary_case_id uuid not null references public.cases(id) on delete cascade,
  linked_case_id uuid not null references public.cases(id) on delete cascade,
  relation_type text not null default 'SUB_CASE' check (relation_type in ('SUB_CASE', 'DEPENDENT', 'FOLLOW_ON')),
  created_at timestamptz not null default now(),
  unique (primary_case_id, linked_case_id)
);

create table if not exists public.case_blockers (
  id uuid primary key default gen_random_uuid(),
  case_id uuid not null references public.cases(id) on delete cascade,
  blocker_key text not null,
  blocker_reason text not null,
  is_active boolean not null default true,
  resolved_at timestamptz,
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now()
);

alter table public.cases
  add column if not exists priority public.case_priority not null default 'MEDIUM',
  add column if not exists owner_team text,
  add column if not exists sla_due_at timestamptz,
  add column if not exists closed_at timestamptz,
  add column if not exists closure_reason text;

create index if not exists idx_case_tasks_case_id on public.case_tasks(case_id);
create index if not exists idx_case_tasks_assigned_to on public.case_tasks(assigned_to);
create index if not exists idx_case_notes_case_id on public.case_notes(case_id);
create index if not exists idx_case_workflows_case_id on public.case_workflows(case_id);

drop trigger if exists trg_case_workflows_updated_at on public.case_workflows;
create trigger trg_case_workflows_updated_at before update on public.case_workflows
for each row execute function public.set_updated_at();

drop trigger if exists trg_case_tasks_updated_at on public.case_tasks;
create trigger trg_case_tasks_updated_at before update on public.case_tasks
for each row execute function public.set_updated_at();

insert into public.workflow_templates (template_key, service_type, template_name, default_sla_hours)
values
  ('visa_default', 'VISA_ASSISTANCE', 'Visa Assistance Default Workflow', 120),
  ('recruitment_default', 'INTERNATIONAL_RECRUITMENT', 'Recruitment Default Workflow', 240),
  ('study_default', 'STUDY_ABROAD', 'Study Abroad Default Workflow', 240),
  ('tour_default', 'TOUR_PACKAGE', 'Tour Package Default Workflow', 72),
  ('hotel_default', 'BUSINESS_EXPORT', 'Hotel Booking Default Workflow', 48),
  ('flight_default', 'FLIGHT_RESERVATION', 'Flight Reservation Default Workflow', 24)
on conflict (template_key) do nothing;

alter table public.workflow_templates enable row level security;
alter table public.workflow_template_steps enable row level security;
alter table public.case_workflows enable row level security;
alter table public.case_tasks enable row level security;
alter table public.case_notes enable row level security;
alter table public.case_links enable row level security;
alter table public.case_blockers enable row level security;

create policy "staff read workflow templates" on public.workflow_templates
for select using (public.has_permission('cases.view') or public.is_super_admin());
create policy "staff manage workflow templates" on public.workflow_templates
for all using (public.has_permission('settings.manage') or public.is_super_admin())
with check (public.has_permission('settings.manage') or public.is_super_admin());

create policy "staff read workflow template steps" on public.workflow_template_steps
for select using (public.has_permission('cases.view') or public.is_super_admin());
create policy "staff manage workflow template steps" on public.workflow_template_steps
for all using (public.has_permission('settings.manage') or public.is_super_admin())
with check (public.has_permission('settings.manage') or public.is_super_admin());

create policy "staff read case workflows" on public.case_workflows
for select using (public.has_permission('cases.view') or public.is_case_assignee(case_id) or public.is_super_admin());
create policy "staff manage case workflows" on public.case_workflows
for all using (public.has_permission('cases.edit') or public.is_super_admin())
with check (public.has_permission('cases.edit') or public.is_super_admin());

create policy "staff read case tasks" on public.case_tasks
for select using (public.has_permission('cases.view') or assigned_to = auth.uid() or public.is_super_admin());
create policy "staff manage case tasks" on public.case_tasks
for all using (public.has_permission('cases.edit') or assigned_to = auth.uid() or public.is_super_admin())
with check (public.has_permission('cases.edit') or public.is_super_admin());

create policy "staff read case notes" on public.case_notes
for select using (
  (visibility = 'CLIENT_VISIBLE' and public.is_case_owner(case_id))
  or public.has_permission('cases.view')
  or public.is_case_assignee(case_id)
  or public.is_super_admin()
);
create policy "staff manage case notes" on public.case_notes
for all using (public.has_permission('cases.edit') or public.is_case_assignee(case_id) or public.is_super_admin())
with check (public.has_permission('cases.edit') or public.is_super_admin());

create policy "staff read case links" on public.case_links
for select using (public.has_permission('cases.view') or public.is_super_admin());
create policy "staff manage case links" on public.case_links
for all using (public.has_permission('cases.edit') or public.is_super_admin())
with check (public.has_permission('cases.edit') or public.is_super_admin());

create policy "staff read case blockers" on public.case_blockers
for select using (public.has_permission('cases.view') or public.is_super_admin());
create policy "staff manage case blockers" on public.case_blockers
for all using (public.has_permission('cases.edit') or public.is_super_admin())
with check (public.has_permission('cases.edit') or public.is_super_admin());
