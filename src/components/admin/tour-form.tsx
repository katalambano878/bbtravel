"use client";

import { useEffect, useMemo, useState } from "react";
import type { FormEvent } from "react";
import { Loader2, X, UploadCloud } from "lucide-react";
import { useRouter } from "next/navigation";

import type { TourRow } from "@/lib/tours/service";
import { upsertTourAction } from "@/app/actions";
import { Card, CardContent } from "@/components/ui/card";

const MAX_BYTES = 8 * 1024 * 1024;
const ALLOWED_TYPES = new Set(["image/jpeg", "image/png", "image/webp", "image/gif"]);

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
  const [galleryUrls, setGalleryUrls] = useState<string[]>([]);
  const [coverUrl, setCoverUrl] = useState<string>(initial?.cover_image ?? "");
  const [coverUploading, setCoverUploading] = useState(false);
  const [galleryUploading, setGalleryUploading] = useState(false);

  useEffect(() => {
    setGalleryUrls((initial?.images ?? []).filter(Boolean));
    setCoverUrl(initial?.cover_image ?? "");
  }, [initial?.id, initial?.cover_image, initial?.images]);

  async function uploadToStorage(file: File): Promise<string> {
    if (!ALLOWED_TYPES.has((file.type || "").toLowerCase())) {
      throw new Error("Please use JPG, PNG, WebP, or GIF.");
    }
    if (file.size > MAX_BYTES) throw new Error("Each image must be 8MB or smaller.");
    const folder =
      (previewSlug || "tours")
        .toLowerCase()
        .replace(/[^a-z0-9-]+/g, "-")
        .replace(/-+/g, "-")
        .replace(/^-|-$/g, "")
        .slice(0, 72) || "tours";
    const body = new FormData();
    body.set("file", file);
    body.set("folder", folder);
    const res = await fetch("/api/admin/tours/upload", { method: "POST", body });
    const json = (await res.json().catch(() => ({}))) as { url?: string; error?: string };
    if (!res.ok || !json.url) throw new Error(json.error || "Upload failed.");
    return json.url;
  }

  async function handleCoverFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    setCoverUploading(true);
    setError(null);
    try {
      const url = await uploadToStorage(file);
      setCoverUrl(url);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Cover upload failed.");
    } finally {
      setCoverUploading(false);
    }
  }

  async function handleGalleryFiles(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? []);
    e.target.value = "";
    if (files.length === 0) return;
    setGalleryUploading(true);
    setError(null);
    try {
      const urls: string[] = [];
      for (const file of files) {
        urls.push(await uploadToStorage(file));
      }
      setGalleryUrls((prev) => [...prev, ...urls]);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gallery upload failed.");
    } finally {
      setGalleryUploading(false);
    }
  }

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const data = new FormData(form);
    if (!data.get("slug")) data.set("slug", previewSlug);
    data.delete("cover_file");
    data.delete("gallery_files");
    data.set("cover_image", coverUrl);
    data.set("images", galleryUrls.join("\n"));
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
            <Field
              label="Cover image"
              hint="Upload a hero image for the card and tour page. Stored in the site media library."
            >
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start">
                <div className="relative min-h-[120px] flex-1 overflow-hidden rounded-xl border border-dashed border-slate-200 bg-slate-50">
                  {coverUrl ? (
                    <>
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={coverUrl} alt="" className="h-32 w-full object-cover sm:h-40" />
                      <button
                        type="button"
                        onClick={() => setCoverUrl("")}
                        className="absolute right-2 top-2 rounded-full bg-white/90 p-1 text-slate-500 shadow hover:bg-rose-50 hover:text-rose-600"
                        aria-label="Remove cover image"
                      >
                        <X className="h-3.5 w-3.5" />
                      </button>
                    </>
                  ) : (
                    <div className="flex h-32 w-full items-center justify-center sm:h-40">
                      <span className="inline-flex items-center gap-1.5 text-[11px] text-slate-400">
                        <UploadCloud className="h-3.5 w-3.5" /> No image yet
                      </span>
                    </div>
                  )}
                </div>
                <div className="flex flex-1 flex-col gap-2">
                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/webp,image/gif"
                    onChange={handleCoverFile}
                    disabled={coverUploading}
                    className="input text-xs file:mr-3 file:rounded-lg file:border-0 file:bg-bb-navy file:px-3 file:py-1.5 file:text-xs file:font-semibold file:text-white disabled:opacity-50"
                  />
                  {coverUploading ? (
                    <p className="inline-flex items-center gap-1.5 text-[11px] text-slate-500">
                      <Loader2 className="h-3 w-3 animate-spin" /> Uploading…
                    </p>
                  ) : null}
                </div>
              </div>
            </Field>
            <Field
              label="Gallery images"
              hint="Add more photos (optional). Remove items below to drop them from the gallery."
            >
              <input
                type="file"
                accept="image/jpeg,image/png,image/webp,image/gif"
                multiple
                onChange={handleGalleryFiles}
                disabled={galleryUploading}
                className="input mb-3 text-xs file:mr-3 file:rounded-lg file:border-0 file:bg-slate-200 file:px-3 file:py-1.5 file:text-xs file:font-semibold file:text-bb-navy disabled:opacity-50"
              />
              {galleryUploading ? (
                <p className="mb-2 inline-flex items-center gap-1.5 text-[11px] text-slate-500">
                  <Loader2 className="h-3 w-3 animate-spin" /> Uploading…
                </p>
              ) : null}
              {galleryUrls.length > 0 ? (
                <ul className="space-y-2 rounded-xl border border-slate-100 bg-slate-50/80 p-3">
                  {galleryUrls.map((url, index) => (
                    <li
                      key={`${url}-${index}`}
                      className="flex items-center gap-2 rounded-lg border border-white bg-white p-2 text-xs shadow-sm"
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={url} alt="" className="h-10 w-14 shrink-0 rounded object-cover" />
                      <span className="min-w-0 flex-1 truncate font-mono text-[10px] text-slate-600">{url}</span>
                      <button
                        type="button"
                        onClick={() => setGalleryUrls((prev) => prev.filter((_, i) => i !== index))}
                        className="shrink-0 rounded p-1 text-slate-400 hover:bg-rose-50 hover:text-rose-600"
                        aria-label="Remove image"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-[11px] text-slate-400">No gallery images yet — upload files above or save with cover only.</p>
              )}
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
          disabled={submitting || coverUploading || galleryUploading}
          className="inline-flex items-center gap-1.5 rounded-lg bg-bb-navy px-4 py-2 text-xs font-semibold text-white hover:bg-bb-navy/90 disabled:opacity-50"
        >
          {submitting ? (
            <>
              <Loader2 className="h-3.5 w-3.5 animate-spin" /> Saving…
            </>
          ) : coverUploading || galleryUploading ? (
            <>
              <Loader2 className="h-3.5 w-3.5 animate-spin" /> Uploading…
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
