create type public.document_review_status as enum ('REQUESTED', 'IN_REVIEW', 'APPROVED', 'REJECTED', 'RESUBMIT_REQUIRED');

alter table public.documents
  add column if not exists file_name text,
  add column if not exists mime_type text,
  add column if not exists version_no int not null default 1,
  add column if not exists expires_at date,
  add column if not exists replaced_by uuid references public.documents(id) on delete set null,
  add column if not exists is_current boolean not null default true;

create table if not exists public.document_versions (
  id uuid primary key default gen_random_uuid(),
  document_id uuid not null references public.documents(id) on delete cascade,
  version_no int not null,
  file_url text not null,
  file_name text,
  mime_type text,
  uploaded_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  unique (document_id, version_no)
);

create table if not exists public.document_reviews (
  id uuid primary key default gen_random_uuid(),
  document_id uuid not null references public.documents(id) on delete cascade,
  review_status public.document_review_status not null default 'REQUESTED',
  reviewer_id uuid references auth.users(id) on delete set null,
  review_notes text,
  requested_changes text,
  reviewed_at timestamptz,
  created_at timestamptz not null default now()
);

create table if not exists public.document_expiry_alerts (
  id uuid primary key default gen_random_uuid(),
  document_id uuid not null references public.documents(id) on delete cascade,
  alert_date date not null,
  is_sent boolean not null default false,
  sent_at timestamptz,
  created_at timestamptz not null default now(),
  unique (document_id, alert_date)
);

create index if not exists idx_documents_expires_at on public.documents(expires_at);
create index if not exists idx_document_reviews_document_id on public.document_reviews(document_id);
create index if not exists idx_document_versions_document_id on public.document_versions(document_id);

alter table public.document_versions enable row level security;
alter table public.document_reviews enable row level security;
alter table public.document_expiry_alerts enable row level security;

create policy "client read own document versions" on public.document_versions
for select using (exists (select 1 from public.documents d where d.id = document_id and public.is_case_owner(d.case_id)));
create policy "staff read document versions" on public.document_versions
for select using (public.has_permission('documents.view') or public.has_permission('documents.review') or public.is_super_admin());
create policy "staff create document versions" on public.document_versions
for insert with check (public.has_permission('documents.upload') or public.has_permission('documents.review') or public.is_super_admin());

create policy "staff read document reviews" on public.document_reviews
for select using (public.has_permission('documents.view') or public.has_permission('documents.review') or public.is_super_admin());
create policy "staff manage document reviews" on public.document_reviews
for all using (public.has_permission('documents.review') or public.is_super_admin())
with check (public.has_permission('documents.review') or public.is_super_admin());

create policy "staff read document expiry alerts" on public.document_expiry_alerts
for select using (public.has_permission('documents.view') or public.is_super_admin());
create policy "staff manage document expiry alerts" on public.document_expiry_alerts
for all using (public.has_permission('documents.review') or public.is_super_admin())
with check (public.has_permission('documents.review') or public.is_super_admin());
