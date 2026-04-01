import { notFound } from "next/navigation";
import Image from "next/image";

import { getPublicTours } from "@/lib/data/public-content";
import { PageHero } from "@/components/shared/page-hero";
import { CtaBanner } from "@/components/shared/cta-banner";

export async function generateStaticParams() {
  const tours = await getPublicTours();
  return tours.map((tour) => ({ slug: tour.slug }));
}

export default async function TravelDealDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const tours = await getPublicTours();
  const tour = tours.find((item) => item.slug === slug);
  if (!tour) return notFound();

  return (
    <>
      <PageHero eyebrow="Tour Detail" title={tour.title} description={tour.summary} />
      <section className="section-shell">
        <div className="relative mb-8 h-[420px] overflow-hidden rounded-3xl">
          <Image src={tour.cover} alt={tour.title} fill className="object-cover" />
        </div>
        <div className="grid gap-8 lg:grid-cols-[1.2fr_0.8fr]">
          <div>
            <h2 className="mb-4 text-2xl font-semibold text-bb-navy">Itinerary highlights</h2>
            <ul className="space-y-3">
              {tour.itinerary.map((item) => (
                <li key={item} className="rounded-xl border border-slate-200 bg-white p-4 text-sm text-slate-700">
                  {item}
                </li>
              ))}
            </ul>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white p-6">
            <p className="text-xs font-semibold uppercase tracking-wide text-bb-gold">Package summary</p>
            <p className="mt-3 text-sm text-slate-600">Duration: {tour.duration}</p>
            <p className="mt-2 text-sm text-slate-600">Destination: {tour.destination}</p>
            <p className="mt-2 text-lg font-semibold text-bb-navy">From ${tour.price}</p>
          </div>
        </div>
      </section>
      <CtaBanner />
    </>
  );
}
