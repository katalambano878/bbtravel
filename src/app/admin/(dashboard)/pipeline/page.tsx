import { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Plus, UserPlus, Mail, Phone } from "lucide-react";

import { createAdminClient } from "@/lib/db/admin";
import { getStaffAccessContext } from "@/lib/data/queries";
import { getCrmSnapshot } from "@/lib/crm/service";
import { Card, CardContent } from "@/components/ui/card";
import {
  LEAD_PIPELINE_STAGES,
  divisions,
  getService,
  type ServiceDivisionKey
} from "@/lib/services/catalogue";
import { ServiceBadge } from "@/components/admin/service-badge";
import { StageBadge } from "@/components/admin/stage-badge";
import { ServiceTypeSelect } from "@/components/admin/service-type-select";
import { WhatsappButton } from "@/components/admin/whatsapp-button";
import {
  addLeadActivityAction,
  assignLeadAction,
  convertLeadAction,
  createLeadInlineAction,
  setLeadNextActionAction,
  updateCaseOwnershipAction,
  updateLeadStageAction
} from "@/app/actions";
import type { CaseStatus } from "@/types/domain";

export const metadata: Metadata = {
  title: "Pipeline — B.B. Admin"
};

type TabKey = "leads" | "cases";

const CASE_STATUSES: CaseStatus[] = [
  "SUBMITTED",
  "UNDER_REVIEW",
  "AWAITING_DOCUMENTS",
  "APPOINTMENT_BOOKED",
  "PROCESSING",
  "DECISION_RECEIVED",
  "COMPLETED",
  "ON_HOLD"
];

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

export default async function PipelinePage({
  searchParams
}: {
  searchParams: Promise<{ tab?: string; new?: string }>;
}) {
  const context = await getStaffAccessContext();
  if (!context) redirect("/admin/login");

  const allowed =
    context.profile.role === "super_admin" ||
    context.permissions.includes("crm.view") ||
    context.permissions.includes("cases.view") ||
    context.permissions.includes("leads.view");
  if (!allowed) redirect("/admin");

  const params = await searchParams;
  const tab = (params.tab as TabKey) ?? "leads";
  const showNewForm = params.new === "1";

  const admin = createAdminClient();
  const [snapshot, casesRes, staffRes] = await Promise.all([
    getCrmSnapshot(),
    admin
      .from("cases")
      .select("id, case_type, status, assigned_to, sla_due_at, created_at, updated_at, meta, clients(id, name, phone, whatsapp)")
      .order("updated_at", { ascending: false })
      .limit(200),
    admin.from("staff_profiles").select("user_id, full_name, role").eq("is_active", true).order("full_name")
  ]);

  const leads = snapshot.leads;
  const cases = casesRes.data ?? [];
  const staff = staffRes.data ?? [];

  const stageCounts = LEAD_PIPELINE_STAGES.reduce<Record<string, number>>((acc, s) => {
    acc[s.key] = leads.filter((l) => l.stage === s.key).length;
    return acc;
  }, {});

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-bb-navy" style={{ fontFamily: "var(--font-sora)" }}>
            Pipeline
          </h1>
        </div>
        <Link
          href="/admin/pipeline?new=1"
          className="inline-flex items-center gap-1.5 rounded-lg bg-bb-navy px-3 py-2 text-xs font-semibold text-white hover:bg-bb-navy/90"
        >
          <UserPlus className="h-3.5 w-3.5" /> New lead
        </Link>
      </div>

      {/* Stage strip */}
      <div className="grid gap-2 md:grid-cols-7">
        {LEAD_PIPELINE_STAGES.map((stage) => (
          <Link
            key={stage.key}
            href={`/admin/pipeline?tab=leads#stage-${stage.key}`}
            className="rounded-xl border border-slate-200 bg-white p-3 text-center transition-colors hover:border-bb-navy/30"
          >
            <span className={`mx-auto mb-1 block h-1.5 w-10 rounded-full ${stage.color}`} />
            <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">{stage.label}</p>
            <p className="mt-1 text-xl font-bold text-bb-navy">{stageCounts[stage.key] ?? 0}</p>
          </Link>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200">
        <Link
          href="/admin/pipeline?tab=leads"
          className={`border-b-2 px-3 py-2 text-sm font-semibold transition-colors ${tab === "leads" ? "border-bb-navy text-bb-navy" : "border-transparent text-slate-500 hover:text-slate-700"}`}
        >
          Leads ({leads.length})
        </Link>
        <Link
          href="/admin/pipeline?tab=cases"
          className={`border-b-2 px-3 py-2 text-sm font-semibold transition-colors ${tab === "cases" ? "border-bb-navy text-bb-navy" : "border-transparent text-slate-500 hover:text-slate-700"}`}
        >
          Cases ({cases.length})
        </Link>
      </div>

      {showNewForm && tab === "leads" && (
        <Card>
          <CardContent className="p-5">
            <h2 className="mb-3 text-sm font-bold text-bb-navy">New lead</h2>
            <form action={createLeadInlineAction} className="grid grid-cols-1 gap-3 md:grid-cols-3">
              <input
                name="name"
                required
                placeholder="Full name"
                className="rounded-lg border border-slate-200 px-3 py-2 text-sm"
              />
              <input
                name="email"
                required
                type="email"
                placeholder="Email"
                className="rounded-lg border border-slate-200 px-3 py-2 text-sm"
              />
              <input
                name="phone"
                placeholder="Phone (Ghana OK, e.g. 0244…)"
                className="rounded-lg border border-slate-200 px-3 py-2 text-sm"
              />
              <input
                name="whatsapp"
                placeholder="WhatsApp (defaults to phone)"
                className="rounded-lg border border-slate-200 px-3 py-2 text-sm"
              />
              <ServiceTypeSelect name="service_type" required exclude={["BUSINESS_EXPORT"]} />
              <input
                name="destination"
                placeholder="Destination / country"
                className="rounded-lg border border-slate-200 px-3 py-2 text-sm"
              />
              <input
                name="next_action_date"
                type="date"
                className="rounded-lg border border-slate-200 px-3 py-2 text-sm"
              />
              <select
                name="timeline"
                className="rounded-lg border border-slate-200 px-3 py-2 text-sm"
                defaultValue=""
              >
                <option value="">Select timeline…</option>
                <option value="urgent">Urgent (this month)</option>
                <option value="3m">1–3 months</option>
                <option value="6m">3–6 months</option>
                <option value="planning">Just exploring</option>
              </select>
              <select
                name="source_key"
                className="rounded-lg border border-slate-200 px-3 py-2 text-sm"
                defaultValue=""
              >
                <option value="">Source…</option>
                <option value="website">Website</option>
                <option value="whatsapp">WhatsApp</option>
                <option value="referral">Referral</option>
                <option value="walk_in">Walk-in</option>
                <option value="phone">Phone call</option>
                <option value="social">Social / paid</option>
              </select>
              <textarea
                name="notes"
                placeholder="Notes…"
                rows={2}
                className="col-span-1 rounded-lg border border-slate-200 px-3 py-2 text-sm md:col-span-3"
              />
              <div className="col-span-1 flex items-center gap-2 md:col-span-3">
                <button
                  type="submit"
                  className="inline-flex items-center gap-1.5 rounded-lg bg-bb-navy px-4 py-2 text-xs font-semibold text-white hover:bg-bb-navy/90"
                >
                  <Plus className="h-3.5 w-3.5" /> Create lead
                </button>
                <Link
                  href="/admin/pipeline"
                  className="text-xs font-medium text-slate-500 hover:text-slate-700"
                >
                  Cancel
                </Link>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {tab === "leads" ? (
        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50/50 text-[11px] uppercase tracking-wide text-slate-500">
                    <th className="px-4 py-2.5 text-left font-semibold">Lead</th>
                    <th className="px-4 py-2.5 text-left font-semibold">Service</th>
                    <th className="px-4 py-2.5 text-left font-semibold">Stage</th>
                    <th className="px-4 py-2.5 text-left font-semibold">Next action</th>
                    <th className="px-4 py-2.5 text-left font-semibold">Owner</th>
                    <th className="px-4 py-2.5 text-right font-semibold">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 [&_tr]:transition-colors [&_tr:hover]:bg-slate-50/60">
                  {leads.slice(0, 50).map((lead) => {
                    const svc = getService(lead.service_type as string);
                    const waPhone = (lead as { whatsapp?: string }).whatsapp || lead.phone;
                    return (
                      <tr key={lead.id} id={`stage-${lead.stage}`} className="align-top">
                        <td className="px-4 py-3">
                          <p className="font-semibold text-bb-navy">{lead.name}</p>
                          <p className="mt-0.5 text-[11px] text-slate-500">
                            {lead.email || "—"}
                            {lead.phone ? ` · ${lead.phone}` : ""}
                          </p>
                          {lead.destination ? (
                            <p className="mt-0.5 text-[11px] text-slate-400">→ {lead.destination}</p>
                          ) : null}
                        </td>
                        <td className="px-4 py-3">
                          <ServiceBadge serviceType={lead.service_type as string} />
                        </td>
                        <td className="px-4 py-3">
                          <form action={updateLeadStageAction} className="flex items-center gap-1">
                            <input type="hidden" name="lead_id" value={lead.id as string} />
                            <select
                              name="stage"
                              defaultValue={lead.stage as string}
                              className="rounded-md border border-slate-200 px-2 py-1 text-[11px]"
                            >
                              {LEAD_PIPELINE_STAGES.map((s) => (
                                <option key={s.key} value={s.key}>
                                  {s.label}
                                </option>
                              ))}
                            </select>
                            <button
                              type="submit"
                              className="rounded-md border border-slate-200 bg-white px-1.5 py-1 text-[10px] font-semibold text-slate-600 hover:bg-slate-50"
                              title="Save stage"
                            >
                              ✓
                            </button>
                          </form>
                        </td>
                        <td className="px-4 py-3">
                          <form action={setLeadNextActionAction} className="flex items-center gap-1">
                            <input type="hidden" name="lead_id" value={lead.id as string} />
                            <input
                              type="date"
                              name="next_action_date"
                              defaultValue={(lead as { next_action_date?: string }).next_action_date ?? ""}
                              className="rounded-md border border-slate-200 px-1.5 py-1 text-[11px]"
                            />
                            <button
                              type="submit"
                              className="rounded-md border border-slate-200 bg-white px-1.5 py-1 text-[10px] font-semibold text-slate-600 hover:bg-slate-50"
                            >
                              Save
                            </button>
                          </form>
                        </td>
                        <td className="px-4 py-3">
                          <form action={assignLeadAction} className="flex items-center gap-1">
                            <input type="hidden" name="lead_id" value={lead.id as string} />
                            <input type="hidden" name="mode" value="MANUAL" />
                            <select
                              name="assignee_user_id"
                              defaultValue={lead.assigned_to ?? ""}
                              className="rounded-md border border-slate-200 px-2 py-1 text-[11px]"
                            >
                              <option value="">Unassigned</option>
                              {staff.map((s) => (
                                <option key={s.user_id as string} value={s.user_id as string}>
                                  {s.full_name}
                                </option>
                              ))}
                            </select>
                            <button
                              type="submit"
                              className="rounded-md border border-slate-200 bg-white px-1.5 py-1 text-[10px] font-semibold text-slate-600 hover:bg-slate-50"
                            >
                              Save
                            </button>
                          </form>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex flex-wrap items-center justify-end gap-1.5">
                            {lead.phone ? (
                              <a
                                href={`tel:${lead.phone}`}
                                className="inline-flex items-center gap-1 rounded-full border border-slate-200 bg-white px-2 py-0.5 text-[10px] font-medium text-slate-600 hover:bg-slate-50"
                              >
                                <Phone className="h-3 w-3" /> Call
                              </a>
                            ) : null}
                            {lead.email ? (
                              <a
                                href={`mailto:${lead.email}`}
                                className="inline-flex items-center gap-1 rounded-full border border-slate-200 bg-white px-2 py-0.5 text-[10px] font-medium text-slate-600 hover:bg-slate-50"
                              >
                                <Mail className="h-3 w-3" /> Email
                              </a>
                            ) : null}
                            <WhatsappButton
                              variant="chip"
                              phone={waPhone}
                              name={lead.name ?? undefined}
                              leadId={lead.id as string}
                              defaultTemplateKey="LEAD_ACK_WHATSAPP"
                              defaultVars={{
                                client_name: lead.name,
                                service: svc?.label ?? String(lead.service_type ?? ""),
                                destination: lead.destination ?? "",
                                staff_name: context.profile.full_name.split(" ")[0]
                              }}
                            />
                            {!lead.converted_case_id ? (
                              <form action={convertLeadAction}>
                                <input type="hidden" name="lead_id" value={lead.id as string} />
                                <input type="hidden" name="case_type" value={(lead.service_type as string) || "CONSULTATION"} />
                                <button
                                  type="submit"
                                  className="rounded-full border border-bb-navy/30 bg-bb-navy/5 px-2 py-0.5 text-[10px] font-semibold text-bb-navy hover:bg-bb-navy/10"
                                >
                                  Convert
                                </button>
                              </form>
                            ) : (
                              <span className="rounded-full border border-emerald-200 bg-emerald-50 px-2 py-0.5 text-[10px] font-semibold text-emerald-700">
                                Converted
                              </span>
                            )}
                          </div>
                          <details className="mt-1.5 text-right">
                            <summary className="cursor-pointer text-[10px] text-slate-400 hover:text-slate-600">
                              Add note
                            </summary>
                            <form
                              action={addLeadActivityAction}
                              className="mt-1 flex items-center justify-end gap-1"
                            >
                              <input type="hidden" name="lead_id" value={lead.id as string} />
                              <input type="hidden" name="type" value="NOTE" />
                              <input
                                name="note"
                                placeholder="Add a note…"
                                required
                                className="w-48 rounded-md border border-slate-200 px-1.5 py-1 text-[11px]"
                              />
                              <button
                                type="submit"
                                className="rounded-md border border-slate-200 bg-white px-1.5 py-1 text-[10px] font-semibold text-slate-600 hover:bg-slate-50"
                              >
                                Save
                              </button>
                            </form>
                          </details>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50/50 text-[11px] uppercase tracking-wide text-slate-500">
                    <th className="px-4 py-2.5 text-left font-semibold">Client</th>
                    <th className="px-4 py-2.5 text-left font-semibold">Service</th>
                    <th className="px-4 py-2.5 text-left font-semibold">Status</th>
                    <th className="px-4 py-2.5 text-left font-semibold">Owner</th>
                    <th className="px-4 py-2.5 text-left font-semibold">SLA due</th>
                    <th className="px-4 py-2.5 text-right font-semibold">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 [&_tr]:transition-colors [&_tr:hover]:bg-slate-50/60">
                  {cases.slice(0, 80).map((c) => {
                    const client = fromMaybeArray(c.clients as unknown) as
                      | { id?: string; name?: string; phone?: string; whatsapp?: string }
                      | null;
                    const svc = getService(c.case_type as string);
                    return (
                      <tr key={c.id} className="align-top">
                        <td className="px-4 py-3">
                          <Link
                            href={`/admin/clients/${client?.id ?? ""}`}
                            className="font-semibold text-bb-navy hover:underline"
                          >
                            {client?.name ?? "—"}
                          </Link>
                          {client?.phone ? (
                            <p className="mt-0.5 text-[11px] text-slate-500">{client.phone}</p>
                          ) : null}
                        </td>
                        <td className="px-4 py-3">
                          <ServiceBadge serviceType={c.case_type as string} />
                        </td>
                        <td className="px-4 py-3">
                          <form action={updateCaseOwnershipAction} className="flex items-center gap-1">
                            <input type="hidden" name="case_id" value={c.id as string} />
                            <select
                              name="status"
                              defaultValue={c.status as string}
                              className="rounded-md border border-slate-200 px-2 py-1 text-[11px]"
                            >
                              {CASE_STATUSES.map((s) => (
                                <option key={s} value={s}>
                                  {s.replace(/_/g, " ")}
                                </option>
                              ))}
                            </select>
                            <button
                              type="submit"
                              className="rounded-md border border-slate-200 bg-white px-1.5 py-1 text-[10px] font-semibold text-slate-600 hover:bg-slate-50"
                            >
                              ✓
                            </button>
                          </form>
                        </td>
                        <td className="px-4 py-3">
                          <form action={updateCaseOwnershipAction} className="flex items-center gap-1">
                            <input type="hidden" name="case_id" value={c.id as string} />
                            <select
                              name="assigned_to"
                              defaultValue={c.assigned_to ?? ""}
                              className="rounded-md border border-slate-200 px-2 py-1 text-[11px]"
                            >
                              <option value="">Unassigned</option>
                              {staff.map((s) => (
                                <option key={s.user_id as string} value={s.user_id as string}>
                                  {s.full_name}
                                </option>
                              ))}
                            </select>
                            <button
                              type="submit"
                              className="rounded-md border border-slate-200 bg-white px-1.5 py-1 text-[10px] font-semibold text-slate-600 hover:bg-slate-50"
                            >
                              Save
                            </button>
                          </form>
                        </td>
                        <td className="px-4 py-3">
                          <form action={updateCaseOwnershipAction} className="flex items-center gap-1">
                            <input type="hidden" name="case_id" value={c.id as string} />
                            <input
                              type="date"
                              name="sla_due_at"
                              defaultValue={c.sla_due_at ? String(c.sla_due_at).slice(0, 10) : ""}
                              className="rounded-md border border-slate-200 px-1.5 py-1 text-[11px]"
                            />
                            <button
                              type="submit"
                              className="rounded-md border border-slate-200 bg-white px-1.5 py-1 text-[10px] font-semibold text-slate-600 hover:bg-slate-50"
                            >
                              Save
                            </button>
                          </form>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex flex-wrap items-center justify-end gap-1.5">
                            <Link
                              href={`/admin/clients/${client?.id ?? ""}`}
                              className="rounded-full border border-slate-200 bg-white px-2 py-0.5 text-[10px] font-medium text-slate-600 hover:bg-slate-50"
                            >
                              Open 360
                            </Link>
                            <WhatsappButton
                              variant="chip"
                              phone={client?.whatsapp || client?.phone}
                              name={client?.name ?? undefined}
                              clientId={client?.id}
                              caseId={c.id as string}
                              defaultVars={{
                                client_name: client?.name ?? "",
                                service: svc?.label ?? String(c.case_type ?? ""),
                                staff_name: context.profile.full_name.split(" ")[0]
                              }}
                            />
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
