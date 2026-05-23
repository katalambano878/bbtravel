-- Migration 025 — pin search_path on legacy helper / trigger functions.
--
-- Resolves the Supabase advisor warning `function_search_path_mutable` for
-- functions defined before the project enforced `set search_path` on every
-- helper. None of these functions are SECURITY DEFINER, so the practical
-- risk was low, but pinning the search_path is best-practice hygiene and
-- silences the dashboard advisor.
--
-- Applied live via Supabase MCP on 2026-05-23. This file mirrors that
-- change so a fresh rebuild from migrations reproduces production exactly.

alter function public.set_updated_at() set search_path = public, pg_temp;
alter function public.apply_petty_cash_movement() set search_path = public, pg_temp;
alter function public.is_case_assignee(case_id uuid) set search_path = public, pg_temp;
alter function public.is_case_owner(case_id uuid) set search_path = public, pg_temp;
alter function public.ensure_financial_period_open(target_date date) set search_path = public, pg_temp;
alter function public.validate_invoice_payment_limit() set search_path = public, pg_temp;
alter function public.refresh_invoice_paid_amount() set search_path = public, pg_temp;
