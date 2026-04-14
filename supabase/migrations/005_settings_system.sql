create table if not exists public.branch_offices (
  id uuid primary key default gen_random_uuid(),
  branch_code text not null unique,
  branch_name text not null,
  address text,
  city text,
  country text not null default 'Ghana',
  phone text,
  email text,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.system_settings (
  id int primary key default 1 check (id = 1),
  company_profile jsonb not null default '{}'::jsonb,
  branch_policy jsonb not null default '{"mode":"single"}'::jsonb,
  approval_thresholds jsonb not null default '{}'::jsonb,
  data_retention jsonb not null default '{}'::jsonb,
  notification_defaults jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

create table if not exists public.approval_policies (
  id uuid primary key default gen_random_uuid(),
  policy_key text not null unique,
  module text not null,
  min_amount numeric(12,2),
  max_amount numeric(12,2),
  required_permission text not null,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.retention_policies (
  id uuid primary key default gen_random_uuid(),
  entity_name text not null unique,
  retention_days int not null check (retention_days > 0),
  archive_enabled boolean not null default false,
  soft_delete_enabled boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

insert into public.system_settings (id)
values (1)
on conflict (id) do nothing;

insert into public.branch_offices (branch_code, branch_name, address, city, country, is_active)
values ('HQ-ACCRA', 'Accra Headquarters', 'Teshie First Junction, CBG Bank Building, First Floor', 'Accra', 'Ghana', true)
on conflict (branch_code) do nothing;

insert into public.approval_policies (policy_key, module, min_amount, max_amount, required_permission)
values
  ('finance.expense.tier1', 'finance', 0, 999.99, 'finance.expense.approve'),
  ('finance.expense.tier2', 'finance', 1000, 999999999, 'settings.manage'),
  ('hr.leave.standard', 'hr', null, null, 'hr.leave.approve')
on conflict (policy_key) do nothing;

insert into public.retention_policies (entity_name, retention_days, archive_enabled, soft_delete_enabled)
values
  ('audit_logs', 2555, true, false),
  ('staff_login_events', 365, true, false),
  ('notifications', 365, true, true),
  ('system_tasks', 365, true, true)
on conflict (entity_name) do nothing;

drop trigger if exists trg_branch_offices_updated_at on public.branch_offices;
create trigger trg_branch_offices_updated_at
before update on public.branch_offices
for each row execute function public.set_updated_at();

drop trigger if exists trg_system_settings_updated_at on public.system_settings;
create trigger trg_system_settings_updated_at
before update on public.system_settings
for each row execute function public.set_updated_at();

drop trigger if exists trg_approval_policies_updated_at on public.approval_policies;
create trigger trg_approval_policies_updated_at
before update on public.approval_policies
for each row execute function public.set_updated_at();

drop trigger if exists trg_retention_policies_updated_at on public.retention_policies;
create trigger trg_retention_policies_updated_at
before update on public.retention_policies
for each row execute function public.set_updated_at();

alter table public.branch_offices enable row level security;
alter table public.system_settings enable row level security;
alter table public.approval_policies enable row level security;
alter table public.retention_policies enable row level security;

create policy "staff read branch offices" on public.branch_offices
for select using (auth.uid() is not null);

create policy "staff manage branch offices" on public.branch_offices
for all using (public.has_permission('settings.manage') or public.is_super_admin())
with check (public.has_permission('settings.manage') or public.is_super_admin());

create policy "staff read system settings" on public.system_settings
for select using (public.has_permission('dashboard.view') or public.is_super_admin());

create policy "staff manage system settings" on public.system_settings
for all using (public.has_permission('settings.manage') or public.is_super_admin())
with check (public.has_permission('settings.manage') or public.is_super_admin());

create policy "staff read approval policies" on public.approval_policies
for select using (public.has_permission('settings.manage') or public.is_super_admin());

create policy "staff manage approval policies" on public.approval_policies
for all using (public.has_permission('settings.manage') or public.is_super_admin())
with check (public.has_permission('settings.manage') or public.is_super_admin());

create policy "staff read retention policies" on public.retention_policies
for select using (public.has_permission('settings.manage') or public.is_super_admin());

create policy "staff manage retention policies" on public.retention_policies
for all using (public.has_permission('settings.manage') or public.is_super_admin())
with check (public.has_permission('settings.manage') or public.is_super_admin());
