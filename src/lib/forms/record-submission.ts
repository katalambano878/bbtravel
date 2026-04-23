import { createAdminClient } from "@/lib/supabase/admin";
import { getStaffAccessContext } from "@/lib/data/queries";
import { sendAdminFormEmail } from "@/lib/email/resend";

export type WebsiteFormType = "START_APPLICATION" | "START_PROFILE" | "CONTACT" | "TOUR_INQUIRY";

export async function recordWebsiteFormSubmission(input: {
  formType: WebsiteFormType;
  payload: Record<string, unknown>;
  name?: string | null;
  email?: string | null;
  phone?: string | null;
  pageUrl?: string | null;
  leadId?: string | null;
  caseId?: string | null;
}): Promise<string> {
  const admin = createAdminClient();
  const { data, error } = await admin
    .from("form_submissions")
    .insert({
      form_type: input.formType,
      payload: input.payload,
      name: input.name ?? null,
      email: input.email ?? null,
      phone: input.phone ?? null,
      page_url: input.pageUrl ?? null,
      lead_id: input.leadId ?? null,
      case_id: input.caseId ?? null
    })
    .select("id")
    .single();
  if (error) throw error;
  const id = data.id as string;

  try {
    await sendAdminFormEmail({
      formType: input.formType,
      payload: input.payload,
      name: input.name,
      email: input.email,
      phone: input.phone,
      submissionId: id,
      leadId: input.leadId,
      caseId: input.caseId
    });
  } catch {
    // Do not fail the user flow if email provider is down.
  }

  return id;
}

export type FormSubmissionRow = {
  id: string;
  form_type: string;
  payload: Record<string, unknown>;
  name: string | null;
  email: string | null;
  phone: string | null;
  page_url: string | null;
  lead_id: string | null;
  case_id: string | null;
  created_at: string;
};

export async function getFormSubmissionsInbox(limit = 200): Promise<FormSubmissionRow[]> {
  const context = await getStaffAccessContext();
  if (!context) {
    throw new Error("Unauthorized");
  }
  const allowed =
    context.profile.role === "super_admin" ||
    context.permissions.includes("leads.view") ||
    context.permissions.includes("crm.view");
  if (!allowed) {
    throw new Error("Forbidden");
  }
  const admin = createAdminClient();
  const { data, error } = await admin
    .from("form_submissions")
    .select("id, form_type, payload, name, email, phone, page_url, lead_id, case_id, created_at")
    .order("created_at", { ascending: false })
    .limit(limit);
  if (error) throw error;
  return (data ?? []) as FormSubmissionRow[];
}
