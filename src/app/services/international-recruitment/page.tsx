import { notFound } from "next/navigation";
import { PageHero } from "@/components/shared/page-hero";
import { CtaBanner } from "@/components/shared/cta-banner";
import { ServiceDetailSection } from "@/components/sections/service-detail";
import { getServiceBySlug } from "@/lib/data/services";
import { buildServiceMetadata } from "@/lib/seo";

export const metadata = buildServiceMetadata(
  "International Recruitment & Career Placement",
  "Verified international recruitment pathways with ethical employer matching and relocation support.",
  "international-recruitment"
);

export default function InternationalRecruitmentPage() {
  const service = getServiceBySlug("international-recruitment");
  if (!service) return notFound();

  return (
    <>
      <PageHero 
        eyebrow="International Recruitment" 
        title={service.title} 
        description="Verified employer placements across the UK, Canada, Gulf States, and Europe — with full documentation and relocation support."
        image="/images/page-hero/contact.webp"
      />
      <ServiceDetailSection
        title={service.title}
        overview={service.overview}
        whoFor={service.whoFor}
        checklistPreview={service.checklistPreview}
        faqs={service.faqs}
        serviceType={service.type}
        backgroundImage="/images/services/jobs.webp"
      />
      <CtaBanner />
    </>
  );
}
