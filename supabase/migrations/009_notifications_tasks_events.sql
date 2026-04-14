create type public.notification_channel as enum ('IN_APP', 'EMAIL');
create type public.notification_status as enum ('PENDING', 'SENT', 'FAILED', 'READ');
create type public.task_priority as enum ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL');
create type public.task_status as enum ('OPEN', 'IN_PROGRESS', 'BLOCKED', 'DONE', 'CANCELLED');

create table if not exists public.notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  channel public.notification_channel not null default 'IN_APP',
  status public.notification_status not null default 'PENDING',
  title text not null,
  body text not null,
  entity_type text,
  entity_id text,
  meta jsonb not null default '{}'::jsonb,
  scheduled_for timestamptz,
  sent_at timestamptz,
  read_at timestamptz,
  created_at timestamptz not null default now()
);

create table if not exists public.system_tasks (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text,
  priority public.task_priority not null default 'MEDIUM',
  status public.task_status not null default 'OPEN',
  due_at timestamptz,
  assigned_to uuid references auth.users(id) on delete set null,
  created_by uuid references auth.users(id) on delete set null,
  entity_type text,
  entity_id text,
  completed_at timestamptz,
  completion_notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.event_log (
  id uuid primary key default gen_random_uuid(),
  event_key text not null,
  event_type text not null,
  aggregate_type text not null,
  aggregate_id text not null,
  payload jsonb not null default '{}'::jsonb,
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now()
);

create table if not exists public.appointment_reminders (
  id uuid primary key default gen_random_uuid(),
  appointment_id uuid not null references public.appointments(id) on delete cascade,
  remind_at timestamptz not null,
  channel public.notification_channel not null default 'IN_APP',
  is_sent boolean not null default false,
  sent_at timestamptz,
  created_at timestamptz not null default now()
);

alter table public.appointments
  add column if not exists reminder_sent boolean not null default false,
  add column if not exists appointment_status text not null default 'SCHEDULED' check (appointment_status in ('SCHEDULED', 'CONFIRMED', 'RESCHEDULED', 'COMPLETED', 'CANCELLED'));

create index if not exists idx_notifications_user_status on public.notifications(user_id, status);
create index if not exists idx_system_tasks_assigned_status on public.system_tasks(assigned_to, status);
create index if not exists idx_event_log_event_key on public.event_log(event_key);
create index if not exists idx_appointment_reminders_appointment on public.appointment_reminders(appointment_id);

drop trigger if exists trg_system_tasks_updated_at on public.system_tasks;
create trigger trg_system_tasks_updated_at before update on public.system_tasks
for each row execute function public.set_updated_at();

alter table public.notifications enable row level security;
alter table public.system_tasks enable row level security;
alter table public.event_log enable row level security;
alter table public.appointment_reminders enable row level security;

create policy "user read own notifications" on public.notifications
for select using (user_id = auth.uid() or public.has_permission('messages.manage') or public.is_super_admin());
create policy "staff manage notifications" on public.notifications
for all using (public.has_permission('messages.manage') or public.is_super_admin())
with check (public.has_permission('messages.manage') or public.is_super_admin());

create policy "staff read tasks" on public.system_tasks
for select using (assigned_to = auth.uid() or public.has_permission('cases.view') or public.is_super_admin());
create policy "staff manage tasks" on public.system_tasks
for all using (created_by = auth.uid() or assigned_to = auth.uid() or public.has_permission('cases.edit') or public.is_super_admin())
with check (public.has_permission('cases.edit') or public.is_super_admin() or created_by = auth.uid());

create policy "staff read event log" on public.event_log
for select using (public.has_permission('settings.audit.view') or public.is_super_admin());
create policy "staff insert event log" on public.event_log
for insert with check (auth.uid() is not null);

create policy "staff read reminders" on public.appointment_reminders
for select using (public.has_permission('appointments.manage') or public.is_super_admin());
create policy "staff manage reminders" on public.appointment_reminders
for all using (public.has_permission('appointments.manage') or public.is_super_admin())
with check (public.has_permission('appointments.manage') or public.is_super_admin());
