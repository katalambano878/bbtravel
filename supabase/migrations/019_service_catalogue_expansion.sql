-- Migration: 019 — Service catalogue expansion.
--
-- Extends the service_type and lead_stage enums so the admin panel can
-- correctly classify every service B.B. Travel Consult actually offers
-- (visa, recruitment, study, tours, flights, hotels, insurance, transport,
-- corporate travel, events, consultation, document processing). Also
-- reseeds crm_pipeline_stages with travel-tailored stages.
--
-- Enum values are add-only (Postgres cannot drop enum values inside a
-- transaction without rebuilding the type). Legacy values are kept and
-- simply stop being surfaced in UI dropdowns.

-- --- service_type additions -------------------------------------------------
do $$
begin
  if not exists (
    select 1 from pg_type t
    join pg_enum e on e.enumtypid = t.oid
    where t.typname = 'service_type' and e.enumlabel = 'HOTEL_BOOKING'
  ) then
    alter type public.service_type add value 'HOTEL_BOOKING';
  end if;
end$$;

do $$
begin
  if not exists (
    select 1 from pg_type t
    join pg_enum e on e.enumtypid = t.oid
    where t.typname = 'service_type' and e.enumlabel = 'CORPORATE_TRAVEL'
  ) then
    alter type public.service_type add value 'CORPORATE_TRAVEL';
  end if;
end$$;

do $$
begin
  if not exists (
    select 1 from pg_type t
    join pg_enum e on e.enumtypid = t.oid
    where t.typname = 'service_type' and e.enumlabel = 'TRAVEL_INSURANCE'
  ) then
    alter type public.service_type add value 'TRAVEL_INSURANCE';
  end if;
end$$;

do $$
begin
  if not exists (
    select 1 from pg_type t
    join pg_enum e on e.enumtypid = t.oid
    where t.typname = 'service_type' and e.enumlabel = 'EVENT_MANAGEMENT'
  ) then
    alter type public.service_type add value 'EVENT_MANAGEMENT';
  end if;
end$$;

do $$
begin
  if not exists (
    select 1 from pg_type t
    join pg_enum e on e.enumtypid = t.oid
    where t.typname = 'service_type' and e.enumlabel = 'TRANSPORT_SERVICES'
  ) then
    alter type public.service_type add value 'TRANSPORT_SERVICES';
  end if;
end$$;

do $$
begin
  if not exists (
    select 1 from pg_type t
    join pg_enum e on e.enumtypid = t.oid
    where t.typname = 'service_type' and e.enumlabel = 'CONSULTATION'
  ) then
    alter type public.service_type add value 'CONSULTATION';
  end if;
end$$;

do $$
begin
  if not exists (
    select 1 from pg_type t
    join pg_enum e on e.enumtypid = t.oid
    where t.typname = 'service_type' and e.enumlabel = 'DOCUMENT_PROCESSING'
  ) then
    alter type public.service_type add value 'DOCUMENT_PROCESSING';
  end if;
end$$;

-- --- lead_stage additions ---------------------------------------------------
do $$
begin
  if not exists (
    select 1 from pg_type t
    join pg_enum e on e.enumtypid = t.oid
    where t.typname = 'lead_stage' and e.enumlabel = 'SCOPED'
  ) then
    alter type public.lead_stage add value 'SCOPED';
  end if;
end$$;

do $$
begin
  if not exists (
    select 1 from pg_type t
    join pg_enum e on e.enumtypid = t.oid
    where t.typname = 'lead_stage' and e.enumlabel = 'QUOTED'
  ) then
    alter type public.lead_stage add value 'QUOTED';
  end if;
end$$;

do $$
begin
  if not exists (
    select 1 from pg_type t
    join pg_enum e on e.enumtypid = t.oid
    where t.typname = 'lead_stage' and e.enumlabel = 'BOOKED'
  ) then
    alter type public.lead_stage add value 'BOOKED';
  end if;
end$$;

do $$
begin
  if not exists (
    select 1 from pg_type t
    join pg_enum e on e.enumtypid = t.oid
    where t.typname = 'lead_stage' and e.enumlabel = 'COMPLETED'
  ) then
    alter type public.lead_stage add value 'COMPLETED';
  end if;
end$$;

-- --- notification_channel: add WhatsApp & SMS -------------------------------
do $$
begin
  if not exists (
    select 1 from pg_type t
    join pg_enum e on e.enumtypid = t.oid
    where t.typname = 'notification_channel' and e.enumlabel = 'WHATSAPP'
  ) then
    alter type public.notification_channel add value 'WHATSAPP';
  end if;
end$$;

do $$
begin
  if not exists (
    select 1 from pg_type t
    join pg_enum e on e.enumtypid = t.oid
    where t.typname = 'notification_channel' and e.enumlabel = 'SMS'
  ) then
    alter type public.notification_channel add value 'SMS';
  end if;
end$$;

-- --- crm_pipeline_stages reseed --------------------------------------------
-- Clear legacy seed rows that no longer map to how the team actually works.
-- (QUALIFIED / PROPOSAL / WON / LOST from migration 006 are replaced by the
-- travel-tailored SCOPED / QUOTED / BOOKED / COMPLETED / CLOSED set.)
delete from public.crm_pipeline_stages where stage_key in ('QUALIFIED', 'PROPOSAL', 'WON', 'LOST');

insert into public.crm_pipeline_stages (stage_key, stage_name, display_order, is_terminal)
values
  ('NEW',       'New',                 1, false),
  ('CONTACTED', 'Contacted',           2, false),
  ('SCOPED',    'Scoped',              3, false),
  ('QUOTED',    'Quoted',              4, false),
  ('BOOKED',    'Booked / Submitted',  5, false),
  ('COMPLETED', 'Completed',           6, true),
  ('CLOSED',    'Closed / Lost',       7, true)
on conflict (stage_key) do update
set stage_name    = excluded.stage_name,
    display_order = excluded.display_order,
    is_terminal   = excluded.is_terminal;
