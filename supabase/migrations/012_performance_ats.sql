create table if not exists public.performance_cycles (
  id uuid primary key default gen_random_uuid(),
  cycle_key text not null unique,
  cycle_name text not null,
  start_date date not null,
  end_date date not null,
  status text not null default 'OPEN' check (status in ('OPEN', 'LOCKED', 'CLOSED')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.performance_goals (
  id uuid primary key default gen_random_uuid(),
  employee_id uuid not null references public.employee_records(id) on delete cascade,
  cycle_id uuid not null references public.performance_cycles(id) on delete cascade,
  goal_title text not null,
  goal_description text,
  weight numeric(5,2) not null default 1,
  target_value text,
  achieved_value text,
  status text not null default 'OPEN' check (status in ('OPEN', 'ON_TRACK', 'AT_RISK', 'ACHIEVED', 'MISSED')),
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.performance_reviews (
  id uuid primary key default gen_random_uuid(),
  employee_id uuid not null references public.employee_records(id) on delete cascade,
  cycle_id uuid not null references public.performance_cycles(id) on delete cascade,
  reviewer_user_id uuid references auth.users(id) on delete set null,
  score numeric(5,2),
  strengths text,
  improvement_areas text,
  manager_comments text,
  employee_comments text,
  submitted_at timestamptz,
  created_at timestamptz not null default now(),
  unique (employee_id, cycle_id)
);

create table if not exists public.internal_candidates (
  id uuid primary key default gen_random_uuid(),
  full_name text not null,
  email text,
  phone text,
  applying_for text not null,
  source text,
  stage text not null default 'NEW' check (stage in ('NEW', 'SCREENING', 'INTERVIEW', 'OFFER', 'HIRED', 'REJECTED')),
  assigned_recruiter uuid references auth.users(id) on delete set null,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.internal_candidate_interviews (
  id uuid primary key default gen_random_uuid(),
  candidate_id uuid not null references public.internal_candidates(id) on delete cascade,
  interviewer_user_id uuid references auth.users(id) on delete set null,
  scheduled_at timestamptz,
  outcome text,
  interview_notes text,
  created_at timestamptz not null default now()
);

drop trigger if exists trg_performance_cycles_updated_at on public.performance_cycles;
create trigger trg_performance_cycles_updated_at before update on public.performance_cycles for each row execute function public.set_updated_at();
drop trigger if exists trg_performance_goals_updated_at on public.performance_goals;
create trigger trg_performance_goals_updated_at before update on public.performance_goals for each row execute function public.set_updated_at();
drop trigger if exists trg_internal_candidates_updated_at on public.internal_candidates;
create trigger trg_internal_candidates_updated_at before update on public.internal_candidates for each row execute function public.set_updated_at();

alter table public.performance_cycles enable row level security;
alter table public.performance_goals enable row level security;
alter table public.performance_reviews enable row level security;
alter table public.internal_candidates enable row level security;
alter table public.internal_candidate_interviews enable row level security;

create policy "hr read performance cycles" on public.performance_cycles
for select using (public.has_permission('hr.view') or public.is_super_admin());
create policy "hr manage performance cycles" on public.performance_cycles
for all using (public.has_permission('hr.performance.manage') or public.is_super_admin())
with check (public.has_permission('hr.performance.manage') or public.is_super_admin());

create policy "hr read performance goals" on public.performance_goals
for select using (public.has_permission('hr.view') or public.is_super_admin());
create policy "hr manage performance goals" on public.performance_goals
for all using (public.has_permission('hr.performance.manage') or public.is_super_admin())
with check (public.has_permission('hr.performance.manage') or public.is_super_admin());

create policy "hr read performance reviews" on public.performance_reviews
for select using (public.has_permission('hr.view') or public.is_super_admin());
create policy "hr manage performance reviews" on public.performance_reviews
for all using (public.has_permission('hr.performance.manage') or public.is_super_admin())
with check (public.has_permission('hr.performance.manage') or public.is_super_admin());

create policy "hr read internal candidates" on public.internal_candidates
for select using (public.has_permission('hr.view') or public.is_super_admin());
create policy "hr manage internal candidates" on public.internal_candidates
for all using (public.has_permission('hr.staff.manage') or public.is_super_admin())
with check (public.has_permission('hr.staff.manage') or public.is_super_admin());

create policy "hr read candidate interviews" on public.internal_candidate_interviews
for select using (public.has_permission('hr.view') or public.is_super_admin());
create policy "hr manage candidate interviews" on public.internal_candidate_interviews
for all using (public.has_permission('hr.staff.manage') or public.is_super_admin())
with check (public.has_permission('hr.staff.manage') or public.is_super_admin());
