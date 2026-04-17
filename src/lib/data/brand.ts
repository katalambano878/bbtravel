import type { NavLink, ServiceType } from "@/types/domain";
import { serviceCatalogue, SERVICE_DISPLAY_ORDER } from "@/lib/services/catalogue";

export const brand = {
  name: "B.B. Travel Consult",
  fullName: "Bright Brown Travel Consult",
  tagline: "Where Your Travel Dreams Take Flight",
  founder: "Mr. Bright Nana Brown",
  hq: "Accra, Ghana (Teshie First Junction)",
  phone: "030 398 1171",
  secondaryPhone: "0507328772",
  whatsapp: "0244489285",
  email: "b.btravelconsult@gmail.com",
  digitalAddress: "GZ-018-0598",
  socialHandle: "@bbtravelconsult",
  mission: "To make global mobility simple, accessible, and trustworthy for every client.",
  vision: "To become Africa's most trusted travel and recruitment brand.",
  whyChoose: [
    "Licensed and registered Ghanaian firm",
    "Proven track record with ethical process management",
    "Global partnerships with personalized client care"
  ]
};

export const navLinks: NavLink[] = [
  { label: "Home", href: "/" },
  { label: "About", href: "/about" },
  { label: "Services", href: "/services" },
  { label: "Success Stories", href: "/success-stories" },
  { label: "Travel Deals", href: "/travel-deals" },
  { label: "Blog", href: "/blog" },
  { label: "Contact", href: "/contact" }
];

/**
 * Legacy view of the service catalogue. Derived from the canonical
 * catalogue in `src/lib/services/catalogue.ts` so that extending the
 * catalogue auto-propagates across the public site.
 */
export const serviceCatalog: {
  type: ServiceType;
  title: string;
  short: string;
  href: string;
  icon: string;
}[] = SERVICE_DISPLAY_ORDER
  // Hide BUSINESS_EXPORT from the public service catalogue since it's a
  // legacy admin-only classification.
  .filter((key) => key !== "BUSINESS_EXPORT")
  .map((key) => {
    const svc = serviceCatalogue[key];
    return {
      type: svc.key as ServiceType,
      title: svc.label,
      short: svc.shortDescription,
      href: `/services/${svc.slug}`,
      icon: svc.icon.displayName ?? "FileBadge2"
    };
  });

export const serviceWorkflows: Record<ServiceType, string[]> = {
  VISA_ASSISTANCE: [
    "Deep-dive profile assessment — we analyze your travel history, financial position, and intent to identify strengths and vulnerabilities before anything is submitted",
    "Strategic document audit — every document is reviewed against embassy-specific criteria, with gaps flagged and alternative evidence sourced",
    "Application form mastery — DS-160, UK online forms, Schengen applications completed with precision to eliminate inconsistencies that trigger red flags",
    "Financial narrative construction — bank statements, sponsor letters, and proof of funds structured to tell a coherent, credible story",
    "Interview preparation & mock sessions — embassy interview coaching tailored to your specific visa type, with practice questions based on real officer patterns",
    "Appointment scheduling & submission management — we coordinate timing, confirm all documents, and provide a final pre-submission quality check"
  ],
  INTERNATIONAL_RECRUITMENT: [
    "Professional profiling & market positioning — your CV, credentials, and experience are evaluated against international employer requirements",
    "Credential verification & gap analysis — qualifications are mapped to destination-country standards, with remediation plans for any gaps",
    "Targeted opportunity matching — we match your profile exclusively with verified, licensed employers from our vetted partner network",
    "Interview preparation & employer coordination — you receive role-specific coaching, mock interviews, and direct scheduling with hiring teams",
    "Contract review & compliance check — every employment offer is reviewed for fairness, legal compliance, and alignment with immigration requirements",
    "Visa processing & relocation support — from work permit applications to pre-departure briefings, we manage the entire transition pipeline"
  ],
  STUDY_ABROAD: [
    "Academic profile assessment — your grades, test scores, and career goals are evaluated against real admission data for target programs",
    "Strategic university shortlisting — we build a balanced list of target, match, and safety schools based on realistic admission probability, not popularity",
    "Application crafting — SOPs, personal statements, and essays are developed through our iterative review process with professional editors",
    "Scholarship identification & application — eligible funding opportunities are flagged and dedicated applications are prepared alongside admissions",
    "Student visa documentation — CAS letters, proof of funds, accommodation evidence, and interview preparation are managed end-to-end",
    "Pre-departure orientation — accommodation guidance, banking setup, airport protocols, and first-week preparation to ensure a smooth transition"
  ],
  TOUR_PACKAGE: [
    "Destination consultation & preference mapping — your ideal experience, budget, group dynamics, and travel dates inform every planning decision",
    "Bespoke itinerary design — day-by-day plans are crafted with curated excursions, premium accommodations, and authentic local experiences",
    "Flight & accommodation booking — competitive rates are secured through our airline and hotel partnerships with flexible cancellation options",
    "Visa & travel documentation — for destinations requiring visas, we handle the full documentation process as part of your package",
    "Pre-departure briefing — every traveler receives a comprehensive trip pack with itineraries, emergency contacts, cultural tips, and insurance details",
    "On-ground concierge support — airport transfers, guided tours, and 24/7 direct-line assistance throughout your entire journey"
  ],
  FLIGHT_RESERVATION: [
    "Travel brief capture — route, dates, traveler details, baggage needs, and ticket flexibility preferences are documented clearly",
    "Fare scouting and comparison — we compare multiple airlines and fare classes to balance cost, transit time, and reliability",
    "Best-fit option shortlist — options are presented with transparent details on baggage, change policy, and cancellation conditions",
    "Ticket reservation and issuance — once approved, we process your booking and share complete e-ticket and airline reference details",
    "Pre-flight support — seat selection guidance, check-in reminders, and travel document checks before departure",
    "Change and disruption handling — rebooking support for date changes, missed connections, or airline schedule adjustments"
  ],
  HOTEL_BOOKING: [
    "Travel brief capture — destination, check-in/check-out dates, room preferences, and budget are collected in one structured intake",
    "Property curation — we shortlist verified hotels based on safety, location, ratings, amenities, and your exact trip purpose",
    "Rate optimization — refundable and non-refundable options are compared to secure the best value with transparent terms",
    "Reservation confirmation — bookings are finalized with clear confirmation details, policy highlights, and payment proof",
    "Pre-arrival coordination — early check-in requests, airport transfer preference, and special notes are communicated to the property",
    "Stay support — our team remains available for rebooking, upgrades, or itinerary-driven hotel adjustments during your trip"
  ],
  TRAVEL_INSURANCE: [
    "Trip risk assessment — destination, duration, activities, and traveler profile are reviewed to identify real exposure points",
    "Policy option comparison — suitable insurers are shortlisted with plain-language breakdowns of limits, exclusions, and claim triggers",
    "Coverage selection — medical, cancellation, baggage, and evacuation cover are matched to your trip's actual risk profile",
    "Policy issuance — the chosen plan is issued with full policy document, certificate of insurance, and emergency assistance contacts",
    "Claim readiness handoff — you are briefed on exactly what evidence and notifications a claim requires, before departure"
  ],
  TRANSPORT_SERVICES: [
    "Mobility intake — pickup and drop-off locations, dates, passenger count, and luggage volume are documented",
    "Vehicle and route planning — suitable vehicle class is matched to your party size, trip type, and comfort level",
    "Schedule confirmation — pickup times are locked in, flight details synced for airport transfers, and buffers built in",
    "Driver dispatch — vetted driver details are shared with you ahead of pickup with contact information",
    "Live trip support — the team stays reachable during your movement for adjustments, delays, or reroutes"
  ],
  CORPORATE_TRAVEL: [
    "Company travel brief — traveler list, destinations, dates, and purpose captured in one structured intake",
    "Policy and budget alignment — bookings calibrated to your internal travel policy, budget ceilings, and cabin class rules",
    "Flight and hotel coordination — routes optimized for time and cost; accommodation blocks secured for multi-traveler movements",
    "Approval and ticketing — approvals routed cleanly, tickets issued, and finance-ready cost breakdowns shared",
    "Trip monitoring and support — active monitoring with disruption recovery support while your team is on the move"
  ],
  EVENT_MANAGEMENT: [
    "Event discovery — objective, destination, guest profile, budget, and programme sketched through a structured briefing",
    "Destination and venue planning — venues scouted, quoted, and selected against your event goals and attendee experience",
    "Travel and stay coordination — group flights, accommodation blocks, and transfers planned with contingency options",
    "Run-of-show finalization — programme flow, supplier deliverables, and responsibilities locked down before travel",
    "On-ground delivery — coordinated execution during the event with a single-point contact for all guest-facing operations"
  ],
  CONSULTATION: [
    "Consultation intake — goal summary, history, and constraints captured so the session is focused from minute one",
    "Profile and goal review — realistic eligibility, risk points, and best service pathway identified using real-world benchmarks",
    "Risk and constraint analysis — timeline, budget, document gaps, and dependencies mapped so nothing is left to chance",
    "Roadmap development — sequenced action plan produced with required documents, expected costs, and realistic timelines",
    "Next-step alignment — the plan is handed off to execution (ours or yours) with clear ownership of each action"
  ],
  DOCUMENT_PROCESSING: [
    "Requirement mapping — destination-specific document list confirmed against the officer's real review criteria",
    "Collection and verification — every document is collected, authenticity-checked, and cross-referenced for consistency",
    "Formatting and structuring — file is ordered, indexed, and presented so reviewers can move through it without ambiguity",
    "Legalization guidance — notarization, apostille, and embassy authentication steps planned where required",
    "Final readiness review — a submission-readiness audit is done before the file is handed off for filing"
  ],
  BUSINESS_EXPORT: [
    "Export brief intake — target markets, product category, volumes, and compliance requirements captured upfront",
    "Market and buyer planning — entry paths mapped with introduction support where our network allows",
    "Travel and visa coordination — business visit logistics organised end-to-end so time on ground is productive",
    "Follow-up support — post-trip follow-through on buyer contacts and documentation continuity"
  ]
};

export const faqs = [
  {
    question: "Do you guarantee visa approvals?",
    answer:
      "No. We provide expert guidance, documentation support, and process management, but final decisions are made by embassies and immigration authorities."
  },
  {
    question: "How long does a visa process usually take?",
    answer:
      "Timelines vary by country and season. We provide realistic ranges during your assessment and keep status updates transparent in your portal."
  },
  {
    question: "Can I track my process online?",
    answer:
      "Yes. Each client gets a secure dashboard to track case progress, document review status, appointments, and next actions."
  }
];
