import { createAdminClient } from "@/lib/supabase/admin";
import { requirePermission } from "@/lib/auth/policy";
import { normalizeGhanaPhone } from "./client";

export async function logWhatsappSend(input: {
  toPhone: string;
  toName?: string | null;
  body: string;
  clientId?: string | null;
  leadId?: string | null;
  caseId?: string | null;
  templateKey?: string | null;
  subject?: string | null;
}) {
  const context = await requirePermission("messages.manage").catch(async () => {
    return requirePermission("cases.view");
  });
  const admin = createAdminClient();
  const phone = normalizeGhanaPhone(input.toPhone) ?? input.toPhone;

  const { data, error } = await admin
    .from("whatsapp_messages")
    .insert({
      to_phone: phone,
      to_name: input.toName ?? null,
      client_id: input.clientId ?? null,
      lead_id: input.leadId ?? null,
      case_id: input.caseId ?? null,
      template_key: input.templateKey ?? null,
      subject: input.subject ?? null,
      body: input.body,
      status: "LAUNCHED",
      sent_by: context.user.id
    })
    .select("id")
    .single();
  if (error) throw error;
  return data?.id as string;
}

export async function getRecentWhatsappMessages(params: {
  clientId?: string;
  caseId?: string;
  leadId?: string;
  limit?: number;
}) {
  await requirePermission("messages.manage").catch(() => requirePermission("cases.view"));
  const admin = createAdminClient();
  let query = admin
    .from("whatsapp_messages")
    .select("id, to_phone, to_name, body, subject, template_key, status, sent_at, sent_by")
    .order("sent_at", { ascending: false })
    .limit(params.limit ?? 25);
  if (params.clientId) query = query.eq("client_id", params.clientId);
  if (params.caseId) query = query.eq("case_id", params.caseId);
  if (params.leadId) query = query.eq("lead_id", params.leadId);
  const { data, error } = await query;
  if (error) throw error;
  return data ?? [];
}
