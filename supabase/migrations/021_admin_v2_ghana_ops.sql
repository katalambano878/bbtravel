-- 021_admin_v2_ghana_ops.sql
-- Admin v2: Ghana-tuned ops primitives.
--   * MoMo-aware payment_method values
--   * Appointment type + status (VFS / embassy slots)
--   * Partners directory (embassies, airlines, hotels, recruiters, universities)
--   * WhatsApp outbound message log (send-history)
--   * Petty cash boxes + movements (Office Cash, MoMo floats)
--   * Additional clients columns for 360 view
--   * Expense category key

-- ---------- Enum extensions ----------
-- payment_method: keep legacy MOBILE_MONEY; add MoMo-network specific + standardise BANK
do $$
begin
  if not exists (select 1 from pg_type t join pg_enum e on e.enumtypid = t.oid where t.typname = 'payment_method' and e.enumlabel = 'MOMO_MTN') then
    alter type public.payment_method add value 'MOMO_MTN';
  end if;
  if not exists (select 1 from pg_type t join pg_enum e on e.enumtypid = t.oid where t.typname = 'payment_method' and e.enumlabel = 'MOMO_VODAFONE') then
    alter type public.payment_method add value 'MOMO_VODAFONE';
  end if;
  if not exists (select 1 from pg_type t join pg_enum e on e.enumtypid = t.oid where t.typname = 'payment_method' and e.enumlabel = 'MOMO_AIRTELTIGO') then
    alter type public.payment_method add value 'MOMO_AIRTELTIGO';
  end if;
  if not exists (select 1 from pg_type t join pg_enum e on e.enumtypid = t.oid where t.typname = 'payment_method' and e.enumlabel = 'POS') then
    alter type public.payment_method add value 'POS';
  end if;
  if not exists (select 1 from pg_type t join pg_enum e on e.enumtypid = t.oid where t.typname = 'payment_method' and e.enumlabel = 'CHEQUE') then
    alter type public.payment_method add value 'CHEQUE';
  end if;
end$$;

-- Appointment type + status
do $$
begin
  if not exists (select 1 from pg_type where typname = 'appointment_type') then
    create type public.appointment_type as enum (
      'CONSULTATION',
      'VFS_SUBMISSION',
      'EMBASSY_INTERVIEW',
      'BIOMETRICS',
      'DOCUMENT_DROPOFF',
      'INTERNAL_REVIEW',
      'TRAVEL_DEPARTURE',
      'TRAVEL_RETURN',
      'OTHER'
    );
  end if;
  if not exists (select 1 from pg_type where typname = 'appointment_status') then
    create type public.appointment_status as enum (
      'SCHEDULED',
      'CONFIRMED',
      'COMPLETED',
      'CANCELLED',
      'NO_SHOW',
      'RESCHEDULED'
    );
  end if;
end$$;

-- Extend appointments with the new columns (keep existing rows working)
alter table public.appointments add column if not exists appointment_type public.appointment_type not null default 'CONSULTATION';
alter table public.appointments add column if not exists status public.appointment_status not null default 'SCHEDULED';
alter table public.appointments add column if not exists duration_minutes integer not null default 60;
alter table public.appointments add column if not exists ends_at timestamptz;
alter table public.appointments add column if not exists created_by uuid references auth.users(id) on delete set null;
alter table public.appointments add column if not exists assigned_to uuid references auth.users(id) on delete set null;
alter table public.appointments add column if not exists reminder_whatsapp boolean not null default false;
alter table public.appointments add column if not exists updated_at timestamptz not null default now();

drop trigger if exists trg_appointments_updated_at on public.appointments;
create trigger trg_appointments_updated_at before update on public.appointments
for each row execute function public.set_updated_at();

create index if not exists idx_appointments_scheduled_at on public.appointments(scheduled_at);
create index if not exists idx_appointments_assigned_to on public.appointments(assigned_to);
create index if not exists idx_appointments_status on public.appointments(status);

-- ---------- Partners directory ----------
create table if not exists public.partners (
  id uuid primary key default gen_random_uuid(),
  partner_type text not null check (partner_type in (
    'EMBASSY', 'VFS_CENTER', 'AIRLINE', 'HOTEL', 'RECRUITER',
    'UNIVERSITY', 'INSURANCE', 'TRANSPORT', 'TRAINING', 'OTHER'
  )),
  name text not null,
  country_code char(2),
  city text,
  address text,
  contact_name text,
  phone text,
  whatsapp text,
  email text,
  website text,
  notes text,
  is_active boolean not null default true,
  tags text[] not null default '{}',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_partners_type on public.partners(partner_type);
create index if not exists idx_partners_active on public.partners(is_active);

drop trigger if exists trg_partners_updated_at on public.partners;
create trigger trg_partners_updated_at before update on public.partners
for each row execute function public.set_updated_at();

alter table public.partners enable row level security;
drop policy if exists "partners read" on public.partners;
drop policy if exists "partners manage" on public.partners;
create policy "partners read" on public.partners for select using (
  public.has_permission('settings.manage') or public.has_permission('cases.view') or public.is_super_admin()
);
create policy "partners manage" on public.partners for all using (
  public.has_permission('settings.manage') or public.is_super_admin()
) with check (
  public.has_permission('settings.manage') or public.is_super_admin()
);

-- ---------- WhatsApp outbound log ----------
create table if not exists public.whatsapp_messages (
  id uuid primary key default gen_random_uuid(),
  direction text not null default 'OUT' check (direction in ('OUT', 'IN')),
  to_phone text not null,
  to_name text,
  client_id uuid references public.clients(id) on delete set null,
  lead_id uuid references public.leads(id) on delete set null,
  case_id uuid references public.cases(id) on delete set null,
  template_key text,
  subject text,
  body text not null,
  status text not null default 'LAUNCHED' check (status in ('LAUNCHED', 'SENT', 'DELIVERED', 'READ', 'FAILED')),
  sent_by uuid references auth.users(id) on delete set null,
  sent_at timestamptz not null default now(),
  meta jsonb not null default '{}'::jsonb
);

create index if not exists idx_wa_client on public.whatsapp_messages(client_id, sent_at desc);
create index if not exists idx_wa_case on public.whatsapp_messages(case_id, sent_at desc);
create index if not exists idx_wa_lead on public.whatsapp_messages(lead_id, sent_at desc);
create index if not exists idx_wa_sent_by on public.whatsapp_messages(sent_by, sent_at desc);

alter table public.whatsapp_messages enable row level security;
drop policy if exists "wa read" on public.whatsapp_messages;
drop policy if exists "wa insert" on public.whatsapp_messages;
create policy "wa read" on public.whatsapp_messages for select using (
  public.has_permission('messages.manage') or public.has_permission('cases.view') or public.has_permission('leads.view') or public.is_super_admin()
);
create policy "wa insert" on public.whatsapp_messages for insert with check (
  public.has_permission('messages.manage') or public.has_permission('cases.edit') or public.has_permission('leads.edit') or public.is_super_admin()
);

-- ---------- Petty cash ----------
create table if not exists public.petty_cash_boxes (
  id uuid primary key default gen_random_uuid(),
  box_name text not null unique,
  box_type text not null check (box_type in ('CASH', 'MOMO_MTN', 'MOMO_VODAFONE', 'MOMO_AIRTELTIGO', 'BANK', 'OTHER')),
  currency text not null default 'GHS',
  opening_balance numeric(14,2) not null default 0,
  current_balance numeric(14,2) not null default 0,
  custodian_user_id uuid references auth.users(id) on delete set null,
  is_active boolean not null default true,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

drop trigger if exists trg_petty_cash_boxes_updated_at on public.petty_cash_boxes;
create trigger trg_petty_cash_boxes_updated_at before update on public.petty_cash_boxes
for each row execute function public.set_updated_at();

create table if not exists public.petty_cash_movements (
  id uuid primary key default gen_random_uuid(),
  box_id uuid not null references public.petty_cash_boxes(id) on delete cascade,
  movement_type text not null check (movement_type in ('IN', 'OUT', 'TRANSFER_IN', 'TRANSFER_OUT', 'TOPUP', 'ADJUSTMENT')),
  amount numeric(14,2) not null check (amount > 0),
  occurred_at timestamptz not null default now(),
  category text,
  description text not null,
  reference text,
  linked_invoice_id uuid references public.invoices(id) on delete set null,
  linked_expense_id uuid references public.expenses(id) on delete set null,
  linked_payment_id uuid references public.payments(id) on delete set null,
  counterparty text,
  recorded_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now()
);

create index if not exists idx_ptc_box_date on public.petty_cash_movements(box_id, occurred_at desc);
create index if not exists idx_ptc_type on public.petty_cash_movements(movement_type);

-- Maintain running balance on the box
create or replace function public.apply_petty_cash_movement() returns trigger language plpgsql as $$
declare
  delta numeric(14,2);
begin
  if (tg_op = 'INSERT') then
    if new.movement_type in ('IN', 'TRANSFER_IN', 'TOPUP') then
      delta := new.amount;
    elsif new.movement_type in ('OUT', 'TRANSFER_OUT') then
      delta := -new.amount;
    else -- ADJUSTMENT can be + or -; treat as + and rely on positive amount + separate OUT entry
      delta := new.amount;
    end if;
    update public.petty_cash_boxes set current_balance = current_balance + delta, updated_at = now()
      where id = new.box_id;
    return new;
  elsif (tg_op = 'DELETE') then
    if old.movement_type in ('IN', 'TRANSFER_IN', 'TOPUP') then
      delta := -old.amount;
    elsif old.movement_type in ('OUT', 'TRANSFER_OUT') then
      delta := old.amount;
    else
      delta := -old.amount;
    end if;
    update public.petty_cash_boxes set current_balance = current_balance + delta, updated_at = now()
      where id = old.box_id;
    return old;
  end if;
  return null;
end;
$$;

drop trigger if exists trg_petty_cash_apply on public.petty_cash_movements;
create trigger trg_petty_cash_apply
  after insert or delete on public.petty_cash_movements
  for each row execute function public.apply_petty_cash_movement();

alter table public.petty_cash_boxes enable row level security;
alter table public.petty_cash_movements enable row level security;

drop policy if exists "petty_cash_boxes read" on public.petty_cash_boxes;
drop policy if exists "petty_cash_boxes manage" on public.petty_cash_boxes;
create policy "petty_cash_boxes read" on public.petty_cash_boxes for select using (
  public.has_permission('finance.view') or public.is_super_admin()
);
create policy "petty_cash_boxes manage" on public.petty_cash_boxes for all using (
  public.has_permission('finance.payment.record') or public.is_super_admin()
) with check (
  public.has_permission('finance.payment.record') or public.is_super_admin()
);

drop policy if exists "petty_cash_movements read" on public.petty_cash_movements;
drop policy if exists "petty_cash_movements manage" on public.petty_cash_movements;
create policy "petty_cash_movements read" on public.petty_cash_movements for select using (
  public.has_permission('finance.view') or public.is_super_admin()
);
create policy "petty_cash_movements manage" on public.petty_cash_movements for all using (
  public.has_permission('finance.payment.record') or public.is_super_admin()
) with check (
  public.has_permission('finance.payment.record') or public.is_super_admin()
);

-- ---------- Client 360 additions ----------
alter table public.clients add column if not exists whatsapp text;
alter table public.clients add column if not exists city text;
alter table public.clients add column if not exists country text default 'GH';
alter table public.clients add column if not exists date_of_birth date;
alter table public.clients add column if not exists passport_number text;
alter table public.clients add column if not exists passport_expiry date;
alter table public.clients add column if not exists tags text[] not null default '{}';
alter table public.clients add column if not exists notes text;
alter table public.clients add column if not exists preferred_channel text check (preferred_channel in ('WHATSAPP', 'PHONE', 'EMAIL', 'IN_PERSON'));

-- ---------- Lead extras ----------
alter table public.leads add column if not exists next_action_date date;
alter table public.leads add column if not exists whatsapp text;

-- ---------- Expense category key ----------
alter table public.expenses add column if not exists category_key text;
alter table public.expenses add column if not exists payment_method public.payment_method;
alter table public.expenses add column if not exists paid_from_box_id uuid references public.petty_cash_boxes(id) on delete set null;

-- ---------- Seed partners (common Ghana starting points) ----------
insert into public.partners (partner_type, name, country_code, city, address, phone, email, notes) values
  ('EMBASSY', 'British High Commission Accra', 'GH', 'Accra', 'Osu Link, Off Gamel Abdul Nasser Ave', '+233 302 213 250', 'accra.consular@fcdo.gov.uk', 'UK visa decisions handled via VFS'),
  ('EMBASSY', 'Embassy of the United States Accra', 'GH', 'Accra', 'No. 24, Fourth Circular Rd, Cantonments', '+233 302 741 000', 'ACSAccra@state.gov', 'B1/B2, F-1, J-1 interviews at Cantonments'),
  ('EMBASSY', 'High Commission of Canada (Accra)', 'GH', 'Accra', 'No. 2 Independence Avenue', '+233 302 211 521', 'accra@international.gc.ca', 'IRCC submissions via VFS Accra'),
  ('VFS_CENTER', 'VFS Global Accra (UK / Canada / Schengen)', 'GH', 'Accra', 'First Floor, Cedi House, Liberia Road', '+233 302 740 650', null, 'Biometric and submission services'),
  ('AIRLINE', 'Emirates', 'AE', 'Dubai', null, '+971 600 555 555', null, 'Daily ACC-DXB-HUB'),
  ('AIRLINE', 'British Airways', 'GB', 'London', null, '+44 203 250 0145', null, 'ACC-LHR direct'),
  ('AIRLINE', 'KLM / Air France', 'NL', 'Amsterdam', null, null, null, 'ACC-AMS / ACC-CDG hubs'),
  ('AIRLINE', 'Turkish Airlines', 'TR', 'Istanbul', null, null, null, 'Wide East/Europe network via IST'),
  ('AIRLINE', 'Africa World Airlines', 'GH', 'Accra', null, null, null, 'Domestic + regional West Africa'),
  ('HOTEL', 'Kempinski Hotel Gold Coast City', 'GH', 'Accra', null, null, null, 'Corporate rate candidate'),
  ('HOTEL', 'Labadi Beach Hotel', 'GH', 'Accra', null, null, null, 'Leisure / event block rate'),
  ('RECRUITER', 'NHS Trusts (via licensed UK sponsors)', 'GB', 'London', null, null, null, 'Nursing / healthcare pipeline'),
  ('UNIVERSITY', 'University of Windsor', 'CA', 'Windsor', null, null, null, 'Master''s intake Fall/Winter'),
  ('INSURANCE', 'Travel Insurance Partner (Schengen-compliant)', 'GH', 'Accra', null, null, null, 'Min EUR 30,000 medical cover')
on conflict do nothing;

-- ---------- Seed petty cash boxes ----------
insert into public.petty_cash_boxes (box_name, box_type, currency, opening_balance, current_balance, notes) values
  ('Office Cash', 'CASH', 'GHS', 0, 0, 'Main office cash box'),
  ('MoMo — MTN Float', 'MOMO_MTN', 'GHS', 0, 0, 'MTN Mobile Money merchant/personal float'),
  ('MoMo — Vodafone Cash', 'MOMO_VODAFONE', 'GHS', 0, 0, 'Vodafone Cash float'),
  ('MoMo — AirtelTigo', 'MOMO_AIRTELTIGO', 'GHS', 0, 0, 'AirtelTigo Money float'),
  ('Bank — Operating Account', 'BANK', 'GHS', 0, 0, 'Primary operating bank account')
on conflict (box_name) do nothing;
