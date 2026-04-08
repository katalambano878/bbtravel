import { notFound } from "next/navigation";
import { PageHero } from "@/components/shared/page-hero";
import { CtaBanner } from "@/components/shared/cta-banner";
import { ServiceDetailSection } from "@/components/sections/service-detail";
import { getServiceBySlug } from "@/lib/data/services";
import { buildServiceMetadata } from "@/lib/seo";

export const metadata = buildServiceMetadata(
  "Hotel Booking & Reservation Service",
  "Verified hotel booking support with policy clarity, destination fit, and stay coordination.",
  "hotel-booking-reservation"
);

export default function HotelBookingReservationPage() {
  const service = getServiceBySlug("hotel-booking-reservation");
  if (!service) return notFound();

  return (
    <>
      <PageHero
        eyebrow="Hotel Booking & Reservation"
        title={service.title}
        description="Trusted hotel selection, transparent reservation terms, and seamless stay coordination for local and international travel."
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
