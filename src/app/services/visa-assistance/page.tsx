import { notFound } from "next/navigation";
import { PageHero } from "@/components/shared/page-hero";
import { CtaBanner } from "@/components/shared/cta-banner";
import { ServiceDetailSection } from "@/components/sections/service-detail";
import { getServiceBySlug } from "@/lib/data/services";

export default function VisaAssistancePage() {
  const service = getServiceBySlug("visa-assistance");
  if (!service) return notFound();

  return (
    <>
      <PageHero 
        eyebrow="Visa Assistance" 
        title={service.title} 
        description="Embassy-aligned strategies that eliminate guesswork and maximize your approval probability across 30+ countries."
        image="/images/page-hero/about.webp"
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
