insert into public.roles (role_key, role_name)
values
  ('super_admin', 'Super Admin'),
  ('case_manager', 'Case Manager'),
  ('visa_officer', 'Visa Officer'),
  ('recruitment_officer', 'Recruitment Officer'),
  ('study_abroad_officer', 'Study Abroad Officer'),
  ('tours_officer', 'Tours Officer'),
  ('customer_support', 'Customer Support'),
  ('finance', 'Finance')
on conflict (role_key) do nothing;

insert into public.permissions (permission_key, description)
values
  ('dashboard.view', 'View admin dashboard'),
  ('leads.view', 'View leads inbox'),
  ('leads.edit', 'Update leads and pipeline'),
  ('cases.view', 'View cases'),
  ('cases.edit', 'Edit cases and assignments'),
  ('documents.review', 'Review documents'),
  ('appointments.manage', 'Manage appointments'),
  ('tours.manage', 'Manage tours'),
  ('content.manage', 'Manage CMS content'),
  ('messages.manage', 'Send client messages'),
  ('audit.view', 'View audit logs'),
  ('staff.manage', 'Manage staff and permissions'),
  ('finance.view', 'View finance module')
on conflict (permission_key) do nothing;

insert into public.role_permissions (role_id, permission_id)
select r.id, p.id
from public.roles r
join public.permissions p on true
where r.role_key = 'super_admin'
on conflict (role_id, permission_id) do nothing;

insert into public.role_permissions (role_id, permission_id)
select r.id, p.id
from public.roles r
join public.permissions p on p.permission_key in ('dashboard.view', 'leads.view', 'cases.view', 'cases.edit', 'appointments.manage', 'messages.manage')
where r.role_key = 'case_manager'
on conflict (role_id, permission_id) do nothing;

insert into public.role_permissions (role_id, permission_id)
select r.id, p.id
from public.roles r
join public.permissions p on p.permission_key in ('dashboard.view', 'cases.view', 'cases.edit', 'documents.review', 'appointments.manage')
where r.role_key = 'visa_officer'
on conflict (role_id, permission_id) do nothing;

insert into public.role_permissions (role_id, permission_id)
select r.id, p.id
from public.roles r
join public.permissions p on p.permission_key in ('dashboard.view', 'cases.view', 'cases.edit', 'messages.manage')
where r.role_key = 'recruitment_officer'
on conflict (role_id, permission_id) do nothing;

insert into public.role_permissions (role_id, permission_id)
select r.id, p.id
from public.roles r
join public.permissions p on p.permission_key in ('dashboard.view', 'cases.view', 'cases.edit', 'documents.review', 'messages.manage')
where r.role_key = 'study_abroad_officer'
on conflict (role_id, permission_id) do nothing;

insert into public.role_permissions (role_id, permission_id)
select r.id, p.id
from public.roles r
join public.permissions p on p.permission_key in ('dashboard.view', 'cases.view', 'cases.edit', 'tours.manage')
where r.role_key = 'tours_officer'
on conflict (role_id, permission_id) do nothing;

insert into public.role_permissions (role_id, permission_id)
select r.id, p.id
from public.roles r
join public.permissions p on p.permission_key in ('dashboard.view', 'leads.view', 'messages.manage')
where r.role_key = 'customer_support'
on conflict (role_id, permission_id) do nothing;

insert into public.role_permissions (role_id, permission_id)
select r.id, p.id
from public.roles r
join public.permissions p on p.permission_key in ('dashboard.view', 'finance.view')
where r.role_key = 'finance'
on conflict (role_id, permission_id) do nothing;

insert into public.site_settings (id, contacts, socials, seo_defaults, feature_flags)
values (
  1,
  '{"office":"+233 30 398 1171","whatsapp":"+233 24 448 9285","email":"b.btravelconsult@gmail.com","location":"Accra, Ghana (Spintex)"}'::jsonb,
  '{"instagram":"@bbtravelconsult"}'::jsonb,
  '{"title":"B.B. Travel Consult","description":"Where Your Travel Dreams Take Flight"}'::jsonb,
  '{"public_case_tracker": false}'::jsonb
)
on conflict (id) do update
set contacts = excluded.contacts,
    socials = excluded.socials,
    seo_defaults = excluded.seo_defaults,
    feature_flags = excluded.feature_flags;

insert into public.testimonials (name, quote, rating, is_active)
values
  ('Efua Mensah', 'The transparency gave me confidence throughout my process.', 5, true),
  ('Kofi Tetteh', 'From first call to placement prep, everything was clear.', 5, true),
  ('Naa Dedei Asante', 'The study abroad support felt personal and premium.', 5, true)
on conflict do nothing;

insert into public.tours (title, slug, price, duration, itinerary, inclusions, images, is_active)
values
  (
    'Dubai Luxury City Escape',
    'dubai-luxury-city-escape',
    1750,
    '6 Days',
    '["Arrival & Marina Dinner","City Heritage Tour","Desert Safari","Leisure + Shopping"]'::jsonb,
    '{"Hotel","Airport transfers","Curated activities"}',
    '["https://images.unsplash.com/photo-1512453979798-5ea266f8880c?auto=format&fit=crop&w=1400&q=80"]'::jsonb,
    true
  ),
  (
    'London Business & Culture Week',
    'london-business-culture-week',
    2200,
    '7 Days',
    '["Arrival","Business District Orientation","Cultural Day Tour","Leisure"]'::jsonb,
    '{"Hotel","Airport transfers","Selected city experiences"}',
    '["https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?auto=format&fit=crop&w=1400&q=80"]'::jsonb,
    true
  )
on conflict (slug) do nothing;

insert into public.blog_posts (title, slug, excerpt, content, cover_image_url, is_published, published_at)
values
  (
    'Visa Interview Readiness: What Actually Matters',
    'visa-interview-readiness-guide',
    'A practical preparation framework for stronger visa interview confidence.',
    'Strong readiness starts with complete documentation and consistent intent explanation.',
    'https://images.unsplash.com/photo-1526304640581-d334cdbbf45e?auto=format&fit=crop&w=1400&q=80',
    true,
    now()
  ),
  (
    'Study Abroad Checklist for Ghanaian Applicants',
    'study-abroad-checklist-ghana',
    'A step-by-step checklist from program shortlist to pre-departure.',
    'Prioritize institution fit, statement quality, financial documentation, and deadlines.',
    'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?auto=format&fit=crop&w=1400&q=80',
    true,
    now()
  )
on conflict (slug) do nothing;
