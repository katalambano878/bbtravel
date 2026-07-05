import { createClient as createServerClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function getCurrentUser() {
  const supabase = await createServerClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();
  return user;
}

export async function getClientCases() {
  const supabase = await createServerClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) return [];

  const { data: client } = await supabase.from("clients").select("id").eq("user_id", user.id).maybeSingle();
  if (!client) return [];

  const { data: cases } = await supabase
    .from("cases")
    .select("id, case_type, status, created_at, updated_at, meta, assigned_to")
    .eq("client_id", client.id)
    .order("created_at", { ascending: false });

  return cases ?? [];
}

export async function getCaseDocuments(caseId: string) {
  const supabase = await createServerClient();
  const { data } = await supabase
    .from("documents")
    .select("id, doc_type, file_url, status, reviewer_notes, created_at")
    .eq("case_id", caseId)
    .order("created_at", { ascending: false });
  return data ?? [];
}

export async function getCaseSteps(caseId: string) {
  const supabase = await createServerClient();
  const { data } = await supabase.from("case_steps").select("id, title, status, due_date").eq("case_id", caseId);
  return data ?? [];
}

export async function getPortalMessages(caseId: string) {
  const supabase = await createServerClient();
  const { data } = await supabase
    .from("case_messages")
    .select("id, message, is_internal, created_at")
    .eq("case_id", caseId)
    .eq("is_internal", false)
    .order("created_at", { ascending: false });
  return data ?? [];
}

export async function getCaseAppointments(caseId: string) {
  const supabase = await createServerClient();
  const { data } = await supabase
    .from("appointments")
    .select("id, scheduled_at, location, notes")
    .eq("case_id", caseId)
    .order("scheduled_at", { ascending: true });
  return data ?? [];
}

export async function getAdminOverview() {
  const admin = createAdminClient();
  const today = new Date();
  const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate()).toISOString();
  const weekAhead = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000).toISOString();
  const [
    leadsRes,
    casesRes,
    docsRes,
    appointmentsRes,
    invoicesOutstandingRes,
    weekAppointmentsRes
  ] = await Promise.all([
    admin.from("leads").select("*", { count: "exact", head: true }).gte("created_at", startOfDay),
    admin.from("cases").select("*", { count: "exact", head: true }).neq("status", "COMPLETED"),
    admin.from("documents").select("*", { count: "exact", head: true }).eq("status", "PENDING"),
    admin.from("appointments").select("*", { count: "exact", head: true }).gte("scheduled_at", startOfDay),
    admin.from("invoices").select("total_amount, amount_paid").neq("status", "PAID"),
    admin
      .from("appointments")
      .select("*", { count: "exact", head: true })
      .gte("scheduled_at", startOfDay)
      .lte("scheduled_at", weekAhead)
  ]);

  const outstandingRevenue = (invoicesOutstandingRes.data ?? []).reduce(
    (sum, row) => sum + Math.max(Number(row.total_amount ?? 0) - Number(row.amount_paid ?? 0), 0),
    0
  );

  return {
    newLeadsToday: leadsRes.count ?? 0,
    activeCases: casesRes.count ?? 0,
    pendingDocuments: docsRes.count ?? 0,
    upcomingAppointments: appointmentsRes.count ?? 0,
    appointmentsThisWeek: weekAppointmentsRes.count ?? 0,
    outstandingRevenue
  };
}

export async function getAdminLeads() {
  const admin = createAdminClient();
  const { data } = await admin.from("leads").select("*").order("created_at", { ascending: false });
  return data ?? [];
}

export async function getAdminCases() {
  const admin = createAdminClient();
  const { data } = await admin
    .from("cases")
    .select("id, case_type, status, assigned_to, created_at, updated_at, meta, clients(name,email)")
    .order("updated_at", { ascending: false });
  return data ?? [];
}

export async function getAdminDocuments() {
  const admin = createAdminClient();
  const { data } = await admin
    .from("documents")
    .select("id, case_id, doc_type, status, reviewer_notes, created_at")
    .order("created_at", { ascending: false });
  return data ?? [];
}

export async function getAdminAppointments() {
  const admin = createAdminClient();
  const { data } = await admin
    .from("appointments")
    .select("id, case_id, scheduled_at, location, notes")
    .order("scheduled_at", { ascending: true });
  return data ?? [];
}

/**
 * Service-division breakdown of ACTIVE cases, for the dashboard home.
 * Returns count keyed by division ("IMMIGRATION" | "TRAVEL" | "CORPORATE_EVENTS" | "CONSULTATION").
 */
export async function getAdminCasesByService() {
  const admin = createAdminClient();
  const { data } = await admin
    .from("cases")
    .select("case_type, status")
    .neq("status", "COMPLETED");
  return data ?? [];
}

/**
 * Appointments in the next N days with case + client info for the
 * Visa Desk / Travel Desk dashboard widgets.
 */
export async function getAdminUpcomingAppointments(days = 7) {
  const admin = createAdminClient();
  const now = new Date();
  const until = new Date(now.getTime() + days * 24 * 60 * 60 * 1000);
  const { data } = await admin
    .from("appointments")
    .select("id, case_id, scheduled_at, location, notes, cases(case_type, meta, clients(name))")
    .gte("scheduled_at", now.toISOString())
    .lte("scheduled_at", until.toISOString())
    .order("scheduled_at", { ascending: true })
    .limit(25);
  return data ?? [];
}

/**
 * Service-segmented BI metrics — by division + per-service counts.
 * Returns active/completed case counts, visa approval rate, tickets issued,
 * bookings, placements, and revenue split.
 */
export async function getServiceSegmentedMetrics() {
  const admin = createAdminClient();
  const [casesRes, invoicesRes] = await Promise.all([
    admin.from("cases").select("id, case_type, status, client_id"),
    admin
      .from("invoices")
      .select("id, total_amount, amount_paid, cases(case_type)")
  ]);
  return {
    cases: casesRes.data ?? [],
    invoices: invoicesRes.data ?? []
  };
}

/**
 * Cases that represent travel departures inside a rolling window, used by
 * the "Travel Desk — Upcoming Departures" widget. Reads `meta.departure_date`
 * which flight/tour/hotel cases store.
 */
export async function getUpcomingDepartures(days = 14) {
  const admin = createAdminClient();
  const now = new Date();
  const until = new Date(now.getTime() + days * 24 * 60 * 60 * 1000);
  const { data } = await admin
    .from("cases")
    .select("id, case_type, status, meta, clients(name)")
    .in("case_type", ["FLIGHT_RESERVATION", "TOUR_PACKAGE", "HOTEL_BOOKING", "CORPORATE_TRAVEL"])
    .neq("status", "COMPLETED")
    .order("updated_at", { ascending: false })
    .limit(50);
  const rows = data ?? [];
  return rows
    .filter((row) => {
      const meta = (row.meta ?? {}) as Record<string, unknown>;
      const key =
        row.case_type === "HOTEL_BOOKING"
          ? "check_in"
          : row.case_type === "CORPORATE_TRAVEL"
            ? "departure_date"
            : "departure_date";
      const raw = meta[key];
      if (!raw || typeof raw !== "string") return false;
      const date = new Date(raw);
      return !Number.isNaN(date.getTime()) && date >= now && date <= until;
    })
    .slice(0, 10);
}

export async function getAdminAuditLogs() {
  const admin = createAdminClient();
  const { data } = await admin.from("audit_logs").select("*").order("created_at", { ascending: false }).limit(50);
  return data ?? [];
}

export async function getSiteContent() {
  const admin = createAdminClient();
  const [settings, testimonials, posts, tours] = await Promise.all([
    admin.from("site_settings").select("*").limit(1).maybeSingle(),
    admin.from("testimonials").select("*").eq("is_active", true),
    admin.from("blog_posts").select("*").eq("is_published", true).order("published_at", { ascending: false }),
    admin.from("tours").select("*").eq("is_active", true)
  ]);

  return {
    settings: settings.data,
    testimonials: testimonials.data ?? [],
    posts: posts.data ?? [],
    tours: tours.data ?? []
  };
}

/**
 * "Today" inbox — aggregates everything a staff member can act on right now.
 * Designed for the admin home page so it is a real todo list, not a vanity wall.
 */
export async function getTodayInbox() {
  const admin = createAdminClient();
  const now = new Date();
  const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const endOfDay = new Date(startOfDay.getTime() + 24 * 60 * 60 * 1000);
  const weekAhead = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
  const in30Days = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);

  const [
    newLeadsTodayRes,
    leadsToCallRes,
    tasksDueRes,
    docsAwaitingRes,
    overdueInvoicesRes,
    paidInvoicesRes,
    appointmentsTodayRes,
    expiringDocsRes,
    slaAtRiskCasesRes,
    pendingExpensesRes,
    leaveRequestsRes
  ] = await Promise.all([
    admin
      .from("leads")
      .select("id, name, service_type, stage, created_at, phone, email, whatsapp, destination, next_action_date, assigned_to")
      .gte("created_at", startOfDay.toISOString())
      .order("created_at", { ascending: false })
      .limit(25),
    admin
      .from("leads")
      .select("id, name, service_type, stage, next_action_date, phone, whatsapp, destination, assigned_to")
      .in("stage", ["NEW", "CONTACTED", "SCOPED", "QUOTED"])
      .or(`next_action_date.is.null,next_action_date.lte.${endOfDay.toISOString().slice(0, 10)}`)
      .order("created_at", { ascending: false })
      .limit(20),
    admin
      .from("case_tasks")
      .select("id, case_id, title, priority, assigned_to, due_at, status, cases(id, case_type, clients(id, name, phone, whatsapp))")
      .in("status", ["OPEN", "IN_PROGRESS", "BLOCKED"])
      .lte("due_at", endOfDay.toISOString())
      .order("due_at", { ascending: true })
      .limit(25),
    admin
      .from("documents")
      .select("id, case_id, doc_type, status, created_at, cases(case_type, clients(name, phone, whatsapp))")
      .eq("status", "PENDING")
      .order("created_at", { ascending: false })
      .limit(20),
    admin
      .from("invoices")
      .select("id, invoice_number, client_id, case_id, total_amount, amount_paid, due_date, status, clients(name, phone, whatsapp)")
      .in("status", ["SENT", "PARTIALLY_PAID", "OVERDUE"])
      .lte("due_date", endOfDay.toISOString().slice(0, 10))
      .order("due_date", { ascending: true })
      .limit(20),
    admin
      .from("invoices")
      .select("total_amount, amount_paid, status")
      .gte("created_at", new Date(now.getTime() - 30 * 86400 * 1000).toISOString()),
    admin
      .from("appointments")
      .select("id, case_id, scheduled_at, appointment_type, status, location, cases(case_type, clients(name, phone, whatsapp))")
      .gte("scheduled_at", startOfDay.toISOString())
      .lte("scheduled_at", endOfDay.toISOString())
      .order("scheduled_at", { ascending: true }),
    admin
      .from("documents")
      .select("id, case_id, doc_type, expires_at, cases(case_type, clients(name, phone, whatsapp))")
      .not("expires_at", "is", null)
      .lte("expires_at", in30Days.toISOString().slice(0, 10))
      .gte("expires_at", startOfDay.toISOString().slice(0, 10))
      .order("expires_at", { ascending: true })
      .limit(20),
    admin
      .from("cases")
      .select("id, case_type, status, sla_due_at, assigned_to, clients(name, phone, whatsapp)")
      .not("sla_due_at", "is", null)
      .lte("sla_due_at", weekAhead.toISOString())
      .neq("status", "COMPLETED")
      .order("sla_due_at", { ascending: true })
      .limit(15),
    admin
      .from("expenses")
      .select("id, amount, category, category_key, expense_date, submitted_by, description")
      .eq("status", "PENDING")
      .order("expense_date", { ascending: true })
      .limit(15),
    admin
      .from("leave_requests")
      .select("id, employee_id, leave_type, start_date, end_date, status")
      .eq("status", "PENDING")
      .order("start_date", { ascending: true })
      .limit(15)
  ]);

  const paidInvoices = (paidInvoicesRes.data ?? []).reduce(
    (sum, row) => sum + Number(row.amount_paid ?? 0),
    0
  );
  const outstanding = (overdueInvoicesRes.data ?? []).reduce(
    (sum, row) => sum + Math.max(Number(row.total_amount ?? 0) - Number(row.amount_paid ?? 0), 0),
    0
  );

  return {
    newLeadsToday: (newLeadsTodayRes.data ?? []).length,
    leadsToCall: leadsToCallRes.data ?? [],
    newLeadsTodayList: newLeadsTodayRes.data ?? [],
    tasksDue: tasksDueRes.data ?? [],
    docsAwaiting: docsAwaitingRes.data ?? [],
    invoicesDue: overdueInvoicesRes.data ?? [],
    appointmentsToday: appointmentsTodayRes.data ?? [],
    expiringDocs: expiringDocsRes.data ?? [],
    slaAtRisk: slaAtRiskCasesRes.data ?? [],
    pendingExpenses: pendingExpensesRes.data ?? [],
    pendingLeaveRequests: leaveRequestsRes.data ?? [],
    kpis: {
      outstandingRevenue: outstanding,
      collected30d: paidInvoices
    }
  };
}

/** Paginated clients list with counts for CRM-style browsing. */
export async function getClientsList(params: { search?: string; limit?: number } = {}) {
  const admin = createAdminClient();
  const limit = params.limit ?? 100;
  let query = admin
    .from("clients")
    .select("id, name, email, phone, whatsapp, city, country, preferred_channel, tags, created_at, cases(id, status)")
    .order("created_at", { ascending: false })
    .limit(limit);
  if (params.search) {
    const search = params.search.trim();
    query = query.or(`name.ilike.%${search}%,email.ilike.%${search}%,phone.ilike.%${search}%,whatsapp.ilike.%${search}%`);
  }
  const { data, error } = await query;
  if (error) throw error;
  return data ?? [];
}

/** Full 360 view for a single client. */
export async function getClientDetail(clientId: string) {
  const admin = createAdminClient();
  const [
    client,
    cases,
    invoices,
    documents,
    leads,
    whatsapp,
    notes,
    appointments
  ] = await Promise.all([
    admin.from("clients").select("*").eq("id", clientId).maybeSingle(),
    admin
      .from("cases")
      .select("id, case_type, status, created_at, updated_at, meta, assigned_to, sla_due_at")
      .eq("client_id", clientId)
      .order("created_at", { ascending: false }),
    admin
      .from("invoices")
      .select("id, invoice_number, total_amount, amount_paid, status, issue_date, due_date")
      .eq("client_id", clientId)
      .order("issue_date", { ascending: false }),
    admin
      .from("documents")
      .select("id, case_id, doc_type, status, expires_at, created_at, file_url")
      .in("case_id",
        (
          await admin.from("cases").select("id").eq("client_id", clientId)
        ).data?.map((r) => r.id) ?? ["00000000-0000-0000-0000-000000000000"]
      )
      .order("created_at", { ascending: false })
      .limit(50),
    admin
      .from("leads")
      .select("id, name, service_type, stage, created_at, destination, notes")
      .eq("converted_client_id", clientId)
      .order("created_at", { ascending: false })
      .limit(20),
    admin
      .from("whatsapp_messages")
      .select("id, body, subject, template_key, status, sent_at, to_phone")
      .eq("client_id", clientId)
      .order("sent_at", { ascending: false })
      .limit(25),
    admin
      .from("case_notes")
      .select("id, case_id, note, visibility, created_at")
      .in("case_id",
        (
          await admin.from("cases").select("id").eq("client_id", clientId)
        ).data?.map((r) => r.id) ?? ["00000000-0000-0000-0000-000000000000"]
      )
      .order("created_at", { ascending: false })
      .limit(25),
    admin
      .from("appointments")
      .select("id, case_id, scheduled_at, appointment_type, status, location")
      .in("case_id",
        (
          await admin.from("cases").select("id").eq("client_id", clientId)
        ).data?.map((r) => r.id) ?? ["00000000-0000-0000-0000-000000000000"]
      )
      .order("scheduled_at", { ascending: false })
      .limit(25)
  ]);

  return {
    client: client.data,
    cases: cases.data ?? [],
    invoices: invoices.data ?? [],
    documents: documents.data ?? [],
    leads: leads.data ?? [],
    whatsapp: whatsapp.data ?? [],
    notes: notes.data ?? [],
    appointments: appointments.data ?? []
  };
}

export async function getStaffAccessContext() {
  const supabase = await createServerClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();
  if (!user) return null;

  // Use service role for the profile lookup: RLS policies reference
  // is_super_admin(), which authenticated users cannot execute directly.
  const admin = createAdminClient();
  const { data: profile } = await admin
    .from("staff_profiles")
    .select("role, full_name, department, manager_user_id, is_active, custom_title")
    .eq("user_id", user.id)
    .maybeSingle();
  if (!profile) return null;
  if (profile.is_active === false) return null;

  const { data: role } = await supabase.from("roles").select("id, role_key").eq("role_key", profile.role).maybeSingle();
  let permissions: { permission_key: string }[] = [];
  if (role?.id) {
    const { data } = await supabase
      .from("role_permissions")
      .select("permissions(permission_key)")
      .eq("role_id", role.id);
    // Supabase returns the related row as either an object or an array depending
    // on the inferred relationship cardinality. Handle both shapes safely.
    type PermRow = { permissions?: { permission_key?: string } | { permission_key?: string }[] | null };
    permissions = (data ?? []).flatMap((row: PermRow) => {
      const perms = row.permissions;
      if (!perms) return [];
      const list = Array.isArray(perms) ? perms : [perms];
      return list
        .map((p) => ({ permission_key: p?.permission_key ?? "" }))
        .filter((p) => p.permission_key !== "");
    });
  }

  return {
    user,
    profile,
    permissions: permissions.map((item) => item.permission_key).filter(Boolean)
  };
}
