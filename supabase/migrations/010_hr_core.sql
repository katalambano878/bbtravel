create table if not exists public.departments (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,
  name text not null,
  description text,
  head_user_id uuid references auth.users(id) on delete set null,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.teams (
  id uuid primary key default gen_random_uuid(),
  department_id uuid not null references public.departments(id) on delete cascade,
  code text not null unique,
  name text not null,
  lead_user_id uuid references auth.users(id) on delete set null,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.employee_records (
  id uuid primary key default gen_random_uuid(),
  user_id uuid unique references auth.users(id) on delete set null,
  staff_profile_user_id uuid references public.staff_profiles(user_id) on delete set null,
  employee_code text not null unique,
  department_id uuid references public.departments(id) on delete set null,
  team_id uuid references public.teams(id) on delete set null,
  job_title text not null,
  employment_type text not null default 'FULL_TIME' check (employment_type in ('FULL_TIME', 'PART_TIME', 'CONTRACT', 'INTERN')),
  contract_start_date date,
  contract_end_date date,
  manager_user_id uuid references auth.users(id) on delete set null,
  base_salary numeric(12,2) not null default 0,
  currency text not null default 'GHS',
  emergency_contact_name text,
  emergency_contact_phone text,
  status text not null default 'ACTIVE' check (status in ('ACTIVE', 'INACTIVE', 'SUSPENDED', 'TERMINATED')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.hr_documents (
  id uuid primary key default gen_random_uuid(),
  employee_id uuid not null references public.employee_records(id) on delete cascade,
  doc_type text not null,
  file_url text not null,
  notes text,
  uploaded_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now()
);

drop trigger if exists trg_departments_updated_at on public.departments;
create trigger trg_departments_updated_at before update on public.departments for each row execute function public.set_updated_at();
drop trigger if exists trg_teams_updated_at on public.teams;
create trigger trg_teams_updated_at before update on public.teams for each row execute function public.set_updated_at();
drop trigger if exists trg_employee_records_updated_at on public.employee_records;
create trigger trg_employee_records_updated_at before update on public.employee_records for each row execute function public.set_updated_at();

alter table public.departments enable row level security;
alter table public.teams enable row level security;
alter table public.employee_records enable row level security;
alter table public.hr_documents enable row level security;

create policy "hr read departments" on public.departments
for select using (public.has_permission('hr.view') or public.is_super_admin());
create policy "hr manage departments" on public.departments
for all using (public.has_permission('hr.staff.manage') or public.is_super_admin())
with check (public.has_permission('hr.staff.manage') or public.is_super_admin());

create policy "hr read teams" on public.teams
for select using (public.has_permission('hr.view') or public.is_super_admin());
create policy "hr manage teams" on public.teams
for all using (public.has_permission('hr.staff.manage') or public.is_super_admin())
with check (public.has_permission('hr.staff.manage') or public.is_super_admin());

create policy "hr read employee records" on public.employee_records
for select using (public.has_permission('hr.view') or public.is_super_admin());
create policy "hr manage employee records" on public.employee_records
for all using (public.has_permission('hr.staff.manage') or public.is_super_admin())
with check (public.has_permission('hr.staff.manage') or public.is_super_admin());

create policy "hr read documents" on public.hr_documents
for select using (public.has_permission('hr.view') or public.is_super_admin());
create policy "hr manage documents" on public.hr_documents
for all using (public.has_permission('hr.staff.manage') or public.is_super_admin())
with check (public.has_permission('hr.staff.manage') or public.is_super_admin());
