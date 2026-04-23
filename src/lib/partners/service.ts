import { createAdminClient } from "@/lib/supabase/admin";
import { requirePermission } from "@/lib/auth/policy";
import { writeAuditEvent } from "@/lib/audit/events";
import type { PartnerType } from "@/types/domain";

export const PARTNER_TYPES: { key: PartnerType; label: string; description: string }[] = [
  { key: "EMBASSY", label: "Embassy / Consulate", description: "Diplomatic missions handling visa decisions" },
  { key: "VFS_CENTER", label: "VFS / Visa centre", description: "Biometric & submission partners" },
  { key: "AIRLINE", label: "Airline", description: "Ticketing and corporate fare partners" },
  { key: "HOTEL", label: "Hotel", description: "Preferred properties and corporate rates" },
  { key: "RECRUITER", label: "Recruiter / Sponsor", description: "Foreign employer partners for recruitment" },
  { key: "UNIVERSITY", label: "University / School", description: "Partner institutions for study abroad" },
  { key: "INSURANCE", label: "Insurance", description: "Travel & health insurance underwriters" },
  { key: "TRANSPORT", label: "Transport", description: "Local and intercity transport providers" },
  { key: "TRAINING", label: "Training", description: "Exam prep & language testing partners" },
  { key: "OTHER", label: "Other", description: "Anything else" }
];

export async function getPartners() {
  await requirePermission("settings.manage").catch(() => requirePermission("cases.view"));
  const admin = createAdminClient();
  const { data, error } = await admin
    .from("partners")
    .select("*")
    .order("partner_type")
    .order("name");
  if (error) throw error;
  return data ?? [];
}

export async function upsertPartner(input: {
  id?: string;
  partnerType: PartnerType;
  name: string;
  country?: string;
  city?: string;
  address?: string;
  contactName?: string;
  phone?: string;
  whatsapp?: string;
  email?: string;
  website?: string;
  notes?: string;
  isActive?: boolean;
  tags?: string[];
}) {
  const context = await requirePermission("settings.manage");
  const admin = createAdminClient();
  const payload = {
    partner_type: input.partnerType,
    name: input.name,
    country_code: input.country ?? null,
    city: input.city ?? null,
    address: input.address ?? null,
    contact_name: input.contactName ?? null,
    phone: input.phone ?? null,
    whatsapp: input.whatsapp ?? null,
    email: input.email ?? null,
    website: input.website ?? null,
    notes: input.notes ?? null,
    is_active: input.isActive ?? true,
    tags: input.tags ?? []
  };
  let data: { id: string };
  if (input.id) {
    const { data: row, error } = await admin
      .from("partners")
      .update(payload)
      .eq("id", input.id)
      .select("id")
      .single();
    if (error) throw error;
    data = row as { id: string };
  } else {
    const { data: row, error } = await admin
      .from("partners")
      .insert(payload)
      .select("id")
      .single();
    if (error) throw error;
    data = row as { id: string };
  }
  await writeAuditEvent({
    actorId: context.user.id,
    action: input.id ? "PARTNER_UPDATED" : "PARTNER_CREATED",
    targetType: "partner",
    targetId: data.id,
    payload: { name: input.name, partner_type: input.partnerType }
  });
  return data;
}

export async function archivePartner(partnerId: string) {
  const context = await requirePermission("settings.manage");
  const admin = createAdminClient();
  const { error } = await admin
    .from("partners")
    .update({ is_active: false })
    .eq("id", partnerId);
  if (error) throw error;
  await writeAuditEvent({
    actorId: context.user.id,
    action: "PARTNER_ARCHIVED",
    targetType: "partner",
    targetId: partnerId,
    payload: {}
  });
}
