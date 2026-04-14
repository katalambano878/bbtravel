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
  const [leadsRes, casesRes, docsRes, appointmentsRes] = await Promise.all([
    admin.from("leads").select("*", { count: "exact", head: true }).gte("created_at", startOfDay),
    admin.from("cases").select("*", { count: "exact", head: true }).neq("status", "COMPLETED"),
    admin.from("documents").select("*", { count: "exact", head: true }).eq("status", "PENDING"),
    admin.from("appointments").select("*", { count: "exact", head: true }).gte("scheduled_at", startOfDay)
  ]);

  return {
    newLeadsToday: leadsRes.count ?? 0,
    activeCases: casesRes.count ?? 0,
    pendingDocuments: docsRes.count ?? 0,
    upcomingAppointments: appointmentsRes.count ?? 0
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
    .select("id, case_type, status, assigned_to, created_at, updated_at, clients(name,email)")
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
    permissions = (data ?? []).flatMap((row: { permissions?: { permission_key?: string }[] }) =>
      (row.permissions ?? []).map((permission) => ({
        permission_key: permission.permission_key ?? ""
      }))
    );
  }

  return {
    user,
    profile,
    permissions: permissions.map((item) => item.permission_key).filter(Boolean)
  };
}
