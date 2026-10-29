import { Metadata } from "next";
import Link from "next/link";
import {
  Phone,
  PhoneCall,
  ClipboardList,
  FileWarning,
  CalendarClock,
  AlertTriangle,
  Banknote,
  ReceiptText,
  ArrowRight,
  UserPlus,
  Plus,
  CalendarDays,
  CheckCircle2
} from "lucide-react";

import { getTodayInbox, getStaffAccessContext } from "@/lib/data/queries";
import { Card, CardContent } from "@/components/ui/card";
import { getService } from "@/lib/services/catalogue";
import { StageBadge } from "@/components/admin/stage-badge";
import { ServiceBadge } from "@/components/admin/service-badge";
import { WhatsappButton } from "@/components/admin/whatsapp-button";
import {
  completeCaseTaskAction,
  decideDocumentAction,
  decideExpenseAction,
  updateAppointmentStatusAction
} from "@/app/actions";

export const metadata: Metadata = {
  title: "Today — B.B. Admin"
};

function formatGhs(amount: number) {
  return new Intl.NumberFormat("en-GH", {
    style: "currency",
    currency: "GHS",
    maximumFractionDigits: 0
  }).format(amount);
}

function formatDateTime(value: string | null | undefined) {
  if (!value) return "—";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleString("en-GH", { dateStyle: "medium", timeStyle: "short" });
}

function formatDate(value: string | null | undefined) {
  if (!value) return "—";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleDateString("en-GH", { dateStyle: "medium" });
}

function fromMaybeArray<T>(value: T | T[] | null | undefined): T | null {
  if (Array.isArray(value)) return value[0] ?? null;
  return (value as T) ?? null;
}

export default async function AdminTodayPage() {
  const context = await getStaffAccessContext();
  if (!context) return null;

  const inbox = await getTodayInbox();
  const today = new Date();
  const greeting =
    today.getHours() < 12 ? "Good morning" : today.getHours() < 17 ? "Good afternoon" : "Good evening";
  const firstName = context.profile.full_name.split(" ")[0];

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-bb-navy" style={{ fontFamily: "var(--font-sora)" }}>
            {greeting}, {firstName}
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            {today.toLocaleDateString("en-GH", { weekday: "long", month: "long", day: "numeric", year: "numeric" })}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Link
            href="/admin/pipeline?new=1"
            className="inline-flex items-center gap-1.5 rounded-lg bg-bb-navy px-3 py-2 text-xs font-semibold text-white hover:bg-bb-navy/90"
          >
            <UserPlus className="h-3.5 w-3.5" /> New lead
          </Link>
          <Link
            href="/admin/finance?tab=invoice"
            className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-bb-navy hover:border-bb-navy/30"
          >
            <ReceiptText className="h-3.5 w-3.5" /> Raise invoice
          </Link>
          <Link
            href="/admin/finance?tab=petty-cash"
            className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-bb-navy hover:border-bb-navy/30"
          >
            <Banknote className="h-3.5 w-3.5" /> Log cash movement
          </Link>
        </div>
      </div>

      {/* Top KPI strip */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="p-4">
            <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">Outstanding</p>
            <p className="mt-1 text-2xl font-bold text-bb-navy">{formatGhs(inbox.kpis.outstandingRevenue)}</p>
            <p className="mt-1 text-[11px] text-slate-400">
              Across {inbox.invoicesDue.length} invoice{inbox.invoicesDue.length === 1 ? "" : "s"} due today
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">Collected (30d)</p>
            <p className="mt-1 text-2xl font-bold text-bb-navy">{formatGhs(inbox.kpis.collected30d)}</p>
            <p className="mt-1 text-[11px] text-slate-400">Payments received</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">New leads today</p>
            <p className="mt-1 text-2xl font-bold text-bb-navy">{inbox.newLeadsToday}</p>
            <p className="mt-1 text-[11px] text-slate-400">Acknowledge within 30 min on WhatsApp</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">SLA at risk</p>
            <p className="mt-1 text-2xl font-bold text-bb-navy">{inbox.slaAtRisk.length}</p>
            <p className="mt-1 text-[11px] text-slate-400">Cases with SLA inside 7 days</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Leads to call */}
        <Card>
          <CardContent className="p-5">
            <div className="mb-3 flex items-center justify-between">
              <div>
                <h2 className="flex items-center gap-2 text-sm font-bold text-bb-navy">
                  <PhoneCall className="h-4 w-4 text-blue-600" /> Leads to call / follow up
                </h2>
                <p className="text-[11px] text-slate-400">
                  New leads and anyone whose next-action date is today or blank
                </p>
              </div>
              <Link
                href="/admin/pipeline"
                className="text-[11px] font-semibold text-bb-navy hover:underline"
              >
                Open pipeline →
              </Link>
            </div>
            {inbox.leadsToCall.length === 0 ? (
              <p className="py-6 text-center text-sm text-slate-400">Inbox zero. 🎉</p>
            ) : (
              <ul className="divide-y divide-slate-100">
                {inbox.leadsToCall.slice(0, 8).map((lead) => {
                  const svc = getService(lead.service_type as string);
                  const waPhone = lead.whatsapp || lead.phone;
                  return (
                    <li key={lead.id} className="flex flex-wrap items-center gap-3 py-2.5">
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-semibold text-bb-navy">{lead.name}</p>
                        <p className="mt-0.5 flex flex-wrap items-center gap-2 text-[11px] text-slate-500">
                          <ServiceBadge serviceType={lead.service_type as string} />
                          {lead.destination ? <span>{lead.destination}</span> : null}
                          <StageBadge stage={lead.stage as string} />
                          {lead.next_action_date ? (
                            <span className="inline-flex items-center gap-0.5">
                              <CalendarDays className="h-3 w-3" />
                              {formatDate(lead.next_action_date)}
                            </span>
                          ) : null}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        {lead.phone ? (
                          <a
                            href={`tel:${lead.phone}`}
                            className="inline-flex items-center gap-1 rounded-full border border-slate-200 bg-white px-2 py-0.5 text-[11px] font-medium text-slate-600 hover:bg-slate-50"
                          >
                            <Phone className="h-3 w-3" /> Call
                          </a>
                        ) : null}
                        <WhatsappButton
                          variant="chip"
                          phone={waPhone}
                          name={lead.name}
                          leadId={lead.id as string}
                          defaultTemplateKey="LEAD_ACK_WHATSAPP"
                          defaultVars={{
                            client_name: lead.name,
                            service: svc?.label ?? String(lead.service_type ?? ""),
                            destination: lead.destination ?? "",
                            staff_name: firstName
                          }}
                        />
                      </div>
                    </li>
                  );
                })}
              </ul>
            )}
          </CardContent>
        </Card>

        {/* Tasks due */}
        <Card>
          <CardContent className="p-5">
            <div className="mb-3 flex items-center justify-between">
              <h2 className="flex items-center gap-2 text-sm font-bold text-bb-navy">
                <ClipboardList className="h-4 w-4 text-indigo-600" /> Tasks due today
              </h2>
              <Link
                href="/admin/pipeline"
                className="text-[11px] font-semibold text-bb-navy hover:underline"
              >
                All cases →
              </Link>
            </div>
            {inbox.tasksDue.length === 0 ? (
              <p className="py-6 text-center text-sm text-slate-400">No open tasks due.</p>
            ) : (
              <ul className="divide-y divide-slate-100">
                {inbox.tasksDue.slice(0, 8).map((task) => {
                  const c = fromMaybeArray(task.cases as unknown);
                  const caseObj = c as { case_type?: string; clients?: unknown } | null;
                  const client = caseObj ? fromMaybeArray(caseObj.clients) : null;
                  const clientObj = client as { name?: string; phone?: string; whatsapp?: string } | null;
                  return (
                    <li key={task.id} className="flex flex-wrap items-center gap-3 py-2.5">
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-semibold text-bb-navy">{task.title}</p>
                        <p className="mt-0.5 text-[11px] text-slate-500">
                          {clientObj?.name ?? "—"}
                          {caseObj?.case_type ? ` · ${getService(caseObj.case_type)?.label ?? caseObj.case_type}` : ""}
                          {task.due_at ? ` · due ${formatDateTime(task.due_at)}` : ""}
                        </p>
                      </div>
                      <form action={completeCaseTaskAction}>
                        <input type="hidden" name="task_id" value={task.id as string} />
                        <input type="hidden" name="status" value="DONE" />
                        <button
                          type="submit"
                          className="inline-flex items-center gap-1 rounded-full border border-emerald-200 bg-emerald-50 px-2 py-0.5 text-[11px] font-semibold text-emerald-700 hover:bg-emerald-100"
                        >
                          <CheckCircle2 className="h-3 w-3" /> Done
                        </button>
                      </form>
                    </li>
                  );
                })}
              </ul>
            )}
          </CardContent>
        </Card>

        {/* Documents awaiting review */}
        <Card>
          <CardContent className="p-5">
            <div className="mb-3 flex items-center justify-between">
              <h2 className="flex items-center gap-2 text-sm font-bold text-bb-navy">
                <FileWarning className="h-4 w-4 text-amber-600" /> Documents awaiting review
              </h2>
              <Link
                href="/admin/documents"
                className="text-[11px] font-semibold text-bb-navy hover:underline"
              >
                All documents →
              </Link>
            </div>
            {inbox.docsAwaiting.length === 0 ? (
              <p className="py-6 text-center text-sm text-slate-400">Everything is reviewed.</p>
            ) : (
              <ul className="divide-y divide-slate-100">
                {inbox.docsAwaiting.slice(0, 8).map((doc) => {
                  const c = fromMaybeArray(doc.cases as unknown);
                  const caseObj = c as { case_type?: string; clients?: unknown } | null;
                  const client = caseObj ? fromMaybeArray(caseObj.clients) : null;
                  const clientObj = client as { name?: string } | null;
                  return (
                    <li key={doc.id} className="flex flex-wrap items-center gap-3 py-2.5">
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-semibold text-bb-navy">{doc.doc_type}</p>
                        <p className="mt-0.5 text-[11px] text-slate-500">
                          {clientObj?.name ?? "—"}
                          {caseObj?.case_type ? ` · ${getService(caseObj.case_type)?.label ?? caseObj.case_type}` : ""}
                          {doc.created_at ? ` · submitted ${formatDate(doc.created_at)}` : ""}
                        </p>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <form action={decideDocumentAction}>
                          <input type="hidden" name="document_id" value={doc.id as string} />
                          <input type="hidden" name="decision" value="APPROVED" />
                          <button
                            type="submit"
                            className="inline-flex items-center gap-1 rounded-full border border-emerald-200 bg-emerald-50 px-2 py-0.5 text-[11px] font-semibold text-emerald-700 hover:bg-emerald-100"
                          >
                            Approve
                          </button>
                        </form>
                        <form action={decideDocumentAction}>
                          <input type="hidden" name="document_id" value={doc.id as string} />
                          <input type="hidden" name="decision" value="REJECTED" />
                          <button
                            type="submit"
                            className="inline-flex items-center gap-1 rounded-full border border-rose-200 bg-rose-50 px-2 py-0.5 text-[11px] font-semibold text-rose-700 hover:bg-rose-100"
                          >
                            Reject
                          </button>
                        </form>
                      </div>
                    </li>
                  );
                })}
              </ul>
            )}
          </CardContent>
        </Card>

        {/* Invoices due */}
        <Card>
          <CardContent className="p-5">
            <div className="mb-3 flex items-center justify-between">
              <h2 className="flex items-center gap-2 text-sm font-bold text-bb-navy">
                <ReceiptText className="h-4 w-4 text-rose-600" /> Invoices to collect
              </h2>
              <Link
                href="/admin/finance"
                className="text-[11px] font-semibold text-bb-navy hover:underline"
              >
                All invoices →
              </Link>
            </div>
            {inbox.invoicesDue.length === 0 ? (
              <p className="py-6 text-center text-sm text-slate-400">No overdue invoices.</p>
            ) : (
              <ul className="divide-y divide-slate-100">
                {inbox.invoicesDue.slice(0, 8).map((inv) => {
                  const clients = fromMaybeArray(inv.clients as unknown) as
                    | { name?: string; phone?: string; whatsapp?: string }
                    | null;
                  const outstanding = Math.max(
                    Number(inv.total_amount ?? 0) - Number(inv.amount_paid ?? 0),
                    0
                  );
                  return (
                    <li key={inv.id} className="flex flex-wrap items-center gap-3 py-2.5">
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-semibold text-bb-navy">
                          {inv.invoice_number} · {clients?.name ?? "—"}
                        </p>
                        <p className="mt-0.5 text-[11px] text-slate-500">
                          Due {formatDate(inv.due_date)} · {String(inv.status)}
                        </p>
                      </div>
                      <span className="text-sm font-semibold text-rose-600">{formatGhs(outstanding)}</span>
                      <WhatsappButton
                        variant="chip"
                        phone={clients?.whatsapp || clients?.phone}
                        name={clients?.name ?? undefined}
                        defaultTemplateKey="INVOICE_SENT_WHATSAPP"
                        defaultVars={{
                          client_name: clients?.name ?? "",
                          invoice_number: inv.invoice_number as string,
                          amount: formatGhs(Number(inv.total_amount ?? 0)),
                          due_date: formatDate(inv.due_date),
                          staff_name: firstName
                        }}
                        label="Chase"
                      />
                    </li>
                  );
                })}
              </ul>
            )}
          </CardContent>
        </Card>

        {/* Appointments today */}
        <Card>
          <CardContent className="p-5">
            <div className="mb-3 flex items-center justify-between">
              <h2 className="flex items-center gap-2 text-sm font-bold text-bb-navy">
                <CalendarClock className="h-4 w-4 text-emerald-600" /> Appointments today
              </h2>
              <Link
                href="/admin/pipeline?tab=appointments"
                className="text-[11px] font-semibold text-bb-navy hover:underline"
              >
                Calendar →
              </Link>
            </div>
            {inbox.appointmentsToday.length === 0 ? (
              <p className="py-6 text-center text-sm text-slate-400">No appointments today.</p>
            ) : (
              <ul className="divide-y divide-slate-100">
                {inbox.appointmentsToday.map((apt) => {
                  const c = fromMaybeArray(apt.cases as unknown);
                  const caseObj = c as { case_type?: string; clients?: unknown } | null;
                  const client = caseObj ? fromMaybeArray(caseObj.clients) : null;
                  const clientObj = client as { name?: string; phone?: string; whatsapp?: string } | null;
                  return (
                    <li key={apt.id} className="flex flex-wrap items-center gap-3 py-2.5">
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-semibold text-bb-navy">
                          {apt.appointment_type?.replace(/_/g, " ")}
                        </p>
                        <p className="mt-0.5 text-[11px] text-slate-500">
                          {formatDateTime(apt.scheduled_at)} · {clientObj?.name ?? "—"}
                          {apt.location ? ` · ${apt.location}` : ""}
                        </p>
                      </div>
                      <form action={updateAppointmentStatusAction}>
                        <input type="hidden" name="appointment_id" value={apt.id as string} />
                        <input type="hidden" name="status" value="COMPLETED" />
                        <button
                          type="submit"
                          className="inline-flex items-center gap-1 rounded-full border border-emerald-200 bg-emerald-50 px-2 py-0.5 text-[11px] font-semibold text-emerald-700 hover:bg-emerald-100"
                        >
                          Completed
                        </button>
                      </form>
                    </li>
                  );
                })}
              </ul>
            )}
          </CardContent>
        </Card>

        {/* Expiring docs + SLA + pending expenses combined */}
        <Card>
          <CardContent className="p-5">
            <div className="mb-3 flex items-center justify-between">
              <h2 className="flex items-center gap-2 text-sm font-bold text-bb-navy">
                <AlertTriangle className="h-4 w-4 text-orange-600" /> Watchlist
              </h2>
              <span className="text-[11px] font-semibold text-slate-400">
                {inbox.expiringDocs.length + inbox.slaAtRisk.length + inbox.pendingExpenses.length + inbox.pendingLeaveRequests.length} items
              </span>
            </div>
            <div className="space-y-3 text-sm">
              {inbox.expiringDocs.length > 0 && (
                <div>
                  <p className="mb-1 text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                    Documents expiring in 30 days
                  </p>
                  <ul className="space-y-1">
                    {inbox.expiringDocs.slice(0, 3).map((d) => {
                      const c = fromMaybeArray(d.cases as unknown);
                      const caseObj = c as { clients?: unknown } | null;
                      const client = caseObj ? fromMaybeArray(caseObj.clients) : null;
                      const clientObj = client as { name?: string } | null;
                      return (
                        <li key={d.id} className="flex items-center gap-2 text-xs text-slate-700">
                          <span className="h-1.5 w-1.5 rounded-full bg-orange-500" />
                          <span className="flex-1 truncate">
                            {clientObj?.name ?? "—"} — {d.doc_type}
                          </span>
                          <span className="font-semibold text-orange-600">{formatDate(d.expires_at)}</span>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              )}

              {inbox.slaAtRisk.length > 0 && (
                <div>
                  <p className="mb-1 text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                    SLA breach risk
                  </p>
                  <ul className="space-y-1">
                    {inbox.slaAtRisk.slice(0, 3).map((s) => {
                      const client = fromMaybeArray(s.clients as unknown) as { name?: string } | null;
                      return (
                        <li key={s.id} className="flex items-center gap-2 text-xs text-slate-700">
                          <span className="h-1.5 w-1.5 rounded-full bg-rose-500" />
                          <span className="flex-1 truncate">
                            {client?.name ?? "—"} — {getService(s.case_type as string)?.label ?? s.case_type}
                          </span>
                          <span className="font-semibold text-rose-600">{formatDate(s.sla_due_at)}</span>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              )}

              {inbox.pendingExpenses.length > 0 && (
                <div>
                  <p className="mb-1 text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                    Pending expenses
                  </p>
                  <ul className="space-y-1">
                    {inbox.pendingExpenses.slice(0, 4).map((e) => (
                      <li key={e.id} className="flex items-center gap-2 text-xs text-slate-700">
                        <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
                        <span className="flex-1 truncate">
                          {e.category} — {e.description || "—"}
                        </span>
                        <span className="font-semibold text-amber-700">{formatGhs(Number(e.amount ?? 0))}</span>
                        <form action={decideExpenseAction} className="ml-1">
                          <input type="hidden" name="expense_id" value={e.id as string} />
                          <input type="hidden" name="status" value="APPROVED" />
                          <button
                            type="submit"
                            className="rounded-full border border-emerald-200 bg-emerald-50 px-1.5 py-0.5 text-[10px] font-semibold text-emerald-700 hover:bg-emerald-100"
                          >
                            Approve
                          </button>
                        </form>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {inbox.pendingLeaveRequests.length > 0 && (
                <div>
                  <p className="mb-1 text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                    Leave requests awaiting decision
                  </p>
                  <ul className="space-y-1">
                    {inbox.pendingLeaveRequests.slice(0, 3).map((lr) => (
                      <li key={lr.id} className="flex items-center gap-2 text-xs text-slate-700">
                        <span className="h-1.5 w-1.5 rounded-full bg-sky-500" />
                        <span className="flex-1 truncate">
                          {lr.leave_types?.leave_name ?? "Leave"} — {formatDate(lr.start_date)} → {formatDate(lr.end_date)}
                        </span>
                        <Link
                          href="/admin/team"
                          className="rounded-full border border-slate-200 bg-white px-1.5 py-0.5 text-[10px] font-semibold text-slate-600 hover:bg-slate-50"
                        >
                          Review
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {inbox.expiringDocs.length +
                inbox.slaAtRisk.length +
                inbox.pendingExpenses.length +
                inbox.pendingLeaveRequests.length ===
                0 && <p className="py-6 text-center text-xs text-slate-400">Nothing on the watchlist.</p>}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
