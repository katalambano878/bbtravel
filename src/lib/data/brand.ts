import type { NavLink, ServiceType } from "@/types/domain";

export const brand = {
  name: "B.B. Travel Consult",
  fullName: "Bright Brown Travel Consult",
  tagline: "Where Your Travel Dreams Take Flight",
  founder: "Mr. Bright Nana Brown",
  hq: "Accra, Ghana (Spintex)",
  phone: "+233 30 398 1171",
  whatsapp: "+233 24 448 9285",
  email: "b.btravelconsult@gmail.com",
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
    type: "BUSINESS_EXPORT",
    title: "Business & Export Facilitation",
    short: "Cross-border trade, import/export advisory, and partnerships.",
    href: "/services/business-export-facilitation",
    icon: "Globe"
  }
];

export const serviceWorkflows: Record<ServiceType, string[]> = {
  VISA_ASSISTANCE: [
    "Initial travel intent assessment",
    "Document checklist generation",
    "Form completion support (DS-160 / UK forms)",
    "Appointment booking support",
    "Submission and status follow-up"
  ],
  INTERNATIONAL_RECRUITMENT: [
    "Candidate profiling and readiness scoring",
    "Role-country opportunity matching",
    "Employer document review and pre-screening",
    "Interview coordination and prep",
    "Placement onboarding support"
  ],
  STUDY_ABROAD: [
    "Program-country fit analysis",
    "Application document support",
    "School application and follow-up",
    "Visa documentation preparation",
    "Pre-departure orientation"
  ],
  TOUR_PACKAGE: [
    "Travel preference discovery",
    "Itinerary design and budget alignment",
    "Flights/hotel/activity planning",
    "Visa and travel documentation support",
    "Departure briefing and concierge support"
  ],
  BUSINESS_EXPORT: [
    "Business goals and market discovery",
    "Trade documentation guidance",
    "Partner and logistics facilitation",
    "Compliance process support",
    "Cross-border launch assistance"
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
