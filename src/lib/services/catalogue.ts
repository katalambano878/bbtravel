import type { LucideIcon } from "lucide-react";
import {
  FileBadge2,
  Briefcase,
  GraduationCap,
  PlaneTakeoff,
  Plane,
  Hotel,
  Building2,
  ShieldCheck,
  CalendarCheck2,
  Car,
  MessagesSquare,
  FileText,
  PackageSearch
} from "lucide-react";

/**
 * Service catalogue — single source of truth for every service B.B. Travel Consult
 * delivers. Used by:
 *  - public-site "start application" wizard
 *  - admin CRM / Cases / Documents / Finance dropdowns
 *  - invoice presets and BI segmentation
 *
 * When adding a new service: extend the `service_type` Postgres enum,
 * add an entry here, and every admin dropdown updates automatically.
 */

export type ServiceTypeKey =
  | "VISA_ASSISTANCE"
  | "INTERNATIONAL_RECRUITMENT"
  | "STUDY_ABROAD"
  | "DOCUMENT_PROCESSING"
  | "TOUR_PACKAGE"
  | "FLIGHT_RESERVATION"
  | "HOTEL_BOOKING"
  | "TRAVEL_INSURANCE"
  | "TRANSPORT_SERVICES"
  | "CORPORATE_TRAVEL"
  | "EVENT_MANAGEMENT"
  | "CONSULTATION"
  | "BUSINESS_EXPORT";

export type ServiceDivisionKey =
  | "IMMIGRATION"
  | "TRAVEL"
  | "CORPORATE_EVENTS"
  | "CONSULTATION";

export interface ServiceDivision {
  key: ServiceDivisionKey;
  label: string;
  short: string;
  description: string;
  accentClass: string;
  iconBg: string;
}

export const divisions: Record<ServiceDivisionKey, ServiceDivision> = {
  IMMIGRATION: {
    key: "IMMIGRATION",
    label: "Immigration & Documentation",
    short: "Visa Desk",
    description:
      "Visa applications, refusal overturns, study & work permits, and document processing.",
    accentClass: "border-l-blue-500",
    iconBg: "bg-blue-50 text-blue-600"
  },
  TRAVEL: {
    key: "TRAVEL",
    label: "Travel & Tourism",
    short: "Travel Desk",
    description:
      "Flights, hotels, tour packages, transport, and travel insurance for individuals and groups.",
    accentClass: "border-l-emerald-500",
    iconBg: "bg-emerald-50 text-emerald-600"
  },
  CORPORATE_EVENTS: {
    key: "CORPORATE_EVENTS",
    label: "Corporate & Events",
    short: "Corporate Desk",
    description:
      "Corporate travel programs, destination events, retreats, and group coordination.",
    accentClass: "border-l-violet-500",
    iconBg: "bg-violet-50 text-violet-600"
  },
  CONSULTATION: {
    key: "CONSULTATION",
    label: "Consultation",
    short: "Advisory",
    description: "Strategic advisory sessions before committing to a full service.",
    accentClass: "border-l-amber-500",
    iconBg: "bg-amber-50 text-amber-600"
  }
};

export interface DocumentRequirement {
  key: string;
  label: string;
  required: boolean;
  expiryRelevant?: boolean;
  notes?: string;
}

export interface WorkflowStep {
  key: string;
  label: string;
}

export interface MetaField {
  key: string;
  label: string;
  type: "text" | "date" | "number" | "select";
  options?: string[];
  placeholder?: string;
}

export interface ServiceCatalogueEntry {
  key: ServiceTypeKey;
  label: string;
  shortLabel: string;
  slug: string;
  division: ServiceDivisionKey;
  icon: LucideIcon;
  /** Minimum published price floor in GHS, or null if session/route/project-based. */
  priceFloorGhs: number | null;
  /** Display label for pricing (e.g. "GH₵ 1,500+" or "Service-based"). */
  priceLabel: string;
  shortDescription: string;
  /** Default line-item description used when creating an invoice preset. */
  defaultInvoiceDescription: string;
  /** Expected turnaround shown to staff; for planning only. */
  expectedTurnaround: string;
  documentChecklist: DocumentRequirement[];
  workflow: WorkflowStep[];
  metaFields: MetaField[];
}

const visaDocs: DocumentRequirement[] = [
  { key: "passport_bio", label: "Passport bio-data page", required: true, expiryRelevant: true },
  { key: "bank_statements", label: "Bank statements (6 months)", required: true },
  { key: "employer_letter", label: "Employer letter / leave approval", required: true },
  { key: "sponsor_letter", label: "Sponsor affidavit / letter", required: false },
  { key: "invitation_letter", label: "Invitation / booking letter", required: false },
  { key: "ties_ghana", label: "Ties-to-Ghana evidence", required: true },
  { key: "prior_refusal", label: "Prior refusal history / GCMS notes", required: false },
  { key: "travel_insurance", label: "Travel insurance policy", required: false, expiryRelevant: true }
];

export const serviceCatalogue: Record<ServiceTypeKey, ServiceCatalogueEntry> = {
  VISA_ASSISTANCE: {
    key: "VISA_ASSISTANCE",
    label: "Visa Assistance & Documentation",
    shortLabel: "Visa",
    slug: "visa-assistance",
    division: "IMMIGRATION",
    icon: FileBadge2,
    priceFloorGhs: 1500,
    priceLabel: "GH₵ 1,500+",
    shortDescription:
      "Embassy-aligned application strategy, document auditing, and refusal overturns for 30+ countries.",
    defaultInvoiceDescription: "Visa assistance & documentation (per applicant)",
    expectedTurnaround: "2 – 6 weeks",
    documentChecklist: visaDocs,
    workflow: [
      { key: "PROFILE_ASSESSMENT", label: "Profile assessment" },
      { key: "DOC_AUDIT", label: "Document audit" },
      { key: "FORM_PREP", label: "Application form preparation" },
      { key: "INTERVIEW_PREP", label: "Interview preparation" },
      { key: "SUBMISSION", label: "Submission to embassy / VFS" },
      { key: "DECISION", label: "Decision received" }
    ],
    metaFields: [
      { key: "destination_country", label: "Destination country", type: "text", placeholder: "UK, Canada, USA…" },
      { key: "visa_type", label: "Visa type", type: "select", options: ["Visitor", "Student", "Work", "Business", "Family", "Transit"] },
      { key: "embassy", label: "Embassy / consulate", type: "text" },
      { key: "appointment_date", label: "Embassy appointment", type: "date" },
      { key: "prior_refusal", label: "Prior refusal?", type: "select", options: ["No", "Yes"] }
    ]
  },

  INTERNATIONAL_RECRUITMENT: {
    key: "INTERNATIONAL_RECRUITMENT",
    label: "International Recruitment",
    shortLabel: "Recruitment",
    slug: "international-recruitment",
    division: "IMMIGRATION",
    icon: Briefcase,
    priceFloorGhs: 2000,
    priceLabel: "GH₵ 2,000+",
    shortDescription:
      "Ethical placement of nurses, engineers, and skilled professionals with verified NHS trusts and global employers.",
    defaultInvoiceDescription: "International recruitment advisory & placement support",
    expectedTurnaround: "4 – 12 weeks",
    documentChecklist: [
      { key: "cv", label: "Updated CV (EU/UK format)", required: true },
      { key: "passport_bio", label: "Passport bio-data page", required: true, expiryRelevant: true },
      { key: "transcripts", label: "Academic transcripts & certificates", required: true },
      { key: "registration_docs", label: "Professional registration (e.g. NMC pin)", required: false },
      { key: "english_proof", label: "English proof (IELTS / OET)", required: false, expiryRelevant: true },
      { key: "references", label: "Two professional references", required: true },
      { key: "police_clearance", label: "Police clearance / good conduct", required: false, expiryRelevant: true }
    ],
    workflow: [
      { key: "PROFILING", label: "Professional profiling" },
      { key: "VERIFICATION", label: "Credential verification" },
      { key: "MATCHING", label: "Opportunity matching" },
      { key: "INTERVIEW", label: "Interview coaching" },
      { key: "OFFER", label: "Offer & contract review" },
      { key: "VISA", label: "Work visa processing" },
      { key: "RELOCATION", label: "Relocation & arrival" }
    ],
    metaFields: [
      { key: "destination_country", label: "Destination country", type: "text", placeholder: "UK, Canada, UAE…" },
      { key: "profession", label: "Profession", type: "select", options: ["Nurse", "Engineer", "IT", "Accountant", "Tradesperson", "Teacher", "Other"] },
      { key: "employer", label: "Target / matched employer", type: "text" },
      { key: "nmc_status", label: "NMC / licensing status", type: "text" }
    ]
  },

  STUDY_ABROAD: {
    key: "STUDY_ABROAD",
    label: "Study Abroad Placement",
    shortLabel: "Study",
    slug: "study-abroad",
    division: "IMMIGRATION",
    icon: GraduationCap,
    priceFloorGhs: 1800,
    priceLabel: "GH₵ 1,800+",
    shortDescription:
      "Strategic university selection, SOP crafting, scholarship sourcing, and student visa processing.",
    defaultInvoiceDescription: "Study abroad advisory, application & visa processing",
    expectedTurnaround: "6 – 16 weeks",
    documentChecklist: [
      { key: "transcripts", label: "Academic transcripts (all institutions)", required: true },
      { key: "passport_bio", label: "Passport bio-data page", required: true, expiryRelevant: true },
      { key: "sop", label: "Statement of Purpose", required: true },
      { key: "ielts_toefl", label: "IELTS / TOEFL / other test scores", required: true, expiryRelevant: true },
      { key: "recommendation_letters", label: "Reference / recommendation letters", required: true },
      { key: "proof_of_funds", label: "Proof of funds / sponsor docs", required: true },
      { key: "cv", label: "Curriculum Vitae", required: true },
      { key: "cas_i20", label: "CAS / I-20 letter", required: false }
    ],
    workflow: [
      { key: "ASSESSMENT", label: "Academic assessment" },
      { key: "SHORTLIST", label: "University shortlisting" },
      { key: "APPLICATION", label: "Application crafting" },
      { key: "OFFER", label: "Offer received" },
      { key: "SCHOLARSHIP", label: "Scholarship / funding" },
      { key: "VISA", label: "Student visa processing" },
      { key: "PRE_DEPARTURE", label: "Pre-departure" }
    ],
    metaFields: [
      { key: "destination_country", label: "Destination country", type: "text" },
      { key: "program_level", label: "Program level", type: "select", options: ["Undergraduate", "Postgraduate / Masters", "PhD", "Diploma", "Professional"] },
      { key: "intake", label: "Intake", type: "select", options: ["Fall", "Winter", "Spring", "Summer"] },
      { key: "university", label: "Target university", type: "text" }
    ]
  },

  DOCUMENT_PROCESSING: {
    key: "DOCUMENT_PROCESSING",
    label: "Work & Study Document Processing",
    shortLabel: "Doc Processing",
    slug: "work-study-abroad-document-processing",
    division: "IMMIGRATION",
    icon: FileText,
    priceFloorGhs: null,
    priceLabel: "Service-based",
    shortDescription:
      "End-to-end documentation support for study and work pathways, including verification and submission readiness.",
    defaultInvoiceDescription: "Document processing & submission-readiness review",
    expectedTurnaround: "3 – 21 days",
    documentChecklist: [
      { key: "passport_bio", label: "Passport bio-data page", required: true, expiryRelevant: true },
      { key: "certificates", label: "Academic / professional certificates", required: true },
      { key: "employment_letters", label: "Employment / supporting letters", required: false },
      { key: "proof_of_funds", label: "Proof of funds / sponsor", required: false },
      { key: "relationship_evidence", label: "Relationship / sponsor linkage evidence", required: false },
      { key: "legalization", label: "Legalization / notarization", required: false }
    ],
    workflow: [
      { key: "MAP", label: "Requirement mapping" },
      { key: "COLLECT", label: "Collection & verification" },
      { key: "STRUCTURE", label: "Formatting & structuring" },
      { key: "LEGALIZATION", label: "Legalization guidance" },
      { key: "REVIEW", label: "Final readiness review" }
    ],
    metaFields: [
      { key: "destination_country", label: "Destination country", type: "text" },
      { key: "pathway", label: "Pathway", type: "select", options: ["Study", "Work", "Dependent / family", "Sponsor", "Other"] }
    ]
  },

  TOUR_PACKAGE: {
    key: "TOUR_PACKAGE",
    label: "Premium Tour Packages",
    shortLabel: "Tour",
    slug: "tour-packages",
    division: "TRAVEL",
    icon: Plane,
    priceFloorGhs: 3000,
    priceLabel: "GH₵ 3,000+",
    shortDescription:
      "Bespoke itineraries with end-to-end concierge management — flights, hotels, excursions, and 24/7 support.",
    defaultInvoiceDescription: "Tour package (flights, accommodation, excursions, support)",
    expectedTurnaround: "2 – 4 weeks",
    documentChecklist: [
      { key: "passport_bio", label: "Passport bio-data page", required: true, expiryRelevant: true },
      { key: "traveler_preferences", label: "Traveler preference questionnaire", required: true },
      { key: "dietary_requirements", label: "Dietary / accessibility needs", required: false },
      { key: "travel_insurance", label: "Travel insurance policy", required: true, expiryRelevant: true },
      { key: "visa_copy", label: "Visa (where required)", required: false, expiryRelevant: true }
    ],
    workflow: [
      { key: "PREFERENCES", label: "Preference mapping" },
      { key: "ITINERARY", label: "Itinerary design" },
      { key: "BOOKINGS", label: "Flights, hotels & docs" },
      { key: "BRIEFING", label: "Pre-departure brief" },
      { key: "DEPARTURE", label: "Departure" },
      { key: "CONCIERGE", label: "On-ground concierge" }
    ],
    metaFields: [
      { key: "destination", label: "Destination", type: "text", placeholder: "Dubai, Paris…" },
      { key: "departure_date", label: "Departure date", type: "date" },
      { key: "return_date", label: "Return date", type: "date" },
      { key: "party_size", label: "Party size", type: "number" },
      { key: "group_type", label: "Group type", type: "select", options: ["Solo", "Couple", "Family", "Friends", "Corporate", "Church / association"] }
    ]
  },

  FLIGHT_RESERVATION: {
    key: "FLIGHT_RESERVATION",
    label: "Flight Bookings & Ticketing",
    shortLabel: "Flight",
    slug: "flight-reservations",
    division: "TRAVEL",
    icon: PlaneTakeoff,
    priceFloorGhs: null,
    priceLabel: "Service-based",
    shortDescription:
      "Domestic and international flight reservations with route optimization, transparent fare terms, and pre-flight support.",
    defaultInvoiceDescription: "Flight booking & ticketing service fee",
    expectedTurnaround: "Same day – 72 hours",
    documentChecklist: [
      { key: "passport_bio", label: "Passport / ID exactly as for travel", required: true, expiryRelevant: true },
      { key: "route_preferences", label: "Route & date preferences", required: true },
      { key: "baggage_pref", label: "Baggage requirement", required: true }
    ],
    workflow: [
      { key: "BRIEF", label: "Travel brief intake" },
      { key: "FARE_COMPARE", label: "Fare comparison" },
      { key: "APPROVAL", label: "Option approval" },
      { key: "ISSUANCE", label: "Ticket issuance" },
      { key: "PRE_FLIGHT", label: "Pre-flight support" }
    ],
    metaFields: [
      { key: "origin", label: "Origin", type: "text" },
      { key: "destination", label: "Destination", type: "text" },
      { key: "departure_date", label: "Departure date", type: "date" },
      { key: "return_date", label: "Return date", type: "date" },
      { key: "airline", label: "Airline", type: "text" },
      { key: "pnr", label: "PNR / airline ref", type: "text" },
      { key: "ticket_number", label: "Ticket number", type: "text" },
      { key: "trip_type", label: "Trip type", type: "select", options: ["One-way", "Return", "Multi-city", "Group"] }
    ]
  },

  HOTEL_BOOKING: {
    key: "HOTEL_BOOKING",
    label: "Hotel Booking & Reservation",
    shortLabel: "Hotel",
    slug: "hotel-booking-reservation",
    division: "TRAVEL",
    icon: Hotel,
    priceFloorGhs: null,
    priceLabel: "Service-based",
    shortDescription:
      "Verified hotel selection, transparent reservation terms, and smooth stay coordination.",
    defaultInvoiceDescription: "Hotel booking & reservation service fee",
    expectedTurnaround: "24 hours – 7 days",
    documentChecklist: [
      { key: "passport_bio", label: "Guest passport / ID", required: true, expiryRelevant: true },
      { key: "stay_preferences", label: "Stay preferences", required: true }
    ],
    workflow: [
      { key: "BRIEF", label: "Travel brief intake" },
      { key: "CURATION", label: "Hotel option curation" },
      { key: "RATES", label: "Rate & policy comparison" },
      { key: "CONFIRMATION", label: "Reservation confirmation" },
      { key: "PRE_ARRIVAL", label: "Pre-arrival coordination" }
    ],
    metaFields: [
      { key: "destination_city", label: "Destination city", type: "text" },
      { key: "check_in", label: "Check-in", type: "date" },
      { key: "check_out", label: "Check-out", type: "date" },
      { key: "nights", label: "Nights", type: "number" },
      { key: "room_type", label: "Room type", type: "select", options: ["Single", "Twin", "Double", "Family", "Suite"] },
      { key: "hotel_name", label: "Hotel", type: "text" },
      { key: "booking_reference", label: "Booking reference", type: "text" }
    ]
  },

  TRAVEL_INSURANCE: {
    key: "TRAVEL_INSURANCE",
    label: "Travel Insurance",
    shortLabel: "Insurance",
    slug: "travel-insurance",
    division: "TRAVEL",
    icon: ShieldCheck,
    priceFloorGhs: null,
    priceLabel: "Policy-based",
    shortDescription:
      "Travel protection planning for medical emergencies, trip disruption, and baggage or document loss.",
    defaultInvoiceDescription: "Travel insurance placement fee",
    expectedTurnaround: "Same day – 48 hours",
    documentChecklist: [
      { key: "passport_bio", label: "Traveler passport / ID", required: true, expiryRelevant: true },
      { key: "trip_dates", label: "Trip dates & itinerary", required: true },
      { key: "health_disclosure", label: "Health disclosure (where required)", required: false }
    ],
    workflow: [
      { key: "RISK", label: "Trip risk assessment" },
      { key: "OPTIONS", label: "Policy option comparison" },
      { key: "SELECTION", label: "Coverage selection" },
      { key: "ISSUANCE", label: "Policy issuance" },
      { key: "CLAIM_READY", label: "Claim guidance readiness" }
    ],
    metaFields: [
      { key: "destination", label: "Destination", type: "text" },
      { key: "start_date", label: "Start date", type: "date" },
      { key: "end_date", label: "End date", type: "date" },
      { key: "coverage_level", label: "Coverage level", type: "select", options: ["Basic", "Standard", "Premium", "Schengen-compliant"] },
      { key: "policy_number", label: "Policy number", type: "text" },
      { key: "insurer", label: "Insurer", type: "text" }
    ]
  },

  TRANSPORT_SERVICES: {
    key: "TRANSPORT_SERVICES",
    label: "Transport & Car Services",
    shortLabel: "Transport",
    slug: "transport-car-services",
    division: "TRAVEL",
    icon: Car,
    priceFloorGhs: null,
    priceLabel: "Route-based",
    shortDescription:
      "Airport transfers, intercity rides, chauffeur options, and scheduled transport for individuals or groups.",
    defaultInvoiceDescription: "Transport / transfer service",
    expectedTurnaround: "Same day – 72 hours",
    documentChecklist: [
      { key: "flight_details", label: "Flight / arrival details", required: false },
      { key: "route_details", label: "Pickup & drop-off details", required: true }
    ],
    workflow: [
      { key: "INTAKE", label: "Mobility requirement intake" },
      { key: "PLANNING", label: "Vehicle & route planning" },
      { key: "SCHEDULE", label: "Schedule confirmation" },
      { key: "DISPATCH", label: "Driver dispatch" },
      { key: "TRIP", label: "Live trip support" }
    ],
    metaFields: [
      { key: "pickup_location", label: "Pickup location", type: "text" },
      { key: "dropoff_location", label: "Drop-off location", type: "text" },
      { key: "pickup_datetime", label: "Pickup date / time", type: "date" },
      { key: "vehicle_type", label: "Vehicle type", type: "select", options: ["Standard", "Executive", "Van", "Group bus", "Chauffeur"] },
      { key: "passenger_count", label: "Passengers", type: "number" }
    ]
  },

  CORPORATE_TRAVEL: {
    key: "CORPORATE_TRAVEL",
    label: "Corporate Travel Solutions",
    shortLabel: "Corporate",
    slug: "corporate-travel-solutions",
    division: "CORPORATE_EVENTS",
    icon: Building2,
    priceFloorGhs: null,
    priceLabel: "Service-based",
    shortDescription:
      "End-to-end business travel coordination for teams, executives, and company events with compliance-first planning.",
    defaultInvoiceDescription: "Corporate travel coordination & booking",
    expectedTurnaround: "24 hours – 10 days",
    documentChecklist: [
      { key: "company_brief", label: "Company travel brief", required: true },
      { key: "travel_policy", label: "Internal travel policy", required: false },
      { key: "traveler_passports", label: "Traveler passports", required: true, expiryRelevant: true },
      { key: "approval_chain", label: "Approval / authorization", required: true }
    ],
    workflow: [
      { key: "BRIEF", label: "Company travel brief" },
      { key: "POLICY", label: "Policy & budget alignment" },
      { key: "BOOKINGS", label: "Flight & hotel coordination" },
      { key: "APPROVAL", label: "Approval & ticketing" },
      { key: "TRIP", label: "Trip monitoring & support" }
    ],
    metaFields: [
      { key: "company_name", label: "Company", type: "text" },
      { key: "cost_center", label: "Cost centre / department", type: "text" },
      { key: "trip_type", label: "Trip type", type: "select", options: ["Executive", "Team", "Conference", "Training", "Incentive"] },
      { key: "travelers_count", label: "Travelers", type: "number" },
      { key: "budget_cap", label: "Budget cap (GHS)", type: "number" }
    ]
  },

  EVENT_MANAGEMENT: {
    key: "EVENT_MANAGEMENT",
    label: "Event & Destination Management",
    shortLabel: "Events",
    slug: "event-destination-management",
    division: "CORPORATE_EVENTS",
    icon: CalendarCheck2,
    priceFloorGhs: null,
    priceLabel: "Project-based",
    shortDescription:
      "Structured planning and logistics for destination events, retreats, celebrations, and hosted group experiences.",
    defaultInvoiceDescription: "Destination event management & logistics",
    expectedTurnaround: "2 – 12 weeks",
    documentChecklist: [
      { key: "event_brief", label: "Event objective & brief", required: true },
      { key: "guest_list", label: "Guest list / attendee profile", required: true },
      { key: "budget_sheet", label: "Budget sheet", required: true },
      { key: "run_of_show", label: "Run-of-show / programme", required: false }
    ],
    workflow: [
      { key: "DISCOVERY", label: "Event discovery" },
      { key: "VENUE", label: "Destination & venue planning" },
      { key: "TRAVEL_STAY", label: "Travel & stay coordination" },
      { key: "RUN_SHOW", label: "Run-of-show finalization" },
      { key: "DELIVERY", label: "On-ground delivery" }
    ],
    metaFields: [
      { key: "event_type", label: "Event type", type: "select", options: ["Wedding", "Corporate retreat", "Conference", "Celebration", "Church / pilgrimage", "Association tour"] },
      { key: "destination", label: "Destination", type: "text" },
      { key: "event_date", label: "Event date", type: "date" },
      { key: "guest_count", label: "Guests", type: "number" }
    ]
  },

  CONSULTATION: {
    key: "CONSULTATION",
    label: "Consultation & Advisory",
    shortLabel: "Consult",
    slug: "consultation-advisory-services",
    division: "CONSULTATION",
    icon: MessagesSquare,
    priceFloorGhs: null,
    priceLabel: "Session-based",
    shortDescription:
      "Strategic travel and immigration advisory sessions for clients needing expert direction before execution.",
    defaultInvoiceDescription: "Strategy / advisory session",
    expectedTurnaround: "Same day – 5 days",
    documentChecklist: [
      { key: "goal_brief", label: "Goal brief", required: true },
      { key: "history", label: "Application / travel history", required: false },
      { key: "available_docs", label: "Available documents (inventory)", required: false }
    ],
    workflow: [
      { key: "INTAKE", label: "Consultation intake" },
      { key: "REVIEW", label: "Profile & goal review" },
      { key: "RISK", label: "Risk & constraint analysis" },
      { key: "ROADMAP", label: "Roadmap development" },
      { key: "HANDOFF", label: "Next-step alignment" }
    ],
    metaFields: [
      { key: "topic", label: "Topic", type: "select", options: ["Visa strategy", "Refusal review", "Study planning", "Work / recruitment", "Travel planning", "General"] },
      { key: "session_format", label: "Session format", type: "select", options: ["In-person", "Phone", "WhatsApp", "Video call"] },
      { key: "session_date", label: "Session date", type: "date" }
    ]
  },

  BUSINESS_EXPORT: {
    key: "BUSINESS_EXPORT",
    label: "Business Export Facilitation",
    shortLabel: "Export",
    slug: "business-export-facilitation",
    division: "CORPORATE_EVENTS",
    icon: PackageSearch,
    priceFloorGhs: null,
    priceLabel: "Project-based",
    shortDescription:
      "Export-oriented travel and documentation support for Ghanaian SMEs reaching international markets.",
    defaultInvoiceDescription: "Business export facilitation fee",
    expectedTurnaround: "Project-based",
    documentChecklist: [
      { key: "business_registration", label: "Business registration documents", required: true },
      { key: "export_brief", label: "Export brief & target market", required: true },
      { key: "passport_bio", label: "Principal passport", required: true, expiryRelevant: true }
    ],
    workflow: [
      { key: "INTAKE", label: "Export brief intake" },
      { key: "MARKET", label: "Market & buyer planning" },
      { key: "TRAVEL", label: "Travel & visa coordination" },
      { key: "FOLLOWUP", label: "Follow-up & support" }
    ],
    metaFields: [
      { key: "target_market", label: "Target market", type: "text" },
      { key: "product_category", label: "Product category", type: "text" }
    ]
  }
};

export const SERVICE_TYPE_KEYS: ServiceTypeKey[] = Object.keys(
  serviceCatalogue
) as ServiceTypeKey[];

/** Display order for dropdowns: most-used services first, grouped by division. */
export const SERVICE_DISPLAY_ORDER: ServiceTypeKey[] = [
  "VISA_ASSISTANCE",
  "STUDY_ABROAD",
  "INTERNATIONAL_RECRUITMENT",
  "DOCUMENT_PROCESSING",
  "FLIGHT_RESERVATION",
  "HOTEL_BOOKING",
  "TOUR_PACKAGE",
  "TRAVEL_INSURANCE",
  "TRANSPORT_SERVICES",
  "CORPORATE_TRAVEL",
  "EVENT_MANAGEMENT",
  "CONSULTATION",
  "BUSINESS_EXPORT"
];

export const serviceList: ServiceCatalogueEntry[] = SERVICE_DISPLAY_ORDER.map(
  (key) => serviceCatalogue[key]
);

export function getService(key: string | null | undefined): ServiceCatalogueEntry | null {
  if (!key) return null;
  return serviceCatalogue[key as ServiceTypeKey] ?? null;
}

export function formatServiceLabel(key: string | null | undefined): string {
  const svc = getService(key);
  if (svc) return svc.label;
  if (!key) return "—";
  return key
    .toLowerCase()
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

export function getServicesByDivision(divisionKey: ServiceDivisionKey): ServiceCatalogueEntry[] {
  return serviceList.filter((svc) => svc.division === divisionKey);
}

export function getDivision(key: string | null | undefined): ServiceDivision | null {
  if (!key) return null;
  return divisions[key as ServiceDivisionKey] ?? null;
}

/** Pipeline stages tailored for a travel + immigration consult. Order matters. */
export const LEAD_PIPELINE_STAGES = [
  { key: "NEW", label: "New", description: "Lead just came in — not yet contacted.", display_order: 1, is_terminal: false, color: "bg-blue-500" },
  { key: "CONTACTED", label: "Contacted", description: "First outreach made; waiting for response or qualification.", display_order: 2, is_terminal: false, color: "bg-cyan-500" },
  { key: "SCOPED", label: "Scoped", description: "Needs understood; service path and feasibility confirmed.", display_order: 3, is_terminal: false, color: "bg-indigo-500" },
  { key: "QUOTED", label: "Quoted", description: "Price quoted / invoice sent; waiting for client commitment.", display_order: 4, is_terminal: false, color: "bg-amber-500" },
  { key: "BOOKED", label: "Booked / Submitted", description: "Service activated — flight ticketed, visa submitted, etc.", display_order: 5, is_terminal: false, color: "bg-emerald-500" },
  { key: "COMPLETED", label: "Completed", description: "Deliverable fulfilled; client successfully served.", display_order: 6, is_terminal: true, color: "bg-green-600" },
  { key: "CLOSED", label: "Closed / Lost", description: "Lost deal or client cancelled.", display_order: 7, is_terminal: true, color: "bg-slate-400" }
] as const;

export type LeadStageKey = (typeof LEAD_PIPELINE_STAGES)[number]["key"];

export function getStageMeta(stageKey: string | null | undefined) {
  return LEAD_PIPELINE_STAGES.find((stage) => stage.key === stageKey) ?? null;
}
