-- Central log of every public website form submission (full JSON payload + links to lead/case).

create table if not exists public.form_submissions (
  id uuid primary key default gen_random_uuid(),
  form_type text not null,
  payload jsonb not null default '{}'::jsonb,
  name text,
  email text,
  phone text,
  page_url text,
  lead_id uuid references public.leads(id) on delete set null,
  case_id uuid references public.cases(id) on delete set null,
  created_at timestamptz not null default now()
);

create index if not exists idx_form_submissions_created on public.form_submissions (created_at desc);
create index if not exists idx_form_submissions_type on public.form_submissions (form_type);
create index if not exists idx_form_submissions_lead on public.form_submissions (lead_id) where lead_id is not null;

comment on table public.form_submissions is 'Audit trail for public website forms; staff review in /admin/inbox.';

alter table public.form_submissions enable row level security;
-- RLS: block direct anon/authenticated access; app uses service role (admin) for all reads/writes.
