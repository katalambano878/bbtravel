import { createAdminClient } from "@/lib/supabase/admin";
import { requirePermission } from "@/lib/auth/policy";
import { writeAuditEvent } from "@/lib/audit/events";
import type { AppointmentType, AppointmentStatus } from "@/types/domain";

export const APPOINTMENT_TYPES: { key: AppointmentType; label: string; venue?: string }[] = [
  { key: "CONSULTATION", label: "Consultation", venue: "Office / Video / WhatsApp" },
  { key: "VFS_SUBMISSION", label: "VFS submission", venue: "VFS Accra — Cedi House" },
  { key: "EMBASSY_INTERVIEW", label: "Embassy interview", venue: "Embassy, Accra" },
  { key: "BIOMETRICS", label: "Biometrics", venue: "VFS Accra" },
  { key: "DOCUMENT_DROPOFF", label: "Document drop-off", venue: "Office" },
  { key: "INTERNAL_REVIEW", label: "Internal review", venue: "Office" },
  { key: "TRAVEL_DEPARTURE", label: "Travel — departure", venue: "Kotoka Intl." },
  { key: "TRAVEL_RETURN", label: "Travel — return", venue: "Kotoka Intl." },
  { key: "OTHER", label: "Other" }
];

export async function createAppointment(input: {
  caseId: string;
  scheduledAt: string;
  appointmentType?: AppointmentType;
  durationMinutes?: number;
  location?: string;
  notes?: string;
  assignedTo?: string;
  reminderWhatsapp?: boolean;
}) {
  const context = await requirePermission("cases.edit");
  const admin = createAdminClient();
  const duration = input.durationMinutes ?? 60;
  const startsAt = new Date(input.scheduledAt);
  const endsAt = new Date(startsAt.getTime() + duration * 60 * 1000);

  const { data, error } = await admin
    .from("appointments")
    .insert({
      case_id: input.caseId,
      scheduled_at: input.scheduledAt,
      appointment_type: input.appointmentType ?? "CONSULTATION",
      duration_minutes: duration,
      ends_at: endsAt.toISOString(),
      location: input.location ?? null,
      notes: input.notes ?? null,
      assigned_to: input.assignedTo ?? null,
      reminder_whatsapp: input.reminderWhatsapp ?? false,
      created_by: context.user.id
    })
    .select("*")
    .single();
  if (error) throw error;
  await writeAuditEvent({
    actorId: context.user.id,
    action: "APPOINTMENT_CREATED",
    targetType: "appointment",
    targetId: data.id,
    payload: {
      case_id: input.caseId,
      type: data.appointment_type,
      scheduled_at: data.scheduled_at
    }
  });
  return data;
}

export async function updateAppointmentStatus(input: {
  appointmentId: string;
  status: AppointmentStatus;
  notes?: string;
}) {
  const context = await requirePermission("cases.edit");
  const admin = createAdminClient();
  const { error } = await admin
    .from("appointments")
    .update({
      status: input.status,
      notes: input.notes ?? undefined
    })
    .eq("id", input.appointmentId);
  if (error) throw error;
  await writeAuditEvent({
    actorId: context.user.id,
    action: "APPOINTMENT_STATUS_CHANGED",
    targetType: "appointment",
    targetId: input.appointmentId,
    payload: { status: input.status }
  });
}

export async function getUpcomingAppointments(daysAhead: number = 7) {
  await requirePermission("cases.view");
  const admin = createAdminClient();
  const now = new Date();
  const to = new Date(now.getTime() + daysAhead * 86400 * 1000);
  const { data, error } = await admin
    .from("appointments")
    .select("id, case_id, scheduled_at, ends_at, appointment_type, status, location, notes, assigned_to, cases(id, case_type, clients(id, name, phone, whatsapp))")
    .gte("scheduled_at", now.toISOString())
    .lte("scheduled_at", to.toISOString())
    .order("scheduled_at", { ascending: true });
  if (error) throw error;
  return data ?? [];
}
