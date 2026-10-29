import { createAdminClient } from "@/lib/db/admin";
import { requirePermission } from "@/lib/auth/policy";
import { publishEvent } from "@/lib/events/bus";

export async function createNotification(input: {
  userId: string;
  title: string;
  body: string;
  channel?: "IN_APP" | "EMAIL" | "WHATSAPP" | "SMS";
  entityType?: string;
  entityId?: string;
  scheduledFor?: string;
}) {
  const context = await requirePermission("messages.manage");
  const admin = createAdminClient();
  const { data, error } = await admin
    .from("notifications")
    .insert({
      user_id: input.userId,
      title: input.title,
      body: input.body,
      channel: input.channel ?? "IN_APP",
      entity_type: input.entityType ?? null,
      entity_id: input.entityId ?? null,
      scheduled_for: input.scheduledFor ?? null
    })
    .select("*")
    .single();

  if (error) throw error;
  await publishEvent({
    eventKey: "notification.created",
    eventType: "NOTIFICATION",
    aggregateType: "notification",
    aggregateId: data.id,
    payload: {
      user_id: input.userId,
      channel: input.channel ?? "IN_APP"
    },
    createdBy: context.user.id
  });
}

export async function createSystemTask(input: {
  title: string;
  description?: string;
  assignedTo?: string;
  dueAt?: string;
  priority?: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
  entityType?: string;
  entityId?: string;
}) {
  const context = await requirePermission("cases.edit");
  const admin = createAdminClient();
  const { data, error } = await admin
    .from("system_tasks")
    .insert({
      title: input.title,
      description: input.description ?? null,
      assigned_to: input.assignedTo ?? null,
      due_at: input.dueAt ?? null,
      priority: input.priority ?? "MEDIUM",
      entity_type: input.entityType ?? null,
      entity_id: input.entityId ?? null,
      created_by: context.user.id
    })
    .select("*")
    .single();

  if (error) throw error;

  await publishEvent({
    eventKey: "system_task.created",
    eventType: "TASK",
    aggregateType: "system_task",
    aggregateId: data.id,
    payload: {
      assigned_to: input.assignedTo ?? null
    },
    createdBy: context.user.id
  });
}

export async function getNotificationSnapshot() {
  const context = await requirePermission("messages.manage");
  const admin = createAdminClient();

  const [notificationsRes, tasksRes, eventsRes] = await Promise.all([
    admin.from("notifications").select("*").order("created_at", { ascending: false }).limit(200),
    admin.from("system_tasks").select("*").order("created_at", { ascending: false }).limit(200),
    admin.from("event_log").select("*").order("created_at", { ascending: false }).limit(200)
  ]);

  return {
    actor: context.user.id,
    notifications: notificationsRes.data ?? [],
    tasks: tasksRes.data ?? [],
    events: eventsRes.data ?? []
  };
}
