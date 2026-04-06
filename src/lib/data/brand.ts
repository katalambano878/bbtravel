import type { NavLink, ServiceType } from "@/types/domain";

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

export const serviceCatalog: {
  type: ServiceType;
  title: string;
  short: string;
  href: string;
  icon: string;
}[] = [
  {
    type: "VISA_ASSISTANCE",
    title: "Visa Application Assistance",
    short: "Tourist, business, student, and work visa documentation support.",
    href: "/services/visa-assistance",
    icon: "FileBadge2"
  },
  {
    type: "INTERNATIONAL_RECRUITMENT",
    title: "International Recruitment",
    short: "Ethical international job placement and candidate preparation.",
    href: "/services/international-recruitment",
    icon: "BriefcaseBusiness"
  },
  {
    type: "STUDY_ABROAD",
    title: "Study Abroad Placement",
    short: "Admission guidance, documentation, and onboarding support.",
    href: "/services/study-abroad",
    icon: "GraduationCap"
  },
  {
    type: "TOUR_PACKAGE",
    title: "International Tour Packages",
    short: "Customized private and group travel experiences.",
    href: "/services/tour-packages",
    icon: "Plane"
  },
  {
    type: "FLIGHT_RESERVATION",
    title: "Flights Reservations",
    short: "International and domestic flight search, fare optimization, and booking support.",
    href: "/services/flight-reservations",
    icon: "PlaneTakeoff"
  },
  {
    type: "BUSINESS_EXPORT",
    title: "Hotel Booking & Reservation",
    short: "Global hotel booking, reservation planning, and stay coordination.",
    href: "/services/hotel-booking-reservation",
    icon: "Hotel"
  }
];

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
  BUSINESS_EXPORT: [
    "Travel brief capture — destination, check-in/check-out dates, room preferences, and budget are collected in one structured intake",
    "Property curation — we shortlist verified hotels based on safety, location, ratings, amenities, and your exact trip purpose",
    "Rate optimization — refundable and non-refundable options are compared to secure the best value with transparent terms",
    "Reservation confirmation — bookings are finalized with clear confirmation details, policy highlights, and payment proof",
    "Pre-arrival coordination — early check-in requests, airport transfer preference, and special notes are communicated to the property",
    "Stay support — our team remains available for rebooking, upgrades, or itinerary-driven hotel adjustments during your trip"
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
