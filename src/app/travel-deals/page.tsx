import { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { PageHero } from "@/components/shared/page-hero";
import { getPublicTours } from "@/lib/data/public-content";
import { Card, CardContent } from "@/components/ui/card";

export const metadata: Metadata = {
  title: "Travel Deals",
  description: "Premium tour packages curated for comfort, confidence, and memorable travel experiences.",
  alternates: { canonical: "/travel-deals" },
  openGraph: {
    title: "Travel Deals | B.B. Travel Consult",
    description: "Premium tour packages curated for comfort, confidence, and memorable travel experiences.",
    url: "/travel-deals",
    images: [{ url: "/seo/og-image.png", width: 1024, height: 1024, alt: "B.B. Travel Consult" }]
  },
  twitter: {
    card: "summary_large_image",
    title: "Travel Deals | B.B. Travel Consult",
    description: "Premium tour packages curated for comfort, confidence, and memorable travel experiences.",
    images: ["/seo/og-image.png"]
  }
};

export default async function TravelDealsPage() {
  const tours = await getPublicTours();

  return (
    <>
      <PageHero
        eyebrow="Travel Deals"
        title="Premium tour packages curated for comfort and confidence."
        description="Explore featured destinations and personalized experiences for solo travelers, families, and groups."
      />
      <section className="section-shell">
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {tours.map((tour) => (
            <Card key={tour.id} className="overflow-hidden">
              <div className="relative h-52">
                <Image src={tour.cover} alt={tour.title} fill className="object-cover" />
              </div>
              <CardContent className="space-y-3 p-6">
                <p className="text-xs font-semibold uppercase tracking-wide text-bb-gold">{tour.destination}</p>
                <h2 className="text-xl font-semibold text-bb-navy">{tour.title}</h2>
                <p className="text-sm text-slate-600">{tour.summary}</p>
                <div className="flex items-center justify-between text-sm">
                  <span className="font-semibold text-bb-navy">${tour.price}</span>
                  <Link href={`/travel-deals/${tour.slug}`} className="text-bb-sky">
                    View details
                  </Link>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>
    </>
  );
}
