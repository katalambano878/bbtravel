import type { ServiceType } from "@/types/domain";

export const testimonials = [
  {
    name: "Efua Mensah",
    quote:
      "The transparency gave me confidence. I always knew what document was needed and what step came next.",
    rating: 5,
    service: "Visa Assistance"
  },
  {
    name: "Kofi Tetteh",
    quote: "I moved from application confusion to a clear recruitment pathway within weeks.",
    rating: 5,
    service: "International Recruitment"
  },
  {
    name: "Naa Dedei Asante",
    quote: "Their study abroad guidance was practical, honest, and very personalized.",
    rating: 5,
    service: "Study Abroad"
  }
];

export const tours = [
  {
    id: "1",
    title: "Dubai Luxury City Escape",
    slug: "dubai-luxury-city-escape",
    price: 1750,
    duration: "6 Days",
    summary: "Premium city break with curated activities and concierge support.",
    destination: "Dubai, UAE",
    cover: "https://images.unsplash.com/photo-1512453979798-5ea266f8880c?auto=format&fit=crop&w=1400&q=80",
    itinerary: ["Arrival & Marina Dinner", "City Heritage Tour", "Desert Safari", "Leisure + Shopping", "Yacht Experience"]
  },
  {
    id: "2",
    title: "London Business & Culture Week",
    slug: "london-business-culture-week",
    price: 2200,
    duration: "7 Days",
    summary: "Balanced package for business travelers and first-time UK visitors.",
    destination: "London, UK",
    cover: "https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?auto=format&fit=crop&w=1400&q=80",
    itinerary: ["Arrival", "Business District Orientation", "Cultural Day Tour", "Optional Meetings", "Leisure"]
  },
  {
    id: "3",
    title: "Paris Family Discovery",
    slug: "paris-family-discovery",
    price: 1980,
    duration: "6 Days",
    summary: "Comfort-first family package with iconic attractions and flexible pacing.",
    destination: "Paris, France",
    cover: "https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&w=1400&q=80",
    itinerary: ["Arrival", "Seine Cruise", "Louvre & City Tour", "Disney Day", "Free Exploration"]
  }
];

export const successStories = [
  {
    title: "Student Placement to Canada",
    outcome: "Secured admission and visa support in one guided workflow.",
    service: "Study Abroad",
    metric: "4 months end-to-end"
  },
  {
    title: "Nurse Placement in Europe",
    outcome: "Ethical recruitment and relocation support through portal tracking.",
    service: "International Recruitment",
    metric: "100% document completeness before interview"
  },
  {
    title: "Family Schengen Tour Success",
    outcome: "Coordinated visa prep and premium itinerary planning.",
    service: "Tour Packages",
    metric: "3-country itinerary completed"
  }
];

export const blogPosts = [
  {
    id: "visa-interview-prep",
    title: "Visa Interview Readiness: What Actually Matters",
    slug: "visa-interview-readiness-guide",
    excerpt: "A practical preparation framework for stronger visa interview confidence.",
    content:
      "Strong readiness starts with complete documentation, consistent intent explanation, and timeline clarity. Avoid overcomplicated narratives and keep your supporting documents aligned with your travel purpose.",
    cover:
      "https://images.unsplash.com/photo-1526304640581-d334cdbbf45e?auto=format&fit=crop&w=1400&q=80",
    category: "Visa Tips"
  },
  {
    id: "study-abroad-checklist",
    title: "Study Abroad Checklist for Ghanaian Applicants",
    slug: "study-abroad-checklist-ghana",
    excerpt: "A step-by-step checklist from program shortlist to pre-departure.",
    content:
      "Prioritize institution fit, statement quality, financial documentation, and application deadlines. Build a timeline backward from intake dates to reduce deadline pressure.",
    cover:
      "https://images.unsplash.com/photo-1434030216411-0b793f4b4173?auto=format&fit=crop&w=1400&q=80",
    category: "Study Abroad"
  },
  {
    id: "travel-doc-basics",
    title: "Travel Document Basics for First-Time Travelers",
    slug: "travel-document-basics-first-time",
    excerpt: "Understand the core documents most embassies expect before you apply.",
    content:
      "Passport validity, financial proof, itinerary support, and intent consistency are universal pillars. Start with a document gap review before paying for appointments.",
    cover:
      "https://images.unsplash.com/photo-1488646953014-85cb44e25828?auto=format&fit=crop&w=1400&q=80",
    category: "Travel Prep"
  }
];

export const checklistTemplates: Record<ServiceType, string[]> = {
  VISA_ASSISTANCE: ["Passport validity check", "Purpose of travel documentation", "Financial support evidence", "Appointment prep sheet"],
  INTERNATIONAL_RECRUITMENT: ["CV standardization", "Qualification verification", "Role fit statement", "Interview readiness checklist"],
  STUDY_ABROAD: ["Academic transcripts", "Personal statement draft", "Financial proof preparation", "Visa readiness bundle"],
  TOUR_PACKAGE: ["Passport and identity checks", "Family/group preference sheet", "Budget and experience priority list", "Travel insurance guidance"],
  FLIGHT_RESERVATION: [
    "Traveler details and route confirmation",
    "Preferred airline and transit options",
    "Baggage and fare flexibility selection",
    "Ticket issuance and pre-flight checklist"
  ],
  BUSINESS_EXPORT: [
    "Travel dates and destination confirmation",
    "Guest ID/passport information sheet",
    "Room preference and occupancy details",
    "Cancellation and payment policy selection"
  ]
};
