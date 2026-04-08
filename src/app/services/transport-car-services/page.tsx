import { notFound } from "next/navigation";
import { PageHero } from "@/components/shared/page-hero";
import { CtaBanner } from "@/components/shared/cta-banner";
import { ServiceDetailSection } from "@/components/sections/service-detail";
import { getServiceBySlug } from "@/lib/data/services";
import { buildServiceMetadata } from "@/lib/seo";

export const metadata = buildServiceMetadata(
  "Transport & Car Services",
  "Airport transfers and route-based car services for individuals, teams, and groups.",
  "transport-car-services"
);

export default function TransportCarServicesPage() {
  const service = getServiceBySlug("transport-car-services");
  if (!service) return notFound();

  return (
    <>
      <PageHero
        eyebrow="Transport & Car Services"
        title={service.title}
        description="Reliable airport transfers, route-based car services, and group transport coordination for seamless movement."
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
