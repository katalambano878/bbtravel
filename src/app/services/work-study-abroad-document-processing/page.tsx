import { notFound } from "next/navigation";
import { PageHero } from "@/components/shared/page-hero";
import { CtaBanner } from "@/components/shared/cta-banner";
import { ServiceDetailSection } from "@/components/sections/service-detail";
import { getServiceBySlug } from "@/lib/data/services";
import { buildServiceMetadata } from "@/lib/seo";

export const metadata = buildServiceMetadata(
  "Work & Study Abroad Document Processing",
  "Comprehensive document processing support for work and study pathway readiness.",
  "work-study-abroad-document-processing"
);

export default function WorkStudyAbroadDocumentProcessingPage() {
  const service = getServiceBySlug("work-study-abroad-document-processing");
  if (!service) return notFound();

  return (
    <>
      <PageHero
        eyebrow="Work & Study Abroad Documents"
        title={service.title}
        description="Structured document processing support for work and study applications, including consistency and readiness checks."
        image="/images/page-hero/services.webp"
      />
      <ServiceDetailSection
        title={service.title}
        overview={service.overview}
        whoFor={service.whoFor}
        checklistPreview={service.checklistPreview}
        faqs={service.faqs}
        serviceType={service.type}
        backgroundImage="/images/services/study.webp"
      />
      <CtaBanner />
    </>
  );
}
