"use client";

import { useMemo, useState } from "react";
import type { FormEvent } from "react";
import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";

import type { TourRow } from "@/lib/tours/service";
import { upsertTourAction } from "@/app/actions";
import { Card, CardContent } from "@/components/ui/card";

interface TourFormProps {
  initial?: TourRow | null;
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

function itineraryToText(items: { day: number; title: string; description: string }[] | undefined) {
  if (!items || items.length === 0) return "";
  return items.map((i) => `Day ${i.day} | ${i.title} | ${i.description}`).join("\n");
}

export function TourForm({ initial }: TourFormProps) {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [title, setTitle] = useState(initial?.title ?? "");
  const [slug, setSlug] = useState(initial?.slug ?? "");
  const [slugEdited, setSlugEdited] = useState(Boolean(initial?.slug));

  const previewSlug = useMemo(() => (slug ? slug : slugify(title)), [slug, title]);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const data = new FormData(form);
    if (!data.get("slug")) data.set("slug", previewSlug);
    setSubmitting(true);
    setError(null);
    try {
      await upsertTourAction(data);
      router.push("/admin/tours");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not save tour.");
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {initial?.id ? <input type="hidden" name="id" value={initial.id} /> : null}

      {error ? (
        <p className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800">{error}</p>
      ) : null}

      <Card>
        <CardContent className="p-5">
          <h2 className="mb-4 text-sm font-bold text-bb-navy">Basics</h2>
          <div className="grid gap-3 sm:grid-cols-2">
            <Field label="Title" required full>
              <input
                name="title"
                required
                value={title}
                onChange={(e) => {
                  setTitle(e.target.value);
                  if (!slugEdited) setSlug(slugify(e.target.value));
                }}
                placeholder="Dubai Luxury Escape"
                className="input"
              />
            </Field>
            <Field
              label="Slug"
              hint={
                <span>
                  URL: <span className="font-mono text-bb-navy">/tours/{previewSlug || "your-tour"}</span>
                </span>
              }
            >
              <input
                name="slug"
                value={slug}
                onChange={(e) => {
                  setSlug(e.target.value);
                  setSlugEdited(true);
                }}
                placeholder="dubai-luxury-escape"
                className="input font-mono"
              />
            </Field>
            <Field label="Destination">
              <input
                name="destination"
                defaultValue={initial?.destination ?? ""}
                placeholder="Dubai, UAE"
                className="input"
              />
            </Field>
            <Field label="Duration label">
              <input
                name="duration_label"
                defaultValue={initial?.duration ?? ""}
                placeholder="6 days / 5 nights"
                className="input"
              />
            </Field>
            <Field label="Duration in days">
              <input
                name="duration_days"
                type="number"
                min={0}
                defaultValue={initial?.duration_days ?? ""}
                placeholder="6"
                className="input"
              />
            </Field>
            <Field label="Starting price (USD)">
              <input
                name="price"
                type="number"
                min={0}
                step="0.01"
                defaultValue={initial?.price ?? ""}
                placeholder="1500"
                className="input"
              />
            </Field>
            <Field label="Price range / tag">
              <input
                name="price_range"
                defaultValue={initial?.price_range ?? ""}
                placeholder="$1,500 - $2,200"
                className="input"
              />
            </Field>
            <Field label="Sort order" hint="Lower numbers appear first">
              <input
                name="sort_order"
                type="number"
                defaultValue={initial?.sort_order ?? 0}
                className="input"
              />
            </Field>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-5">
          <h2 className="mb-4 text-sm font-bold text-bb-navy">Hero & story</h2>
          <div className="grid gap-3">
            <Field label="Cover image URL" hint="Shown on the hero band and card">
              <input
                name="cover_image"
                defaultValue={initial?.cover_image ?? ""}
                placeholder="https://... or /images/tours/your-tour.webp"
                className="input"
              />
            </Field>
            <Field label="Gallery image URLs" hint="One URL per line (optional)">
              <textarea
                name="images"
                rows={3}
                defaultValue={(initial?.images ?? []).join("\n")}
                placeholder={"https://example.com/gallery-1.jpg\nhttps://example.com/gallery-2.jpg"}
                className="input font-mono text-xs"
              />
            </Field>
            <Field label="Short description" hint="One line under the hero. Two sentences maximum.">
              <textarea
                name="short_description"
                rows={2}
                defaultValue={initial?.short_description ?? ""}
                placeholder="Experience the pinnacle of luxury with our all-inclusive Dubai package…"
                className="input"
              />
            </Field>
            <Field label="Overview" hint="Full paragraph shown on the tour detail page">
              <textarea
                name="overview"
                rows={6}
                defaultValue={initial?.overview ?? ""}
                placeholder="Our Dubai Luxury Escape is designed for those who desire the absolute best…"
                className="input"
              />
            </Field>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-5">
          <h2 className="mb-4 text-sm font-bold text-bb-navy">Lists</h2>
          <div className="grid gap-3 md:grid-cols-2">
            <Field label="Highlights" hint="One chip per line">
              <textarea
                name="highlights"
                rows={5}
                defaultValue={(initial?.highlights ?? []).join("\n")}
                placeholder={"Desert Safari\nBurj Khalifa VIP\nMarina Dhow Cruise"}
                className="input"
              />
            </Field>
            <div className="md:col-span-1" />
            <Field label="What's included" hint="One item per line">
              <textarea
                name="inclusions"
                rows={6}
                defaultValue={(initial?.inclusions ?? []).join("\n")}
                placeholder={"5 Nights 5-Star Accommodation\nVIP Airport Meet & Greet"}
                className="input"
              />
            </Field>
            <Field label="Not included" hint="One item per line">
              <textarea
                name="exclusions"
                rows={6}
                defaultValue={(initial?.exclusions ?? []).join("\n")}
                placeholder={"International Flights\nPersonal Expenses"}
                className="input"
              />
            </Field>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-5">
          <h2 className="mb-2 text-sm font-bold text-bb-navy">Daily itinerary</h2>
          <p className="mb-3 text-xs text-slate-500">
            One day per line. Format: <code className="rounded bg-slate-100 px-1">Day 1 | Arrival | Welcome dinner at the marina</code>
          </p>
          <textarea
            name="itinerary"
            rows={10}
            defaultValue={itineraryToText(initial?.itinerary)}
            placeholder={"Day 1 | Arrival & VIP Welcome | Private transfer to your luxury hotel. Evening welcome dinner.\nDay 2 | Modern Dubai City Tour | Explore the futuristic side of Dubai with VIP Burj Khalifa access."}
            className="input font-mono text-xs"
          />
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-5">
          <h2 className="mb-4 text-sm font-bold text-bb-navy">Visibility</h2>
          <label className="flex items-center gap-3 text-sm text-slate-700">
            <input
              type="checkbox"
              name="is_active"
              value="true"
              defaultChecked={initial ? initial.is_active : true}
              className="h-4 w-4 rounded border-slate-300 text-bb-navy focus:ring-bb-navy"
            />
            Publish to the website (otherwise saved as a draft)
          </label>
        </CardContent>
      </Card>

      <div className="flex items-center justify-end gap-3">
        <button
          type="button"
          onClick={() => router.push("/admin/tours")}
          className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={submitting}
          className="inline-flex items-center gap-1.5 rounded-lg bg-bb-navy px-4 py-2 text-xs font-semibold text-white hover:bg-bb-navy/90 disabled:opacity-50"
        >
          {submitting ? (
            <>
              <Loader2 className="h-3.5 w-3.5 animate-spin" /> Saving…
            </>
          ) : initial?.id ? (
            "Save changes"
          ) : (
            "Create tour"
          )}
        </button>
      </div>

      <style jsx>{`
        .input {
          width: 100%;
          border-radius: 0.5rem;
          border: 1px solid rgb(226 232 240);
          background-color: white;
          padding: 0.5rem 0.75rem;
          font-size: 0.875rem;
          color: rgb(15 23 42);
          outline: none;
        }
        .input:focus-visible {
          border-color: rgb(11 47 84 / 0.45);
          box-shadow: 0 0 0 3px rgb(11 47 84 / 0.12);
        }
      `}</style>
    </form>
  );
}

function Field({
  label,
  hint,
  required,
  full,
  children
}: {
  label: string;
  hint?: React.ReactNode;
  required?: boolean;
  full?: boolean;
  children: React.ReactNode;
}) {
  return (
    <label className={`block ${full ? "sm:col-span-2" : ""}`}>
      <span className="mb-1 block text-[11px] font-semibold uppercase tracking-wide text-slate-500">
        {label}
        {required ? <span className="ml-1 text-rose-500">*</span> : null}
      </span>
      {children}
      {hint ? <span className="mt-1 block text-[11px] text-slate-400">{hint}</span> : null}
    </label>
  );
}
