import { Metadata } from "next";
import Link from "next/link";
import { redirect, notFound } from "next/navigation";
import { ArrowLeft, ExternalLink } from "lucide-react";

import { getStaffAccessContext } from "@/lib/data/queries";
import { getTourById } from "@/lib/tours/service";
import { TourForm } from "@/components/admin/tour-form";

export const metadata: Metadata = { title: "Edit tour — B.B. Admin" };

export default async function EditTourPage({ params }: { params: Promise<{ id: string }> }) {
  const context = await getStaffAccessContext();
  if (!context) redirect("/admin/login");
  const allowed =
    context.profile.role === "super_admin" || context.permissions.includes("tours.manage");
  if (!allowed) redirect("/admin");

  const { id } = await params;
  const tour = await getTourById(id);
  if (!tour) notFound();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-3">
        <Link
          href="/admin/tours"
          className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-[11px] font-semibold text-slate-600 hover:bg-slate-50"
        >
          <ArrowLeft className="h-3.5 w-3.5" /> Back to tours
        </Link>
        <Link
          href={`/tours/${tour.slug}`}
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-[11px] font-semibold text-bb-navy hover:bg-slate-50"
        >
          <ExternalLink className="h-3.5 w-3.5" /> Open on website
        </Link>
      </div>
      <div>
        <h1 className="text-2xl font-bold text-bb-navy" style={{ fontFamily: "var(--font-sora)" }}>
          {tour.title}
        </h1>
        <p className="mt-1 text-sm text-slate-500 font-mono text-[12px]">/tours/{tour.slug}</p>
      </div>
      <TourForm initial={tour} />
    </div>
  );
}
