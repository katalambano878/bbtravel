import { notFound } from "next/navigation";
import { PageHero } from "@/components/shared/page-hero";
import { CtaBanner } from "@/components/shared/cta-banner";
import { ServiceDetailSection } from "@/components/sections/service-detail";
import { getServiceBySlug } from "@/lib/data/services";
import { buildServiceMetadata } from "@/lib/seo";

export const metadata = buildServiceMetadata(
  "Travel Insurance Support",
  "Coverage planning for medical emergencies, cancellations, delays, and lost baggage.",
  "travel-insurance"
);

export default function TravelInsurancePage() {
  const service = getServiceBySlug("travel-insurance");
  if (!service) return notFound();

  return (
    <>
      <PageHero
        eyebrow="Travel Insurance"
        title={service.title}
        description="Get the right protection plan for medical emergencies, cancellations, delays, and baggage risks before you travel."
        image="/images/page-hero/about.webp"
      />
      <ServiceDetailSection
        title={service.title}
        overview={service.overview}
        whoFor={service.whoFor}
        checklistPreview={service.checklistPreview}
        faqs={service.faqs}
        serviceType={service.type}
        backgroundImage="/images/services/visa.webp"
      />
      <CtaBanner />
    </>
  );
}
