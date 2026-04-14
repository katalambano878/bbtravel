create type public.attendance_status as enum ('PRESENT', 'LATE', 'ABSENT', 'HALF_DAY', 'LEAVE');
create type public.leave_status as enum ('PENDING', 'APPROVED', 'REJECTED', 'CANCELLED');

create table if not exists public.shift_definitions (
  id uuid primary key default gen_random_uuid(),
  shift_key text not null unique,
  shift_name text not null,
  start_time time not null,
  end_time time not null,
  grace_minutes int not null default 10,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists public.attendance_records (
  id uuid primary key default gen_random_uuid(),
  employee_id uuid not null references public.employee_records(id) on delete cascade,
  attendance_date date not null,
  shift_id uuid references public.shift_definitions(id) on delete set null,
  clock_in timestamptz,
  clock_out timestamptz,
  status public.attendance_status not null default 'PRESENT',
  notes text,
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  unique (employee_id, attendance_date)
);

create table if not exists public.leave_types (
  id uuid primary key default gen_random_uuid(),
  leave_key text not null unique,
  leave_name text not null,
  annual_quota_days numeric(6,2) not null default 0,
  paid_leave boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists public.leave_balances (
  id uuid primary key default gen_random_uuid(),
  employee_id uuid not null references public.employee_records(id) on delete cascade,
  leave_type_id uuid not null references public.leave_types(id) on delete cascade,
  balance_days numeric(6,2) not null default 0,
  period_year int not null,
  updated_at timestamptz not null default now(),
  unique (employee_id, leave_type_id, period_year)
);

create table if not exists public.leave_requests (
  id uuid primary key default gen_random_uuid(),
  employee_id uuid not null references public.employee_records(id) on delete cascade,
  leave_type_id uuid not null references public.leave_types(id) on delete cascade,
  start_date date not null,
  end_date date not null,
  requested_days numeric(6,2) not null,
  status public.leave_status not null default 'PENDING',
  reason text,
  approver_user_id uuid references auth.users(id) on delete set null,
  approver_notes text,
  decision_at timestamptz,
  created_at timestamptz not null default now()
);

create table if not exists public.payroll_periods (
  id uuid primary key default gen_random_uuid(),
  period_key text not null unique,
  period_start date not null,
  period_end date not null,
  status text not null default 'OPEN' check (status in ('OPEN', 'LOCKED', 'CLOSED')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.payroll_inputs (
  id uuid primary key default gen_random_uuid(),
  payroll_period_id uuid not null references public.payroll_periods(id) on delete cascade,
  employee_id uuid not null references public.employee_records(id) on delete cascade,
  base_salary numeric(12,2) not null default 0,
  allowances numeric(12,2) not null default 0,
  deductions numeric(12,2) not null default 0,
  overtime_amount numeric(12,2) not null default 0,
  net_amount numeric(12,2) generated always as (base_salary + allowances + overtime_amount - deductions) stored,
  notes text,
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  unique (payroll_period_id, employee_id)
);

create index if not exists idx_attendance_employee_date on public.attendance_records(employee_id, attendance_date);
create index if not exists idx_leave_requests_employee on public.leave_requests(employee_id);
create index if not exists idx_payroll_inputs_period on public.payroll_inputs(payroll_period_id);

drop trigger if exists trg_leave_balances_updated_at on public.leave_balances;
create trigger trg_leave_balances_updated_at before update on public.leave_balances for each row execute function public.set_updated_at();
drop trigger if exists trg_payroll_periods_updated_at on public.payroll_periods;
create trigger trg_payroll_periods_updated_at before update on public.payroll_periods for each row execute function public.set_updated_at();

insert into public.leave_types (leave_key, leave_name, annual_quota_days, paid_leave)
values
  ('annual', 'Annual Leave', 21, true),
  ('sick', 'Sick Leave', 10, true),
  ('unpaid', 'Unpaid Leave', 365, false)
on conflict (leave_key) do nothing;

alter table public.shift_definitions enable row level security;
alter table public.attendance_records enable row level security;
alter table public.leave_types enable row level security;
alter table public.leave_balances enable row level security;
alter table public.leave_requests enable row level security;
alter table public.payroll_periods enable row level security;
alter table public.payroll_inputs enable row level security;

create policy "hr read shift definitions" on public.shift_definitions
for select using (public.has_permission('hr.view') or public.is_super_admin());
create policy "hr manage shift definitions" on public.shift_definitions
for all using (public.has_permission('hr.staff.manage') or public.is_super_admin())
with check (public.has_permission('hr.staff.manage') or public.is_super_admin());

create policy "hr read attendance" on public.attendance_records
for select using (public.has_permission('hr.view') or public.is_super_admin());
create policy "hr manage attendance" on public.attendance_records
for all using (public.has_permission('hr.staff.manage') or public.is_super_admin())
with check (public.has_permission('hr.staff.manage') or public.is_super_admin());

create policy "hr read leave types" on public.leave_types
for select using (public.has_permission('hr.view') or public.is_super_admin());
create policy "hr manage leave types" on public.leave_types
for all using (public.has_permission('hr.staff.manage') or public.is_super_admin())
with check (public.has_permission('hr.staff.manage') or public.is_super_admin());

create policy "hr read leave balances" on public.leave_balances
for select using (public.has_permission('hr.view') or public.is_super_admin());
create policy "hr manage leave balances" on public.leave_balances
for all using (public.has_permission('hr.staff.manage') or public.is_super_admin())
with check (public.has_permission('hr.staff.manage') or public.is_super_admin());

create policy "hr read leave requests" on public.leave_requests
for select using (public.has_permission('hr.view') or public.is_super_admin());
create policy "hr manage leave requests" on public.leave_requests
for all using (public.has_permission('hr.leave.approve') or public.has_permission('hr.staff.manage') or public.is_super_admin())
with check (public.has_permission('hr.leave.approve') or public.has_permission('hr.staff.manage') or public.is_super_admin());

create policy "hr read payroll periods" on public.payroll_periods
for select using (public.has_permission('hr.view') or public.has_permission('hr.payroll.manage') or public.is_super_admin());
create policy "hr manage payroll periods" on public.payroll_periods
for all using (public.has_permission('hr.payroll.manage') or public.is_super_admin())
with check (public.has_permission('hr.payroll.manage') or public.is_super_admin());

create policy "hr read payroll inputs" on public.payroll_inputs
for select using (public.has_permission('hr.view') or public.has_permission('hr.payroll.manage') or public.is_super_admin());
create policy "hr manage payroll inputs" on public.payroll_inputs
for all using (public.has_permission('hr.payroll.manage') or public.is_super_admin())
with check (public.has_permission('hr.payroll.manage') or public.is_super_admin());
