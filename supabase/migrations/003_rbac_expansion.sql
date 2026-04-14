do $$
begin
  if not exists (
    select 1 from pg_type t
    join pg_enum e on t.oid = e.enumtypid
    where t.typname = 'staff_role' and e.enumlabel = 'operations_manager'
  ) then
    alter type public.staff_role add value 'operations_manager';
  end if;
  if not exists (
    select 1 from pg_type t
    join pg_enum e on t.oid = e.enumtypid
    where t.typname = 'staff_role' and e.enumlabel = 'finance_manager'
  ) then
    alter type public.staff_role add value 'finance_manager';
  end if;
  if not exists (
    select 1 from pg_type t
    join pg_enum e on t.oid = e.enumtypid
    where t.typname = 'staff_role' and e.enumlabel = 'accountant'
  ) then
    alter type public.staff_role add value 'accountant';
  end if;
  if not exists (
    select 1 from pg_type t
    join pg_enum e on t.oid = e.enumtypid
    where t.typname = 'staff_role' and e.enumlabel = 'hr_manager'
  ) then
    alter type public.staff_role add value 'hr_manager';
  end if;
  if not exists (
    select 1 from pg_type t
    join pg_enum e on t.oid = e.enumtypid
    where t.typname = 'staff_role' and e.enumlabel = 'hr_officer'
  ) then
    alter type public.staff_role add value 'hr_officer';
  end if;
  if not exists (
    select 1 from pg_type t
    join pg_enum e on t.oid = e.enumtypid
    where t.typname = 'staff_role' and e.enumlabel = 'auditor'
  ) then
    alter type public.staff_role add value 'auditor';
  end if;
  if not exists (
    select 1 from pg_type t
    join pg_enum e on t.oid = e.enumtypid
    where t.typname = 'staff_role' and e.enumlabel = 'read_only_analyst'
  ) then
    alter type public.staff_role add value 'read_only_analyst';
  end if;
end $$;

create table if not exists public.custom_roles (
  id uuid primary key default gen_random_uuid(),
  role_key text not null unique,
  role_name text not null,
  is_system boolean not null default false,
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.custom_role_permissions (
  id uuid primary key default gen_random_uuid(),
  custom_role_id uuid not null references public.custom_roles(id) on delete cascade,
  permission_id uuid not null references public.permissions(id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (custom_role_id, permission_id)
);

create table if not exists public.user_custom_roles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  custom_role_id uuid not null references public.custom_roles(id) on delete cascade,
  assigned_by uuid references auth.users(id) on delete set null,
  assigned_at timestamptz not null default now(),
  unique (user_id, custom_role_id)
);

alter table public.staff_profiles
  add column if not exists department text,
  add column if not exists manager_user_id uuid references auth.users(id) on delete set null,
  add column if not exists is_active boolean not null default true,
  add column if not exists last_login_at timestamptz,
  add column if not exists custom_title text;

create index if not exists idx_staff_profiles_manager on public.staff_profiles(manager_user_id);

insert into public.roles (role_key, role_name)
values
  ('super_admin', 'Super Admin'),
  ('operations_manager', 'Operations Manager'),
  ('case_manager', 'Case Manager'),
  ('visa_officer', 'Visa Officer'),
  ('recruitment_officer', 'Recruitment Officer'),
  ('study_abroad_officer', 'Study Abroad Officer'),
  ('tours_officer', 'Tours Officer'),
  ('finance_manager', 'Finance Manager'),
  ('accountant', 'Accountant'),
  ('hr_manager', 'HR Manager'),
  ('hr_officer', 'HR Officer'),
  ('customer_support', 'Customer Support'),
  ('auditor', 'Auditor'),
  ('read_only_analyst', 'Read-only Analyst'),
  ('finance', 'Finance (Legacy)')
on conflict (role_key) do update set role_name = excluded.role_name;

insert into public.permissions (permission_key, description)
values
  ('crm.view', 'View CRM records'),
  ('crm.create', 'Create CRM records'),
  ('crm.edit', 'Edit CRM records'),
  ('crm.assign', 'Assign CRM leads'),
  ('crm.convert', 'Convert leads to clients/cases'),
  ('cases.view', 'View cases'),
  ('cases.create', 'Create cases'),
  ('cases.edit', 'Edit cases'),
  ('cases.status.change_owner', 'Change case status/owner'),
  ('cases.approve', 'Approve case milestones'),
  ('documents.view', 'View documents'),
  ('documents.upload', 'Upload documents'),
  ('documents.review', 'Review documents'),
  ('documents.approve', 'Approve documents'),
  ('documents.reject', 'Reject documents'),
  ('finance.view', 'View finance module'),
  ('finance.invoice.create', 'Create invoices'),
  ('finance.payment.record', 'Record payments'),
  ('finance.expense.approve', 'Approve expenses'),
  ('finance.refund.process', 'Process refunds'),
  ('hr.view', 'View HR module'),
  ('hr.staff.manage', 'Manage staff records'),
  ('hr.leave.approve', 'Approve leave requests'),
  ('hr.payroll.manage', 'Manage payroll inputs'),
  ('hr.performance.manage', 'Manage performance cycle'),
  ('reports.view', 'View reports'),
  ('reports.export', 'Export reports'),
  ('reports.scheduled', 'Schedule reports'),
  ('settings.manage', 'Manage system settings'),
  ('settings.rbac.manage', 'Manage RBAC'),
  ('settings.audit.view', 'View audit logs'),
  ('dashboard.view', 'View dashboard'),
  ('appointments.manage', 'Manage appointments'),
  ('messages.manage', 'Manage case messages'),
  ('content.manage', 'Manage CMS content'),
  ('tours.manage', 'Manage tour inventory')
on conflict (permission_key) do nothing;

create or replace function public.has_permission(permission_key text)
returns boolean
language sql
stable
as $$
  select public.is_super_admin() or exists (
    select 1
    from public.staff_profiles sp
    join public.roles r on r.role_key = sp.role
    join public.role_permissions rp on rp.role_id = r.id
    join public.permissions p on p.id = rp.permission_id
    where sp.user_id = auth.uid()
      and p.permission_key = has_permission.permission_key
  ) or exists (
    select 1
    from public.user_custom_roles ucr
    join public.custom_role_permissions crp on crp.custom_role_id = ucr.custom_role_id
    join public.permissions p on p.id = crp.permission_id
    where ucr.user_id = auth.uid()
      and p.permission_key = has_permission.permission_key
  );
$$;

alter table public.custom_roles enable row level security;
alter table public.custom_role_permissions enable row level security;
alter table public.user_custom_roles enable row level security;

create policy "staff read custom roles" on public.custom_roles
for select using (public.has_permission('settings.rbac.manage') or public.is_super_admin());

create policy "staff manage custom roles" on public.custom_roles
for all using (public.has_permission('settings.rbac.manage') or public.is_super_admin())
with check (public.has_permission('settings.rbac.manage') or public.is_super_admin());

create policy "staff read custom role permissions" on public.custom_role_permissions
for select using (public.has_permission('settings.rbac.manage') or public.is_super_admin());

create policy "staff manage custom role permissions" on public.custom_role_permissions
for all using (public.has_permission('settings.rbac.manage') or public.is_super_admin())
with check (public.has_permission('settings.rbac.manage') or public.is_super_admin());

create policy "staff read user custom roles" on public.user_custom_roles
for select using (public.has_permission('settings.rbac.manage') or public.is_super_admin());

create policy "staff manage user custom roles" on public.user_custom_roles
for all using (public.has_permission('settings.rbac.manage') or public.is_super_admin())
with check (public.has_permission('settings.rbac.manage') or public.is_super_admin());
