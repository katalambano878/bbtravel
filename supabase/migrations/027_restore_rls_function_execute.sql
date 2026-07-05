-- Migration 027 — restore EXECUTE for authenticated on internal RLS helpers.
--
-- Migration 026 revoked EXECUTE from authenticated on is_super_admin() and
-- has_permission(), which broke every RLS policy that references them.
-- Postgres still invokes those functions while evaluating policies for
-- authenticated requests, causing "permission denied for function is_super_admin"
-- and blocking staff_profiles reads (admin login loop).
--
-- Keep EXECUTE revoked for anon/public so these helpers are not callable as
-- direct PostgREST RPC endpoints by unauthenticated clients.

grant execute on function public.is_super_admin() to authenticated;
grant execute on function public.has_permission(text) to authenticated;
