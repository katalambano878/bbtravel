-- Migration: 018 — RLS helper functions hardened against recursion.
--
-- Context: the original public.is_super_admin() and public.has_permission()
-- helpers (defined in 003_rbac_expansion.sql) ran as SECURITY INVOKER and
-- therefore re-triggered RLS on public.staff_profiles whenever a policy on
-- staff_profiles itself called them. That caused `stack depth limit exceeded`
-- errors under admin-panel login.
--
-- Fix: redefine both helpers as SECURITY DEFINER with a locked search_path so
-- they bypass RLS when invoked from inside a policy but can't be exploited by
-- search-path tricks. This change was applied live to the Supabase project
-- and is captured here so rebuilding the DB from migrations reproduces it.

create or replace function public.is_super_admin()
returns boolean
language sql
stable
security definer
set search_path = public, pg_temp
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
security definer
set search_path = public, pg_temp
as $$
  select public.is_super_admin() or exists (
    select 1
    from public.staff_profiles sp
    join public.roles r on r.role_key = sp.role
    join public.role_permissions rp on rp.role_id = r.id
    join public.permissions p on p.id = rp.permission_id
    where sp.user_id = auth.uid()
      and p.permission_key = has_permission.permission_key
  ) or exists (
    select 1
    from public.user_custom_roles ucr
    join public.custom_role_permissions crp on crp.custom_role_id = ucr.custom_role_id
    join public.permissions p on p.id = crp.permission_id
    where ucr.user_id = auth.uid()
      and p.permission_key = has_permission.permission_key
  );
$$;
