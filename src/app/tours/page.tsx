import { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, MapPin, Clock } from "lucide-react";

import { Container } from "@/components/layout/Container";
import { Section } from "@/components/layout/Section";
import { featuredTours } from "@/lib/mockData";
import { FlightPathBackground } from "@/components/brand/FlightPathBackground";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "Exclusive Tours",
  description: "Curated premium travel experiences."
};

export default function ToursHubPage() {
  return (
    <>
      <section className="relative pt-32 pb-20 md:pt-48 md:pb-32 bg-bb-navy overflow-hidden">
        <FlightPathBackground />
        <Container className="relative z-10 text-center">
          <span className="eyebrow mb-6 inline-block">Exclusive Packages</span>
          <h1 className="text-4xl md:text-6xl font-bold tracking-tight text-white mb-6">
            Curated escapes for <br className="hidden md:block" />
            <span className="text-bb-gold">global citizens.</span>
          </h1>
          <p className="text-lg md:text-xl text-slate-300 font-light max-w-2xl mx-auto">
            Beyond standard vacations. Experience culture, luxury, and perfectly choreographed itineraries across the world's most desired destinations.
          </p>
        </Container>
      </section>

      <Section variant="white" className="border-b border-slate-200">
        <Container>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {featuredTours.map((tour) => (
              <div
                key={tour.id}
                className="group relative bg-bb-navy rounded-[2rem] overflow-hidden flex flex-col justify-end shadow-[0_8px_30px_rgb(0,0,0,0.12)] hover:shadow-[0_20px_40px_rgba(0,0,0,0.25)] hover:-translate-y-1.5 transition-all duration-700 ease-out h-[480px]"
              >
                <div 
                  className="absolute inset-0 bg-cover bg-center transition-transform duration-1000 group-hover:scale-105 opacity-80"
                  style={{ backgroundImage: `url(${tour.image})` }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900/90 via-slate-900/40 to-transparent" />
                
                <div className="absolute top-6 right-6 bg-bb-gold/90 backdrop-blur-md px-4 py-1.5 rounded-full shadow-lg">
                  <span className="text-sm font-bold text-bb-navy">{tour.priceRange}</span>
                </div>

                <div className="relative z-10 p-8 flex flex-col h-full justify-end">
                  <div className="flex items-center gap-4 mb-4">
                    <span className="flex items-center gap-1.5 text-xs font-semibold text-bb-gold tracking-wide uppercase">
                      <MapPin className="w-3.5 h-3.5" /> {tour.destination}
                    </span>
                    <span className="flex items-center gap-1.5 text-xs font-semibold text-slate-300 tracking-wide uppercase">
                      <Clock className="w-3.5 h-3.5" /> {tour.durationDays} Days
                    </span>
                  </div>
                  
                  <h3 className="text-2xl font-bold text-white mb-2">{tour.title}</h3>
                  <p className="text-slate-300 font-light text-sm line-clamp-2 mb-6 opacity-0 group-hover:opacity-100 transition-opacity duration-500 h-0 group-hover:h-auto overflow-hidden">
                    {tour.shortDescription}
                  </p>

                  <Button asChild className="w-full bg-white/10 hover:bg-bb-gold text-white hover:text-bb-navy backdrop-blur-md border border-white/20 hover:border-bb-gold rounded-xl h-12 transition-all">
                    <Link href={`/tours/${tour.slug}`}>View Full Details</Link>
                  </Button>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-20 text-center max-w-2xl mx-auto bg-slate-50 border border-slate-200 rounded-[2rem] p-10">
            <h3 className="text-2xl font-bold text-bb-navy mb-4">Looking for a custom itinerary?</h3>
            <p className="text-slate-500 font-light mb-8">
              We specialize in creating bespoke travel plans tailored precisely to your family or corporate group's needs.
            </p>
            <Button asChild className="h-14 px-8 bg-bb-navy hover:bg-bb-gold text-white rounded-xl">
              <Link href="/start">Request Custom Tour <ArrowRight className="w-5 h-5 ml-2" /></Link>
            </Button>
          </div>
        </Container>
      </Section>
    </>
  );
}
