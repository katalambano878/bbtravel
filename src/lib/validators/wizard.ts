import { z } from "zod";

import { SERVICE_TYPE_KEYS } from "@/lib/services/catalogue";

// z.enum requires a non-empty tuple; cast once from the catalogue.
const serviceTypeEnum = z.enum(SERVICE_TYPE_KEYS as [string, ...string[]]);

export const wizardSchema = z.object({
  service_type: serviceTypeEnum,
  full_name: z.string().min(2),
  phone: z.string().min(7),
  email: z.string().email(),
  destination: z.string().optional(),
  timeline: z.string().min(2),
  budget_range: z.string().optional(),
  experience_level: z.string().optional(),
  education_level: z.string().optional(),
  passport_status: z.string().optional(),
  travel_history: z.string().optional(),
  notes: z.string().optional()
});

export type WizardPayload = z.infer<typeof wizardSchema>;
