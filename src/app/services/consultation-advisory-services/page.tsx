import { notFound } from "next/navigation";
import { PageHero } from "@/components/shared/page-hero";
import { CtaBanner } from "@/components/shared/cta-banner";
import { ServiceDetailSection } from "@/components/sections/service-detail";
import { getServiceBySlug } from "@/lib/data/services";
import { buildServiceMetadata } from "@/lib/seo";

export const metadata = buildServiceMetadata(
  "Consultation & Advisory Services",
  "Expert strategic consultations to define the right travel and immigration pathway.",
  "consultation-advisory-services"
);

export default function ConsultationAdvisoryServicesPage() {
  const service = getServiceBySlug("consultation-advisory-services");
  if (!service) return notFound();

  return (
    <>
      <PageHero
        eyebrow="Consultation & Advisory"
        title={service.title}
        description="Book strategic advisory sessions to assess readiness, reduce risk, and choose the right travel or immigration path."
        image="/images/page-hero/about.webp"
      />
      <ServiceDetailSection
        title={service.title}
        overview={service.overview}
        whoFor={service.whoFor}
        checklistPreview={service.checklistPreview}
        faqs={service.faqs}
        serviceType={service.type}
        backgroundImage="/images/services/visa.webp"
      />
      <CtaBanner />
    </>
  );
}
