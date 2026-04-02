import { notFound } from "next/navigation";
import { PageHero } from "@/components/shared/page-hero";
import { CtaBanner } from "@/components/shared/cta-banner";
import { ServiceDetailSection } from "@/components/sections/service-detail";
import { getServiceBySlug } from "@/lib/data/services";

export default function StudyAbroadPage() {
  const service = getServiceBySlug("study-abroad");
  if (!service) return notFound();

  return (
    <>
      <PageHero 
        eyebrow="Study Abroad" 
        title={service.title} 
        description="From university selection to visa approval — a structured pathway to world-class education for ambitious Ghanaian students."
        image="/images/page-hero/about.webp"
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
