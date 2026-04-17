/**
 * B.B. Travel Consult expense category taxonomy.
 * Used by the Finance module to help staff categorize expenses consistently
 * when submitting for approval.
 */
export interface ExpenseCategory {
  key: string;
  label: string;
  /** Short helper hint shown next to the option. */
  hint?: string;
  /** Division-alignment so finance reports can slice by business unit. */
  division: "IMMIGRATION" | "TRAVEL" | "CORPORATE_EVENTS" | "OPERATIONS";
}

export const EXPENSE_CATEGORIES: ExpenseCategory[] = [
  // Immigration
  { key: "EMBASSY_FEE", label: "Embassy / consular fee", hint: "Visa fee, biometrics, courier", division: "IMMIGRATION" },
  { key: "VFS_SERVICE", label: "VFS / service fee", hint: "VFS, TLScontact, BLS", division: "IMMIGRATION" },
  { key: "LEGAL_NOTARY", label: "Legal / notary / apostille", hint: "Certification of documents", division: "IMMIGRATION" },
  { key: "RECRUITMENT_LICENSE", label: "Recruitment licensing", hint: "Agent or job-board fees", division: "IMMIGRATION" },

  // Travel
  { key: "AIRLINE_INVENTORY", label: "Airline inventory cost", hint: "Tickets issued to clients", division: "TRAVEL" },
  { key: "HOTEL_INVENTORY", label: "Hotel inventory cost", hint: "Rooms issued to clients", division: "TRAVEL" },
  { key: "TRANSPORT_INVENTORY", label: "Transport / driver cost", hint: "Car hire, driver fee, fuel", division: "TRAVEL" },
  { key: "INSURANCE_UNDERWRITING", label: "Insurance underwriting", hint: "Paid to insurer on policy issuance", division: "TRAVEL" },

  // Corporate / events
  { key: "EVENT_VENUE", label: "Event venue & decor", hint: "Venues, stage, decor", division: "CORPORATE_EVENTS" },
  { key: "EVENT_CATERING", label: "Event catering", division: "CORPORATE_EVENTS" },
  { key: "CORPORATE_GROUND_OPS", label: "Corporate ground ops", hint: "On-ground handling & transfers", division: "CORPORATE_EVENTS" },

  // Operations
  { key: "STAFF_SALARIES", label: "Staff salaries", division: "OPERATIONS" },
  { key: "MARKETING_ADVERTS", label: "Marketing & adverts", hint: "Social media, campaigns", division: "OPERATIONS" },
  { key: "OFFICE_RENT", label: "Office rent", division: "OPERATIONS" },
  { key: "UTILITIES", label: "Utilities (power, water, internet)", division: "OPERATIONS" },
  { key: "SOFTWARE_SUBSCRIPTIONS", label: "Software & subscriptions", division: "OPERATIONS" },
  { key: "BANK_CHARGES", label: "Bank / payment gateway charges", division: "OPERATIONS" },
  { key: "TRAVEL_STAFF", label: "Staff travel / training", division: "OPERATIONS" },
  { key: "MISC_ADMIN", label: "Miscellaneous admin", division: "OPERATIONS" }
];
