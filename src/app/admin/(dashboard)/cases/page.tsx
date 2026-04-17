import { Metadata } from "next";
import { redirect } from "next/navigation";
import { Briefcase, ListTodo, AlertTriangle, Link2 } from "lucide-react";

import { addCaseNoteAction, createCaseTaskAction, linkCasesAction } from "@/app/actions";
import { getStaffAccessContext, getAdminCases } from "@/lib/data/queries";
import { getCaseOperationsSnapshot } from "@/lib/cases/service";
import { createAdminClient } from "@/lib/supabase/admin";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { divisions, getService, type ServiceDivisionKey } from "@/lib/services/catalogue";
import { ServiceBadge } from "@/components/admin/service-badge";
import { formatServiceLabel } from "@/lib/services/catalogue";

export const metadata: Metadata = { title: "Cases — Admin Console" };

type CaseRow = Awaited<ReturnType<typeof getAdminCases>>[number];

function caseMetaHighlight(caseItem: CaseRow): string | null {
  const svc = getService(caseItem.case_type);
  const meta = (caseItem.meta ?? {}) as Record<string, string | number | undefined>;
  if (!svc) return null;
  switch (svc.key) {
    case "VISA_ASSISTANCE":
      return [meta.destination_country, meta.visa_type].filter(Boolean).join(" • ") || null;
    case "FLIGHT_RESERVATION":
      return [meta.origin && meta.destination ? `${meta.origin} → ${meta.destination}` : undefined, meta.departure_date].filter(Boolean).join(" • ") || null;
    case "HOTEL_BOOKING":
      return [meta.hotel_name, meta.check_in].filter(Boolean).join(" • ") || null;
    case "TOUR_PACKAGE":
      return [meta.destination, meta.departure_date].filter(Boolean).join(" • ") || null;
    case "TRAVEL_INSURANCE":
      return [meta.destination, meta.coverage_level].filter(Boolean).join(" • ") || null;
    case "TRANSPORT_SERVICES":
      return [meta.pickup_location, meta.dropoff_location].filter(Boolean).join(" → ") || null;
    case "CORPORATE_TRAVEL":
      return [meta.company_name, meta.travelers_count ? `${meta.travelers_count} travelers` : undefined].filter(Boolean).join(" • ") || null;
    case "EVENT_MANAGEMENT":
      return [meta.event_type, meta.destination, meta.event_date].filter(Boolean).join(" • ") || null;
    case "STUDY_ABROAD":
      return [meta.university, meta.destination_country].filter(Boolean).join(" • ") || null;
    case "INTERNATIONAL_RECRUITMENT":
      return [meta.profession, meta.destination_country].filter(Boolean).join(" • ") || null;
    case "CONSULTATION":
      return [meta.topic, meta.session_format].filter(Boolean).join(" • ") || null;
    case "DOCUMENT_PROCESSING":
      return [meta.pathway, meta.destination_country].filter(Boolean).join(" • ") || null;
    default:
      return null;
  }
}

const STATUS_TONE: Record<string, string> = {
  SUBMITTED: "bg-blue-50 text-blue-700 border-blue-100",
  UNDER_REVIEW: "bg-amber-50 text-amber-700 border-amber-100",
  AWAITING_DOCUMENTS: "bg-orange-50 text-orange-700 border-orange-100",
  IN_PROGRESS: "bg-indigo-50 text-indigo-700 border-indigo-100",
  COMPLETED: "bg-emerald-50 text-emerald-700 border-emerald-100",
  CANCELLED: "bg-slate-100 text-slate-500 border-slate-200"
};

function StatusPill({ status }: { status: string }) {
  const tone = STATUS_TONE[status] ?? "bg-slate-100 text-slate-600 border-slate-200";
  return (
    <span
      className={`inline-flex rounded-full border px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wide ${tone}`}
    >
      {status.replaceAll("_", " ")}
    </span>
  );
}

function CasesTable({
  rows,
  allCases,
  staffUsers
}: {
  rows: CaseRow[];
  allCases: CaseRow[];
  staffUsers: { user_id: string; full_name: string; role: string }[];
}) {
  if (rows.length === 0) {
    return (
      <p className="py-8 text-center text-sm text-slate-400">No cases in this division.</p>
    );
  }
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Service</TableHead>
          <TableHead>Details</TableHead>
          <TableHead>Client</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {rows.map((caseItem) => {
          const highlight = caseMetaHighlight(caseItem);
          const client = Array.isArray(caseItem.clients)
            ? caseItem.clients[0]
            : (caseItem.clients as { name?: string; email?: string } | null);
          return (
            <TableRow key={caseItem.id}>
              <TableCell>
                <ServiceBadge serviceType={caseItem.case_type} />
                <p className="mt-1 text-[11px] text-slate-400">#{caseItem.id.slice(0, 8)}</p>
              </TableCell>
              <TableCell className="text-sm text-slate-600">
                {highlight ?? <span className="text-slate-300">—</span>}
              </TableCell>
              <TableCell className="text-sm text-slate-600">
                {client?.name ? (
                  <>
                    <p className="font-medium text-bb-navy">{client.name}</p>
                    {client.email && (
                      <p className="text-xs text-slate-400">{client.email}</p>
                    )}
                  </>
                ) : (
                  "N/A"
                )}
              </TableCell>
              <TableCell>
                <StatusPill status={caseItem.status as string} />
              </TableCell>
              <TableCell>
                <Tabs defaultValue="task">
                  <TabsList>
                    <TabsTrigger value="task">Task</TabsTrigger>
                    <TabsTrigger value="note">Note</TabsTrigger>
                    <TabsTrigger value="link">Link</TabsTrigger>
                  </TabsList>

                  <TabsContent value="task">
                    <form
                      action={createCaseTaskAction}
                      className="flex flex-wrap items-end gap-2"
                    >
                      <input type="hidden" name="case_id" value={caseItem.id} />
                      <Input
                        name="title"
                        placeholder="Task title"
                        required
                        className="h-8 min-w-[140px] text-xs"
                      />
                      <Input
                        name="description"
                        placeholder="Description"
                        className="h-8 min-w-[120px] text-xs"
                      />
                      <select
                        name="priority"
                        className="rounded-lg border border-slate-200 bg-white px-2 py-1.5 text-xs"
                      >
                        <option value="LOW">Low</option>
                        <option value="MEDIUM">Medium</option>
                        <option value="HIGH">High</option>
                        <option value="CRITICAL">Critical</option>
                      </select>
                      <select
                        name="assigned_to"
                        className="rounded-lg border border-slate-200 bg-white px-2 py-1.5 text-xs"
                      >
                        <option value="">Unassigned</option>
                        {staffUsers.map((s) => (
                          <option key={s.user_id} value={s.user_id}>
                            {s.full_name}
                          </option>
                        ))}
                      </select>
                      <Button type="submit" size="sm" className="h-8 text-xs">
                        Add
                      </Button>
                    </form>
                  </TabsContent>

                  <TabsContent value="note">
                    <form
                      action={addCaseNoteAction}
                      className="flex flex-wrap items-end gap-2"
                    >
                      <input type="hidden" name="case_id" value={caseItem.id} />
                      <Input
                        name="note"
                        placeholder="Case note"
                        required
                        className="h-8 min-w-[200px] text-xs"
                      />
                      <select
                        name="visibility"
                        className="rounded-lg border border-slate-200 bg-white px-2 py-1.5 text-xs"
                      >
                        <option value="INTERNAL">Internal</option>
                        <option value="CLIENT_VISIBLE">Client visible</option>
                      </select>
                      <Button type="submit" size="sm" variant="secondary" className="h-8 text-xs">
                        Save
                      </Button>
                    </form>
                  </TabsContent>

                  <TabsContent value="link">
                    <form
                      action={linkCasesAction}
                      className="flex flex-wrap items-end gap-2"
                    >
                      <input type="hidden" name="primary_case_id" value={caseItem.id} />
                      <select
                        name="linked_case_id"
                        className="min-w-[220px] rounded-lg border border-slate-200 bg-white px-2 py-1.5 text-xs"
                      >
                        {allCases
                          .filter((c) => c.id !== caseItem.id)
                          .slice(0, 100)
                          .map((c) => (
                            <option key={c.id} value={c.id}>
                              {c.id.slice(0, 8)} — {formatServiceLabel(c.case_type)}
                            </option>
                          ))}
                      </select>
                      <select
                        name="relation_type"
                        className="rounded-lg border border-slate-200 bg-white px-2 py-1.5 text-xs"
                      >
                        <option value="SUB_CASE">Sub-case</option>
                        <option value="DEPENDENT">Dependent</option>
                        <option value="FOLLOW_ON">Follow-on</option>
                      </select>
                      <Button type="submit" size="sm" className="h-8 text-xs">
                        Link
                      </Button>
                    </form>
                  </TabsContent>
                </Tabs>
              </TableCell>
            </TableRow>
          );
        })}
      </TableBody>
    </Table>
  );
}

export default async function AdminCasesPage() {
  const context = await getStaffAccessContext();
  if (!context) redirect("/admin/login");
  if (!(context.permissions.includes("cases.view") || context.profile.role === "super_admin")) {
    redirect("/admin");
  }

  const [cases, snapshot] = await Promise.all([getAdminCases(), getCaseOperationsSnapshot()]);
  const admin = createAdminClient();
  const { data: staffUsers } = await admin
    .from("staff_profiles")
    .select("user_id, full_name, role")
    .eq("is_active", true);
  const staffList = staffUsers ?? [];

  // Group by division
  const byDivision: Record<ServiceDivisionKey, CaseRow[]> = {
    IMMIGRATION: [],
    TRAVEL: [],
    CORPORATE_EVENTS: [],
    CONSULTATION: []
  };
  for (const c of cases) {
    const svc = getService(c.case_type);
    if (svc) byDivision[svc.division].push(c);
  }

  const kpis = [
    {
      label: "Active workflows",
      value: snapshot.workflows.length,
      icon: Briefcase,
      accent: "border-l-blue-500"
    },
    {
      label: "Open tasks",
      value: snapshot.tasks.filter((t) => t.status !== "DONE").length,
      icon: ListTodo,
      accent: "border-l-emerald-500"
    },
    {
      label: "Open blockers",
      value: snapshot.blockers.length,
      icon: AlertTriangle,
      accent: "border-l-red-500"
    },
    {
      label: "Linked cases",
      value: snapshot.links.length,
      icon: Link2,
      accent: "border-l-violet-500"
    }
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1
          className="text-2xl font-bold text-bb-navy"
          style={{ fontFamily: "var(--font-sora)" }}
        >
          Case operations
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          Live work across the visa, travel, corporate, and advisory desks. Open a
          case to manage tasks, notes, and linked files.
        </p>
      </div>

      {/* KPI row */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {kpis.map(({ label, value, icon: Icon, accent }) => (
          <Card key={label} className={`border-l-4 ${accent}`}>
            <CardContent className="flex items-center gap-4 p-5">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-50 text-slate-500">
                <Icon className="h-5 w-5" />
              </div>
              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                  {label}
                </p>
                <p className="text-2xl font-bold text-bb-navy">{value}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Cases by division */}
      <Card>
        <CardContent className="p-6">
          <Tabs defaultValue="all">
            <TabsList>
              <TabsTrigger value="all">All ({cases.length})</TabsTrigger>
              <TabsTrigger value="IMMIGRATION">
                {divisions.IMMIGRATION.short} ({byDivision.IMMIGRATION.length})
              </TabsTrigger>
              <TabsTrigger value="TRAVEL">
                {divisions.TRAVEL.short} ({byDivision.TRAVEL.length})
              </TabsTrigger>
              <TabsTrigger value="CORPORATE_EVENTS">
                {divisions.CORPORATE_EVENTS.short} ({byDivision.CORPORATE_EVENTS.length})
              </TabsTrigger>
              <TabsTrigger value="CONSULTATION">
                {divisions.CONSULTATION.short} ({byDivision.CONSULTATION.length})
              </TabsTrigger>
            </TabsList>

            <TabsContent value="all">
              <CasesTable
                rows={cases.slice(0, 50)}
                allCases={cases}
                staffUsers={staffList}
              />
            </TabsContent>
            {(Object.keys(byDivision) as ServiceDivisionKey[]).map((key) => (
              <TabsContent key={key} value={key}>
                <CasesTable
                  rows={byDivision[key].slice(0, 50)}
                  allCases={cases}
                  staffUsers={staffList}
                />
              </TabsContent>
            ))}
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
