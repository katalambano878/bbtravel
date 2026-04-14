create type public.invoice_status as enum ('DRAFT', 'SENT', 'PARTIALLY_PAID', 'PAID', 'OVERDUE', 'CANCELLED');
create type public.payment_method as enum ('CASH', 'BANK_TRANSFER', 'MOBILE_MONEY', 'CARD', 'OTHER');
create type public.expense_status as enum ('PENDING', 'APPROVED', 'REJECTED', 'PAID');

create table if not exists public.vendors (
  id uuid primary key default gen_random_uuid(),
  vendor_name text not null,
  contact_name text,
  phone text,
  email text,
  payment_terms text,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.invoices (
  id uuid primary key default gen_random_uuid(),
  invoice_number text not null unique,
  client_id uuid references public.clients(id) on delete set null,
  case_id uuid references public.cases(id) on delete set null,
  issue_date date not null default current_date,
  due_date date not null,
  currency text not null default 'GHS',
  subtotal numeric(14,2) not null default 0,
  tax_amount numeric(14,2) not null default 0,
  discount_amount numeric(14,2) not null default 0,
  total_amount numeric(14,2) not null default 0,
  amount_paid numeric(14,2) not null default 0,
  status public.invoice_status not null default 'DRAFT',
  notes text,
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.invoice_items (
  id uuid primary key default gen_random_uuid(),
  invoice_id uuid not null references public.invoices(id) on delete cascade,
  line_description text not null,
  quantity numeric(10,2) not null default 1,
  unit_price numeric(14,2) not null default 0,
  tax_rate numeric(8,4) not null default 0,
  line_total numeric(14,2) not null default 0,
  created_at timestamptz not null default now()
);

create table if not exists public.payments (
  id uuid primary key default gen_random_uuid(),
  invoice_id uuid not null references public.invoices(id) on delete cascade,
  amount numeric(14,2) not null check (amount > 0),
  paid_at timestamptz not null default now(),
  payment_method public.payment_method not null default 'BANK_TRANSFER',
  reference text,
  notes text,
  recorded_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now()
);

create table if not exists public.expenses (
  id uuid primary key default gen_random_uuid(),
  employee_id uuid references public.employee_records(id) on delete set null,
  vendor_id uuid references public.vendors(id) on delete set null,
  expense_date date not null default current_date,
  category text not null,
  amount numeric(14,2) not null check (amount > 0),
  status public.expense_status not null default 'PENDING',
  description text,
  submitted_by uuid references auth.users(id) on delete set null,
  approved_by uuid references auth.users(id) on delete set null,
  approved_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.vendor_bills (
  id uuid primary key default gen_random_uuid(),
  vendor_id uuid not null references public.vendors(id) on delete cascade,
  bill_number text not null unique,
  bill_date date not null,
  due_date date not null,
  amount numeric(14,2) not null check (amount > 0),
  amount_paid numeric(14,2) not null default 0,
  status text not null default 'OPEN' check (status in ('OPEN', 'PARTIALLY_PAID', 'PAID', 'CANCELLED')),
  notes text,
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.credit_notes (
  id uuid primary key default gen_random_uuid(),
  invoice_id uuid not null references public.invoices(id) on delete cascade,
  credit_number text not null unique,
  amount numeric(14,2) not null check (amount > 0),
  reason text,
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now()
);

create table if not exists public.refunds (
  id uuid primary key default gen_random_uuid(),
  invoice_id uuid not null references public.invoices(id) on delete cascade,
  payment_id uuid references public.payments(id) on delete set null,
  refund_amount numeric(14,2) not null check (refund_amount > 0),
  reason text,
  status text not null default 'PENDING' check (status in ('PENDING', 'APPROVED', 'COMPLETED', 'REJECTED')),
  approved_by uuid references auth.users(id) on delete set null,
  processed_by uuid references auth.users(id) on delete set null,
  processed_at timestamptz,
  created_at timestamptz not null default now()
);

create index if not exists idx_invoices_client on public.invoices(client_id);
create index if not exists idx_invoices_status_due on public.invoices(status, due_date);
create index if not exists idx_payments_invoice on public.payments(invoice_id);
create index if not exists idx_expenses_status on public.expenses(status);
create index if not exists idx_vendor_bills_status_due on public.vendor_bills(status, due_date);

drop trigger if exists trg_vendors_updated_at on public.vendors;
create trigger trg_vendors_updated_at before update on public.vendors for each row execute function public.set_updated_at();
drop trigger if exists trg_invoices_updated_at on public.invoices;
create trigger trg_invoices_updated_at before update on public.invoices for each row execute function public.set_updated_at();
drop trigger if exists trg_expenses_updated_at on public.expenses;
create trigger trg_expenses_updated_at before update on public.expenses for each row execute function public.set_updated_at();
drop trigger if exists trg_vendor_bills_updated_at on public.vendor_bills;
create trigger trg_vendor_bills_updated_at before update on public.vendor_bills for each row execute function public.set_updated_at();

alter table public.vendors enable row level security;
alter table public.invoices enable row level security;
alter table public.invoice_items enable row level security;
alter table public.payments enable row level security;
alter table public.expenses enable row level security;
alter table public.vendor_bills enable row level security;
alter table public.credit_notes enable row level security;
alter table public.refunds enable row level security;

create policy "finance read vendors" on public.vendors for select using (public.has_permission('finance.view') or public.is_super_admin());
create policy "finance manage vendors" on public.vendors for all using (public.has_permission('finance.view') or public.is_super_admin()) with check (public.has_permission('finance.view') or public.is_super_admin());

create policy "finance read invoices" on public.invoices for select using (public.has_permission('finance.view') or public.is_super_admin());
create policy "finance manage invoices" on public.invoices for all using (public.has_permission('finance.invoice.create') or public.is_super_admin()) with check (public.has_permission('finance.invoice.create') or public.is_super_admin());

create policy "finance read invoice items" on public.invoice_items for select using (public.has_permission('finance.view') or public.is_super_admin());
create policy "finance manage invoice items" on public.invoice_items for all using (public.has_permission('finance.invoice.create') or public.is_super_admin()) with check (public.has_permission('finance.invoice.create') or public.is_super_admin());

create policy "finance read payments" on public.payments for select using (public.has_permission('finance.view') or public.is_super_admin());
create policy "finance manage payments" on public.payments for all using (public.has_permission('finance.payment.record') or public.is_super_admin()) with check (public.has_permission('finance.payment.record') or public.is_super_admin());

create policy "finance read expenses" on public.expenses for select using (public.has_permission('finance.view') or public.is_super_admin());
create policy "finance manage expenses" on public.expenses for all using (public.has_permission('finance.expense.approve') or public.is_super_admin()) with check (public.has_permission('finance.expense.approve') or public.is_super_admin());

create policy "finance read vendor bills" on public.vendor_bills for select using (public.has_permission('finance.view') or public.is_super_admin());
create policy "finance manage vendor bills" on public.vendor_bills for all using (public.has_permission('finance.expense.approve') or public.is_super_admin()) with check (public.has_permission('finance.expense.approve') or public.is_super_admin());

create policy "finance read credit notes" on public.credit_notes for select using (public.has_permission('finance.view') or public.is_super_admin());
create policy "finance manage credit notes" on public.credit_notes for all using (public.has_permission('finance.refund.process') or public.is_super_admin()) with check (public.has_permission('finance.refund.process') or public.is_super_admin());

create policy "finance read refunds" on public.refunds for select using (public.has_permission('finance.view') or public.is_super_admin());
create policy "finance manage refunds" on public.refunds for all using (public.has_permission('finance.refund.process') or public.is_super_admin()) with check (public.has_permission('finance.refund.process') or public.is_super_admin());
