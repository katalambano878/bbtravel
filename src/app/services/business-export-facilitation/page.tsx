import { notFound } from "next/navigation";
import { PageHero } from "@/components/shared/page-hero";
import { CtaBanner } from "@/components/shared/cta-banner";
import { ServiceDetailSection } from "@/components/sections/service-detail";
import { getServiceBySlug } from "@/lib/data/services";

export default function BusinessExportPage() {
  const service = getServiceBySlug("business-export-facilitation");
  if (!service) return notFound();

  return (
    <>
      <PageHero 
        eyebrow="Business & Export Facilitation" 
        title={service.title} 
        description="End-to-end export compliance, buyer connection, and market entry strategy for Ghanaian businesses going global."
        image="/images/page-hero/services.webp"
      />
      <ServiceDetailSection
        title={service.title}
        overview={service.overview}
        whoFor={service.whoFor}
        checklistPreview={service.checklistPreview}
        faqs={service.faqs}
        serviceType={service.type}
      />
      <CtaBanner />
    </>
  );
}
