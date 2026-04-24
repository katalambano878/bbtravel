-- Rich tour content to power the `/tours` hub and `/tours/[slug]` pages.
-- Extends the existing `public.tours` table without breaking prior columns.

alter table public.tours
  add column if not exists destination text,
  add column if not exists duration_days integer,
  add column if not exists price_range text,
  add column if not exists cover_image text,
  add column if not exists short_description text,
  add column if not exists overview text,
  add column if not exists highlights text[] not null default '{}',
  add column if not exists exclusions text[] not null default '{}',
  add column if not exists sort_order integer not null default 0;

create index if not exists idx_tours_active_sort
  on public.tours (is_active desc, sort_order asc, created_at desc);

comment on column public.tours.itinerary is
  'JSON array of {day:int, title:text, description:text} objects for the day-by-day itinerary.';
comment on column public.tours.highlights is
  'Short bullet strings shown as chips on the tour detail page.';
comment on column public.tours.exclusions is
  'Items NOT included in the package. Paired with the existing `inclusions` column.';
comment on column public.tours.cover_image is
  'Primary hero image URL. Falls back to the first entry of `images` when empty.';
