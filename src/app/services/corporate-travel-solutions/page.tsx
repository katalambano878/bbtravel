import { notFound } from "next/navigation";
import { PageHero } from "@/components/shared/page-hero";
import { CtaBanner } from "@/components/shared/cta-banner";
import { ServiceDetailSection } from "@/components/sections/service-detail";
import { getServiceBySlug } from "@/lib/data/services";
import { buildServiceMetadata } from "@/lib/seo";

export const metadata = buildServiceMetadata(
  "Corporate Travel Solutions",
  "Executive and team travel management with policy alignment, cost visibility, and operational support.",
  "corporate-travel-solutions"
);

export default function CorporateTravelSolutionsPage() {
  const service = getServiceBySlug("corporate-travel-solutions");
  if (!service) return notFound();

  return (
    <>
      <PageHero
        eyebrow="Corporate Travel Solutions"
        title={service.title}
        description="Structured executive and team travel coordination with policy alignment, cost control, and high reliability."
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
