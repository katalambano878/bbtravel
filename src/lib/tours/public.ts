import { createAdminClient } from "@/lib/db/admin";
import { featuredTours } from "@/lib/mockData";

export interface PublicTourItinerary {
  day: number;
  title: string;
  description: string;
}

/**
 * Shape consumed by the existing `/tours` and `/tours/[slug]` pages.
 * Fields match `featuredTours` in `src/lib/mockData.ts` exactly so the
 * pages can stay dumb and keep their current markup.
 */
export interface PublicTour {
  id: string;
  title: string;
  slug: string;
  destination: string;
  durationDays: number;
  priceRange: string;
  image: string;
  highlights: string[];
  shortDescription: string;
  overview: string;
  included: string[];
  excluded: string[];
  itinerary: PublicTourItinerary[];
}

const fallbackTours: PublicTour[] = (featuredTours as PublicTour[]).map((t) => ({
  id: t.id,
  title: t.title,
  slug: t.slug,
  destination: t.destination,
  durationDays: t.durationDays,
  priceRange: t.priceRange,
  image: t.image,
  highlights: t.highlights ?? [],
  shortDescription: t.shortDescription ?? "",
  overview: t.overview ?? "",
  included: t.included ?? [],
  excluded: t.excluded ?? [],
  itinerary: (t.itinerary ?? []).map((i) => ({
    day: Number(i.day ?? 0),
    title: String(i.title ?? ""),
    description: String(i.description ?? "")
  }))
}));

function normaliseImage(cover: string | null, images: unknown): string {
  if (cover && typeof cover === "string") return cover;
  if (Array.isArray(images) && images.length > 0) return String(images[0]);
  return fallbackTours[0]?.image ?? "";
}

function mapRow(row: Record<string, unknown>): PublicTour {
  const itineraryRaw = row.itinerary as unknown;
  let itinerary: PublicTourItinerary[] = [];
  if (Array.isArray(itineraryRaw)) {
    itinerary = itineraryRaw
      .map((entry, idx) => {
        if (typeof entry === "string") {
          return { day: idx + 1, title: entry, description: "" };
        }
        if (entry && typeof entry === "object") {
          const obj = entry as Record<string, unknown>;
          return {
            day: Number(obj.day ?? idx + 1) || idx + 1,
            title: String(obj.title ?? ""),
            description: String(obj.description ?? "")
          };
        }
        return null;
      })
      .filter((item): item is PublicTourItinerary => item !== null && item.title.length > 0);
  }

  const price = Number(row.price ?? 0);
  const priceRangeRaw = row.price_range ? String(row.price_range) : "";
  const priceRange: string =
    priceRangeRaw || (price > 0 ? `From $${Math.round(price).toLocaleString()}` : "Contact us");

  const durationDays = Number(row.duration_days ?? 0);
  const durationFromLabel = (() => {
    const label = String(row.duration ?? "");
    const match = label.match(/(\d+)/);
    return match ? Number(match[1]) : 0;
  })();

  return {
    id: String(row.id),
    title: String(row.title ?? ""),
    slug: String(row.slug ?? ""),
    destination: String(row.destination ?? ""),
    durationDays: durationDays > 0 ? durationDays : durationFromLabel,
    priceRange,
    image: normaliseImage(row.cover_image as string | null, row.images),
    highlights: Array.isArray(row.highlights) ? (row.highlights as unknown[]).map(String) : [],
    shortDescription: String(row.short_description ?? ""),
    overview: String(row.overview ?? ""),
    included: Array.isArray(row.inclusions) ? (row.inclusions as unknown[]).map(String) : [],
    excluded: Array.isArray(row.exclusions) ? (row.exclusions as unknown[]).map(String) : [],
    itinerary
  };
}

/**
 * Returns published tours from the database. Falls back to the curated seed
 * list so the marketing site never renders an empty catalogue.
 */
export async function getPublishedTours(): Promise<PublicTour[]> {
  try {
    const db = createAdminClient();
    const { data, error } = await db
      .from("tours")
      .select(
        "id, title, slug, destination, duration, duration_days, price, price_range, cover_image, images, short_description, overview, highlights, inclusions, exclusions, itinerary, sort_order, created_at"
      )
      .eq("is_active", true)
      .order("sort_order", { ascending: true })
      .order("created_at", { ascending: false });

    if (error) throw error;
    if (!data || data.length === 0) return fallbackTours;
    return data.map((row) => mapRow(row as Record<string, unknown>));
  } catch {
    return fallbackTours;
  }
}

export async function getPublishedTourBySlug(slug: string): Promise<PublicTour | null> {
  const all = await getPublishedTours();
  return all.find((tour) => tour.slug === slug) ?? null;
}
