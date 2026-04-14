create table if not exists public.staff_login_events (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete set null,
  email text,
  ip_address text,
  user_agent text,
  login_status text not null check (login_status in ('SUCCESS', 'FAILED', 'LOCKED')),
  failure_reason text,
  created_at timestamptz not null default now()
);

create table if not exists public.staff_login_attempts (
  id uuid primary key default gen_random_uuid(),
  email text not null unique,
  failed_attempts int not null default 0 check (failed_attempts >= 0),
  last_attempt_at timestamptz,
  locked_until timestamptz,
  updated_at timestamptz not null default now()
);

create table if not exists public.auth_security_policies (
  id int primary key default 1 check (id = 1),
  max_failed_attempts int not null default 5 check (max_failed_attempts between 3 and 20),
  lockout_minutes int not null default 15 check (lockout_minutes between 5 and 240),
  min_password_length int not null default 8 check (min_password_length between 8 and 128),
  require_mfa boolean not null default false,
  suspicious_login_alert boolean not null default true,
  updated_at timestamptz not null default now()
);

insert into public.auth_security_policies (id)
values (1)
on conflict (id) do nothing;

create index if not exists idx_staff_login_events_user_created on public.staff_login_events(user_id, created_at desc);
create index if not exists idx_staff_login_events_email_created on public.staff_login_events(email, created_at desc);

drop trigger if exists trg_staff_login_attempts_updated_at on public.staff_login_attempts;
create trigger trg_staff_login_attempts_updated_at
before update on public.staff_login_attempts
for each row execute function public.set_updated_at();

drop trigger if exists trg_auth_security_policies_updated_at on public.auth_security_policies;
create trigger trg_auth_security_policies_updated_at
before update on public.auth_security_policies
for each row execute function public.set_updated_at();

alter table public.staff_login_events enable row level security;
alter table public.staff_login_attempts enable row level security;
alter table public.auth_security_policies enable row level security;

create policy "staff read login events" on public.staff_login_events
for select using (public.has_permission('settings.audit.view') or public.is_super_admin());

create policy "service create login events" on public.staff_login_events
for insert with check (auth.uid() is not null or public.is_super_admin());

create policy "super admin manage login attempts" on public.staff_login_attempts
for all using (public.has_permission('settings.rbac.manage') or public.is_super_admin())
with check (public.has_permission('settings.rbac.manage') or public.is_super_admin());

create policy "super admin manage auth security policy" on public.auth_security_policies
for all using (public.has_permission('settings.rbac.manage') or public.is_super_admin())
with check (public.has_permission('settings.rbac.manage') or public.is_super_admin());
