import { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Plus, ExternalLink, Pencil, Eye, EyeOff, MapPin, Clock } from "lucide-react";

import { getStaffAccessContext } from "@/lib/data/queries";
import { listTours } from "@/lib/tours/service";
import { Card, CardContent } from "@/components/ui/card";
import { adminTable } from "@/components/admin/table-styles";
import { toggleTourActiveAction } from "@/app/actions";
import { DeleteTourButton } from "@/components/admin/tour-row-actions";
import { SyncMockToursButton } from "@/components/admin/sync-mock-tours-button";

export const metadata: Metadata = {
  title: "Tours — B.B. Admin"
};

function formatWhen(value: string) {
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleDateString("en-GH", { dateStyle: "medium" });
}

export default async function AdminToursPage() {
  const context = await getStaffAccessContext();
  if (!context) redirect("/admin/login");

  const allowed =
    context.profile.role === "super_admin" || context.permissions.includes("tours.manage");
  if (!allowed) redirect("/admin");

  let rows: Awaited<ReturnType<typeof listTours>> = [];
  let loadError: string | null = null;
  try {
    rows = await listTours();
  } catch {
    loadError =
      "Could not load tours. If this is a new environment, apply the latest database migration.";
  }

  const published = rows.filter((r) => r.is_active).length;
  const drafts = rows.length - published;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-bb-navy" style={{ fontFamily: "var(--font-sora)" }}>
            Tours
          </h1>
          <p className="mt-1 max-w-2xl text-sm text-slate-500">
            Manage the tour catalogue that powers the <span className="font-mono text-[12px]">/tours</span> hub and
            individual detail pages on the public site.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <SyncMockToursButton />
          <Link
            href="/admin/tours/new"
            className="inline-flex items-center gap-1.5 rounded-lg bg-bb-navy px-4 py-2 text-xs font-semibold text-white hover:bg-bb-navy/90"
          >
            <Plus className="h-3.5 w-3.5" /> New tour
          </Link>
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        <Card>
          <CardContent className="p-4">
            <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">Total</p>
            <p className="mt-1 text-2xl font-bold text-bb-navy">{rows.length}</p>
            <p className="mt-1 text-[11px] text-slate-400">In the catalogue</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">Published</p>
            <p className="mt-1 text-2xl font-bold text-bb-navy">{published}</p>
            <p className="mt-1 text-[11px] text-slate-400">Visible on the website</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">Drafts</p>
            <p className="mt-1 text-2xl font-bold text-bb-navy">{drafts}</p>
            <p className="mt-1 text-[11px] text-slate-400">Unpublished or archived</p>
          </CardContent>
        </Card>
      </div>

      {loadError ? (
        <p className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">{loadError}</p>
      ) : null}

      <Card>
        <CardContent className="p-0">
          <div className={adminTable.wrap}>
            <table className={adminTable.table}>
              <thead className={adminTable.thead}>
                <tr>
                  <th className={adminTable.th}>Tour</th>
                  <th className={adminTable.th}>Destination</th>
                  <th className={adminTable.th}>Duration</th>
                  <th className={adminTable.th}>Price</th>
                  <th className={adminTable.th}>Status</th>
                  <th className={adminTable.th}>Updated</th>
                  <th className={adminTable.thRight}>Actions</th>
                </tr>
              </thead>
              <tbody className={adminTable.body}>
                {rows.map((tour) => {
                  const cover = tour.cover_image || tour.images[0] || null;
                  return (
                    <tr key={tour.id} className={adminTable.row}>
                      <td className={adminTable.td}>
                        <div className="flex items-center gap-3">
                          <div className="relative h-12 w-16 shrink-0 overflow-hidden rounded-md bg-slate-100">
                            {cover ? (
                              // eslint-disable-next-line @next/next/no-img-element
                              <img
                                src={cover}
                                alt={tour.title}
                                className="h-full w-full object-cover"
                                loading="lazy"
                              />
                            ) : (
                              <div className="flex h-full w-full items-center justify-center text-[10px] text-slate-400">
                                No image
                              </div>
                            )}
                          </div>
                          <div className="min-w-0">
                            <p className="truncate text-sm font-semibold text-bb-navy">{tour.title}</p>
                            <p className="truncate text-[11px] text-slate-500 font-mono">/{tour.slug}</p>
                          </div>
                        </div>
                      </td>
                      <td className={adminTable.td}>
                        <span className="inline-flex items-center gap-1 text-[12px] text-slate-700">
                          <MapPin className="h-3 w-3 text-bb-gold" />
                          {tour.destination || "—"}
                        </span>
                      </td>
                      <td className={adminTable.td}>
                        <span className="inline-flex items-center gap-1 text-[12px] text-slate-700">
                          <Clock className="h-3 w-3 text-slate-400" />
                          {tour.duration ||
                            (tour.duration_days ? `${tour.duration_days} days` : "—")}
                        </span>
                      </td>
                      <td className={adminTable.td}>
                        <span className="text-[12px] font-semibold text-bb-navy">
                          {tour.price_range ||
                            (tour.price > 0 ? `$${Math.round(tour.price).toLocaleString()}` : "—")}
                        </span>
                      </td>
                      <td className={adminTable.td}>
                        {tour.is_active ? (
                          <span className="inline-flex items-center gap-1 rounded-full border border-emerald-200 bg-emerald-50 px-2 py-0.5 text-[10px] font-semibold text-emerald-700">
                            <Eye className="h-3 w-3" /> Published
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 rounded-full border border-slate-200 bg-slate-50 px-2 py-0.5 text-[10px] font-semibold text-slate-500">
                            <EyeOff className="h-3 w-3" /> Draft
                          </span>
                        )}
                      </td>
                      <td className={`${adminTable.td} text-[11px] text-slate-500`}>
                        {formatWhen(tour.updated_at)}
                      </td>
                      <td className={`${adminTable.td} text-right`}>
                        <div className="flex items-center justify-end gap-1.5">
                          <Link
                            href={`/tours/${tour.slug}`}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-1 rounded-full border border-slate-200 bg-white px-2 py-0.5 text-[11px] font-semibold text-slate-600 hover:bg-slate-50"
                            title="Open on website"
                          >
                            <ExternalLink className="h-3 w-3" />
                          </Link>
                          <Link
                            href={`/admin/tours/${tour.id}`}
                            className="inline-flex items-center gap-1 rounded-full border border-slate-200 bg-white px-2 py-0.5 text-[11px] font-semibold text-bb-navy hover:bg-slate-50"
                          >
                            <Pencil className="h-3 w-3" /> Edit
                          </Link>
                          <form action={toggleTourActiveAction}>
                            <input type="hidden" name="id" value={tour.id} />
                            <input type="hidden" name="active" value={tour.is_active ? "false" : "true"} />
                            <button
                              type="submit"
                              className="inline-flex items-center gap-1 rounded-full border border-slate-200 bg-white px-2 py-0.5 text-[11px] font-semibold text-slate-600 hover:bg-slate-50"
                              title={tour.is_active ? "Unpublish" : "Publish"}
                            >
                              {tour.is_active ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
                              {tour.is_active ? "Unpublish" : "Publish"}
                            </button>
                          </form>
                          <DeleteTourButton id={tour.id} title={tour.title} />
                        </div>
                      </td>
                    </tr>
                  );
                })}
                {rows.length === 0 && !loadError ? (
                  <tr>
                    <td colSpan={7} className="px-4 py-16 text-center">
                      <div className="mx-auto flex max-w-md flex-col items-center gap-2 text-slate-400">
                        <p className="text-sm font-semibold text-slate-600">No tours yet</p>
                        <p className="text-[12px]">
                          Tours you publish here appear on the <span className="font-mono">/tours</span> hub and on
                          individual tour detail pages.
                        </p>
                        <Link
                          href="/admin/tours/new"
                          className="mt-2 inline-flex items-center gap-1.5 rounded-lg bg-bb-navy px-3 py-1.5 text-[11px] font-semibold text-white hover:bg-bb-navy/90"
                        >
                          <Plus className="h-3.5 w-3.5" /> Add your first tour
                        </Link>
                      </div>
                    </td>
                  </tr>
                ) : null}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
