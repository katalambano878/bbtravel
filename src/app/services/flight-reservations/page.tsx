import { notFound } from "next/navigation";
import { PageHero } from "@/components/shared/page-hero";
import { CtaBanner } from "@/components/shared/cta-banner";
import { ServiceDetailSection } from "@/components/sections/service-detail";
import { getServiceBySlug } from "@/lib/data/services";

export default function FlightReservationsPage() {
  const service = getServiceBySlug("flight-reservations");
  if (!service) return notFound();

  return (
    <>
      <PageHero
        eyebrow="Flights Reservations"
        title={service.title}
        description="Reliable domestic and international flight reservations with transparent fares, smart route planning, and full pre-flight support."
        image="/images/page-hero/services.webp"
      />
      <ServiceDetailSection
        title={service.title}
        overview={service.overview}
        whoFor={service.whoFor}
        checklistPreview={service.checklistPreview}
        faqs={service.faqs}
        serviceType={service.type}
        backgroundImage="/images/page-hero/services.webp"
      />
      <CtaBanner />
    </>
  );
}
