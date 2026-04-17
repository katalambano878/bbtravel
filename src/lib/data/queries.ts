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

export async function getStaffAccessContext() {
  const supabase = await createServerClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: profile } = await supabase
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
