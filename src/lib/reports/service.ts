import { createAdminClient } from "@/lib/supabase/admin";
import { requirePermission } from "@/lib/auth/policy";
import { writeAuditEvent } from "@/lib/audit/events";
import { publishEvent } from "@/lib/events/bus";

function toCsv(rows: Record<string, unknown>[]) {
  if (!rows.length) return "";
  const headers = Object.keys(rows[0]);
  const escaped = (value: unknown) => `"${String(value ?? "").replace(/"/g, '""')}"`;
  const data = rows.map((row) => headers.map((header) => escaped(row[header])).join(","));
  return [headers.join(","), ...data].join("\n");
}

export async function getExecutiveDashboardData() {
  await requirePermission("dashboard.view");
  const admin = createAdminClient();

  const [leads, cases, invoices, expenses, leaveRequests, docs, tasks] = await Promise.all([
    admin.from("leads").select("id, stage, service_type, created_at"),
    admin.from("cases").select("id, status, created_at, sla_due_at"),
    admin.from("invoices").select("id, status, total_amount, amount_paid, due_date"),
    admin.from("expenses").select("id, status, amount"),
    admin.from("leave_requests").select("id, status"),
    admin.from("documents").select("id, status"),
    admin.from("system_tasks").select("id, status, due_at")
  ]);

  const leadRows = leads.data ?? [];
  const caseRows = cases.data ?? [];
  const invoiceRows = invoices.data ?? [];
  const expenseRows = expenses.data ?? [];
  const leaveRows = leaveRequests.data ?? [];
  const docRows = docs.data ?? [];
  const taskRows = tasks.data ?? [];

  const billed = invoiceRows.reduce((sum, row) => sum + Number(row.total_amount ?? 0), 0);
  const collected = invoiceRows.reduce((sum, row) => sum + Number(row.amount_paid ?? 0), 0);
  const expensesTotal = expenseRows.reduce((sum, row) => sum + Number(row.amount ?? 0), 0);
  const now = new Date();

  return {
    kpis: {
      leadsTotal: leadRows.length,
      activeCases: caseRows.filter((row) => row.status !== "COMPLETED").length,
      slaAtRiskCases: caseRows.filter((row) => row.sla_due_at && new Date(row.sla_due_at) < now && row.status !== "COMPLETED").length,
      billedRevenue: billed,
      collectedRevenue: collected,
      outstandingRevenue: Math.max(billed - collected, 0),
      expensesTotal,
      netMarginProxy: collected - expensesTotal
    },
    widgets: {
      pendingDocumentApprovals: docRows.filter((row) => row.status === "PENDING").length,
      pendingExpenseApprovals: expenseRows.filter((row) => row.status === "PENDING").length,
      pendingLeaveApprovals: leaveRows.filter((row) => row.status === "PENDING").length,
      openTasks: taskRows.filter((row) => row.status !== "DONE" && row.status !== "CANCELLED").length,
      overdueInvoices: invoiceRows.filter((row) => row.status !== "PAID" && row.due_date && new Date(row.due_date) < now).length
    },
    breakdown: {
      leadByService: Object.entries(
        leadRows.reduce<Record<string, number>>((acc, row) => {
          const key = row.service_type ?? "UNKNOWN";
          acc[key] = (acc[key] ?? 0) + 1;
          return acc;
        }, {})
      ).map(([service, count]) => ({ service, count }))
    }
  };
}

export async function saveReportView(input: { reportKey: string; viewName: string; filters: Record<string, unknown> }) {
  const context = await requirePermission("reports.view");
  const admin = createAdminClient();
  const { data, error } = await admin
    .from("saved_report_views")
    .insert({
      report_key: input.reportKey,
      view_name: input.viewName,
      filters: input.filters,
      owner_user_id: context.user.id
    })
    .select("*")
    .single();
  if (error) throw error;

  await writeAuditEvent({
    actorId: context.user.id,
    action: "REPORT_VIEW_SAVED",
    targetType: "report_view",
    targetId: data.id,
    payload: {
      report_key: input.reportKey
    }
  });
}

export async function queueReportExport(input: { reportKey: string; format: "CSV" | "XLSX" | "PDF" | "JSON"; filters: Record<string, unknown> }) {
  const context = await requirePermission("reports.export");
  const admin = createAdminClient();
  const { data, error } = await admin
    .from("report_exports")
    .insert({
      report_key: input.reportKey,
      export_format: input.format,
      filters: input.filters,
      requested_by: context.user.id
    })
    .select("*")
    .single();
  if (error) throw error;

  await admin.from("job_queue").insert({
    job_type: "REPORT_EXPORT",
    payload: {
      report_export_id: data.id
    },
    created_by: context.user.id
  });

  await publishEvent({
    eventKey: "report.export.queued",
    eventType: "REPORT",
    aggregateType: "report_export",
    aggregateId: data.id,
    payload: {
      report_key: input.reportKey,
      format: input.format
    },
    createdBy: context.user.id
  });
}

export async function createScheduledReport(input: {
  reportKey: string;
  scheduleCron: string;
  recipients: string[];
  exportFormat: "CSV" | "XLSX" | "PDF" | "JSON";
  filters: Record<string, unknown>;
}) {
  const context = await requirePermission("reports.scheduled");
  const admin = createAdminClient();
  const { data, error } = await admin
    .from("scheduled_reports")
    .insert({
      report_key: input.reportKey,
      schedule_cron: input.scheduleCron,
      recipients: input.recipients,
      export_format: input.exportFormat,
      filters: input.filters,
      created_by: context.user.id
    })
    .select("*")
    .single();
  if (error) throw error;

  await writeAuditEvent({
    actorId: context.user.id,
    action: "SCHEDULED_REPORT_CREATED",
    targetType: "scheduled_report",
    targetId: data.id,
    payload: {
      report_key: input.reportKey
    }
  });
}

export async function getReportingSnapshot() {
  await requirePermission("reports.view");
  const admin = createAdminClient();
  const [savedViews, exports, scheduledReports, jobs, kpiSnapshots] = await Promise.all([
    admin.from("saved_report_views").select("*").order("created_at", { ascending: false }).limit(200),
    admin.from("report_exports").select("*").order("created_at", { ascending: false }).limit(200),
    admin.from("scheduled_reports").select("*").order("created_at", { ascending: false }).limit(200),
    admin.from("job_queue").select("*").order("created_at", { ascending: false }).limit(200),
    admin.from("kpi_snapshots").select("*").order("snapshot_date", { ascending: false }).limit(200)
  ]);

  return {
    savedViews: savedViews.data ?? [],
    exports: exports.data ?? [],
    scheduledReports: scheduledReports.data ?? [],
    jobs: jobs.data ?? [],
    kpiSnapshots: kpiSnapshots.data ?? []
  };
}

export async function exportExecutiveDashboardAsCsv() {
  const dashboard = await getExecutiveDashboardData();
  const rows = [
    { metric: "Leads Total", value: dashboard.kpis.leadsTotal },
    { metric: "Active Cases", value: dashboard.kpis.activeCases },
    { metric: "SLA At Risk", value: dashboard.kpis.slaAtRiskCases },
    { metric: "Billed Revenue", value: dashboard.kpis.billedRevenue },
    { metric: "Collected Revenue", value: dashboard.kpis.collectedRevenue },
    { metric: "Outstanding Revenue", value: dashboard.kpis.outstandingRevenue },
    { metric: "Expenses", value: dashboard.kpis.expensesTotal },
    { metric: "Net Margin Proxy", value: dashboard.kpis.netMarginProxy }
  ];
  return toCsv(rows);
}
