do $$
begin
  if not exists (
    select 1
    from pg_type t
    join pg_enum e on t.oid = e.enumtypid
    where t.typname = 'service_type'
      and e.enumlabel = 'FLIGHT_RESERVATION'
  ) then
    alter type public.service_type add value 'FLIGHT_RESERVATION';
  end if;
end $$;
