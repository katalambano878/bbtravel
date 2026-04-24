import { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowLeft } from "lucide-react";

import { getStaffAccessContext } from "@/lib/data/queries";
import { TourForm } from "@/components/admin/tour-form";

export const metadata: Metadata = { title: "New tour — B.B. Admin" };

export default async function NewTourPage() {
  const context = await getStaffAccessContext();
  if (!context) redirect("/admin/login");
  const allowed =
    context.profile.role === "super_admin" || context.permissions.includes("tours.manage");
  if (!allowed) redirect("/admin");

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Link
          href="/admin/tours"
          className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-[11px] font-semibold text-slate-600 hover:bg-slate-50"
        >
          <ArrowLeft className="h-3.5 w-3.5" /> Back to tours
        </Link>
      </div>
      <div>
        <h1 className="text-2xl font-bold text-bb-navy" style={{ fontFamily: "var(--font-sora)" }}>
          New tour
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          Add a new curated package. It appears on the public <span className="font-mono">/tours</span> page the
          moment you save with Publish on.
        </p>
      </div>
      <TourForm />
    </div>
  );
}
