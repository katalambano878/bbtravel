-- B.B. Travel Consult initial schema
create extension if not exists "pgcrypto";

create type public.service_type as enum (
  'VISA_ASSISTANCE',
  'INTERNATIONAL_RECRUITMENT',
  'STUDY_ABROAD',
  'TOUR_PACKAGE',
  'BUSINESS_EXPORT'
);

create type public.lead_stage as enum ('NEW', 'CONTACTED', 'QUALIFIED', 'CONVERTED', 'CLOSED');

create type public.case_status as enum (
  'SUBMITTED',
  'UNDER_REVIEW',
  'AWAITING_DOCUMENTS',
  'APPOINTMENT_BOOKED',
  'PROCESSING',
  'DECISION_RECEIVED',
  'COMPLETED',
  'ON_HOLD'
);

create type public.step_status as enum ('PENDING', 'IN_PROGRESS', 'COMPLETED');

create type public.document_status as enum ('PENDING', 'APPROVED', 'REJECTED');

create type public.staff_role as enum (
  'super_admin',
  'case_manager',
  'visa_officer',
  'recruitment_officer',
  'study_abroad_officer',
  'tours_officer',
  'customer_support',
  'finance'
);

create table if not exists public.roles (
  id uuid primary key default gen_random_uuid(),
  role_key public.staff_role not null unique,
  role_name text not null,
  created_at timestamptz not null default now()
);

create table if not exists public.permissions (
  id uuid primary key default gen_random_uuid(),
  permission_key text not null unique,
  description text,
  created_at timestamptz not null default now()
);

create table if not exists public.role_permissions (
  id uuid primary key default gen_random_uuid(),
  role_id uuid not null references public.roles(id) on delete cascade,
  permission_id uuid not null references public.permissions(id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (role_id, permission_id)
);

create table if not exists public.staff_profiles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  full_name text not null,
  role public.staff_role not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.clients (
  id uuid primary key default gen_random_uuid(),
  user_id uuid unique references auth.users(id) on delete set null,
  name text not null,
  phone text,
  email text unique not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.leads (
  id uuid primary key default gen_random_uuid(),
  service_type public.service_type not null,
  stage public.lead_stage not null default 'NEW',
  name text not null,
  phone text,
  email text not null,
  destination text,
  timeline text,
  notes text,
  created_at timestamptz not null default now()
);

create table if not exists public.cases (
  id uuid primary key default gen_random_uuid(),
  client_id uuid not null references public.clients(id) on delete cascade,
  case_type public.service_type not null,
  status public.case_status not null default 'SUBMITTED',
  assigned_to uuid references auth.users(id) on delete set null,
  meta jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.case_steps (
  id uuid primary key default gen_random_uuid(),
  case_id uuid not null references public.cases(id) on delete cascade,
  step_key text not null,
  title text not null,
  status public.step_status not null default 'PENDING',
  due_date date,
  notes text,
  created_at timestamptz not null default now(),
  unique (case_id, step_key)
);

create table if not exists public.documents (
  id uuid primary key default gen_random_uuid(),
  case_id uuid not null references public.cases(id) on delete cascade,
  doc_type text not null,
  file_url text not null,
  status public.document_status not null default 'PENDING',
  reviewer_notes text,
  uploaded_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now()
);

create table if not exists public.appointments (
  id uuid primary key default gen_random_uuid(),
  case_id uuid not null references public.cases(id) on delete cascade,
  scheduled_at timestamptz not null,
  location text,
  notes text,
  created_at timestamptz not null default now()
);

create table if not exists public.case_messages (
  id uuid primary key default gen_random_uuid(),
  case_id uuid not null references public.cases(id) on delete cascade,
  sender_id uuid references auth.users(id) on delete set null,
  message text not null,
  is_internal boolean not null default false,
  created_at timestamptz not null default now()
);

create table if not exists public.tours (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  slug text not null unique,
  price numeric(10,2) not null default 0,
  duration text not null,
  itinerary jsonb not null default '[]'::jsonb,
  inclusions text[] not null default '{}',
  images jsonb not null default '[]'::jsonb,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.testimonials (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  quote text not null,
  rating int not null default 5 check (rating between 1 and 5),
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists public.blog_posts (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  slug text not null unique,
  excerpt text,
  content text not null,
  cover_image_url text,
  is_published boolean not null default false,
  published_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.site_settings (
  id int primary key default 1 check (id = 1),
  contacts jsonb not null default '{}'::jsonb,
  socials jsonb not null default '{}'::jsonb,
  seo_defaults jsonb not null default '{}'::jsonb,
  feature_flags jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

create table if not exists public.audit_logs (
  id uuid primary key default gen_random_uuid(),
  actor_id uuid references auth.users(id) on delete set null,
  action text not null,
  target_type text not null,
  target_id text not null,
  payload jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists idx_cases_client_id on public.cases(client_id);
create index if not exists idx_cases_assigned_to on public.cases(assigned_to);
create index if not exists idx_documents_case_id on public.documents(case_id);
create index if not exists idx_case_steps_case_id on public.case_steps(case_id);
create index if not exists idx_appointments_case_id on public.appointments(case_id);
create index if not exists idx_leads_stage on public.leads(stage);

create or replace function public.set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists trg_staff_profiles_updated_at on public.staff_profiles;
create trigger trg_staff_profiles_updated_at before update on public.staff_profiles
for each row execute function public.set_updated_at();

drop trigger if exists trg_clients_updated_at on public.clients;
create trigger trg_clients_updated_at before update on public.clients
for each row execute function public.set_updated_at();

drop trigger if exists trg_cases_updated_at on public.cases;
create trigger trg_cases_updated_at before update on public.cases
for each row execute function public.set_updated_at();

drop trigger if exists trg_tours_updated_at on public.tours;
create trigger trg_tours_updated_at before update on public.tours
for each row execute function public.set_updated_at();

drop trigger if exists trg_blog_posts_updated_at on public.blog_posts;
create trigger trg_blog_posts_updated_at before update on public.blog_posts
for each row execute function public.set_updated_at();

drop trigger if exists trg_site_settings_updated_at on public.site_settings;
create trigger trg_site_settings_updated_at before update on public.site_settings
for each row execute function public.set_updated_at();

create or replace function public.is_super_admin()
returns boolean
language sql
stable
as $$
  select exists (
    select 1
    from public.staff_profiles sp
    where sp.user_id = auth.uid()
      and sp.role = 'super_admin'
  );
$$;

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
  );
$$;

create or replace function public.is_case_assignee(case_id uuid)
returns boolean
language sql
stable
as $$
  select exists (
    select 1 from public.cases c where c.id = is_case_assignee.case_id and c.assigned_to = auth.uid()
  );
$$;

create or replace function public.is_case_owner(case_id uuid)
returns boolean
language sql
stable
as $$
  select exists (
    select 1
    from public.cases c
    join public.clients cl on cl.id = c.client_id
    where c.id = is_case_owner.case_id
      and cl.user_id = auth.uid()
  );
$$;

alter table public.roles enable row level security;
alter table public.permissions enable row level security;
alter table public.role_permissions enable row level security;
alter table public.staff_profiles enable row level security;
alter table public.clients enable row level security;
alter table public.leads enable row level security;
alter table public.cases enable row level security;
alter table public.case_steps enable row level security;
alter table public.documents enable row level security;
alter table public.appointments enable row level security;
alter table public.case_messages enable row level security;
alter table public.tours enable row level security;
alter table public.testimonials enable row level security;
alter table public.blog_posts enable row level security;
alter table public.site_settings enable row level security;
alter table public.audit_logs enable row level security;

create policy "staff read roles" on public.roles for select using (public.is_super_admin() or public.has_permission('staff.manage'));
create policy "staff read permissions" on public.permissions for select using (public.is_super_admin() or public.has_permission('staff.manage'));
create policy "staff read role_permissions" on public.role_permissions for select using (public.is_super_admin() or public.has_permission('staff.manage'));
create policy "super admin manage role_permissions" on public.role_permissions for all using (public.is_super_admin()) with check (public.is_super_admin());

create policy "staff profile self read" on public.staff_profiles for select using (user_id = auth.uid() or public.is_super_admin());
create policy "super admin manage staff profiles" on public.staff_profiles for all using (public.is_super_admin()) with check (public.is_super_admin());

create policy "client own profile read" on public.clients for select using (user_id = auth.uid());
create policy "client own profile update" on public.clients for update using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy "staff manage clients" on public.clients for all using (public.has_permission('cases.view') or public.is_super_admin()) with check (public.has_permission('cases.edit') or public.is_super_admin());

create policy "staff manage leads" on public.leads for all using (public.has_permission('leads.view') or public.is_super_admin()) with check (public.has_permission('leads.edit') or public.is_super_admin());

create policy "client read own cases" on public.cases for select using (public.is_case_owner(id));
create policy "client insert own cases" on public.cases for insert with check (
  exists (select 1 from public.clients cl where cl.id = client_id and cl.user_id = auth.uid())
);
create policy "staff read cases" on public.cases for select using (public.has_permission('cases.view') or public.is_case_assignee(id) or public.is_super_admin());
create policy "staff manage cases" on public.cases for all using (public.has_permission('cases.edit') or public.is_case_assignee(id) or public.is_super_admin()) with check (public.has_permission('cases.edit') or public.is_super_admin());

create policy "client read case steps" on public.case_steps for select using (public.is_case_owner(case_id));
create policy "staff manage case steps" on public.case_steps for all using (public.has_permission('cases.view') or public.is_case_assignee(case_id) or public.is_super_admin()) with check (public.has_permission('cases.edit') or public.is_super_admin());

create policy "client read own documents" on public.documents for select using (public.is_case_owner(case_id));
create policy "client upload documents" on public.documents for insert with check (public.is_case_owner(case_id));
create policy "staff review documents" on public.documents for update using (public.has_permission('documents.review') or public.is_case_assignee(case_id) or public.is_super_admin()) with check (public.has_permission('documents.review') or public.is_super_admin());
create policy "staff read documents" on public.documents for select using (public.has_permission('cases.view') or public.is_case_assignee(case_id) or public.is_super_admin());

create policy "client read appointments" on public.appointments for select using (public.is_case_owner(case_id));
create policy "staff manage appointments" on public.appointments for all using (public.has_permission('appointments.manage') or public.is_super_admin()) with check (public.has_permission('appointments.manage') or public.is_super_admin());

create policy "client read messages" on public.case_messages for select using (public.is_case_owner(case_id) and is_internal = false);
create policy "staff read messages" on public.case_messages for select using (public.has_permission('messages.manage') or public.is_case_assignee(case_id) or public.is_super_admin());
create policy "staff send messages" on public.case_messages for insert with check (public.has_permission('messages.manage') or public.is_super_admin());

create policy "public read active tours" on public.tours for select using (is_active = true);
create policy "staff manage tours" on public.tours for all using (public.has_permission('tours.manage') or public.is_super_admin()) with check (public.has_permission('tours.manage') or public.is_super_admin());

create policy "public read active testimonials" on public.testimonials for select using (is_active = true);
create policy "staff manage testimonials" on public.testimonials for all using (public.has_permission('content.manage') or public.is_super_admin()) with check (public.has_permission('content.manage') or public.is_super_admin());

create policy "public read published blog posts" on public.blog_posts for select using (is_published = true);
create policy "staff manage blog posts" on public.blog_posts for all using (public.has_permission('content.manage') or public.is_super_admin()) with check (public.has_permission('content.manage') or public.is_super_admin());

create policy "public read site settings" on public.site_settings for select using (true);
create policy "staff manage site settings" on public.site_settings for all using (public.has_permission('content.manage') or public.is_super_admin()) with check (public.has_permission('content.manage') or public.is_super_admin());

create policy "staff read audit logs" on public.audit_logs for select using (public.has_permission('audit.view') or public.is_super_admin());
create policy "staff create audit logs" on public.audit_logs for insert with check (auth.uid() is not null);

insert into storage.buckets (id, name, public)
values
  ('client-documents', 'client-documents', false),
  ('site-media', 'site-media', true),
  ('tour-media', 'tour-media', true),
  ('blog-covers', 'blog-covers', true)
on conflict (id) do nothing;

create policy "public read site media" on storage.objects for select using (
  bucket_id in ('site-media', 'tour-media', 'blog-covers')
);
create policy "staff manage public media" on storage.objects for all using (
  bucket_id in ('site-media', 'tour-media', 'blog-covers') and (public.has_permission('content.manage') or public.has_permission('tours.manage') or public.is_super_admin())
) with check (
  bucket_id in ('site-media', 'tour-media', 'blog-covers') and (public.has_permission('content.manage') or public.has_permission('tours.manage') or public.is_super_admin())
);
create policy "client upload own docs" on storage.objects for insert with check (
  bucket_id = 'client-documents' and auth.uid() is not null
);
create policy "client read own docs" on storage.objects for select using (
  bucket_id = 'client-documents' and auth.uid() is not null
);
create policy "staff read all client docs" on storage.objects for select using (
  bucket_id = 'client-documents' and (public.has_permission('documents.review') or public.has_permission('cases.view') or public.is_super_admin())
);
create policy "staff manage client docs" on storage.objects for update using (
  bucket_id = 'client-documents' and (public.has_permission('documents.review') or public.is_super_admin())
) with check (
  bucket_id = 'client-documents' and (public.has_permission('documents.review') or public.is_super_admin())
);

alter publication supabase_realtime add table public.cases;
alter publication supabase_realtime add table public.documents;
alter publication supabase_realtime add table public.case_messages;
