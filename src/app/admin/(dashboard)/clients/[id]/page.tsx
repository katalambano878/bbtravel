import { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { Calendar, FileText, MessageSquare, Receipt, StickyNote } from "lucide-react";

import { getClientDetail, getStaffAccessContext } from "@/lib/data/queries";
import { Card, CardContent } from "@/components/ui/card";
import { ServiceBadge } from "@/components/admin/service-badge";
import { WhatsappButton } from "@/components/admin/whatsapp-button";
import { getService } from "@/lib/services/catalogue";

export const metadata: Metadata = {
  title: "Client 360 — B.B. Admin"
};

function formatGhs(amount: number | null | undefined) {
  return `GH₵${Number(amount ?? 0).toLocaleString("en-GH", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}
function formatDate(v: string | null | undefined) {
  if (!v) return "—";
  const d = new Date(v);
  return Number.isNaN(d.getTime()) ? "—" : d.toLocaleDateString("en-GH", { dateStyle: "medium" });
}
function formatDateTime(v: string | null | undefined) {
  if (!v) return "—";
  const d = new Date(v);
  return Number.isNaN(d.getTime())
    ? "—"
    : d.toLocaleString("en-GH", { dateStyle: "medium", timeStyle: "short" });
}

export default async function ClientDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const context = await getStaffAccessContext();
  if (!context) redirect("/admin/login");

  const { id } = await params;
  const data = await getClientDetail(id);
  if (!data.client) notFound();

  const c = data.client as {
    id: string;
    name: string;
    email: string | null;
    phone: string | null;
    whatsapp: string | null;
    city?: string | null;
    country?: string | null;
    date_of_birth?: string | null;
    passport_number?: string | null;
    passport_expiry?: string | null;
    preferred_channel?: string | null;
    tags?: string[] | null;
    notes?: string | null;
    created_at?: string;
  };

  const totalInvoiced = data.invoices.reduce(
    (sum, i) => sum + Number((i as { total_amount?: number }).total_amount ?? 0),
    0
  );
  const totalPaid = data.invoices.reduce(
    (sum, i) => sum + Number((i as { amount_paid?: number }).amount_paid ?? 0),
    0
  );
  const outstanding = Math.max(totalInvoiced - totalPaid, 0);

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-medium uppercase tracking-wider text-slate-400">Client</p>
          <h1 className="text-2xl font-bold text-bb-navy" style={{ fontFamily: "var(--font-sora)" }}>
            {c.name}
          </h1>
          <p className="mt-0.5 text-sm text-slate-500">
            {c.email || "—"} · {c.phone || "—"}
            {c.city || c.country ? ` · ${[c.city, c.country].filter(Boolean).join(", ")}` : ""}
          </p>
          {c.tags && c.tags.length > 0 ? (
            <div className="mt-2 flex flex-wrap gap-1">
              {c.tags.map((t) => (
                <span
                  key={t}
                  className="rounded-full border border-slate-200 bg-slate-50 px-1.5 py-0.5 text-[10px] font-medium text-slate-600"
                >
                  {t}
                </span>
              ))}
            </div>
          ) : null}
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <WhatsappButton
            variant="solid"
            phone={c.whatsapp || c.phone}
            name={c.name}
            clientId={c.id}
            defaultVars={{ client_name: c.name, staff_name: context.profile.full_name.split(" ")[0] }}
          />
          {c.email ? (
            <a
              href={`mailto:${c.email}`}
              className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"
            >
              Email
            </a>
          ) : null}
          {c.phone ? (
            <a
              href={`tel:${c.phone}`}
              className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"
            >
              Call
            </a>
          ) : null}
        </div>
      </div>

      {/* KPI strip */}
      <div className="grid gap-3 md:grid-cols-4">
        <Card>
          <CardContent className="p-4">
            <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">Invoiced</p>
            <p className="mt-1 text-xl font-bold text-bb-navy">{formatGhs(totalInvoiced)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">Collected</p>
            <p className="mt-1 text-xl font-bold text-emerald-700">{formatGhs(totalPaid)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">Outstanding</p>
            <p className={`mt-1 text-xl font-bold ${outstanding > 0 ? "text-amber-700" : "text-slate-400"}`}>
              {formatGhs(outstanding)}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">Client since</p>
            <p className="mt-1 text-xl font-bold text-bb-navy">{formatDate(c.created_at)}</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Left: profile card */}
        <Card className="lg:col-span-1">
          <CardContent className="space-y-3 p-5">
            <h2 className="text-sm font-bold text-bb-navy">Profile</h2>
            <dl className="space-y-2 text-[12px]">
              <Row label="Preferred channel" value={c.preferred_channel} />
              <Row label="WhatsApp" value={c.whatsapp} />
              <Row label="Date of birth" value={formatDate(c.date_of_birth)} />
              <Row label="Passport #" value={c.passport_number} />
              <Row label="Passport expiry" value={formatDate(c.passport_expiry)} />
              <Row label="City" value={c.city} />
              <Row label="Country" value={c.country} />
            </dl>
            {c.notes ? (
              <div className="rounded-lg border border-slate-200 bg-slate-50 p-3 text-[12px] leading-relaxed text-slate-700">
                {c.notes}
              </div>
            ) : null}
          </CardContent>
        </Card>

        {/* Right: cases + activities */}
        <div className="space-y-6 lg:col-span-2">
          <Card>
            <CardContent className="p-5">
              <div className="mb-3 flex items-center justify-between">
                <h2 className="flex items-center gap-1.5 text-sm font-bold text-bb-navy">
                  <FileText className="h-4 w-4" /> Cases ({data.cases.length})
                </h2>
                <Link
                  href="/admin/pipeline?tab=cases"
                  className="text-[11px] font-semibold text-bb-navy hover:underline"
                >
                  All cases
                </Link>
              </div>
              {data.cases.length === 0 ? (
                <p className="py-4 text-center text-[12px] text-slate-400">No cases yet.</p>
              ) : (
                <ul className="space-y-2">
                  {data.cases.map((cs) => {
                    const svc = getService(cs.case_type as string);
                    return (
                      <li
                        key={cs.id as string}
                        className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-slate-200 p-3"
                      >
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2">
                            <ServiceBadge serviceType={cs.case_type as string} />
                            <span className="rounded-full border border-slate-200 bg-slate-50 px-1.5 py-0 text-[10px] font-medium text-slate-600">
                              {String(cs.status).replace(/_/g, " ")}
                            </span>
                          </div>
                          <p className="mt-1 text-[11px] text-slate-500">
                            Opened {formatDate(cs.created_at as string)}
                            {cs.sla_due_at ? ` · SLA ${formatDate(cs.sla_due_at as string)}` : ""}
                          </p>
                        </div>
                        <span className="text-[10px] text-slate-400">{svc?.label}</span>
                      </li>
                    );
                  })}
                </ul>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-5">
              <h2 className="mb-3 flex items-center gap-1.5 text-sm font-bold text-bb-navy">
                <Receipt className="h-4 w-4" /> Invoices ({data.invoices.length})
              </h2>
              {data.invoices.length === 0 ? (
                <p className="py-4 text-center text-[12px] text-slate-400">No invoices yet.</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-[12px]">
                    <thead>
                      <tr className="text-left text-[10px] uppercase tracking-wide text-slate-500">
                        <th className="pb-2">#</th>
                        <th className="pb-2">Status</th>
                        <th className="pb-2">Issued</th>
                        <th className="pb-2">Due</th>
                        <th className="pb-2 text-right">Total</th>
                        <th className="pb-2 text-right">Paid</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {data.invoices.map((inv) => (
                        <tr key={inv.id as string}>
                          <td className="py-2 font-semibold text-bb-navy">{inv.invoice_number}</td>
                          <td className="py-2 text-slate-600">{inv.status}</td>
                          <td className="py-2 text-slate-500">{formatDate(inv.issue_date as string)}</td>
                          <td className="py-2 text-slate-500">{formatDate(inv.due_date as string)}</td>
                          <td className="py-2 text-right font-semibold text-bb-navy">
                            {formatGhs(inv.total_amount as number)}
                          </td>
                          <td className="py-2 text-right text-emerald-700">
                            {formatGhs(inv.amount_paid as number)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>

          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardContent className="p-5">
                <h2 className="mb-3 flex items-center gap-1.5 text-sm font-bold text-bb-navy">
                  <Calendar className="h-4 w-4" /> Appointments
                </h2>
                {data.appointments.length === 0 ? (
                  <p className="py-3 text-center text-[12px] text-slate-400">None scheduled.</p>
                ) : (
                  <ul className="space-y-2">
                    {data.appointments.slice(0, 6).map((a) => (
                      <li key={a.id as string} className="rounded-lg border border-slate-200 p-2.5">
                        <p className="text-[12px] font-semibold text-bb-navy">
                          {String(a.appointment_type || "").replace(/_/g, " ") || "Appointment"}
                        </p>
                        <p className="text-[11px] text-slate-500">
                          {formatDateTime(a.scheduled_at as string)}
                          {a.location ? ` · ${a.location}` : ""}
                        </p>
                      </li>
                    ))}
                  </ul>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-5">
                <h2 className="mb-3 flex items-center gap-1.5 text-sm font-bold text-bb-navy">
                  <MessageSquare className="h-4 w-4" /> Recent WhatsApp
                </h2>
                {data.whatsapp.length === 0 ? (
                  <p className="py-3 text-center text-[12px] text-slate-400">No messages logged.</p>
                ) : (
                  <ul className="space-y-2">
                    {data.whatsapp.slice(0, 6).map((m) => (
                      <li key={m.id as string} className="rounded-lg border border-slate-200 p-2.5">
                        <p className="text-[11px] font-semibold text-bb-navy">
                          {m.template_key || "Custom"} · {m.status}
                        </p>
                        <p className="mt-0.5 line-clamp-2 text-[11px] text-slate-600">{m.body}</p>
                        <p className="mt-0.5 text-[10px] text-slate-400">{formatDateTime(m.sent_at as string)}</p>
                      </li>
                    ))}
                  </ul>
                )}
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardContent className="p-5">
              <h2 className="mb-3 flex items-center gap-1.5 text-sm font-bold text-bb-navy">
                <StickyNote className="h-4 w-4" /> Notes
              </h2>
              {data.notes.length === 0 ? (
                <p className="py-3 text-center text-[12px] text-slate-400">No case notes yet.</p>
              ) : (
                <ul className="space-y-2">
                  {data.notes.slice(0, 8).map((n) => (
                    <li key={n.id as string} className="rounded-lg border border-slate-200 p-2.5">
                      <p className="text-[11px] text-slate-600">{n.note}</p>
                      <p className="mt-0.5 text-[10px] text-slate-400">{formatDateTime(n.created_at as string)}</p>
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-3 border-b border-slate-100 pb-1.5 last:border-0 last:pb-0">
      <dt className="text-[11px] font-medium uppercase tracking-wide text-slate-500">{label}</dt>
      <dd className="text-right text-[12px] text-slate-700">{value || "—"}</dd>
    </div>
  );
}
