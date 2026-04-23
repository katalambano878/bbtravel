import { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";

import { getStaffAccessContext } from "@/lib/data/queries";
import { getFormSubmissionsInbox } from "@/lib/forms/record-submission";
import { Card, CardContent } from "@/components/ui/card";

export const metadata: Metadata = {
  title: "Inbox — B.B. Admin"
};

const FORM_LABELS: Record<string, string> = {
  START_APPLICATION: "Start application (full form)",
  START_PROFILE: "Start flow (4-step)",
  CONTACT: "Contact page",
  TOUR_INQUIRY: "Travel deal inquiry"
};

function formatWhen(iso: string) {
  const d = new Date(iso);
  return Number.isNaN(d.getTime())
    ? "—"
    : d.toLocaleString("en-GH", { dateStyle: "medium", timeStyle: "short" });
}

export default async function AdminInboxPage() {
  const context = await getStaffAccessContext();
  if (!context) redirect("/admin/login");

  const allowed =
    context.profile.role === "super_admin" ||
    context.permissions.includes("leads.view") ||
    context.permissions.includes("crm.view");
  if (!allowed) redirect("/admin");

  let rows: Awaited<ReturnType<typeof getFormSubmissionsInbox>> = [];
  let loadError: string | null = null;
  try {
    rows = await getFormSubmissionsInbox(300);
  } catch {
    loadError = "Could not load submissions. If this is a new environment, apply the latest database migration.";
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-bb-navy" style={{ fontFamily: "var(--font-sora)" }}>
          Website Inbox
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          Every public form submission is stored here with the full JSON payload. Admins are notified by email when{" "}
          <code className="rounded bg-slate-100 px-1 text-xs">RESEND_API_KEY</code> and{" "}
          <code className="rounded bg-slate-100 px-1 text-xs">ADMIN_NOTIFY_EMAILS</code> (optional) are set.
        </p>
      </div>

      {loadError ? (
        <p className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">{loadError}</p>
      ) : null}

      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50/50 text-[11px] uppercase tracking-wide text-slate-500">
                  <th className="px-4 py-2.5 text-left font-semibold">When</th>
                  <th className="px-4 py-2.5 text-left font-semibold">Form</th>
                  <th className="px-4 py-2.5 text-left font-semibold">Name</th>
                  <th className="px-4 py-2.5 text-left font-semibold">Email</th>
                  <th className="px-4 py-2.5 text-left font-semibold">Phone</th>
                  <th className="px-4 py-2.5 text-left font-semibold">Links</th>
                  <th className="px-4 py-2.5 text-right font-semibold">Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {rows.map((row) => (
                  <tr key={row.id} className="align-top">
                    <td className="px-4 py-3 text-[12px] text-slate-500 whitespace-nowrap">
                      {formatWhen(row.created_at)}
                    </td>
                    <td className="px-4 py-3 text-[12px] text-bb-navy">
                      {FORM_LABELS[row.form_type] ?? row.form_type.replace(/_/g, " ")}
                    </td>
                    <td className="px-4 py-3 text-[12px] font-medium text-slate-800">{row.name || "—"}</td>
                    <td className="px-4 py-3 text-[12px] text-slate-600">{row.email || "—"}</td>
                    <td className="px-4 py-3 text-[12px] text-slate-600">{row.phone || "—"}</td>
                    <td className="px-4 py-3 text-[11px]">
                      {row.lead_id ? (
                        <Link
                          href={`/admin/pipeline?tab=leads`}
                          className="text-bb-sky hover:underline"
                        >
                          Lead
                        </Link>
                      ) : (
                        "—"
                      )}
                      {row.case_id ? (
                        <span className="text-slate-400">
                          {" "}
                          ·{" "}
                          <Link href={`/admin/pipeline?tab=cases`} className="text-bb-sky hover:underline">
                            Case
                          </Link>
                        </span>
                      ) : null}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <details className="text-left">
                        <summary className="cursor-pointer text-[11px] font-semibold text-bb-navy hover:underline">
                          JSON
                        </summary>
                        {row.page_url ? (
                          <p className="mb-1 mt-2 text-[10px] text-slate-500">Page: {row.page_url}</p>
                        ) : null}
                        <pre className="mt-2 max-h-64 max-w-md overflow-auto rounded-lg bg-slate-50 p-2 text-[10px] text-slate-700">
                          {JSON.stringify(row.payload, null, 2)}
                        </pre>
                      </details>
                    </td>
                  </tr>
                ))}
                {rows.length === 0 && !loadError ? (
                  <tr>
                    <td colSpan={7} className="px-4 py-12 text-center text-sm text-slate-400">
                      No form submissions yet. They will appear when visitors use{" "}
                      <span className="text-slate-600">/start</span>, <span className="text-slate-600">/start-application</span>
                      , <span className="text-slate-600">/contact</span>, or a travel deal inquiry form.
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
