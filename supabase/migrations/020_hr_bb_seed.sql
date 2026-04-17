-- 020_hr_bb_seed.sql
-- ---------------------------------------------------------------------------
-- Seeds B.B. Travel Consult's operating structure: departments and teams
-- aligned with the four service divisions (Immigration, Travel, Corporate &
-- Events, and Operations). Idempotent via UPSERT on the unique `code`.
-- ---------------------------------------------------------------------------

-- Departments --------------------------------------------------------------
insert into public.departments (code, name, description)
values
  ('VISA', 'Visa & Immigration', 'Visa assistance, refusal overturns, work & study permits, and document processing'),
  ('TRAVEL', 'Travel & Tourism', 'Flights, hotels, tour packages, transport, and travel insurance'),
  ('CORP', 'Corporate & Events', 'Corporate travel programs, destination events, retreats, and export facilitation'),
  ('CONSULT', 'Consultation & Advisory', 'Strategy and advisory sessions for complex cases'),
  ('FIN', 'Finance', 'Invoicing, collections, expenses, payroll, and reporting'),
  ('OPS', 'Operations & Admin', 'Operations, customer success, office admin, HR'),
  ('MKT', 'Marketing & Growth', 'Brand, campaigns, content, and lead generation')
on conflict (code) do update
  set name = excluded.name,
      description = excluded.description,
      updated_at = now();

-- Teams --------------------------------------------------------------------
with dept as (
  select id, code from public.departments
)
insert into public.teams (department_id, code, name)
select d.id, t.code, t.name
from (values
  -- Visa desk
  ('VISA', 'VISA-UK',      'UK & Schengen Desk'),
  ('VISA', 'VISA-NA',      'USA & Canada Desk'),
  ('VISA', 'VISA-GCC',     'Middle East & Asia Desk'),
  ('VISA', 'STUDY',        'Study Placement Team'),
  ('VISA', 'RECRUIT',      'International Recruitment Team'),
  ('VISA', 'DOCS',         'Document Processing Team'),

  -- Travel
  ('TRAVEL', 'FLIGHTS',    'Flights & Ticketing Desk'),
  ('TRAVEL', 'HOTELS',     'Hotels & Reservations Desk'),
  ('TRAVEL', 'TOURS',      'Tour Packages Desk'),
  ('TRAVEL', 'INSURANCE',  'Travel Insurance Desk'),
  ('TRAVEL', 'TRANSPORT',  'Transport & Transfers Desk'),

  -- Corporate & events
  ('CORP', 'CORP-TRAVEL',  'Corporate Travel Programs'),
  ('CORP', 'EVENTS',       'Destination Events & Experiences'),
  ('CORP', 'EXPORT',       'Business Export Facilitation'),

  -- Consultation
  ('CONSULT', 'STRATEGY',  'Strategy & Advisory'),

  -- Finance
  ('FIN', 'AR',            'Invoicing & Collections'),
  ('FIN', 'AP',            'Payables & Expenses'),
  ('FIN', 'PAYROLL',       'Payroll & Benefits'),

  -- Operations
  ('OPS', 'CS',            'Customer Success'),
  ('OPS', 'HR',            'People & HR'),
  ('OPS', 'ADMIN',         'Office Admin & IT'),

  -- Marketing
  ('MKT', 'GROWTH',        'Growth & Campaigns'),
  ('MKT', 'CONTENT',       'Brand & Content')
) as t(dept_code, code, name)
join dept d on d.code = t.dept_code
on conflict (code) do update
  set name = excluded.name,
      updated_at = now();
