import { Metadata } from "next";
import Link from "next/link";
import {
  Users,
  Briefcase,
  FileText,
  CalendarClock,
  ArrowUpRight,
  PlusCircle,
  Upload,
  TrendingUp,
  Clock,
  PlaneTakeoff,
  Banknote,
  MapPin
} from "lucide-react";

import {
  getAdminOverview,
  getAdminLeads,
  getAdminAuditLogs,
  getStaffAccessContext,
  getAdminCasesByService,
  getAdminUpcomingAppointments,
  getUpcomingDepartures
} from "@/lib/data/queries";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  LEAD_PIPELINE_STAGES,
  divisions,
  getService,
  type ServiceDivisionKey
} from "@/lib/services/catalogue";
import { ServiceBadge } from "@/components/admin/service-badge";
import { StageBadge } from "@/components/admin/stage-badge";

export const metadata: Metadata = {
  title: "Dashboard — Admin Console"
};

export default async function AdminDashboardPage() {
  const context = await getStaffAccessContext();
  if (!context) return null;

  const [overview, leads, logs, casesByService, upcomingAppointments, departures] = await Promise.all([
    getAdminOverview(),
    getAdminLeads(),
    getAdminAuditLogs(),
    getAdminCasesByService(),
    getAdminUpcomingAppointments(7),
    getUpcomingDepartures(14)
  ]);

  // Division-split active case counts
  const divisionCounts: Record<ServiceDivisionKey, number> = {
    IMMIGRATION: 0,
    TRAVEL: 0,
    CORPORATE_EVENTS: 0,
    CONSULTATION: 0
  };
  for (const row of casesByService) {
    const svc = getService(row.case_type);
    if (svc) divisionCounts[svc.division] += 1;
  }

  // Lead pipeline summary (tailored stages)
  const totalLeads = leads.length || 1;
  const pipelineCounts = LEAD_PIPELINE_STAGES.map((stage) => ({
    ...stage,
    count: leads.filter((l) => l.stage === stage.key || (stage.key === "SCOPED" && l.stage === "QUALIFIED") || (stage.key === "BOOKED" && l.stage === "CONVERTED")).length
  }));

  // Visa desk = leads interested in immigration-division services
  const visaLeads = leads.filter((l) => {
    const svc = getService((l.service_type as string) ?? "");
    return svc?.division === "IMMIGRATION";
  });

  // Convert rate (Booked / total) for recent leads
  const bookedCount = leads.filter((l) => l.stage === "BOOKED" || l.stage === "CONVERTED").length;
  const conversionPct = Math.round((bookedCount / totalLeads) * 100);

  const formatMoney = (n: number) =>
    new Intl.NumberFormat("en-GH", { style: "currency", currency: "GHS", maximumFractionDigits: 0 }).format(n);

  const kpis = [
    {
      key: "newLeadsToday",
      label: "New leads today",
      value: overview.newLeadsToday,
      icon: Users,
      accent: "border-l-blue-500",
      iconColor: "text-blue-500"
    },
    {
      key: "activeCases",
      label: "Active cases",
      value: overview.activeCases,
      icon: Briefcase,
      accent: "border-l-emerald-500",
      iconColor: "text-emerald-500"
    },
    {
      key: "pendingDocuments",
      label: "Docs awaiting review",
      value: overview.pendingDocuments,
      icon: FileText,
      accent: "border-l-amber-500",
      iconColor: "text-amber-500"
    },
    {
      key: "appointmentsThisWeek",
      label: "Appointments this week",
      value: overview.appointmentsThisWeek,
      icon: CalendarClock,
      accent: "border-l-violet-500",
      iconColor: "text-violet-500"
    },
    {
      key: "outstandingRevenue",
      label: "Outstanding revenue",
      value: formatMoney(Number(overview.outstandingRevenue ?? 0)),
      icon: Banknote,
      accent: "border-l-rose-500",
      iconColor: "text-rose-500"
    },
    {
      key: "conversion",
      label: "Lead to booking",
      value: `${conversionPct}%`,
      icon: TrendingUp,
      accent: "border-l-teal-500",
      iconColor: "text-teal-500"
    }
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-bb-navy" style={{ fontFamily: "var(--font-sora)" }}>
            Welcome back, {context.profile.full_name.split(" ")[0]}
          </h1>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button asChild size="sm">
            <Link href="/admin/crm">
              <PlusCircle className="mr-1.5 h-3.5 w-3.5" />
              New Lead
            </Link>
          </Button>
          <Button asChild size="sm" variant="secondary">
            <Link href="/admin/cases">
              <Briefcase className="mr-1.5 h-3.5 w-3.5" />
              Create Case
            </Link>
          </Button>
          <Button asChild size="sm" variant="secondary">
            <Link href="/admin/documents">
              <Upload className="mr-1.5 h-3.5 w-3.5" />
              Upload Doc
            </Link>
          </Button>
          <Button asChild size="sm" variant="secondary">
            <Link href="/admin/finance">
              <Banknote className="mr-1.5 h-3.5 w-3.5" />
              Raise Invoice
            </Link>
          </Button>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        {kpis.map(({ key, label, value, icon: Icon, accent, iconColor }) => (
          <Card key={key} className={`border-l-4 ${accent}`}>
            <CardContent className="flex items-center gap-3 p-4">
              <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-50 ${iconColor}`}>
                <Icon className="h-4.5 w-4.5" />
              </div>
              <div className="min-w-0">
                <p className="text-[11px] font-medium uppercase tracking-wide text-slate-500">{label}</p>
                <p className="truncate text-xl font-bold text-bb-navy">{value}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Division split */}
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {(Object.keys(divisions) as ServiceDivisionKey[]).map((key) => {
          const division = divisions[key];
          const count = divisionCounts[key];
          return (
            <Card key={key} className={`border-l-4 ${division.accentClass}`}>
              <CardContent className="p-5">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                  {division.short}
                </p>
                <p className="mt-2 text-3xl font-bold text-bb-navy">{count}</p>
                <p className="mt-1 text-[11px] text-slate-400">Active cases</p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="grid gap-6 xl:grid-cols-3">
        {/* Lead Pipeline */}
        <Card className="xl:col-span-2">
          <CardContent className="p-6">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="flex items-center gap-2 text-lg font-semibold text-bb-navy">
                <TrendingUp className="h-4.5 w-4.5 text-slate-400" />
                Lead pipeline
              </h2>
              <Link href="/admin/crm" className="flex items-center gap-1 text-xs font-medium text-bb-sky hover:underline">
                View CRM <ArrowUpRight className="h-3 w-3" />
              </Link>
            </div>
            <div className="mb-4 flex h-5 w-full overflow-hidden rounded-full bg-slate-100">
              {pipelineCounts.map((s) =>
                s.count > 0 ? (
                  <div
                    key={s.key}
                    className={`${s.color} transition-all`}
                    style={{ width: `${(s.count / totalLeads) * 100}%` }}
                    title={`${s.label}: ${s.count}`}
                  />
                ) : null
              )}
            </div>
            <div className="flex flex-wrap gap-4">
              {pipelineCounts.map((s) => (
                <div key={s.key} className="flex items-center gap-2 text-xs text-slate-600">
                  <span className={`inline-block h-2.5 w-2.5 rounded-full ${s.color}`} />
                  {s.label} <span className="font-semibold text-bb-navy">{s.count}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Visa Desk */}
        <Card>
          <CardContent className="p-6">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="flex items-center gap-2 text-lg font-semibold text-bb-navy">
                <FileText className="h-4.5 w-4.5 text-blue-500" />
                Visa desk
              </h2>
              <Link href="/admin/crm" className="flex items-center gap-1 text-xs font-medium text-bb-sky hover:underline">
                Open <ArrowUpRight className="h-3 w-3" />
              </Link>
            </div>
            <div className="space-y-3">
              {visaLeads.length === 0 && (
                <p className="text-sm text-slate-400">No visa leads in the pipeline yet.</p>
              )}
              {visaLeads.slice(0, 5).map((lead) => (
                <div key={lead.id} className="flex items-start gap-3 rounded-xl bg-slate-50 p-3">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-blue-100 text-blue-600">
                    <Users className="h-4 w-4" />
                  </div>
                    <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-bb-navy">{lead.name}</p>
                    <div className="mt-1 flex flex-wrap items-center gap-1.5">
                      <ServiceBadge short serviceType={lead.service_type as string} />
                      <StageBadge stage={lead.stage as string} />
                    </div>
                    {(lead.destination || lead.timeline) ? (
                      <p className="mt-1 text-xs text-slate-500">
                        {lead.destination ?? ""}{lead.destination && lead.timeline ? " • " : ""}{lead.timeline ?? ""}
                      </p>
                    ) : null}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        {/* Travel Desk — Upcoming departures */}
        <Card>
          <CardContent className="p-6">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="flex items-center gap-2 text-lg font-semibold text-bb-navy">
                <PlaneTakeoff className="h-4.5 w-4.5 text-emerald-500" />
                Travel desk — upcoming departures
              </h2>
              <Link href="/admin/cases" className="flex items-center gap-1 text-xs font-medium text-bb-sky hover:underline">
                All cases <ArrowUpRight className="h-3 w-3" />
              </Link>
            </div>
            <div className="space-y-3">
              {departures.length === 0 && (
                <p className="text-sm text-slate-400">No travel departures in the next 14 days.</p>
              )}
              {departures.map((dep) => {
                const meta = (dep.meta ?? {}) as Record<string, string | undefined>;
                const dateKey = dep.case_type === "HOTEL_BOOKING" ? meta.check_in : meta.departure_date;
                const destination = meta.destination ?? meta.route ?? meta.event_destination;
                const clientName = Array.isArray(dep.clients)
                  ? dep.clients[0]?.name
                  : (dep.clients as { name?: string } | null)?.name;
                return (
                  <div key={dep.id} className="flex items-start gap-3 rounded-xl bg-slate-50 p-3">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-emerald-100 text-emerald-600">
                      <MapPin className="h-4 w-4" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-1.5">
                        <p className="truncate text-sm font-medium text-bb-navy">
                          {clientName ?? "Traveller"}
                        </p>
                        <ServiceBadge short serviceType={dep.case_type} />
                      </div>
                      <p className="mt-0.5 text-xs text-slate-500">
                        {destination ? <span className="font-medium">{destination}</span> : null}
                        {destination && dateKey ? " • " : ""}
                        {dateKey
                          ? new Date(dateKey).toLocaleDateString("en-GB", {
                              day: "numeric",
                              month: "short",
                              year: "numeric"
                            })
                          : null}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Upcoming Appointments (this week) */}
        <Card>
          <CardContent className="p-6">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="flex items-center gap-2 text-lg font-semibold text-bb-navy">
                <CalendarClock className="h-4.5 w-4.5 text-violet-500" />
                This week&apos;s appointments
              </h2>
              <Link href="/admin/crm" className="flex items-center gap-1 text-xs font-medium text-bb-sky hover:underline">
                CRM <ArrowUpRight className="h-3 w-3" />
              </Link>
            </div>
            <div className="space-y-3">
              {upcomingAppointments.length === 0 && (
                <p className="text-sm text-slate-400">No appointments scheduled.</p>
              )}
              {upcomingAppointments.slice(0, 6).map((apt) => {
                const cases = Array.isArray(apt.cases) ? apt.cases[0] : apt.cases;
                const clients = cases?.clients as { name?: string } | { name?: string }[] | null | undefined;
                const clientName = Array.isArray(clients) ? clients[0]?.name : clients?.name;
                return (
                  <div key={apt.id} className="flex items-start gap-3 rounded-xl bg-slate-50 p-3">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-violet-100 text-violet-600">
                      <Clock className="h-4 w-4" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-1.5">
                        <p className="truncate text-sm font-medium text-bb-navy">
                          {clientName ?? apt.location ?? "Virtual meeting"}
                        </p>
                        {cases?.case_type ? (
                          <ServiceBadge short serviceType={cases.case_type as string} />
                        ) : null}
                      </div>
                      <p className="mt-0.5 text-xs text-slate-500">
                        {new Date(apt.scheduled_at).toLocaleDateString("en-GB", {
                          weekday: "short",
                          day: "numeric",
                          month: "short"
                        })}
                        {" • "}
                        {new Date(apt.scheduled_at).toLocaleTimeString("en-GB", {
                          hour: "2-digit",
                          minute: "2-digit"
                        })}
                        {apt.location ? ` • ${apt.location}` : ""}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <Card>
        <CardContent className="p-6">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-bb-navy">Recent activity</h2>
          </div>
          <div className="space-y-3">
            {logs.length === 0 && <p className="text-sm text-slate-400">No recent activity.</p>}
            {logs.slice(0, 10).map((log) => (
              <div
                key={log.id}
                className="flex items-start gap-3 border-b border-slate-100 pb-3 last:border-0 last:pb-0"
              >
                <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-slate-100 text-xs font-bold text-slate-500">
                  {log.action.charAt(0).toUpperCase()}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm text-slate-700">
                    <span className="font-medium text-bb-navy">{log.action}</span> on{" "}
                    <span className="text-slate-500">{log.target_type}</span>
                  </p>
                  <p className="text-xs text-slate-400">
                    {new Date(log.created_at).toLocaleString("en-GB", {
                      day: "numeric",
                      month: "short",
                      hour: "2-digit",
                      minute: "2-digit"
                    })}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
