import { notFound } from "next/navigation";
import { PageHero } from "@/components/shared/page-hero";
import { CtaBanner } from "@/components/shared/cta-banner";
import { ServiceDetailSection } from "@/components/sections/service-detail";
import { getServiceBySlug } from "@/lib/data/services";
import { buildServiceMetadata } from "@/lib/seo";

export const metadata = buildServiceMetadata(
  "Event & Destination Management",
  "Destination event and travel logistics for corporate, group, and celebration experiences.",
  "event-destination-management"
);

export default function EventDestinationManagementPage() {
  const service = getServiceBySlug("event-destination-management");
  if (!service) return notFound();

  return (
    <>
      <PageHero
        eyebrow="Event & Destination Management"
        title={service.title}
        description="Destination event planning and logistics for retreats, celebrations, conferences, and hosted group experiences."
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
