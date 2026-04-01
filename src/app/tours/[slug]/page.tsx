import { notFound } from "next/navigation";
import { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, CheckCircle2, Clock, MapPin, Calendar, Users, DollarSign, Image as ImageIcon } from "lucide-react";

import { featuredTours, brand } from "@/lib/mockData";
import { Container } from "@/components/layout/Container";
import { Section } from "@/components/layout/Section";
import { Button } from "@/components/ui/button";

export function generateStaticParams() {
  return featuredTours.map((t) => ({ slug: t.slug }));
}

export function generateMetadata({ params }: { params: { slug: string } }): Metadata {
  const tour = featuredTours.find((t) => t.slug === params.slug);
  if (!tour) return { title: "Tour Not Found" };
  return {
    title: `${tour.title} | Premium Tours`,
    description: tour.shortDescription
  };
}

export default function TourPage({ params }: { params: { slug: string } }) {
  const tour = featuredTours.find((t) => t.slug === params.slug);
  if (!tour) notFound();

  return (
    <>
      <div className="relative pt-32 pb-20 md:pt-48 md:pb-32 overflow-hidden flex items-end min-h-[70vh]">
        <div 
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${tour.image})` }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/60 to-slate-900/30" />
        
        <Container className="relative z-10 w-full">
          <Link href="/tours" className="inline-flex items-center text-sm font-semibold text-bb-gold hover:text-white transition-colors mb-8">
            <ArrowLeft className="w-4 h-4 mr-2" /> Back to All Tours
          </Link>
          
          <div className="max-w-4xl">
            <div className="flex flex-wrap items-center gap-4 mb-6">
              <span className="inline-flex items-center px-4 py-1.5 rounded-full bg-bb-sky/20 border border-bb-sky/30 text-white text-xs font-semibold uppercase tracking-wider backdrop-blur-md">
                <MapPin className="w-4 h-4 mr-2" /> {tour.destination}
              </span>
              <span className="inline-flex items-center px-4 py-1.5 rounded-full bg-bb-gold/20 border border-bb-gold/30 text-white text-xs font-semibold uppercase tracking-wider backdrop-blur-md">
                <Clock className="w-4 h-4 mr-2" /> {tour.durationDays} Days
              </span>
            </div>
            
            <h1 className="text-4xl md:text-6xl font-bold tracking-tight text-white mb-6 leading-[1.1]">
              {tour.title}
            </h1>
            <p className="text-lg md:text-xl text-slate-300 font-light leading-relaxed max-w-2xl">
              {tour.shortDescription}
            </p>
          </div>
        </Container>
      </div>

      {/* Overview Strip */}
      <div className="bg-white border-b border-slate-200 py-6 sticky top-20 z-40 shadow-sm">
        <Container>
          <div className="flex flex-wrap items-center justify-between gap-6">
            <div className="flex items-center gap-8">
              <div>
                <p className="text-xs text-slate-400 uppercase tracking-widest font-semibold">Pricing</p>
                <p className="font-bold text-bb-navy text-xl">{tour.priceRange}</p>
              </div>
              <div className="hidden sm:block">
                <p className="text-xs text-slate-400 uppercase tracking-widest font-semibold">Availability</p>
                <p className="font-medium text-slate-600 flex items-center gap-1.5">
                  <Calendar className="w-4 h-4 text-bb-gold" /> Year-round
                </p>
              </div>
            </div>
            <Button asChild className="h-12 px-8 bg-bb-gold hover:bg-bb-navy text-bb-navy hover:text-white font-bold rounded-xl transition-all">
              <Link href="/start">Request Booking</Link>
            </Button>
          </div>
        </Container>
      </div>

      {/* Main Content */}
      <Section variant="neutral" className="border-b border-slate-200">
        <Container>
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-16">
            
            {/* Left Col - Itinerary & Details */}
            <div className="lg:col-span-8 space-y-16">
              
              {/* Highlights */}
              <div>
                <h3 className="text-2xl font-bold text-bb-navy mb-8 flex items-center gap-3">
                  <CheckCircle2 className="w-6 h-6 text-bb-gold" /> Experience Highlights
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {tour.highlights.map((highlight, i) => (
                    <div key={i} className="flex gap-3 bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
                      <div className="w-8 h-8 rounded-full bg-bb-gold/10 flex items-center justify-center shrink-0">
                        <CheckCircle2 className="w-4 h-4 text-bb-gold" />
                      </div>
                      <span className="text-slate-600 font-medium text-sm mt-1">{highlight}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Itinerary */}
              <div>
                <h3 className="text-2xl font-bold text-bb-navy mb-8">Daily Itinerary Overview</h3>
                <div className="bg-white rounded-[2rem] p-8 md:p-10 border border-slate-200 shadow-sm">
                  <div className="space-y-8 relative before:absolute before:inset-0 before:ml-[15px] before:h-full before:w-[2px] before:bg-slate-100">
                    
                    {Array.from({ length: tour.durationDays }).map((_, i) => (
                      <div key={i} className="relative z-10 flex gap-6">
                        <div className="w-8 h-8 rounded-full bg-bb-navy flex items-center justify-center shrink-0 ring-4 ring-white shadow-sm mt-1">
                          <span className="text-bb-gold text-xs font-bold">D{i + 1}</span>
                        </div>
                        <div className="flex-1 pb-6 border-b border-slate-100 last:border-0 last:pb-0">
                          <h4 className="font-bold text-bb-navy text-lg mb-2">
                            {i === 0 ? "Arrival & Private Transfer" : i === tour.durationDays - 1 ? "Departure & Farewell" : "Guided Exploration & Leisure"}
                          </h4>
                          <p className="text-slate-500 font-light leading-relaxed mb-4">
                            Detailed daily breakdown is provided upon consultation to protect our intellectual property and ensure a bespoke approach. Expect premium execution.
                          </p>
                          {i === 1 && (
                            <div className="w-full h-32 bg-slate-100 rounded-xl flex items-center justify-center text-slate-400 border border-slate-200/50">
                              <ImageIcon className="w-6 h-6 mr-2 opacity-50" /> Secure Itinerary View
                            </div>
                          )}
                        </div>
                      </div>
                    ))}

                  </div>
                </div>
              </div>

            </div>

            {/* Right Col - Inclusions & Form Sidebar */}
            <div className="lg:col-span-4 relative">
              <div className="sticky top-40 space-y-6">
                
                {/* Inclusions Card */}
                <div className="bg-white rounded-3xl p-8 shadow-premium border border-slate-200">
                  <h3 className="text-xl font-bold text-bb-navy mb-6 pb-4 border-b border-slate-100">
                    What's Included
                  </h3>
                  <ul className="space-y-4">
                    <li className="flex gap-3 text-slate-600 text-sm">
                      <CheckCircle2 className="w-5 h-5 text-bb-sky shrink-0" /> Premium Accommodation
                    </li>
                    <li className="flex gap-3 text-slate-600 text-sm">
                      <CheckCircle2 className="w-5 h-5 text-bb-sky shrink-0" /> Dedicated Chauffeur/Transfers
                    </li>
                    <li className="flex gap-3 text-slate-600 text-sm">
                      <CheckCircle2 className="w-5 h-5 text-bb-sky shrink-0" /> Expert English-speaking Guide
                    </li>
                    <li className="flex gap-3 text-slate-600 text-sm">
                      <CheckCircle2 className="w-5 h-5 text-bb-sky shrink-0" /> Curated Dining Experiences
                    </li>
                    <li className="flex gap-3 text-slate-600 text-sm">
                      <CheckCircle2 className="w-5 h-5 text-bb-sky shrink-0" /> Visa Document Verification
                    </li>
                  </ul>
                </div>

                {/* Exclusions Card */}
                <div className="bg-slate-50 rounded-3xl p-8 border border-slate-200">
                  <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-4">
                    Not Included
                  </h3>
                  <ul className="space-y-3">
                    <li className="text-slate-500 text-sm flex gap-2"><span className="text-slate-300">-</span> International Flights (quoted separately)</li>
                    <li className="text-slate-500 text-sm flex gap-2"><span className="text-slate-300">-</span> Personal Expenses & Souvenirs</li>
                    <li className="text-slate-500 text-sm flex gap-2"><span className="text-slate-300">-</span> Consulate Visa Fees</li>
                  </ul>
                </div>

              </div>
            </div>

          </div>
        </Container>
      </Section>
    </>
  );
}
