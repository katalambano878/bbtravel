import type { WizardPayload } from "@/lib/validators/wizard";

const readinessFields: (keyof WizardPayload)[] = [
  "service_type",
  "full_name",
  "phone",
  "email",
  "timeline",
  "destination",
  "passport_status",
  "travel_history",
  "education_level",
  "experience_level"
];

export function calculateReadinessScore(payload: WizardPayload) {
  const completed = readinessFields.filter((field) => {
    const value = payload[field];
    return typeof value === "string" ? value.trim().length > 0 : Boolean(value);
  }).length;

  return Math.round((completed / readinessFields.length) * 100);
}
