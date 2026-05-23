-- Migration 026 — lock down internal SECURITY DEFINER helpers from PostgREST.
--
-- `is_super_admin`, `has_permission` and `rls_auto_enable` are intended to be
-- called only from inside RLS policies (where the SECURITY DEFINER context
-- bypasses RLS on staff_profiles to avoid recursion) and from the server's
-- service-role client. They should never be exposed as RPC endpoints to
-- anon / authenticated users via /rest/v1/rpc/.
--
-- Resolves Supabase advisor 0028/0029 by revoking EXECUTE from the public
-- API roles. RLS policy evaluation continues to work because RLS uses the
-- function owner (postgres) which still holds EXECUTE.

revoke execute on function public.has_permission(text) from anon, authenticated, public;
revoke execute on function public.is_super_admin() from anon, authenticated, public;
revoke execute on function public.rls_auto_enable() from anon, authenticated, public;
