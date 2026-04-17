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
  Clock
} from "lucide-react";

import {
  getAdminOverview,
  getAdminLeads,
  getAdminAppointments,
  getAdminAuditLogs,
  getStaffAccessContext
} from "@/lib/data/queries";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "Dashboard — Admin Console"
};

const kpiConfig = [
  { key: "newLeadsToday", label: "Leads Today", icon: Users, accent: "border-l-blue-500", iconColor: "text-blue-500" },
  { key: "activeCases", label: "Active Cases", icon: Briefcase, accent: "border-l-emerald-500", iconColor: "text-emerald-500" },
  { key: "pendingDocuments", label: "Pending Docs", icon: FileText, accent: "border-l-amber-500", iconColor: "text-amber-500" },
  { key: "upcomingAppointments", label: "Appointments", icon: CalendarClock, accent: "border-l-violet-500", iconColor: "text-violet-500" }
] as const;

export default async function AdminDashboardPage() {
  const context = await getStaffAccessContext();
  if (!context) return null;

  const [overview, leads, appointments, logs] = await Promise.all([
    getAdminOverview(),
    getAdminLeads(),
    getAdminAppointments(),
    getAdminAuditLogs()
  ]);

  const pipelineStages = ["NEW", "CONTACTED", "QUALIFIED", "CONVERTED", "CLOSED"];
  const pipelineCounts = pipelineStages.map((stage) => ({
    stage,
    count: leads.filter((l) => l.stage === stage).length
  }));
  const totalLeads = leads.length || 1;
  const stageColors: Record<string, string> = {
    NEW: "bg-blue-500",
    CONTACTED: "bg-cyan-500",
    QUALIFIED: "bg-amber-500",
    CONVERTED: "bg-emerald-500",
    CLOSED: "bg-slate-400"
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-bb-navy" style={{ fontFamily: "var(--font-sora)" }}>
            Welcome back, {context.profile.full_name.split(" ")[0]}
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Here&apos;s what&apos;s happening across your organization today.
          </p>
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
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {kpiConfig.map(({ key, label, icon: Icon, accent, iconColor }) => (
          <Card key={key} className={`border-l-4 ${accent}`}>
            <CardContent className="flex items-center gap-4 p-5">
              <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-slate-50 ${iconColor}`}>
                <Icon className="h-5 w-5" />
              </div>
              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-slate-500">{label}</p>
                <p className="text-2xl font-bold text-bb-navy">{overview[key]}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 xl:grid-cols-3">
        {/* Pipeline overview */}
        <Card className="xl:col-span-2">
          <CardContent className="p-6">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-bb-navy flex items-center gap-2">
                <TrendingUp className="h-4.5 w-4.5 text-slate-400" />
                Lead Pipeline
              </h2>
              <Link href="/admin/crm" className="flex items-center gap-1 text-xs font-medium text-bb-sky hover:underline">
                View all <ArrowUpRight className="h-3 w-3" />
              </Link>
            </div>
            {/* Bar chart */}
            <div className="mb-4 flex h-5 w-full overflow-hidden rounded-full bg-slate-100">
              {pipelineCounts.map(({ stage, count }) =>
                count > 0 ? (
                  <div
                    key={stage}
                    className={`${stageColors[stage]} transition-all`}
                    style={{ width: `${(count / totalLeads) * 100}%` }}
                    title={`${stage}: ${count}`}
                  />
                ) : null
              )}
            </div>
            <div className="flex flex-wrap gap-4">
              {pipelineCounts.map(({ stage, count }) => (
                <div key={stage} className="flex items-center gap-2 text-xs text-slate-600">
                  <span className={`inline-block h-2.5 w-2.5 rounded-full ${stageColors[stage]}`} />
                  {stage} <span className="font-semibold text-bb-navy">{count}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Upcoming Appointments */}
        <Card>
          <CardContent className="p-6">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-bb-navy flex items-center gap-2">
                <CalendarClock className="h-4.5 w-4.5 text-slate-400" />
                Upcoming
              </h2>
            </div>
            <div className="space-y-3">
              {appointments.length === 0 && <p className="text-sm text-slate-400">No upcoming appointments.</p>}
              {appointments.slice(0, 5).map((apt) => (
                <div key={apt.id} className="flex items-start gap-3 rounded-xl bg-slate-50 p-3">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-violet-100 text-violet-600">
                    <Clock className="h-4 w-4" />
                  </div>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-bb-navy">
                      {apt.location ?? "Virtual Meeting"}
                    </p>
                    <p className="text-xs text-slate-500">
                      {new Date(apt.scheduled_at).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}
                      {" "}
                      {new Date(apt.scheduled_at).toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" })}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <Card>
        <CardContent className="p-6">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-bb-navy">Recent Activity</h2>
          </div>
          <div className="space-y-3">
            {logs.length === 0 && <p className="text-sm text-slate-400">No recent activity.</p>}
            {logs.slice(0, 10).map((log) => (
              <div key={log.id} className="flex items-start gap-3 border-b border-slate-100 pb-3 last:border-0 last:pb-0">
                <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-slate-100 text-xs font-bold text-slate-500">
                  {log.action.charAt(0).toUpperCase()}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm text-slate-700">
                    <span className="font-medium text-bb-navy">{log.action}</span>
                    {" "}on{" "}
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
