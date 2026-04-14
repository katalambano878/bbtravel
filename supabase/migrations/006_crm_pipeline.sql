create type public.lead_activity_type as enum (
  'NOTE',
  'CALL',
  'EMAIL',
  'WHATSAPP',
  'TASK',
  'STATUS_CHANGE',
  'ASSIGNMENT'
);

create table if not exists public.lead_sources (
  id uuid primary key default gen_random_uuid(),
  source_key text not null unique,
  source_name text not null,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists public.crm_pipeline_stages (
  id uuid primary key default gen_random_uuid(),
  stage_key text not null unique,
  stage_name text not null,
  display_order int not null,
  is_terminal boolean not null default false,
  created_at timestamptz not null default now()
);

alter table public.leads
  add column if not exists source_key text references public.lead_sources(source_key) on delete set null,
  add column if not exists campaign text,
  add column if not exists budget_band text,
  add column if not exists urgency text,
  add column if not exists target_travel_date date,
  add column if not exists assigned_to uuid references auth.users(id) on delete set null,
  add column if not exists converted_client_id uuid references public.clients(id) on delete set null,
  add column if not exists converted_case_id uuid references public.cases(id) on delete set null,
  add column if not exists lost_reason text,
  add column if not exists dedupe_fingerprint text;

create table if not exists public.lead_activities (
  id uuid primary key default gen_random_uuid(),
  lead_id uuid not null references public.leads(id) on delete cascade,
  activity_type public.lead_activity_type not null,
  activity_note text,
  activity_meta jsonb not null default '{}'::jsonb,
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now()
);

create table if not exists public.lead_assignments (
  id uuid primary key default gen_random_uuid(),
  lead_id uuid not null references public.leads(id) on delete cascade,
  previous_owner uuid references auth.users(id) on delete set null,
  new_owner uuid references auth.users(id) on delete set null,
  assignment_mode text not null check (assignment_mode in ('ROUND_ROBIN', 'MANUAL', 'AUTO')),
  reason text,
  assigned_by uuid references auth.users(id) on delete set null,
  assigned_at timestamptz not null default now()
);

create table if not exists public.lead_duplicates (
  id uuid primary key default gen_random_uuid(),
  lead_id uuid not null references public.leads(id) on delete cascade,
  duplicate_of uuid not null references public.leads(id) on delete cascade,
  match_score numeric(5,2) not null,
  detection_meta jsonb not null default '{}'::jsonb,
  reviewed boolean not null default false,
  created_at timestamptz not null default now(),
  unique (lead_id, duplicate_of)
);

create index if not exists idx_leads_assigned_to on public.leads(assigned_to);
create index if not exists idx_leads_source_key on public.leads(source_key);
create index if not exists idx_lead_activities_lead_id on public.lead_activities(lead_id);
create index if not exists idx_lead_assignments_lead_id on public.lead_assignments(lead_id);

insert into public.lead_sources (source_key, source_name)
values
  ('website', 'Website'),
  ('referral', 'Referral'),
  ('social', 'Social Media'),
  ('walk_in', 'Walk In'),
  ('manual', 'Manual Entry')
on conflict (source_key) do nothing;

insert into public.crm_pipeline_stages (stage_key, stage_name, display_order, is_terminal)
values
  ('NEW', 'New', 1, false),
  ('CONTACTED', 'Contacted', 2, false),
  ('QUALIFIED', 'Qualified', 3, false),
  ('PROPOSAL', 'Proposal', 4, false),
  ('WON', 'Won', 5, true),
  ('LOST', 'Lost', 6, true)
on conflict (stage_key) do update
set stage_name = excluded.stage_name,
    display_order = excluded.display_order,
    is_terminal = excluded.is_terminal;

alter table public.lead_sources enable row level security;
alter table public.crm_pipeline_stages enable row level security;
alter table public.lead_activities enable row level security;
alter table public.lead_assignments enable row level security;
alter table public.lead_duplicates enable row level security;

create policy "staff read lead sources" on public.lead_sources
for select using (auth.uid() is not null);
create policy "staff manage lead sources" on public.lead_sources
for all using (public.has_permission('settings.manage') or public.is_super_admin())
with check (public.has_permission('settings.manage') or public.is_super_admin());

create policy "staff read crm stages" on public.crm_pipeline_stages
for select using (public.has_permission('crm.view') or public.has_permission('leads.view') or public.is_super_admin());
create policy "staff manage crm stages" on public.crm_pipeline_stages
for all using (public.has_permission('settings.manage') or public.is_super_admin())
with check (public.has_permission('settings.manage') or public.is_super_admin());

create policy "staff read lead activities" on public.lead_activities
for select using (public.has_permission('crm.view') or public.has_permission('leads.view') or public.is_super_admin());
create policy "staff create lead activities" on public.lead_activities
for insert with check (public.has_permission('crm.edit') or public.has_permission('leads.edit') or public.is_super_admin());

create policy "staff read lead assignments" on public.lead_assignments
for select using (public.has_permission('crm.view') or public.has_permission('leads.view') or public.is_super_admin());
create policy "staff create lead assignments" on public.lead_assignments
for insert with check (public.has_permission('crm.assign') or public.is_super_admin());

create policy "staff read lead duplicates" on public.lead_duplicates
for select using (public.has_permission('crm.view') or public.has_permission('leads.view') or public.is_super_admin());
create policy "staff manage lead duplicates" on public.lead_duplicates
for all using (public.has_permission('crm.edit') or public.is_super_admin())
with check (public.has_permission('crm.edit') or public.is_super_admin());
