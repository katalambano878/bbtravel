import { notFound } from "next/navigation";
import { PageHero } from "@/components/shared/page-hero";
import { CtaBanner } from "@/components/shared/cta-banner";
import { ServiceDetailSection } from "@/components/sections/service-detail";
import { getServiceBySlug } from "@/lib/data/services";

export default function InternationalRecruitmentPage() {
  const service = getServiceBySlug("international-recruitment");
  if (!service) return notFound();

  return (
    <>
      <PageHero eyebrow="International Recruitment" title={service.title} description={service.overview} />
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
