create table if not exists public.finance_approval_rules (
  id uuid primary key default gen_random_uuid(),
  rule_key text not null unique,
  rule_scope text not null,
  min_amount numeric(14,2) not null default 0,
  max_amount numeric(14,2),
  required_permission text not null,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.finance_snapshots (
  id uuid primary key default gen_random_uuid(),
  snapshot_date date not null,
  revenue_total numeric(14,2) not null default 0,
  received_total numeric(14,2) not null default 0,
  outstanding_total numeric(14,2) not null default 0,
  expense_total numeric(14,2) not null default 0,
  net_position numeric(14,2) not null default 0,
  payload jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  unique (snapshot_date)
);

create or replace function public.ensure_financial_period_open(target_date date)
returns boolean
language plpgsql
stable
as $$
declare
  period_status text;
begin
  select status
  into period_status
  from public.financial_periods fp
  where target_date between fp.period_start and fp.period_end
  order by fp.period_start desc
  limit 1;

  if period_status is null then
    return true;
  end if;

  return period_status = 'OPEN';
end;
$$;

create or replace function public.validate_invoice_payment_limit()
returns trigger
language plpgsql
as $$
declare
  invoice_total numeric(14,2);
  paid_so_far numeric(14,2);
begin
  select total_amount, amount_paid into invoice_total, paid_so_far
  from public.invoices
  where id = new.invoice_id
  for update;

  if invoice_total is null then
    raise exception 'Invoice % not found', new.invoice_id;
  end if;

  if (coalesce(paid_so_far, 0) + new.amount) > invoice_total then
    raise exception 'Payment exceeds invoice total for invoice %', new.invoice_id;
  end if;

  return new;
end;
$$;

drop trigger if exists trg_validate_invoice_payment_limit on public.payments;
create trigger trg_validate_invoice_payment_limit
before insert on public.payments
for each row execute function public.validate_invoice_payment_limit();

create or replace function public.refresh_invoice_paid_amount()
returns trigger
language plpgsql
as $$
begin
  update public.invoices
  set amount_paid = coalesce((
      select sum(p.amount) from public.payments p where p.invoice_id = coalesce(new.invoice_id, old.invoice_id)
    ), 0),
    status = case
      when coalesce((
        select sum(p.amount) from public.payments p where p.invoice_id = coalesce(new.invoice_id, old.invoice_id)
      ), 0) = 0 then status
      when coalesce((
        select sum(p.amount) from public.payments p where p.invoice_id = coalesce(new.invoice_id, old.invoice_id)
      ), 0) < total_amount then 'PARTIALLY_PAID'
      else 'PAID'
    end
  where id = coalesce(new.invoice_id, old.invoice_id);

  return coalesce(new, old);
end;
$$;

drop trigger if exists trg_refresh_invoice_paid_amount_on_insert on public.payments;
create trigger trg_refresh_invoice_paid_amount_on_insert
after insert on public.payments
for each row execute function public.refresh_invoice_paid_amount();

drop trigger if exists trg_refresh_invoice_paid_amount_on_delete on public.payments;
create trigger trg_refresh_invoice_paid_amount_on_delete
after delete on public.payments
for each row execute function public.refresh_invoice_paid_amount();

insert into public.finance_approval_rules (rule_key, rule_scope, min_amount, max_amount, required_permission)
values
  ('expense.low', 'expense', 0, 999.99, 'finance.expense.approve'),
  ('expense.high', 'expense', 1000, 999999999, 'settings.manage'),
  ('refund.any', 'refund', 0, 999999999, 'finance.refund.process')
on conflict (rule_key) do nothing;

drop trigger if exists trg_finance_approval_rules_updated_at on public.finance_approval_rules;
create trigger trg_finance_approval_rules_updated_at before update on public.finance_approval_rules for each row execute function public.set_updated_at();

alter table public.finance_approval_rules enable row level security;
alter table public.finance_snapshots enable row level security;

create policy "finance read approval rules" on public.finance_approval_rules
for select using (public.has_permission('finance.view') or public.is_super_admin());
create policy "finance manage approval rules" on public.finance_approval_rules
for all using (public.has_permission('settings.manage') or public.is_super_admin())
with check (public.has_permission('settings.manage') or public.is_super_admin());

create policy "finance read snapshots" on public.finance_snapshots
for select using (public.has_permission('finance.view') or public.is_super_admin());
create policy "finance manage snapshots" on public.finance_snapshots
for all using (public.has_permission('finance.view') or public.is_super_admin())
with check (public.has_permission('finance.view') or public.is_super_admin());
