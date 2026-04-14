create type public.account_type as enum ('ASSET', 'LIABILITY', 'EQUITY', 'REVENUE', 'EXPENSE');

create table if not exists public.chart_of_accounts (
  id uuid primary key default gen_random_uuid(),
  account_code text not null unique,
  account_name text not null,
  account_type public.account_type not null,
  parent_account_id uuid references public.chart_of_accounts(id) on delete set null,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.financial_periods (
  id uuid primary key default gen_random_uuid(),
  period_key text not null unique,
  period_start date not null,
  period_end date not null,
  status text not null default 'OPEN' check (status in ('OPEN', 'LOCKED', 'CLOSED')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.journal_entries (
  id uuid primary key default gen_random_uuid(),
  period_id uuid references public.financial_periods(id) on delete set null,
  entry_date date not null,
  reference text,
  description text,
  source_type text,
  source_id text,
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now()
);

create table if not exists public.journal_lines (
  id uuid primary key default gen_random_uuid(),
  journal_entry_id uuid not null references public.journal_entries(id) on delete cascade,
  account_id uuid not null references public.chart_of_accounts(id) on delete restrict,
  debit numeric(14,2) not null default 0,
  credit numeric(14,2) not null default 0,
  description text,
  created_at timestamptz not null default now(),
  check (debit >= 0 and credit >= 0 and (debit = 0 or credit = 0))
);

create index if not exists idx_journal_entries_period on public.journal_entries(period_id);
create index if not exists idx_journal_lines_entry on public.journal_lines(journal_entry_id);
create index if not exists idx_journal_lines_account on public.journal_lines(account_id);

drop trigger if exists trg_chart_of_accounts_updated_at on public.chart_of_accounts;
create trigger trg_chart_of_accounts_updated_at before update on public.chart_of_accounts for each row execute function public.set_updated_at();
drop trigger if exists trg_financial_periods_updated_at on public.financial_periods;
create trigger trg_financial_periods_updated_at before update on public.financial_periods for each row execute function public.set_updated_at();

insert into public.chart_of_accounts (account_code, account_name, account_type)
values
  ('1000', 'Cash and Bank', 'ASSET'),
  ('1100', 'Accounts Receivable', 'ASSET'),
  ('2000', 'Accounts Payable', 'LIABILITY'),
  ('2100', 'Unearned Revenue', 'LIABILITY'),
  ('3000', 'Owner Equity', 'EQUITY'),
  ('4000', 'Service Revenue', 'REVENUE'),
  ('4100', 'Travel Package Revenue', 'REVENUE'),
  ('5000', 'Operating Expenses', 'EXPENSE'),
  ('5100', 'Staff Costs', 'EXPENSE')
on conflict (account_code) do nothing;

alter table public.chart_of_accounts enable row level security;
alter table public.financial_periods enable row level security;
alter table public.journal_entries enable row level security;
alter table public.journal_lines enable row level security;

create policy "finance read coa" on public.chart_of_accounts
for select using (public.has_permission('finance.view') or public.is_super_admin());
create policy "finance manage coa" on public.chart_of_accounts
for all using (public.has_permission('settings.manage') or public.is_super_admin())
with check (public.has_permission('settings.manage') or public.is_super_admin());

create policy "finance read periods" on public.financial_periods
for select using (public.has_permission('finance.view') or public.is_super_admin());
create policy "finance manage periods" on public.financial_periods
for all using (public.has_permission('finance.view') or public.is_super_admin())
with check (public.has_permission('finance.view') or public.is_super_admin());

create policy "finance read journal entries" on public.journal_entries
for select using (public.has_permission('finance.view') or public.is_super_admin());
create policy "finance manage journal entries" on public.journal_entries
for all using (public.has_permission('finance.view') or public.is_super_admin())
with check (public.has_permission('finance.view') or public.is_super_admin());

create policy "finance read journal lines" on public.journal_lines
for select using (public.has_permission('finance.view') or public.is_super_admin());
create policy "finance manage journal lines" on public.journal_lines
for all using (public.has_permission('finance.view') or public.is_super_admin())
with check (public.has_permission('finance.view') or public.is_super_admin());
