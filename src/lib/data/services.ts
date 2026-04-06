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
    title: "Strategic Visa & Immigration Advisory",
    whoFor: "Professionals, families, entrepreneurs, and students who refuse to gamble on their visa outcome — and demand a structured, embassy-aligned strategy from day one.",
    overview:
      "Every year, thousands of visa applications from Ghana are rejected due to preventable errors — weak financial narratives, inconsistent travel histories, and poorly structured supporting documents. We exist to eliminate that. Our visa advisory framework reverse-engineers embassy decision criteria for over 30 countries, builds profiles that withstand scrutiny, and delivers documentation packages that leave nothing to interpretation. From Schengen and UK Standard Visitor visas to complex US B1/B2 and Canadian TRV applications, we've handled it all — including prior refusal overturns.",
    checklistPreview: [
      "Valid passport with 6+ months validity and clean scan of bio-data page",
      "Bank statements (6 months minimum) with consistent balance and no suspicious deposits",
      "Employer letter confirming position, salary, and approved leave dates",
      "Proof of ties to Ghana — property documents, business registration, or family obligations",
      "Travel itinerary: confirmed flight reservation and hotel booking",
      "Previous visa history documentation and any refusal letters (if applicable)"
    ],
    faqs: [
      {
        question: "Can you guarantee my visa will be approved?",
        answer: "No legitimate firm can guarantee an embassy's decision — and any firm that does is deceiving you. What we guarantee is a fully compliant, strategically structured application that maximizes your probability of success. Our preparation addresses the exact criteria officers evaluate: financial credibility, intent clarity, and ties to your home country."
      },
      {
        question: "I was previously refused a visa. Can you still help?",
        answer: "Absolutely. Prior refusals are one of our core specialties. We obtain and analyze your refusal grounds (including GCMS notes for Canada), identify exactly what went wrong, and rebuild your application from scratch to directly address the officer's concerns. Many of our strongest results come from overturned refusals."
      },
      {
        question: "How long does the entire process take from start to approval?",
        answer: "This depends on the destination country and visa type. Typically, our preparation phase takes 5–10 business days. Embassy processing times vary: Schengen averages 15 calendar days, UK Standard Visitor 3–6 weeks, US B1/B2 depends on interview availability, and Canadian TRVs can take 4–12 weeks. We provide realistic timelines upfront so you can plan accordingly."
      },
      {
        question: "What's included in your service fee?",
        answer: "Our fee covers: comprehensive profile assessment, document audit and gap analysis, full application form completion (DS-160, UK online forms, etc.), financial narrative structuring, interview preparation coaching, appointment scheduling guidance, and post-submission tracking support. Embassy fees and third-party costs (e.g., VFS processing fees) are paid separately by the client."
      },
      {
        question: "Do you handle both tourist and work/student visas?",
        answer: "Yes. We service the full spectrum — tourist/visitor visas, business visas, skilled worker visas, family reunification, and dependent applications. Each category has a tailored preparation protocol because the scrutiny criteria differ significantly between visa classes."
      }
    ]
  },
  {
    type: "INTERNATIONAL_RECRUITMENT",
    slug: "international-recruitment",
    title: "International Recruitment & Career Placement",
    whoFor: "Qualified Ghanaian professionals — nurses, engineers, accountants, IT specialists, and skilled tradespeople — ready to secure verified international employment through ethical, transparent channels.",
    overview:
      "The international recruitment space in Ghana is plagued by scam agencies, inflated promises, and exploitative placement fees. We built our recruitment arm specifically to be the antidote. Our model connects pre-vetted candidates directly with licensed employers and NHS trusts in the UK, healthcare facilities across Europe, and verified companies in Canada, the Middle East, and beyond. Every placement goes through a rigorous compliance check — we verify employer licenses, review contract terms for fairness, and manage the entire documentation pipeline from credential verification to visa processing. If the opportunity doesn't meet our ethical standards, we don't present it. Period.",
    checklistPreview: [
      "Updated professional CV formatted to international standards (UK/EU format)",
      "Verified academic transcripts and professional certificates",
      "Professional registration documents (e.g., NMC pin for nurses, relevant board certifications)",
      "Valid passport with minimum 12 months validity",
      "English language proficiency evidence (IELTS/OET scores where required)",
      "Two professional references from current or recent employers"
    ],
    faqs: [
      {
        question: "Do you guarantee job placement?",
        answer: "We do not guarantee employment — no ethical agency can, as final hiring decisions rest with employers. What we guarantee is access to verified, legitimate opportunities and complete preparation support. Our candidates receive profile optimization, interview coaching, and end-to-end documentation management. Our placement success rate speaks for itself."
      },
      {
        question: "Are the employers you work with verified and legitimate?",
        answer: "Every employer in our network undergoes our due diligence protocol. For UK healthcare placements, we only work with NHS trusts and CQC-registered care providers with active sponsor licenses. For other markets, we verify business registration, employment contracts, and compliance with local labor laws before presenting any opportunity to candidates."
      },
      {
        question: "Do I have to pay the employer or a placement fee?",
        answer: "Legitimate employers do not charge candidates for jobs. If you're being asked to pay an employer to 'secure' a role, that's a red flag. Our fees are transparent and cover our advisory, documentation, and coordination services only. We will never ask you to pay a third party for a job offer."
      },
      {
        question: "How long does the recruitment process typically take?",
        answer: "From initial profiling to placement confirmation, the typical timeline is 8–16 weeks depending on the role, destination country, and visa processing times. Healthcare placements (especially UK NHS) can be faster when candidates have current registrations. We provide a personalized timeline after your initial assessment."
      },
      {
        question: "I'm a nurse. Can you help with NMC registration and CBT preparation?",
        answer: "Yes. Our healthcare recruitment pipeline includes full NMC registration support, CBT exam preparation guidance, OSCE readiness coaching, and direct introductions to NHS trusts with active sponsorship. We've successfully placed nurses from Ghana into NHS roles across England and Wales."
      }
    ]
  },
  {
    type: "STUDY_ABROAD",
    slug: "study-abroad",
    title: "Study Abroad Advisory & University Placement",
    whoFor: "Ambitious students and working professionals pursuing undergraduate, postgraduate, or professional programs at top universities in Canada, the UK, the US, Australia, and Europe.",
    overview:
      "Getting into an international university isn't just about grades — it's about presenting a compelling narrative that aligns your academic history, career trajectory, and financial credibility into one airtight application. We've guided hundreds of Ghanaian students through the entire pipeline: from identifying the right program and university based on realistic eligibility (not wishful thinking) to crafting statements of purpose that admissions committees actually remember. Our financial documentation framework is specifically designed for Ghanaian applicants — we know the exact proof-of-funds structures that IRCC, UKVI, and USCIS examiners look for, including how to present GCR funding, family sponsorship, and scholarship combinations credibly.",
    checklistPreview: [
      "Academic transcripts from all institutions attended (certified copies)",
      "Standardized test scores — IELTS, TOEFL, GRE, GMAT as required by program",
      "Statement of Purpose (SOP) — we provide framework and professional review",
      "Proof of funds — bank statements, sponsor declarations, scholarship award letters",
      "Curriculum Vitae highlighting academic and professional achievements",
      "Two academic or professional reference letters"
    ],
    faqs: [
      {
        question: "Can you help me choose the right university and program?",
        answer: "Yes — and this is where most students go wrong. We don't just recommend 'popular' schools. We analyze your grades, test scores, budget, and career goals against real admission data to build a shortlist of realistic target, match, and safety schools. This strategic approach dramatically increases your chances of receiving at least one strong offer."
      },
      {
        question: "My grades aren't perfect. Can I still study abroad?",
        answer: "Absolutely. A lower GPA doesn't automatically disqualify you. Many programs weigh work experience, research, extracurriculars, and the strength of your SOP heavily. We specialize in building applications that contextualize academic gaps and highlight your strongest assets. We've placed students with second-class lower degrees into ranked postgraduate programs."
      },
      {
        question: "Do you help with scholarship applications?",
        answer: "Yes. We identify scholarship opportunities that match your profile — including fully funded programs, partial tuition waivers, and country-specific scholarships (Commonwealth, Chevening, DAAD, etc.). We then help you craft competitive scholarship essays and ensure your applications meet all documentation requirements and deadlines."
      },
      {
        question: "What about the student visa after admission?",
        answer: "Your admission is only half the battle. We manage the entire student visa application — CAS letter coordination for UK, study permit documentation for Canada, I-20 processing for the US — including financial evidence structuring, accommodation proof, and interview preparation. Our visa preparation is built into the service, not an afterthought."
      },
      {
        question: "How early should I start the process?",
        answer: "Ideally 8–12 months before your target intake. This allows time for test preparation, strategic school selection, application crafting, and visa processing. Late starters can sometimes be accommodated for rolling admissions or January intakes, but starting early gives you the strongest position — especially for scholarship deadlines."
      }
    ]
  },
  {
    type: "TOUR_PACKAGE",
    slug: "tour-packages",
    title: "Curated International Tour Packages",
    whoFor: "Individuals, couples, families, corporate groups, and church/association delegations seeking premium, hassle-free international travel experiences with end-to-end concierge management.",
    overview:
      "Travel should be an experience, not a logistical nightmare. Our tour packages are meticulously designed itineraries that handle everything — from visa documentation and flight bookings to premium accommodations, guided excursions, airport transfers, and 24/7 on-ground concierge support. Whether it's a honeymoon in Paris, a family adventure in Dubai, a corporate retreat in London, or a church pilgrimage to Israel, we build every trip around your preferences and budget. Every package includes detailed pre-departure briefings, travel insurance coordination, and real-time support throughout your journey. You show up and enjoy — we handle absolutely everything else.",
    checklistPreview: [
      "Valid passport with 6+ months validity from travel date",
      "Completed traveler preference questionnaire (destinations, budget, group size)",
      "Travel dates and any scheduling constraints",
      "Dietary requirements and accessibility needs (if applicable)",
      "Travel insurance preferences",
      "Visa documentation support (included for destinations requiring visas)"
    ],
    faqs: [
      {
        question: "What's typically included in your tour packages?",
        answer: "Every package includes: return flights, premium hotel accommodations, guided excursions and activities, airport transfers, daily breakfast (most packages include half-board or full-board options), travel insurance coordination, and 24/7 concierge support. Visa processing support is included for destinations that require it. We provide a detailed breakdown before you commit."
      },
      {
        question: "Can you create a fully customized itinerary?",
        answer: "Yes. While we offer signature packages for popular destinations (Dubai, London, Paris, Istanbul, South Africa), every trip can be fully customized — from hotel selections and excursion preferences to private dining experiences and VIP access. Corporate groups and family celebrations receive bespoke planning."
      },
      {
        question: "Do you handle group tours for churches, associations, or companies?",
        answer: "Absolutely. Group travel is one of our strongest capabilities. We manage group visa coordination, negotiate bulk rates for flights and accommodations, handle group logistics, and assign a dedicated tour coordinator for groups of 10 or more. We've coordinated church pilgrimages, corporate incentive trips, and association study tours."
      },
      {
        question: "What happens if something goes wrong during the trip?",
        answer: "Every traveler receives a direct line to our operations team for the duration of the trip. Flight disruptions, hotel issues, medical situations — we coordinate immediate solutions. This isn't a call center; it's direct access to the team that planned your trip and knows your itinerary intimately."
      },
      {
        question: "How far in advance should I book?",
        answer: "We recommend booking 6–8 weeks before travel for popular destinations, and 3–4 months for peak seasons (December holidays, Easter, summer). This allows adequate time for visa processing, flight availability at competitive rates, and hotel confirmations. Last-minute bookings are possible but may come with limited options."
      }
    ]
  },
  {
    type: "FLIGHT_RESERVATION",
    slug: "flight-reservations",
    title: "Flights Reservations Service",
    whoFor:
      "Individuals, families, students, business travelers, and group coordinators who want reliable flight options with clear fare rules and support before departure.",
    overview:
      "Flight booking mistakes are expensive. Hidden fare restrictions, poor transit choices, and baggage surprises can disrupt the entire trip. Our flights reservation service solves that by matching each traveler to the best-fit route based on budget, timing, flexibility, and comfort. We compare multiple carriers, explain all fare conditions up front, and issue tickets with complete documentation and support. Whether you need one-way, return, multi-city, or group bookings, we handle reservations with precision and transparency.",
    checklistPreview: [
      "Traveler names exactly as shown on valid passport or ID",
      "Preferred origin, destination, and exact travel dates",
      "Baggage requirement (hand luggage only, checked bags, extra weight)",
      "Ticket flexibility preference (fixed, partially flexible, fully flexible)",
      "Airline or transit preference (direct flight or acceptable layover)",
      "Emergency contact and confirmation email/phone details"
    ],
    faqs: [
      {
        question: "Can you book both international and domestic flights?",
        answer:
          "Yes. We handle both domestic and international routes, including single passenger bookings, family trips, and group travel plans."
      },
      {
        question: "Do you help me choose between cheaper and flexible fares?",
        answer:
          "Absolutely. We explain each fare class in plain terms so you understand baggage limits, change fees, and cancellation conditions before you pay."
      },
      {
        question: "Will I receive full ticket confirmation immediately?",
        answer:
          "Yes. Once your booking is finalized, we send your e-ticket, airline reservation code, itinerary details, and key travel reminders."
      },
      {
        question: "Can you support date changes after booking?",
        answer:
          "If your fare rules allow changes, we coordinate rebooking and guide you through any airline penalties or fare difference charges."
      },
      {
        question: "Do you offer group flight reservations?",
        answer:
          "Yes. We support group bookings for families, tour groups, corporate teams, and church delegations with coordinated itineraries."
      }
    ]
  },
  {
    type: "BUSINESS_EXPORT",
    slug: "hotel-booking-reservation",
    title: "Hotel Booking & Reservation Service",
    whoFor:
      "Business travelers, tourists, families, student travelers, and group coordinators who want stress-free hotel selection and trusted reservations at the right price point.",
    overview:
      "Booking a hotel should be simple, but poor location choices, hidden policy terms, and overpriced rates can ruin even the best travel plan. Our hotel booking and reservation service is designed to remove that risk. We match your destination, budget, and travel purpose to carefully vetted properties, compare rate plans transparently, and secure reservations with clear cancellation and payment terms. From short-stay city trips to long-stay business and study travel, we coordinate your accommodation with precision so your trip starts smoothly.",
    checklistPreview: [
      "Destination city and exact check-in/check-out dates",
      "Guest details exactly as they appear on passport or valid ID",
      "Room preference and occupancy requirement (single, twin, family, group)",
      "Budget range and preferred hotel rating (3-star, 4-star, 5-star)",
      "Special requests (early check-in, airport transfer, breakfast, accessibility)",
      "Payment method confirmation and cancellation preference (flexible vs fixed)"
    ],
    faqs: [
      {
        question: "Can you book hotels for both local and international destinations?",
        answer:
          "Yes. We support domestic and international hotel reservations. We shortlist options based on your destination, budget, safety expectations, and trip purpose."
      },
      {
        question: "Do you only book luxury hotels?",
        answer:
          "No. We book across budget, mid-range, premium, and luxury categories. The key is matching you to the best-value property for your exact travel objective."
      },
      {
        question: "Will I receive a confirmed reservation document?",
        answer:
          "Absolutely. You receive full reservation confirmation details, including booking reference, property address, check-in instructions, and policy summary."
      },
      {
        question: "Can you handle group or family hotel bookings?",
        answer:
          "Yes. We coordinate group reservations, room allocations, and special requests for families, church groups, corporate teams, and tour groups."
      },
      {
        question: "What happens if my travel dates change?",
        answer:
          "Where the chosen rate plan allows changes, we support date modifications and rebooking. We always explain flexibility terms before final confirmation."
      }
    ]
  }
];

export function getServiceBySlug(slug: string) {
  return serviceDetails.find((service) => service.slug === slug);
}
