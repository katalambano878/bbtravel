import { featuredTours } from "@/lib/mockData";
import { createAdminClient } from "@/lib/db/admin";
import { requirePermission } from "@/lib/auth/policy";
import { writeAuditEvent } from "@/lib/audit/events";

export interface TourItineraryItem {
  day: number;
  title: string;
  description: string;
}

export interface TourRow {
  id: string;
  title: string;
  slug: string;
  destination: string | null;
  duration: string | null;
  duration_days: number | null;
  price: number;
  price_range: string | null;
  cover_image: string | null;
  images: string[];
  short_description: string | null;
  overview: string | null;
  highlights: string[];
  inclusions: string[];
  exclusions: string[];
  itinerary: TourItineraryItem[];
  is_active: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

function slugify(input: string): string {
  return input
    .trim()
    .toLowerCase()
    .replace(/['"]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

function parseLines(value: FormDataEntryValue | null): string[] {
  if (typeof value !== "string") return [];
  return value
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => line.length > 0);
}

function parseItinerary(value: FormDataEntryValue | null): TourItineraryItem[] {
  if (typeof value !== "string") return [];
  const blocks = value
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);
  const items: TourItineraryItem[] = [];
  blocks.forEach((line, index) => {
    // Supported formats: "Day 1 | Arrival | Welcome dinner" or "1 | Arrival | Welcome dinner"
    const parts = line.split("|").map((p) => p.trim());
    if (parts.length === 0) return;
    const first = parts[0] ?? "";
    const dayMatch = first.match(/(\d+)/);
    const day = dayMatch ? Number(dayMatch[1]) : index + 1;
    const title = parts[1] ?? `Day ${day}`;
    const description = parts.slice(2).join(" | ") || "";
    if (!title && !description) return;
    items.push({ day, title, description });
  });
  return items;
}

function normalizeRow(row: Record<string, unknown>): TourRow {
  const imagesJson = row.images as unknown;
  let images: string[] = [];
  if (Array.isArray(imagesJson)) {
    images = imagesJson.map((entry) => String(entry)).filter(Boolean);
  }

  const itineraryJson = row.itinerary as unknown;
  let itinerary: TourItineraryItem[] = [];
  if (Array.isArray(itineraryJson)) {
    itinerary = itineraryJson
      .map((entry) => {
        if (typeof entry === "string") {
          return { day: 0, title: entry, description: "" } satisfies TourItineraryItem;
        }
        if (entry && typeof entry === "object") {
          const obj = entry as Record<string, unknown>;
          return {
            day: Number(obj.day ?? 0) || 0,
            title: String(obj.title ?? ""),
            description: String(obj.description ?? "")
          } satisfies TourItineraryItem;
        }
        return null;
      })
      .filter((item): item is TourItineraryItem => item !== null && item.title.length > 0);
  }

  return {
    id: String(row.id),
    title: String(row.title ?? ""),
    slug: String(row.slug ?? ""),
    destination: (row.destination as string | null) ?? null,
    duration: (row.duration as string | null) ?? null,
    duration_days: row.duration_days === null || row.duration_days === undefined
      ? null
      : Number(row.duration_days),
    price: Number(row.price ?? 0),
    price_range: (row.price_range as string | null) ?? null,
    cover_image: (row.cover_image as string | null) ?? null,
    images,
    short_description: (row.short_description as string | null) ?? null,
    overview: (row.overview as string | null) ?? null,
    highlights: Array.isArray(row.highlights) ? (row.highlights as unknown[]).map(String) : [],
    inclusions: Array.isArray(row.inclusions) ? (row.inclusions as unknown[]).map(String) : [],
    exclusions: Array.isArray(row.exclusions) ? (row.exclusions as unknown[]).map(String) : [],
    itinerary,
    is_active: Boolean(row.is_active ?? true),
    sort_order: Number(row.sort_order ?? 0),
    created_at: String(row.created_at ?? ""),
    updated_at: String(row.updated_at ?? "")
  };
}

const TOUR_COLUMNS =
  "id, title, slug, destination, duration, duration_days, price, price_range, cover_image, images, short_description, overview, highlights, inclusions, exclusions, itinerary, is_active, sort_order, created_at, updated_at";

export async function listTours(): Promise<TourRow[]> {
  await requirePermission("tours.manage");
  const admin = createAdminClient();
  const { data, error } = await admin
    .from("tours")
    .select(TOUR_COLUMNS)
    .order("sort_order", { ascending: true })
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (data ?? []).map((row) => normalizeRow(row as Record<string, unknown>));
}

export async function getTourById(id: string): Promise<TourRow | null> {
  await requirePermission("tours.manage");
  const admin = createAdminClient();
  const { data, error } = await admin.from("tours").select(TOUR_COLUMNS).eq("id", id).maybeSingle();
  if (error) throw error;
  if (!data) return null;
  return normalizeRow(data as Record<string, unknown>);
}

export interface UpsertTourInput {
  id?: string | null;
  title: string;
  slug?: string;
  destination?: string;
  durationDays?: number | null;
  durationLabel?: string;
  price?: number;
  priceRange?: string;
  coverImage?: string;
  images?: string[];
  shortDescription?: string;
  overview?: string;
  highlights?: string[];
  inclusions?: string[];
  exclusions?: string[];
  itinerary?: TourItineraryItem[];
  isActive?: boolean;
  sortOrder?: number;
}

export async function upsertTour(input: UpsertTourInput): Promise<string> {
  const ctx = await requirePermission("tours.manage");
  const admin = createAdminClient();

  const title = input.title.trim();
  if (!title) throw new Error("Title is required.");

  const slugInput = (input.slug ?? "").trim();
  const slug = slugInput ? slugify(slugInput) : slugify(title);
  if (!slug) throw new Error("A valid slug is required.");

  const images = (input.images ?? []).filter(Boolean);
  const cover = (input.coverImage ?? "").trim() || images[0] || null;
  const duration =
    (input.durationLabel ?? "").trim() ||
    (input.durationDays ? `${input.durationDays} days` : "");

  const payload = {
    title,
    slug,
    destination: input.destination?.trim() || null,
    duration_days: input.durationDays ?? null,
    duration: duration || null,
    price: Number(input.price ?? 0),
    price_range: input.priceRange?.trim() || null,
    cover_image: cover,
    images,
    short_description: input.shortDescription?.trim() || null,
    overview: input.overview?.trim() || null,
    highlights: input.highlights ?? [],
    inclusions: input.inclusions ?? [],
    exclusions: input.exclusions ?? [],
    itinerary: input.itinerary ?? [],
    is_active: input.isActive ?? true,
    sort_order: Math.max(0, Number(input.sortOrder ?? 0)),
    updated_at: new Date().toISOString()
  } satisfies Record<string, unknown>;

  if (input.id) {
    const { data, error } = await admin
      .from("tours")
      .update(payload)
      .eq("id", input.id)
      .select("id")
      .single();
    if (error) throw error;
    await writeAuditEvent({
      actorId: ctx.user.id,
      action: "tour.updated",
      targetType: "tour",
      targetId: data.id as string,
      payload: { title, slug }
    });
    return data.id as string;
  }

  const { data, error } = await admin
    .from("tours")
    .insert(payload)
    .select("id")
    .single();
  if (error) throw error;
  await writeAuditEvent({
    actorId: ctx.user.id,
    action: "tour.created",
    targetType: "tour",
    targetId: data.id as string,
    payload: { title, slug }
  });
  return data.id as string;
}

export async function setTourActive(id: string, active: boolean): Promise<void> {
  const ctx = await requirePermission("tours.manage");
  const admin = createAdminClient();
  const { error } = await admin
    .from("tours")
    .update({ is_active: active, updated_at: new Date().toISOString() })
    .eq("id", id);
  if (error) throw error;
  await writeAuditEvent({
    actorId: ctx.user.id,
    action: active ? "tour.published" : "tour.unpublished",
    targetType: "tour",
    targetId: id
  });
}

export async function deleteTour(id: string): Promise<void> {
  const ctx = await requirePermission("tours.manage");
  const admin = createAdminClient();
  const { error } = await admin.from("tours").delete().eq("id", id);
  if (error) throw error;
  await writeAuditEvent({
    actorId: ctx.user.id,
    action: "tour.deleted",
    targetType: "tour",
    targetId: id
  });
}

/**
 * Returns only the fields needed by public-facing tour pages. Uses the
 * standard server client (anon) so RLS applies.
 */
export async function getPublicToursDb(): Promise<TourRow[]> {
  const db = createAdminClient();
  const { data, error } = await db
    .from("tours")
    .select(TOUR_COLUMNS)
    .eq("is_active", true)
    .order("sort_order", { ascending: true })
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (data ?? []).map((row) => normalizeRow(row as Record<string, unknown>));
}

function parseStartingPriceFromRange(priceRange: string): number {
  const parts = priceRange.match(/[\d,]+(?:\.\d+)?/g);
  if (!parts || parts.length === 0) return 0;
  const n = Number(parts[0].replace(/,/g, ""));
  return Number.isFinite(n) ? n : 0;
}

/**
 * Upsert each entry in `featuredTours` (see `src/lib/mockData.ts`) by slug.
 * Creates new rows or overwrites existing catalogue content; images stay as
 * URLs from the mock (uploaded images are unchanged until re-saved in admin).
 */
export async function syncFeaturedToursFromMock(): Promise<{ count: number; slugs: string[] }> {
  await requirePermission("tours.manage");
  const admin = createAdminClient();
  const slugs: string[] = [];

  for (let i = 0; i < featuredTours.length; i++) {
    const t = featuredTours[i];
    const slug = slugify(String(t.slug ?? ""));
    if (!slug) throw new Error(`Featured tour at index ${i} is missing a slug.`);

    const { data: existing } = await admin.from("tours").select("id").eq("slug", slug).maybeSingle();

    const itinerary: TourItineraryItem[] = (t.itinerary ?? []).map((row) => ({
      day: Number(row.day ?? 0),
      title: String(row.title ?? ""),
      description: String(row.description ?? "")
    }));

    const imageUrl = String(t.image ?? "").trim();
    await upsertTour({
      id: (existing as { id?: string } | null)?.id,
      title: t.title,
      slug: t.slug,
      destination: t.destination,
      durationDays: t.durationDays,
      durationLabel: `${t.durationDays} days`,
      price: parseStartingPriceFromRange(t.priceRange),
      priceRange: t.priceRange,
      coverImage: imageUrl,
      images: imageUrl ? [imageUrl] : [],
      shortDescription: t.shortDescription,
      overview: t.overview,
      highlights: t.highlights ?? [],
      inclusions: t.included ?? [],
      exclusions: t.excluded ?? [],
      itinerary,
      isActive: true,
      sortOrder: i
    });

    slugs.push(slug);
  }

  return { count: slugs.length, slugs };
}

export { parseLines as parseLineList, parseItinerary as parseItineraryText, slugify as slugifyTour };
