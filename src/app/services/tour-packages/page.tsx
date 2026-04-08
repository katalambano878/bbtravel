import { notFound } from "next/navigation";
import { PageHero } from "@/components/shared/page-hero";
import { CtaBanner } from "@/components/shared/cta-banner";
import { ServiceDetailSection } from "@/components/sections/service-detail";
import { getServiceBySlug } from "@/lib/data/services";
import { buildServiceMetadata } from "@/lib/seo";

export const metadata = buildServiceMetadata(
  "Curated International Tour Packages",
  "Premium tour packages with end-to-end planning, logistics, and concierge support.",
  "tour-packages"
);

export default function TourPackagesPage() {
  const service = getServiceBySlug("tour-packages");
  if (!service) return notFound();

  return (
    <>
      <PageHero 
        eyebrow="Tour Packages" 
        title={service.title} 
        description="Fully managed travel experiences with curated itineraries, premium accommodation, and seamless logistics worldwide."
        image="/images/page-hero/tours.webp"
      />
      <ServiceDetailSection
        title={service.title}
        overview={service.overview}
        whoFor={service.whoFor}
        checklistPreview={service.checklistPreview}
        faqs={service.faqs}
        serviceType={service.type}
        backgroundImage="/images/services/tours.webp"
      />
      <CtaBanner />
    </>
  );
}
