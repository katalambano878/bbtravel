import { createAdminClient } from "@/lib/supabase/admin";
import { requirePermission } from "@/lib/auth/policy";
import { writeAuditEvent } from "@/lib/audit/events";

export async function assignLead({
  leadId,
  assigneeUserId,
  reason,
  mode
}: {
  leadId: string;
  assigneeUserId: string;
  reason?: string;
  mode: "ROUND_ROBIN" | "MANUAL" | "AUTO";
}) {
  const context = await requirePermission("crm.assign");
  const admin = createAdminClient();

  const { data: lead } = await admin.from("leads").select("assigned_to").eq("id", leadId).maybeSingle();
  await admin.from("leads").update({ assigned_to: assigneeUserId }).eq("id", leadId);
  await admin.from("lead_assignments").insert({
    lead_id: leadId,
    previous_owner: lead?.assigned_to ?? null,
    new_owner: assigneeUserId,
    assignment_mode: mode,
    reason: reason ?? null,
    assigned_by: context.user.id
  });
  await admin.from("lead_activities").insert({
    lead_id: leadId,
    activity_type: "ASSIGNMENT",
    activity_note: `Lead reassigned (${mode}).`,
    activity_meta: {
      previous_owner: lead?.assigned_to ?? null,
      new_owner: assigneeUserId,
      reason: reason ?? null
    },
    created_by: context.user.id
  });

  await writeAuditEvent({
    actorId: context.user.id,
    action: "LEAD_ASSIGNED",
    targetType: "lead",
    targetId: leadId,
    payload: { assignee_user_id: assigneeUserId, mode, reason: reason ?? null }
  });
}

export async function addLeadActivity({
  leadId,
  type,
  note,
  meta
}: {
  leadId: string;
  type: "NOTE" | "CALL" | "EMAIL" | "WHATSAPP" | "TASK" | "STATUS_CHANGE" | "ASSIGNMENT";
  note: string;
  meta?: Record<string, unknown>;
}) {
  const context = await requirePermission("crm.edit");
  const admin = createAdminClient();
  await admin.from("lead_activities").insert({
    lead_id: leadId,
    activity_type: type,
    activity_note: note,
    activity_meta: meta ?? {},
    created_by: context.user.id
  });

  await writeAuditEvent({
    actorId: context.user.id,
    action: "LEAD_ACTIVITY_ADDED",
    targetType: "lead",
    targetId: leadId,
    payload: { type, note }
  });
}

export async function convertLeadToClientAndCase({
  leadId,
  caseType
}: {
  leadId: string;
  caseType: string;
}) {
  const context = await requirePermission("crm.convert");
  const admin = createAdminClient();

  const { data: lead } = await admin.from("leads").select("*").eq("id", leadId).single();
  if (!lead) throw new Error("Lead not found.");

  let clientId: string | null = null;
  const { data: existingClient } = await admin.from("clients").select("id").eq("email", lead.email).maybeSingle();
  if (existingClient) {
    clientId = existingClient.id;
  } else {
    const { data: createdClient } = await admin
      .from("clients")
      .insert({
        name: lead.name,
        phone: lead.phone,
        email: lead.email
      })
      .select("id")
      .single();
    clientId = createdClient?.id ?? null;
  }
  if (!clientId) throw new Error("Unable to convert lead to client.");

  const { data: createdCase } = await admin
    .from("cases")
    .insert({
      client_id: clientId,
      case_type: caseType,
      status: "SUBMITTED",
      assigned_to: lead.assigned_to ?? null,
      meta: {
        converted_from_lead: lead.id,
        source_key: lead.source_key,
        campaign: lead.campaign
      }
    })
    .select("id")
    .single();
  if (!createdCase?.id) throw new Error("Unable to create case.");

  await admin
    .from("leads")
    .update({
      // Travel-tailored pipeline: a converted lead = service "booked" / submitted.
      stage: "BOOKED",
      converted_client_id: clientId,
      converted_case_id: createdCase.id
    })
    .eq("id", leadId);

  await admin.from("lead_activities").insert({
    lead_id: leadId,
    activity_type: "STATUS_CHANGE",
    activity_note: "Lead converted to client and case.",
    activity_meta: { converted_client_id: clientId, converted_case_id: createdCase.id },
    created_by: context.user.id
  });

  await writeAuditEvent({
    actorId: context.user.id,
    action: "LEAD_CONVERTED",
    targetType: "lead",
    targetId: leadId,
    payload: {
      converted_client_id: clientId,
      converted_case_id: createdCase.id
    }
  });
}

export async function createLeadInline(input: {
  name: string;
  email: string;
  phone?: string;
  whatsapp?: string;
  serviceType: string;
  destination?: string;
  timeline?: string;
  notes?: string;
  sourceKey?: string;
  nextActionDate?: string;
  assignedTo?: string;
}) {
  const context = await requirePermission("crm.edit").catch(() => requirePermission("leads.edit"));
  const admin = createAdminClient();
  const { data, error } = await admin
    .from("leads")
    .insert({
      name: input.name,
      email: input.email,
      phone: input.phone ?? null,
      whatsapp: input.whatsapp ?? input.phone ?? null,
      service_type: input.serviceType,
      destination: input.destination ?? null,
      timeline: input.timeline ?? null,
      notes: input.notes ?? null,
      source_key: input.sourceKey ?? null,
      next_action_date: input.nextActionDate ?? null,
      assigned_to: input.assignedTo ?? context.user.id,
      stage: "NEW"
    })
    .select("id")
    .single();
  if (error) throw error;

  await writeAuditEvent({
    actorId: context.user.id,
    action: "LEAD_CREATED",
    targetType: "lead",
    targetId: data.id,
    payload: { service_type: input.serviceType, destination: input.destination ?? null }
  });
  return data.id as string;
}

export async function updateLeadStage(input: { leadId: string; stage: string; note?: string }) {
  const context = await requirePermission("crm.edit").catch(() => requirePermission("leads.edit"));
  const admin = createAdminClient();
  const { data: previous } = await admin.from("leads").select("stage").eq("id", input.leadId).maybeSingle();
  await admin.from("leads").update({ stage: input.stage }).eq("id", input.leadId);
  await admin.from("lead_activities").insert({
    lead_id: input.leadId,
    activity_type: "STATUS_CHANGE",
    activity_note: input.note ?? `Stage changed to ${input.stage}.`,
    activity_meta: { from: previous?.stage ?? null, to: input.stage },
    created_by: context.user.id
  });
  await writeAuditEvent({
    actorId: context.user.id,
    action: "LEAD_STAGE_CHANGED",
    targetType: "lead",
    targetId: input.leadId,
    payload: { from: previous?.stage ?? null, to: input.stage }
  });
}

export async function setLeadNextAction(input: { leadId: string; nextActionDate: string | null; note?: string }) {
  const context = await requirePermission("crm.edit").catch(() => requirePermission("leads.edit"));
  const admin = createAdminClient();
  await admin
    .from("leads")
    .update({ next_action_date: input.nextActionDate })
    .eq("id", input.leadId);
  if (input.note) {
    await admin.from("lead_activities").insert({
      lead_id: input.leadId,
      activity_type: "TASK",
      activity_note: input.note,
      activity_meta: { next_action_date: input.nextActionDate },
      created_by: context.user.id
    });
  }
}

export async function getCrmSnapshot() {
  await requirePermission("crm.view");
  const admin = createAdminClient();
  const [pipelineStages, leads, leadAssignments] = await Promise.all([
    admin.from("crm_pipeline_stages").select("*").order("display_order"),
    admin.from("leads").select("*").order("created_at", { ascending: false }).limit(200),
    admin.from("lead_assignments").select("*").order("assigned_at", { ascending: false }).limit(200)
  ]);

  return {
    pipelineStages: pipelineStages.data ?? [],
    leads: leads.data ?? [],
    leadAssignments: leadAssignments.data ?? []
  };
}
