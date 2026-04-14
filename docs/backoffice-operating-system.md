# B.B. Travel Consult Backoffice Operating System

## Overview

This document describes the internal operating system modules now available in the codebase for B.B. Travel Consult:

- RBAC and staff security controls
- CRM and case operations engine
- Document lifecycle and notifications
- HRMS
- Finance and controls
- BI and reporting scheduler

## Environment and Deployment

Ensure the following are configured in your deployment environment:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `APP_BASE_URL`
- `GOOGLE_SITE_VERIFICATION` (for SEO verification)

## Database Migration Order

Run all migrations in sequence:

1. `001_initial_schema.sql`
2. `002_add_flight_reservation_service_type.sql`
3. `003_rbac_expansion.sql`
4. `004_auth_security_controls.sql`
5. `005_settings_system.sql`
6. `006_crm_pipeline.sql`
7. `007_case_workflow_engine.sql`
8. `008_documents_lifecycle.sql`
9. `009_notifications_tasks_events.sql`
10. `010_hr_core.sql`
11. `011_attendance_leave_payroll.sql`
12. `012_performance_ats.sql`
13. `013_finance_ledger.sql`
14. `014_invoicing_ar_ap.sql`
15. `015_finance_controls.sql`
16. `016_reporting_saved_views.sql`
17. `017_scheduler_jobs.sql`

## Admin Modules

- `/admin`: Operations summary
- `/admin/settings`: business profile, controls
- `/admin/crm`: lead pipeline, assignment, conversion
- `/admin/cases`: tasks, notes, linked cases
- `/admin/documents`: review/version lifecycle
- `/admin/notifications`: notifications and task desk
- `/admin/hr`: employee, attendance, leave, payroll inputs
- `/admin/finance`: invoicing, payments, expense and refund controls
- `/admin/bi`: executive KPIs, saved views, exports, scheduled reports

## Roles and Permission Model

System roles include:

- `super_admin`
- `operations_manager`
- `case_manager`
- `visa_officer`
- `recruitment_officer`
- `study_abroad_officer`
- `tours_officer`
- `finance_manager`
- `accountant`
- `hr_manager`
- `hr_officer`
- `customer_support`
- `auditor`
- `read_only_analyst`

Permission keys are mapped in `src/lib/auth/permissions.ts` and seeded in migration `003_rbac_expansion.sql`.

## Security and Compliance Controls

- Central permission gate in `src/lib/auth/policy.ts`
- Immutable audit writes via `src/lib/audit/events.ts`
- Login lockout and security policy controls:
  - `staff_login_attempts`
  - `staff_login_events`
  - `auth_security_policies`
- Financial anti-corruption controls:
  - payment cap trigger on invoice totals
  - invoice paid amount refresh trigger
  - open period controls scaffold

## Finance Rules

- Invoice totals are computed from subtotal/tax/discount.
- Payment insertion is blocked if payment exceeds invoice balance.
- Refund processing is permission-restricted (`finance.refund.process`).
- Financial periods support OPEN/LOCKED/CLOSED lifecycle.

## Reporting and Scheduling

- Saved report filters: `saved_report_views`
- Export queue: `report_exports`
- Scheduled reports: `scheduled_reports`
- Background jobs scaffold: `job_queue`
- Event stream: `event_log`
- KPI download endpoint: `/admin/bi/export`

## Validation Checklist

After deployment, validate:

1. Staff role access boundaries
2. Lead assignment and conversion
3. Case task and note workflows
4. Document versioning and review loops
5. Leave approvals and payroll input lock behavior
6. Invoice creation and payment cap enforcement
7. Refund approvals and audit logs
8. BI saved views, queued exports, scheduled reports
