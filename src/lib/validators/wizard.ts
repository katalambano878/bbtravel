import { z } from "zod";

export const wizardSchema = z.object({
  service_type: z.enum([
    "VISA_ASSISTANCE",
    "INTERNATIONAL_RECRUITMENT",
    "STUDY_ABROAD",
    "TOUR_PACKAGE",
    "BUSINESS_EXPORT",
    "FLIGHT_RESERVATION"
  ]),
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
