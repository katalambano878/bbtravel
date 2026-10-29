import { createAdminClient } from "@/lib/db/admin";

interface EventPayload {
  eventKey: string;
  eventType: string;
  aggregateType: string;
  aggregateId: string;
  payload?: Record<string, unknown>;
  createdBy?: string | null;
}

export async function publishEvent(input: EventPayload) {
  const admin = createAdminClient();
  await admin.from("event_log").insert({
    event_key: input.eventKey,
    event_type: input.eventType,
    aggregate_type: input.aggregateType,
    aggregate_id: input.aggregateId,
    payload: input.payload ?? {},
    created_by: input.createdBy ?? null
  });
}
