import { createAdminClient } from "@/lib/db/admin";
import { requirePermission } from "@/lib/auth/policy";
import { writeAuditEvent } from "@/lib/audit/events";

export async function getSystemSettings() {
  await requirePermission("settings.manage");
  const admin = createAdminClient();
  const { data } = await admin.from("system_settings").select("*").eq("id", 1).maybeSingle();
  return data;
}

export async function updateSystemSettings(payload: Record<string, unknown>) {
  const context = await requirePermission("settings.manage");
  const admin = createAdminClient();

  const { data, error } = await admin
    .from("system_settings")
    .update({
      ...payload
    })
    .eq("id", 1)
    .select("*")
    .single();

  if (error) throw error;

  await writeAuditEvent({
    actorId: context.user.id,
    action: "SYSTEM_SETTINGS_UPDATED",
    targetType: "system_settings",
    targetId: "1",
    payload
  });

  return data;
}
