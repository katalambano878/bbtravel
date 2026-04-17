import Link from "next/link";
import { redirect } from "next/navigation";

import { createScheduledReportAction, queueReportExportAction, saveReportViewAction } from "@/app/actions";
import { getStaffAccessContext } from "@/lib/data/queries";
import { getExecutiveDashboardData, getReportingSnapshot } from "@/lib/reports/service";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

export default async function AdminBiPage() {
  const context = await getStaffAccessContext();
  if (!context) redirect("/admin/login");
  if (!(context.permissions.includes("reports.view") || context.profile.role === "super_admin")) {
    redirect("/admin");
  }

  const [dashboard, snapshot] = await Promise.all([getExecutiveDashboardData(), getReportingSnapshot()]);

  return (
    <section className="section-shell space-y-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="eyebrow">Executive BI</p>
          <h1 className="text-3xl font-semibold text-bb-navy">KPI, Saved Views, Exports, Schedules</h1>
        </div>
        <Button asChild variant="secondary">
          <Link href="/admin/bi/export">Download KPI CSV</Link>
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="p-5">
            <p className="text-xs text-slate-500">Leads Total</p>
            <p className="text-2xl font-semibold text-bb-navy">{dashboard.kpis.leadsTotal}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5">
            <p className="text-xs text-slate-500">Active Cases</p>
            <p className="text-2xl font-semibold text-bb-navy">{dashboard.kpis.activeCases}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5">
            <p className="text-xs text-slate-500">Outstanding Revenue (GHS)</p>
            <p className="text-2xl font-semibold text-bb-navy">{dashboard.kpis.outstandingRevenue.toFixed(2)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5">
            <p className="text-xs text-slate-500">SLA At Risk</p>
            <p className="text-2xl font-semibold text-bb-navy">{dashboard.kpis.slaAtRiskCases}</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        <Card>
          <CardContent className="space-y-3 p-6">
            <h2 className="text-lg font-semibold text-bb-navy">Save Report View</h2>
            <form action={saveReportViewAction} className="space-y-2">
              <Input name="report_key" defaultValue="executive_dashboard" />
              <Input name="view_name" placeholder="View name" required />
              <Label htmlFor="date_from">Date From</Label>
              <Input id="date_from" name="date_from" type="date" />
              <Label htmlFor="date_to">Date To</Label>
              <Input id="date_to" name="date_to" type="date" />
              <Button type="submit">Save view</Button>
            </form>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="space-y-3 p-6">
            <h2 className="text-lg font-semibold text-bb-navy">Queue Export</h2>
            <form action={queueReportExportAction} className="space-y-2">
              <Input name="report_key" defaultValue="executive_dashboard" />
              <select name="format" className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm">
                <option value="CSV">CSV</option>
                <option value="XLSX">XLSX</option>
                <option value="PDF">PDF</option>
                <option value="JSON">JSON</option>
              </select>
              <Input name="date_from" type="date" />
              <Input name="date_to" type="date" />
              <Button type="submit" variant="secondary">
                Queue export
              </Button>
            </form>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="space-y-3 p-6">
            <h2 className="text-lg font-semibold text-bb-navy">Schedule Report</h2>
            <form action={createScheduledReportAction} className="space-y-2">
              <Input name="report_key" defaultValue="executive_dashboard" />
              <Input name="schedule_cron" placeholder="Cron (e.g. 0 8 * * 1)" defaultValue="0 8 * * 1" required />
              <Input name="recipients" placeholder="Emails comma-separated" required />
              <select name="export_format" className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm">
                <option value="CSV">CSV</option>
                <option value="XLSX">XLSX</option>
                <option value="PDF">PDF</option>
                <option value="JSON">JSON</option>
              </select>
              <select name="period" className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm">
                <option value="daily">Daily</option>
                <option value="weekly">Weekly</option>
                <option value="monthly">Monthly</option>
              </select>
              <Button type="submit">Create schedule</Button>
            </form>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-8 lg:grid-cols-2">
        <Card>
          <CardContent className="space-y-3 p-6">
            <h2 className="text-lg font-semibold text-bb-navy">Saved Views</h2>
            <div className="space-y-2 text-sm text-slate-600">
              {snapshot.savedViews.slice(0, 10).map((view) => (
                <p key={view.id} className="rounded-lg bg-slate-50 px-3 py-2">
                  {view.report_key} • {view.view_name}
                </p>
              ))}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="space-y-3 p-6">
            <h2 className="text-lg font-semibold text-bb-navy">Report Jobs</h2>
            <div className="space-y-2 text-sm text-slate-600">
              {snapshot.jobs.slice(0, 10).map((job) => (
                <p key={job.id} className="rounded-lg bg-slate-50 px-3 py-2">
                  {job.job_type} • {job.status}
                </p>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </section>
  );
}
