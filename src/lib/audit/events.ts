import { createAdminClient } from "@/lib/db/admin";

interface AuditEventInput {
  actorId?: string | null;
  action: string;
  targetType: string;
  targetId: string;
  payload?: Record<string, unknown>;
}

export async function writeAuditEvent(input: AuditEventInput) {
  const admin = createAdminClient();
  await admin.from("audit_logs").insert({
    actor_id: input.actorId ?? null,
    action: input.action,
    target_type: input.targetType,
    target_id: input.targetId,
    payload: input.payload ?? {}
  });
}
