import { notFound } from "next/navigation";
import { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, Clock, MapPin, CheckCircle2, XCircle, Calendar, ArrowRight } from "lucide-react";

import { featuredTours, brand } from "@/lib/mockData";
import { Container } from "@/components/layout/Container";
import { Section } from "@/components/layout/Section";
import { Button } from "@/components/ui/button";
import { CtaBanner } from "@/components/shared/cta-banner";

export function generateStaticParams() {
  return featuredTours.map((t) => ({ slug: t.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const resolvedParams = await params;
  const tour = featuredTours.find((t) => t.slug === resolvedParams.slug);
  if (!tour) return { title: "Tour Not Found" };
  return {
    title: `${tour.title} | Premium Packages`,
    description: tour.shortDescription,
    alternates: {
      canonical: `/tours/${resolvedParams.slug}`
    },
    openGraph: {
      title: `${tour.title} | Premium Packages`,
      description: tour.shortDescription,
      url: `/tours/${resolvedParams.slug}`,
      images: [{ url: "/seo/og-image.png", width: 1024, height: 1024, alt: "B.B. Travel Consult" }]
    },
    twitter: {
      card: "summary_large_image",
      title: `${tour.title} | Premium Packages`,
      description: tour.shortDescription,
      images: ["/seo/og-image.png"]
    }
  };
}

export default async function TourPage({ params }: { params: Promise<{ slug: string }> }) {
  const resolvedParams = await params;
  const tour = featuredTours.find((t) => t.slug === resolvedParams.slug);
  
  if (!tour) notFound();

  return (
    <>
      {/* Dynamic Hero Section */}
      <div className="relative pt-32 pb-20 md:pt-48 md:pb-32 bg-bb-navy overflow-hidden">
        {/* Background Image with Overlay */}
        <div 
          className="absolute inset-0 bg-cover bg-center md:bg-fixed opacity-40"
          style={{ backgroundImage: `url(${tour.image})` }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-bb-navy via-bb-navy/80 to-transparent" />
        
        <Container className="relative z-10">
          <Link href="/tours" className="inline-flex items-center text-sm font-semibold text-bb-gold hover:text-white transition-colors mb-8">
            <ArrowLeft className="w-4 h-4 mr-2" /> Back to Tours
          </Link>
          
          <div className="max-w-3xl">
            <div className="flex items-center gap-3 mb-4 flex-wrap">
              <span className="eyebrow inline-block">Exclusive Package</span>
              <span className="flex items-center gap-1.5 text-xs font-bold bg-white/10 text-white border border-white/20 px-3 py-1 rounded-full uppercase tracking-wider backdrop-blur-md">
                <MapPin className="w-3.5 h-3.5 text-bb-gold" /> {tour.destination}
              </span>
              <span className="flex items-center gap-1.5 text-xs font-bold bg-white/10 text-white border border-white/20 px-3 py-1 rounded-full uppercase tracking-wider backdrop-blur-md">
                <Clock className="w-3.5 h-3.5 text-bb-gold" /> {tour.durationDays} Days
              </span>
            </div>
            
            <h1 className="text-4xl md:text-6xl font-bold tracking-tight text-white mb-6 leading-[1.1]">
              {tour.title}
            </h1>
            <p className="text-lg md:text-xl text-slate-300 font-light leading-relaxed mb-10 max-w-2xl">
              {tour.shortDescription}
            </p>
            
            <div className="flex flex-wrap items-center gap-4">
              <Button asChild className="h-14 px-8 text-base bg-bb-gold hover:bg-white text-bb-navy hover:text-bb-navy font-bold rounded-xl transition-all shadow-lg hover:shadow-[0_20px_40px_rgba(255,255,255,0.15)] hover:-translate-y-1 duration-700 ease-out">
                <Link href="/start">Request Booking</Link>
              </Button>
              <div className="bg-white/10 border border-white/20 backdrop-blur-md rounded-xl px-6 h-14 flex items-center justify-center">
                <span className="text-sm text-slate-300 font-light mr-2">Packages from</span>
                <span className="text-lg font-bold text-white tracking-wide">{tour.priceRange}</span>
              </div>
            </div>
          </div>
        </Container>
      </div>

      {/* Main Content */}
      <Section variant="neutral" className="py-20 md:py-28 border-b border-slate-200">
        <Container>
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 lg:gap-20">
            
            {/* Left Col - Overview & Itinerary */}
            <div className="lg:col-span-8 space-y-16">
              
              {/* Overview */}
              <div>
                <h2 className="text-3xl font-bold text-bb-navy mb-6">Tour Overview</h2>
                <p className="text-lg text-slate-600 font-light leading-relaxed">
                  {tour.overview}
                </p>
                <div className="mt-8 flex flex-wrap gap-3">
                  {tour.highlights.map((highlight, idx) => (
                    <span key={idx} className="bg-bb-gold/10 text-bb-navy px-4 py-2 rounded-lg text-sm font-semibold border border-bb-gold/20 flex items-center gap-2">
                       <CheckCircle2 className="w-4 h-4 text-bb-gold" /> {highlight}
                    </span>
                  ))}
                </div>
              </div>

              {/* Inclusions & Exclusions */}
              <div className="grid md:grid-cols-2 gap-8">
                <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-sm">
                  <h3 className="text-xl font-bold text-bb-navy mb-6 flex items-center gap-2">
                    <CheckCircle2 className="w-5 h-5 text-emerald-500" /> What's Included
                  </h3>
                  <ul className="space-y-4">
                    {tour.included?.map((item, i) => (
                      <li key={i} className="flex gap-3 text-sm text-slate-600 font-medium">
                        <span className="text-emerald-500 shrink-0 mt-0.5">•</span> {item}
                      </li>
                    ))}
                  </ul>
                </div>
                
                <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-sm">
                  <h3 className="text-xl font-bold text-bb-navy mb-6 flex items-center gap-2">
                    <XCircle className="w-5 h-5 text-red-400" /> Not Included
                  </h3>
                  <ul className="space-y-4">
                    {tour.excluded?.map((item, i) => (
                      <li key={i} className="flex gap-3 text-sm text-slate-500 font-medium">
                        <span className="text-red-400 shrink-0 mt-0.5">•</span> {item}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Day by Day Itinerary */}
              <div>
                <h2 className="text-3xl font-bold text-bb-navy mb-8">Daily Itinerary</h2>
                <div className="space-y-6 relative before:absolute before:inset-0 before:left-8 md:before:left-10 before:w-[2px] before:bg-slate-200 before:-z-10">
                  {tour.itinerary?.map((item, i) => (
                    <div key={i} className="flex gap-6 md:gap-8 group">
                      <div className="w-16 md:w-20 shrink-0 flex flex-col items-center mt-1">
                        <div className="w-10 h-10 rounded-full bg-bb-navy text-bb-gold flex items-center justify-center font-bold text-sm shadow-[0_0_0_4px_white] transition-transform duration-500 group-hover:scale-110">
                          {item.day}
                        </div>
                        <span className="text-[10px] uppercase font-bold tracking-widest text-slate-400 mt-2">Day</span>
                      </div>
                      <div className="bg-white rounded-2xl p-6 md:p-8 border border-slate-200 shadow-sm flex-1 group-hover:shadow-[0_20px_40px_rgba(0,0,0,0.06)] group-hover:-translate-y-1 transition-all duration-700 ease-out">
                        <h4 className="text-lg font-bold text-bb-navy mb-2">{item.title}</h4>
                        <p className="text-slate-600 text-sm font-light leading-relaxed">{item.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              
            </div>

            {/* Right Col - Sticky Sidebar / Booking */}
            <div className="lg:col-span-4">
              <div className="sticky top-32">
                <div className="bg-bb-navy rounded-3xl p-8 shadow-premium text-white relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-64 h-64 bg-bb-gold/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
                  
                  <div className="relative z-10">
                    <h3 className="text-2xl font-bold mb-2">Book this Experience</h3>
                    <p className="text-slate-400 text-sm font-light mb-8">
                      Secure your package today. One of our travel concierges will reach out within 24 hours to customize your dates.
                    </p>
                    
                    <div className="space-y-4 mb-8">
                      <div className="flex justify-between items-center py-3 border-b border-white/10">
                        <span className="text-slate-400 text-sm">Tour Code</span>
                        <span className="font-bold text-sm uppercase">{tour.slug.split('-')[0]}-{new Date().getFullYear()}</span>
                      </div>
                      <div className="flex justify-between items-center py-3 border-b border-white/10">
                        <span className="text-slate-400 text-sm">Availability</span>
                        <span className="font-semibold text-emerald-400 text-sm flex items-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5" /> Open</span>
                      </div>
                      <div className="flex justify-between items-center py-3 border-b border-white/10">
                        <span className="text-slate-400 text-sm">Starting Price</span>
                        <span className="font-bold text-bb-gold text-lg">{tour.priceRange}</span>
                      </div>
                    </div>
                    
                    <Button asChild className="w-full h-14 bg-bb-gold hover:bg-white text-bb-navy hover:text-bb-navy font-bold rounded-xl text-base mb-4 transition-all">
                      <Link href="/start">
                        Start Booking <ArrowRight className="w-4 h-4 ml-2" />
                      </Link>
                    </Button>
                    
                    <p className="text-center text-xs text-slate-500 font-light">
                      Or contact our travel desk directly at <br />
                      <a href={`https://wa.me/${brand.whatsapp.replace(/\D/g, "").replace(/^0/, "233")}`} className="hover:text-bb-gold transition-colors underline underline-offset-4 decoration-white/20 mt-1 inline-block">WhatsApp Us</a>
                    </p>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </Container>
      </Section>
      
      <CtaBanner />
    </>
  );
}
