import { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Inbox, Mail, Plane, Globe2, User, MessageSquare } from "lucide-react";

import { getStaffAccessContext } from "@/lib/data/queries";
import { getFormSubmissionsInbox } from "@/lib/forms/record-submission";
import { Card, CardContent } from "@/components/ui/card";
import { adminTable } from "@/components/admin/table-styles";

export const metadata: Metadata = {
  title: "Inbox — B.B. Admin"
};

const FORM_LABELS: Record<string, string> = {
  START_APPLICATION: "Start application",
  START_PROFILE: "Start flow",
  CONTACT: "Contact",
  TOUR_INQUIRY: "Travel deal"
};

const FORM_META: Record<string, { tone: string; icon: React.ComponentType<{ className?: string }> }> = {
  START_APPLICATION: { tone: "bg-sky-50 text-sky-700 border-sky-200", icon: User },
  START_PROFILE: { tone: "bg-violet-50 text-violet-700 border-violet-200", icon: User },
  CONTACT: { tone: "bg-slate-100 text-slate-700 border-slate-200", icon: MessageSquare },
  TOUR_INQUIRY: { tone: "bg-emerald-50 text-emerald-700 border-emerald-200", icon: Plane }
};

function formatWhen(iso: string) {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "—";
  const now = Date.now();
  const diff = now - d.getTime();
  const mins = Math.round(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.round(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return d.toLocaleString("en-GH", { dateStyle: "medium", timeStyle: "short" });
}

function formatAbs(iso: string) {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleString("en-GH", { dateStyle: "medium", timeStyle: "short" });
}

export default async function AdminInboxPage({
  searchParams
}: {
  searchParams?: Promise<{ type?: string }>;
}) {
  const context = await getStaffAccessContext();
  if (!context) redirect("/admin/login");

  const allowed =
    context.profile.role === "super_admin" ||
    context.permissions.includes("leads.view") ||
    context.permissions.includes("crm.view");
  if (!allowed) redirect("/admin");

  const params = (await searchParams) ?? {};
  const activeType = (params.type ?? "all").toUpperCase();

  let allRows: Awaited<ReturnType<typeof getFormSubmissionsInbox>> = [];
  let loadError: string | null = null;
  try {
    allRows = await getFormSubmissionsInbox(300);
  } catch {
    loadError = "Could not load submissions. If this is a new environment, apply the latest database migration.";
  }

  const counts = allRows.reduce<Record<string, number>>((acc, r) => {
    acc[r.form_type] = (acc[r.form_type] ?? 0) + 1;
    return acc;
  }, {});
  const total = allRows.length;
  const rows = activeType === "ALL" ? allRows : allRows.filter((r) => r.form_type === activeType);

  const sevenDaysAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
  const last7d = allRows.filter((r) => new Date(r.created_at).getTime() >= sevenDaysAgo).length;
  const last24h = allRows.filter(
    (r) => new Date(r.created_at).getTime() >= Date.now() - 24 * 60 * 60 * 1000
  ).length;

  const tabs: Array<{ id: string; label: string; icon: React.ComponentType<{ className?: string }>; count: number }> = [
    { id: "ALL", label: "All", icon: Inbox, count: total },
    {
      id: "START_APPLICATION",
      label: "Start application",
      icon: User,
      count: counts.START_APPLICATION ?? 0
    },
    { id: "START_PROFILE", label: "Start flow", icon: User, count: counts.START_PROFILE ?? 0 },
    { id: "CONTACT", label: "Contact", icon: MessageSquare, count: counts.CONTACT ?? 0 },
    { id: "TOUR_INQUIRY", label: "Travel deals", icon: Plane, count: counts.TOUR_INQUIRY ?? 0 }
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-bb-navy" style={{ fontFamily: "var(--font-sora)" }}>
            Website inbox
          </h1>
          <p className="mt-1 max-w-2xl text-sm text-slate-500">
            Every public form submission is logged here with the full payload, and routed to the admin email when{" "}
            <code className="rounded bg-slate-100 px-1 text-[11px]">RESEND_API_KEY</code> and{" "}
            <code className="rounded bg-slate-100 px-1 text-[11px]">ADMIN_NOTIFY_EMAILS</code> are configured.
          </p>
        </div>
        <div className="flex items-center gap-2 text-[11px] text-slate-500">
          <Mail className="h-3.5 w-3.5" />
          Notifications route to your admin email list
        </div>
      </div>

      {/* KPI strip */}
      <div className="grid gap-3 sm:grid-cols-3">
        <Card>
          <CardContent className="p-4">
            <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">Submissions</p>
            <p className="mt-1 text-2xl font-bold text-bb-navy">{total}</p>
            <p className="mt-1 text-[11px] text-slate-400">Total in system</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">Last 7 days</p>
            <p className="mt-1 text-2xl font-bold text-bb-navy">{last7d}</p>
            <p className="mt-1 text-[11px] text-slate-400">Form submissions received</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">Last 24 hours</p>
            <p className="mt-1 text-2xl font-bold text-bb-navy">{last24h}</p>
            <p className="mt-1 text-[11px] text-slate-400">Acknowledge within 30 min on WhatsApp</p>
          </CardContent>
        </Card>
      </div>

      {/* Filter tabs */}
      <div className="flex flex-wrap items-center gap-1.5">
        {tabs.map((t) => {
          const Icon = t.icon;
          const active = activeType === t.id || (t.id === "ALL" && activeType === "ALL");
          const href = t.id === "ALL" ? "/admin/inbox" : `/admin/inbox?type=${t.id}`;
          return (
            <Link
              key={t.id}
              href={href}
              className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-semibold transition ${
                active
                  ? "border-bb-navy bg-bb-navy text-white shadow-sm"
                  : "border-slate-200 bg-white text-slate-600 hover:border-bb-navy/40 hover:text-bb-navy"
              }`}
            >
              <Icon className="h-3.5 w-3.5" />
              {t.label}
              <span
                className={`inline-flex min-w-[1.25rem] items-center justify-center rounded-full px-1.5 py-0.5 text-[10px] font-bold ${
                  active ? "bg-white/20 text-white" : "bg-slate-100 text-slate-500"
                }`}
              >
                {t.count}
              </span>
            </Link>
          );
        })}
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
                  <th className={adminTable.th}>When</th>
                  <th className={adminTable.th}>Form</th>
                  <th className={adminTable.th}>Contact</th>
                  <th className={adminTable.th}>Summary</th>
                  <th className={adminTable.th}>Links</th>
                  <th className={adminTable.thRight}>Details</th>
                </tr>
              </thead>
              <tbody className={adminTable.body}>
                {rows.map((row) => {
                  const meta = FORM_META[row.form_type] ?? {
                    tone: "bg-slate-100 text-slate-700 border-slate-200",
                    icon: Globe2
                  };
                  const Icon = meta.icon;
                  const payload = (row.payload ?? {}) as Record<string, unknown>;
                  const summary =
                    (typeof payload.message === "string" && payload.message) ||
                    (typeof payload.destination === "string" && payload.destination
                      ? `Dest: ${payload.destination}`
                      : "") ||
                    (typeof payload.tour_title === "string" && payload.tour_title) ||
                    (typeof payload.intent === "string" && payload.intent) ||
                    "";
                  return (
                    <tr key={row.id} className={adminTable.row}>
                      <td className={`${adminTable.td} whitespace-nowrap`}>
                        <p className="text-[12px] font-semibold text-bb-navy">{formatWhen(row.created_at)}</p>
                        <p className="mt-0.5 text-[10px] text-slate-400">{formatAbs(row.created_at)}</p>
                      </td>
                      <td className={adminTable.td}>
                        <span
                          className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-semibold ${meta.tone}`}
                        >
                          <Icon className="h-3 w-3" />
                          {FORM_LABELS[row.form_type] ?? row.form_type.replace(/_/g, " ")}
                        </span>
                      </td>
                      <td className={adminTable.td}>
                        <p className="text-[12px] font-semibold text-slate-800">{row.name || "—"}</p>
                        <p className="mt-0.5 text-[11px] text-slate-500">
                          {row.email || "—"}
                          {row.phone ? ` · ${row.phone}` : ""}
                        </p>
                      </td>
                      <td className={`${adminTable.td} max-w-[260px]`}>
                        <p className="line-clamp-2 text-[11px] text-slate-600">{summary || "—"}</p>
                      </td>
                      <td className={adminTable.td}>
                        <div className="flex flex-wrap items-center gap-1.5 text-[11px]">
                          {row.lead_id ? (
                            <Link
                              href={`/admin/pipeline?tab=leads`}
                              className="rounded-full border border-sky-200 bg-sky-50 px-2 py-0.5 font-semibold text-sky-700 hover:bg-sky-100"
                            >
                              Lead
                            </Link>
                          ) : null}
                          {row.case_id ? (
                            <Link
                              href={`/admin/pipeline?tab=cases`}
                              className="rounded-full border border-violet-200 bg-violet-50 px-2 py-0.5 font-semibold text-violet-700 hover:bg-violet-100"
                            >
                              Case
                            </Link>
                          ) : null}
                          {!row.lead_id && !row.case_id ? <span className="text-slate-400">—</span> : null}
                        </div>
                      </td>
                      <td className={`${adminTable.td} text-right`}>
                        <details className="text-left">
                          <summary className="cursor-pointer text-[11px] font-semibold text-bb-navy hover:underline">
                            JSON
                          </summary>
                          {row.page_url ? (
                            <p className="mb-1 mt-2 truncate text-[10px] text-slate-500">Page: {row.page_url}</p>
                          ) : null}
                          <pre className="mt-2 max-h-64 max-w-md overflow-auto rounded-lg border border-slate-100 bg-slate-50 p-2 text-[10px] text-slate-700">
                            {JSON.stringify(row.payload, null, 2)}
                          </pre>
                        </details>
                      </td>
                    </tr>
                  );
                })}
                {rows.length === 0 && !loadError ? (
                  <tr>
                    <td colSpan={6} className="px-4 py-16 text-center">
                      <div className="mx-auto flex max-w-md flex-col items-center gap-2 text-slate-400">
                        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-slate-100">
                          <Inbox className="h-5 w-5 text-slate-400" />
                        </div>
                        <p className="text-sm font-semibold text-slate-600">
                          {activeType === "ALL" ? "No submissions yet" : "No submissions in this filter"}
                        </p>
                        <p className="text-[12px]">
                          {activeType === "ALL"
                            ? "They will appear as visitors use /start, /start-application, /contact, or a travel deal inquiry."
                            : "Try a different filter or wait for new submissions."}
                        </p>
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
