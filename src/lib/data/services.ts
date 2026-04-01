import type { ServiceType } from "@/types/domain";

export const serviceDetails: {
  type: ServiceType;
  slug: string;
  title: string;
  whoFor: string;
  overview: string;
  checklistPreview: string[];
  faqs: { question: string; answer: string }[];
}[] = [
  {
    type: "VISA_ASSISTANCE",
    slug: "visa-assistance",
    title: "Visa Application & Documentation Assistance",
    whoFor: "Tourists, business travelers, students, and workers seeking structured visa process support.",
    overview:
      "We support form guidance (including DS-160 and UK forms), appointment planning, and document readiness to reduce avoidable delays.",
    checklistPreview: ["Passport data page", "Travel intent documents", "Financial support evidence", "Appointment prep sheet"],
    faqs: [
      { question: "Do you submit directly to embassies?", answer: "We guide and prepare your process. Submission flows depend on embassy systems and applicant requirements." },
      { question: "Can you help with DS-160 and UK forms?", answer: "Yes, we provide step-by-step form guidance and document alignment support." }
    ]
  },
  {
    type: "INTERNATIONAL_RECRUITMENT",
    slug: "international-recruitment",
    title: "International Recruitment & Job Placement",
    whoFor: "Professionals seeking ethical international job opportunities and structured onboarding.",
    overview:
      "Our recruitment pathway includes profile assessment, opportunity matching, interview readiness, and placement support.",
    checklistPreview: ["CV readiness review", "Credentials verification", "Role-country preference", "Interview preparation tracker"],
    faqs: [
      { question: "Do you guarantee jobs?", answer: "No. We provide ethical placement support and process preparation, while final hiring decisions rest with employers." },
      { question: "Can fresh candidates apply?", answer: "Yes, depending on role requirements and destination-country criteria." }
    ]
  },
  {
    type: "STUDY_ABROAD",
    slug: "study-abroad",
    title: "Study Abroad & Student Placement",
    whoFor: "Students pursuing international academic pathways with admissions and visa guidance.",
    overview:
      "From school/program fit to documentation and pre-departure guidance, we help students navigate complex application pathways.",
    checklistPreview: ["Academic transcript bundle", "Program shortlist", "Statement draft", "Financial proof plan"],
    faqs: [
      { question: "Can you help pick schools?", answer: "Yes, we assess fit based on goals, budget, and eligibility criteria." },
      { question: "Do you assist with visa preparation?", answer: "Yes, we align student documentation and interview readiness support." }
    ]
  },
  {
    type: "TOUR_PACKAGE",
    slug: "tour-packages",
    title: "International Tour Packages",
    whoFor: "Individuals, families, and groups looking for premium, customized travel experiences.",
    overview:
      "We design tailored itineraries with practical logistics support and document guidance where needed.",
    checklistPreview: ["Destination preference form", "Budget range", "Travel dates", "Traveler profile details"],
    faqs: [
      { question: "Can you customize group tours?", answer: "Yes, we build custom group plans with itinerary and accommodation options." },
      { question: "Do tours include visa support?", answer: "Where applicable, we provide process guidance and documentation support." }
    ]
  },
  {
    type: "BUSINESS_EXPORT",
    slug: "business-export-facilitation",
    title: "Business & Export Facilitation",
    whoFor: "Businesses and entrepreneurs expanding via import/export and cross-border partnerships.",
    overview:
      "We support business mobility and trade pathways with structured advisory and process facilitation.",
    checklistPreview: ["Business profile", "Target market details", "Trade documentation requirements", "Partnership objective sheet"],
    faqs: [
      { question: "Do you provide legal representation?", answer: "No. We offer process guidance and facilitation support, not legal representation." },
      { question: "Can you support first-time exporters?", answer: "Yes, with practical advisory and structured readiness support." }
    ]
  }
];

export function getServiceBySlug(slug: string) {
  return serviceDetails.find((service) => service.slug === slug);
}
