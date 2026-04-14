import { createAdminClient } from "@/lib/supabase/admin";
import { requirePermission } from "@/lib/auth/policy";
import { writeAuditEvent } from "@/lib/audit/events";

export async function createCaseTask(input: {
  caseId: string;
  title: string;
  description?: string;
  priority?: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
  dueAt?: string;
  assignedTo?: string;
}) {
  const context = await requirePermission("cases.edit");
  const admin = createAdminClient();
  const { data, error } = await admin
    .from("case_tasks")
    .insert({
      case_id: input.caseId,
      title: input.title,
      description: input.description ?? null,
      priority: input.priority ?? "MEDIUM",
      due_at: input.dueAt ?? null,
      assigned_to: input.assignedTo ?? null,
      created_by: context.user.id
    })
    .select("*")
    .single();
  if (error) throw error;

  await writeAuditEvent({
    actorId: context.user.id,
    action: "CASE_TASK_CREATED",
    targetType: "case",
    targetId: input.caseId,
    payload: {
      task_id: data.id,
      title: input.title,
      priority: input.priority ?? "MEDIUM"
    }
  });
}

export async function addCaseNote(input: {
  caseId: string;
  note: string;
  visibility: "INTERNAL" | "CLIENT_VISIBLE";
}) {
  const context = await requirePermission("cases.edit");
  const admin = createAdminClient();
  await admin.from("case_notes").insert({
    case_id: input.caseId,
    note: input.note,
    visibility: input.visibility,
    created_by: context.user.id
  });

  await writeAuditEvent({
    actorId: context.user.id,
    action: "CASE_NOTE_ADDED",
    targetType: "case",
    targetId: input.caseId,
    payload: {
      visibility: input.visibility
    }
  });
}

export async function linkCases(input: {
  primaryCaseId: string;
  linkedCaseId: string;
  relationType: "SUB_CASE" | "DEPENDENT" | "FOLLOW_ON";
}) {
  const context = await requirePermission("cases.edit");
  const admin = createAdminClient();
  await admin.from("case_links").insert({
    primary_case_id: input.primaryCaseId,
    linked_case_id: input.linkedCaseId,
    relation_type: input.relationType
  });

  await writeAuditEvent({
    actorId: context.user.id,
    action: "CASE_LINK_CREATED",
    targetType: "case",
    targetId: input.primaryCaseId,
    payload: {
      linked_case_id: input.linkedCaseId,
      relation_type: input.relationType
    }
  });
}

export async function getCaseOperationsSnapshot() {
  await requirePermission("cases.view");
  const admin = createAdminClient();
  const [workflows, tasks, notes, links, blockers] = await Promise.all([
    admin.from("case_workflows").select("*").order("updated_at", { ascending: false }).limit(200),
    admin.from("case_tasks").select("*").order("created_at", { ascending: false }).limit(400),
    admin.from("case_notes").select("*").order("created_at", { ascending: false }).limit(400),
    admin.from("case_links").select("*").order("created_at", { ascending: false }).limit(200),
    admin.from("case_blockers").select("*").eq("is_active", true).order("created_at", { ascending: false }).limit(200)
  ]);

  return {
    workflows: workflows.data ?? [],
    tasks: tasks.data ?? [],
    notes: notes.data ?? [],
    links: links.data ?? [],
    blockers: blockers.data ?? []
  };
}
