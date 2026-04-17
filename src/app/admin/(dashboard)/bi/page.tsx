import { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { BarChart3, Download, Users, Briefcase, DollarSign, AlertTriangle } from "lucide-react";

import { createScheduledReportAction, queueReportExportAction, saveReportViewAction } from "@/app/actions";
import { getStaffAccessContext, getServiceSegmentedMetrics } from "@/lib/data/queries";
import { getExecutiveDashboardData, getReportingSnapshot } from "@/lib/reports/service";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
  divisions,
  getService,
  serviceList,
  type ServiceDivisionKey
} from "@/lib/services/catalogue";

export const metadata: Metadata = { title: "BI / Reports — Admin Console" };

export default async function AdminBiPage() {
  const context = await getStaffAccessContext();
  if (!context) redirect("/admin/login");
  if (!(context.permissions.includes("reports.view") || context.profile.role === "super_admin")) {
    redirect("/admin");
  }

  const [dashboard, snapshot, segmented] = await Promise.all([
    getExecutiveDashboardData(),
    getReportingSnapshot(),
    getServiceSegmentedMetrics()
  ]);
  const k = dashboard.kpis;

  // Per-service and per-division metrics
  const divisionCases: Record<ServiceDivisionKey, { total: number; active: number; completed: number; revenue: number }> = {
    IMMIGRATION: { total: 0, active: 0, completed: 0, revenue: 0 },
    TRAVEL: { total: 0, active: 0, completed: 0, revenue: 0 },
    CORPORATE_EVENTS: { total: 0, active: 0, completed: 0, revenue: 0 },
    CONSULTATION: { total: 0, active: 0, completed: 0, revenue: 0 }
  };
  const serviceCases: Record<string, { total: number; active: number; completed: number }> = {};

  for (const c of segmented.cases) {
    const svc = getService(c.case_type);
    if (!svc) continue;
    const row = divisionCases[svc.division];
    row.total += 1;
    if (c.status === "COMPLETED") row.completed += 1;
    else row.active += 1;
    const sRow = (serviceCases[svc.key] ??= { total: 0, active: 0, completed: 0 });
    sRow.total += 1;
    if (c.status === "COMPLETED") sRow.completed += 1;
    else sRow.active += 1;
  }

  for (const inv of segmented.invoices) {
    const caseRef = Array.isArray(inv.cases) ? inv.cases[0] : (inv.cases as { case_type?: string } | null);
    const svc = getService(caseRef?.case_type);
    if (!svc) continue;
    divisionCases[svc.division].revenue += Number(inv.amount_paid ?? 0);
  }

  // Visa approval rate — completed visa cases / total closed (completed + cancelled) visa cases
  const visaStats = serviceCases["VISA_ASSISTANCE"];
  const visaApprovalRate = visaStats && visaStats.total > 0
    ? Math.round((visaStats.completed / visaStats.total) * 100)
    : null;

  const money = (n: number) =>
    new Intl.NumberFormat("en-GH", {
      style: "currency",
      currency: "GHS",
      maximumFractionDigits: 0
    }).format(n);

  const kpis = [
    { label: "Leads Total", value: k.leadsTotal, icon: Users, accent: "border-l-blue-500" },
    { label: "Active Cases", value: k.activeCases, icon: Briefcase, accent: "border-l-emerald-500" },
    { label: "Outstanding (GHS)", value: k.outstandingRevenue.toFixed(2), icon: DollarSign, accent: "border-l-amber-500" },
    { label: "SLA At Risk", value: k.slaAtRiskCases, icon: AlertTriangle, accent: "border-l-red-500" }
  ];

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-bb-navy" style={{ fontFamily: "var(--font-sora)" }}>Reports & BI</h1>
          <p className="mt-1 text-sm text-slate-500">Executive KPIs, saved views, exports, and scheduled reports.</p>
        </div>
        <Button asChild size="sm" variant="secondary">
          <Link href="/admin/bi/export">
            <Download className="mr-1.5 h-3.5 w-3.5" /> Download KPI CSV
          </Link>
        </Button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {kpis.map(({ label, value, icon: Icon, accent }) => (
          <Card key={label} className={`border-l-4 ${accent}`}>
            <CardContent className="flex items-center gap-4 p-5">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-50 text-slate-500">
                <Icon className="h-5 w-5" />
              </div>
              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-slate-500">{label}</p>
                <p className="text-2xl font-bold text-bb-navy">{value}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Division-split KPIs */}
      <Card>
        <CardContent className="p-6">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-bb-navy">Revenue & cases by division</h2>
            {visaApprovalRate !== null && (
              <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700">
                Visa success rate: {visaApprovalRate}%
              </span>
            )}
          </div>
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {(Object.keys(divisionCases) as ServiceDivisionKey[]).map((key) => {
              const row = divisionCases[key];
              const division = divisions[key];
              return (
                <div
                  key={key}
                  className={`rounded-xl border border-slate-100 p-4 ${division.accentClass} border-l-4`}
                >
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                    {division.label}
                  </p>
                  <p className="mt-2 text-2xl font-bold text-bb-navy">{money(row.revenue)}</p>
                  <p className="mt-1 text-xs text-slate-500">Revenue collected</p>
                  <div className="mt-3 grid grid-cols-3 gap-2 text-center">
                    <div>
                      <p className="text-lg font-semibold text-bb-navy">{row.total}</p>
                      <p className="text-[10px] uppercase tracking-wide text-slate-400">Total</p>
                    </div>
                    <div>
                      <p className="text-lg font-semibold text-bb-navy">{row.active}</p>
                      <p className="text-[10px] uppercase tracking-wide text-slate-400">Active</p>
                    </div>
                    <div>
                      <p className="text-lg font-semibold text-bb-navy">{row.completed}</p>
                      <p className="text-[10px] uppercase tracking-wide text-slate-400">Done</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Service-level breakdown */}
      <Card>
        <CardContent className="p-6">
          <h2 className="mb-4 text-lg font-semibold text-bb-navy">Service performance</h2>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Service</TableHead>
                <TableHead>Division</TableHead>
                <TableHead className="text-right">Total cases</TableHead>
                <TableHead className="text-right">Active</TableHead>
                <TableHead className="text-right">Completed</TableHead>
                <TableHead className="text-right">Success rate</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {serviceList
                .filter((svc) => svc.key !== "BUSINESS_EXPORT")
                .map((svc) => {
                  const row = serviceCases[svc.key];
                  const total = row?.total ?? 0;
                  const completed = row?.completed ?? 0;
                  const active = row?.active ?? 0;
                  const rate = total > 0 ? Math.round((completed / total) * 100) : null;
                  return (
                    <TableRow key={svc.key}>
                      <TableCell className="font-medium text-bb-navy">{svc.label}</TableCell>
                      <TableCell className="text-xs text-slate-500">
                        {divisions[svc.division].label}
                      </TableCell>
                      <TableCell className="text-right text-sm">{total}</TableCell>
                      <TableCell className="text-right text-sm">{active}</TableCell>
                      <TableCell className="text-right text-sm">{completed}</TableCell>
                      <TableCell className="text-right text-sm font-medium text-bb-navy">
                        {rate === null ? "—" : `${rate}%`}
                      </TableCell>
                    </TableRow>
                  );
                })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Tabs defaultValue="views">
        <TabsList>
          <TabsTrigger value="views">Save View</TabsTrigger>
          <TabsTrigger value="export">Queue Export</TabsTrigger>
          <TabsTrigger value="schedule">Schedule Report</TabsTrigger>
        </TabsList>

        <TabsContent value="views">
          <Card>
            <CardContent className="p-6">
              <h2 className="mb-4 text-lg font-semibold text-bb-navy">Save Report View</h2>
              <form action={saveReportViewAction} className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                <Input name="report_key" defaultValue="executive_dashboard" />
                <Input name="view_name" placeholder="View name" required />
                <div />
                <div>
                  <Label className="text-xs">Date From</Label>
                  <Input name="date_from" type="date" />
                </div>
                <div>
                  <Label className="text-xs">Date To</Label>
                  <Input name="date_to" type="date" />
                </div>
                <div className="flex items-end">
                  <Button type="submit">Save View</Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="export">
          <Card>
            <CardContent className="p-6">
              <h2 className="mb-4 text-lg font-semibold text-bb-navy">Queue Export</h2>
              <form action={queueReportExportAction} className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                <Input name="report_key" defaultValue="executive_dashboard" />
                <select name="format" className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm">
                  <option value="CSV">CSV</option>
                  <option value="XLSX">XLSX</option>
                  <option value="PDF">PDF</option>
                  <option value="JSON">JSON</option>
                </select>
                <Input name="date_from" type="date" />
                <Input name="date_to" type="date" />
                <div className="sm:col-span-2 lg:col-span-4">
                  <Button type="submit" variant="secondary">Queue Export</Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="schedule">
          <Card>
            <CardContent className="p-6">
              <h2 className="mb-4 text-lg font-semibold text-bb-navy">Schedule Report</h2>
              <form action={createScheduledReportAction} className="grid gap-3 sm:grid-cols-2">
                <Input name="report_key" defaultValue="executive_dashboard" />
                <Input name="schedule_cron" placeholder="Cron (e.g. 0 8 * * 1)" defaultValue="0 8 * * 1" required />
                <Input name="recipients" placeholder="Emails comma-separated" required />
                <div className="grid grid-cols-2 gap-3">
                  <select name="export_format" className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm">
                    <option value="CSV">CSV</option>
                    <option value="XLSX">XLSX</option>
                    <option value="PDF">PDF</option>
                    <option value="JSON">JSON</option>
                  </select>
                  <select name="period" className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm">
                    <option value="daily">Daily</option>
                    <option value="weekly">Weekly</option>
                    <option value="monthly">Monthly</option>
                  </select>
                </div>
                <div className="sm:col-span-2">
                  <Button type="submit">Create Schedule</Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <div className="grid gap-6 xl:grid-cols-2">
        <Card>
          <CardContent className="p-6">
            <h2 className="mb-4 text-lg font-semibold text-bb-navy">Saved Views</h2>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Report Key</TableHead>
                  <TableHead>View Name</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {snapshot.savedViews.length === 0 && (
                  <TableRow><TableCell colSpan={2} className="text-center text-slate-400">No saved views.</TableCell></TableRow>
                )}
                {snapshot.savedViews.slice(0, 10).map((v) => (
                  <TableRow key={v.id}>
                    <TableCell className="text-sm text-slate-600">{v.report_key}</TableCell>
                    <TableCell className="font-medium text-bb-navy">{v.view_name}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <h2 className="mb-4 text-lg font-semibold text-bb-navy">Report Jobs</h2>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Type</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {snapshot.jobs.length === 0 && (
                  <TableRow><TableCell colSpan={2} className="text-center text-slate-400">No report jobs.</TableCell></TableRow>
                )}
                {snapshot.jobs.slice(0, 10).map((j) => (
                  <TableRow key={j.id}>
                    <TableCell className="text-sm text-slate-600">{j.job_type}</TableCell>
                    <TableCell>
                      <span className="inline-flex rounded-full bg-slate-100 px-2.5 py-0.5 text-[11px] font-semibold uppercase text-slate-600">
                        {j.status}
                      </span>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
