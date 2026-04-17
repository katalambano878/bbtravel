/**
 * Pre-baked communication templates used across the notifications module.
 * Grouped by business moment (lead capture, booking, document chase, etc.)
 * so staff can send consistent, brand-aligned messages in one click.
 *
 * Placeholders use {{curly}} syntax and are resolved at send time.
 */

export type TemplateChannel = "WHATSAPP" | "EMAIL" | "IN_APP" | "SMS";

export interface MessageTemplate {
  key: string;
  name: string;
  channel: TemplateChannel;
  /** Short label for grouping in the UI (e.g. "Visa", "Flights", "Follow-up"). */
  group: string;
  /** Subject (used for EMAIL) */
  subject?: string;
  /** Message body — placeholders e.g. {{client_name}}, {{destination}}. */
  body: string;
  /** Optional tone / description used as helper text. */
  description?: string;
}

export const MESSAGE_TEMPLATES: MessageTemplate[] = [
  // ---------- Lead acknowledgement (24h SLA) --------------------------
  {
    key: "LEAD_ACK_WHATSAPP",
    name: "Lead acknowledgement (WhatsApp)",
    channel: "WHATSAPP",
    group: "Lead follow-up",
    body:
      "Hi {{client_name}}, thanks for reaching out to B.B. Travel Consult 🙏. " +
      "I've received your {{service}} enquiry for {{destination}} and will send you a full next-steps note within the day.\n\n" +
      "— {{staff_name}}",
    description: "Warm WhatsApp first-touch — send within 30 minutes of lead submission."
  },
  {
    key: "LEAD_ACK_EMAIL",
    name: "Lead acknowledgement (Email)",
    channel: "EMAIL",
    group: "Lead follow-up",
    subject: "Your {{service}} enquiry with B.B. Travel Consult",
    body:
      "Dear {{client_name}},\n\n" +
      "Thank you for reaching out to B.B. Travel Consult regarding your {{service}} request for {{destination}}. " +
      "Your dedicated consultant, {{staff_name}}, will review your profile and send you a next-steps note within 24 hours.\n\n" +
      "If anything urgent comes up, reply directly to this email.\n\n" +
      "Warm regards,\nB.B. Travel Consult"
  },

  // ---------- Visa ---------------------------------------------------
  {
    key: "VISA_DOC_REQUEST_WHATSAPP",
    name: "Visa document request (WhatsApp)",
    channel: "WHATSAPP",
    group: "Visa",
    body:
      "Hi {{client_name}}, to progress your {{destination}} visa we'll need:\n" +
      "• Passport bio-data page\n" +
      "• Bank statements (last 6 months)\n" +
      "• Employer letter / leave approval\n" +
      "• Ties-to-Ghana evidence\n\n" +
      "Please share them here or via {{portal_link}} at your earliest convenience.\n\n— {{staff_name}}"
  },
  {
    key: "VISA_APPT_REMINDER_EMAIL",
    name: "Visa appointment reminder (Email)",
    channel: "EMAIL",
    group: "Visa",
    subject: "Reminder: your {{destination}} embassy appointment on {{appointment_date}}",
    body:
      "Dear {{client_name}},\n\n" +
      "This is a friendly reminder of your {{destination}} visa appointment scheduled for {{appointment_date}} at {{appointment_location}}. " +
      "Please arrive at least 45 minutes early with your complete documentation bundle and biometric confirmation slip.\n\n" +
      "We're here if anything comes up.\n\n— {{staff_name}}, B.B. Travel Consult"
  },
  {
    key: "VISA_DECISION_EMAIL",
    name: "Visa decision notification (Email)",
    channel: "EMAIL",
    group: "Visa",
    subject: "Update on your {{destination}} visa application",
    body:
      "Dear {{client_name}},\n\n" +
      "We have received an update on your {{destination}} visa application submitted on {{submission_date}}. " +
      "Please schedule a short call with {{staff_name}} at your earliest convenience so we can walk you through the outcome and next steps.\n\n" +
      "Warm regards,\nB.B. Travel Consult"
  },

  // ---------- Flight / Hotel ----------------------------------------
  {
    key: "FLIGHT_OPTIONS_WHATSAPP",
    name: "Flight options for approval (WhatsApp)",
    channel: "WHATSAPP",
    group: "Flights & Hotels",
    body:
      "Hi {{client_name}}, here are the best flight options for {{origin}} → {{destination}} on {{departure_date}}:\n" +
      "1) {{option_1}}\n" +
      "2) {{option_2}}\n" +
      "3) {{option_3}}\n\n" +
      "Fares are live and can change quickly — let me know which you'd like to lock in.\n— {{staff_name}}"
  },
  {
    key: "FLIGHT_ISSUED_WHATSAPP",
    name: "Ticket issued confirmation (WhatsApp)",
    channel: "WHATSAPP",
    group: "Flights & Hotels",
    body:
      "Your ticket is issued ✈️\nPassenger: {{client_name}}\nRoute: {{origin}} → {{destination}}\nDeparture: {{departure_date}} {{departure_time}}\nPNR: {{pnr}}\n\n" +
      "Full e-ticket has been sent to your email. Safe travels!\n— B.B. Travel Consult"
  },
  {
    key: "HOTEL_CONFIRMED_EMAIL",
    name: "Hotel reservation confirmation (Email)",
    channel: "EMAIL",
    group: "Flights & Hotels",
    subject: "Your {{hotel_name}} reservation is confirmed",
    body:
      "Dear {{client_name}},\n\n" +
      "Your reservation at {{hotel_name}} ({{destination}}) is confirmed.\n" +
      "Check-in: {{check_in}}\nCheck-out: {{check_out}}\nBooking reference: {{booking_reference}}\n\n" +
      "Please carry your passport at check-in. We'll also alert the property of any special notes you shared.\n\n— B.B. Travel Consult"
  },

  // ---------- Study / Recruitment ------------------------------------
  {
    key: "STUDY_OFFER_EMAIL",
    name: "Study offer received (Email)",
    channel: "EMAIL",
    group: "Study & Recruitment",
    subject: "Great news — your {{university}} offer has arrived",
    body:
      "Dear {{client_name}},\n\n" +
      "Congratulations 🎉 — {{university}} has issued you an offer for the {{intake}} intake. " +
      "Your consultant {{staff_name}} will schedule a call to plan your acceptance, tuition deposit, and student visa timeline.\n\n" +
      "Warm regards,\nB.B. Travel Consult"
  },
  {
    key: "RECRUITMENT_NEXT_STEP_WHATSAPP",
    name: "Recruitment next-step (WhatsApp)",
    channel: "WHATSAPP",
    group: "Study & Recruitment",
    body:
      "Hi {{client_name}}, your recruitment profile has been shortlisted for {{employer}} ({{destination}}).\n" +
      "Next step: a virtual screening interview. I'll share prep materials and slot options shortly.\n\n— {{staff_name}}"
  },

  // ---------- Invoice & payment -------------------------------------
  {
    key: "INVOICE_SENT_WHATSAPP",
    name: "Invoice sent (WhatsApp)",
    channel: "WHATSAPP",
    group: "Invoicing",
    body:
      "Hi {{client_name}}, invoice {{invoice_number}} for {{service}} ({{amount}}) has been sent to your email and uploaded to your portal. " +
      "Settlement deadline: {{due_date}}. Payment details are on the invoice. Let me know when you've paid so we can move to the next step.\n\n— {{staff_name}}"
  },
  {
    key: "PAYMENT_RECEIVED_EMAIL",
    name: "Payment received (Email)",
    channel: "EMAIL",
    group: "Invoicing",
    subject: "Payment received — invoice {{invoice_number}}",
    body:
      "Dear {{client_name}},\n\n" +
      "We've received your payment of {{amount}} against invoice {{invoice_number}}. Your service case will now advance to the next stage. " +
      "An official receipt is attached for your records.\n\nWarm regards,\nB.B. Travel Consult Finance"
  },

  // ---------- Document follow-up -----------------------------------
  {
    key: "DOC_REMINDER_WHATSAPP",
    name: "Document reminder (WhatsApp)",
    channel: "WHATSAPP",
    group: "Document chase",
    body:
      "Hi {{client_name}}, quick nudge 🔔 — we're still waiting on the following to proceed with your {{service}}:\n" +
      "• {{missing_items}}\n\n" +
      "Processing time resets once we receive them. — {{staff_name}}"
  },
  {
    key: "PASSPORT_EXPIRY_WARNING_EMAIL",
    name: "Passport expiry warning (Email)",
    channel: "EMAIL",
    group: "Document chase",
    subject: "Important: your passport is nearing the embassy validity threshold",
    body:
      "Dear {{client_name}},\n\n" +
      "Our records show your passport expires on {{expiry_date}}. Most embassies require at least 6 months' validity beyond your intended return date, " +
      "so we recommend initiating a renewal now to avoid delays on your upcoming {{service}} with us.\n\n— B.B. Travel Consult"
  },

  // ---------- Internal / escalation --------------------------------
  {
    key: "INTERNAL_BLOCKER_IN_APP",
    name: "Internal blocker alert (In-app)",
    channel: "IN_APP",
    group: "Internal",
    body:
      "Blocker raised on case {{case_id}} ({{service}} — {{client_name}}). Summary: {{summary}}. Please review and unblock."
  },
  {
    key: "INTERNAL_SLA_IN_APP",
    name: "SLA breach warning (In-app)",
    channel: "IN_APP",
    group: "Internal",
    body:
      "Case {{case_id}} ({{service}}) is approaching its SLA deadline on {{due_date}}. Please check status and action if needed."
  }
];

export const TEMPLATE_GROUPS = Array.from(
  new Set(MESSAGE_TEMPLATES.map((t) => t.group))
);

export function getTemplate(key: string): MessageTemplate | null {
  return MESSAGE_TEMPLATES.find((t) => t.key === key) ?? null;
}
