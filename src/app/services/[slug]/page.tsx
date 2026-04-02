import { notFound } from "next/navigation";
import { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, CheckCircle2, Clock, DollarSign, FileText, ArrowRight } from "lucide-react";

import { services, brand } from "@/lib/mockData";
import { Container } from "@/components/layout/Container";
import { Section } from "@/components/layout/Section";
import { Button } from "@/components/ui/button";

export function generateStaticParams() {
  return services.map((s) => ({ slug: s.slug }));
}

export function generateMetadata({ params }: { params: { slug: string } }): Metadata {
  const service = services.find((s) => s.slug === params.slug);
  if (!service) return { title: "Service Not Found" };
  return {
    title: service.title,
    description: service.shortDescription
  };
}

export default function ServicePage({ params }: { params: { slug: string } }) {
  const service = services.find((s) => s.slug === params.slug);
  if (!service) notFound();

  return (
    <>
      <div className="bg-bb-navy pb-8 pt-32">
        <Container>
          <Link href="/services" className="inline-flex items-center text-sm font-semibold text-bb-gold hover:text-white transition-colors mb-8">
            <ArrowLeft className="w-4 h-4 mr-2" /> Back to Services
          </Link>
          
          <div className="max-w-3xl">
            <span className="eyebrow inline-block mb-4">Service Methodology</span>
            <h1 className="text-4xl md:text-6xl font-bold tracking-tight text-white mb-6 leading-[1.1]">
              Navigating the <br />
              <span className="text-bb-gold">{service.title}</span> pathway.
            </h1>
            <p className="text-lg text-slate-300 font-light leading-relaxed mb-10">
              {service.description}
            </p>
            
            <div className="flex flex-wrap gap-4">
              <Button asChild className="h-14 px-8 text-base bg-bb-gold hover:bg-white text-bb-navy hover:text-bb-navy font-bold rounded-xl transition-colors">
                <Link href="/start">Begin Application Overview</Link>
              </Button>
            </div>
          </div>
        </Container>
      </div>

      {/* Overview Strip */}
      <div className="bg-white border-b border-slate-200 py-8">
        <Container>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 divide-y md:divide-y-0 md:divide-x divide-slate-100">
            <div className="flex items-center gap-4 pt-4 md:pt-0">
              <div className="w-12 h-12 bg-bb-navy/5 rounded-full flex items-center justify-center shrink-0">
                <Clock className="w-5 h-5 text-bb-navy" />
              </div>
              <div>
                <p className="text-xs text-slate-400 uppercase tracking-widest font-semibold">Duration</p>
                <p className="font-semibold text-bb-navy">{service.processTime}</p>
              </div>
            </div>
            
            <div className="flex items-center gap-4 pt-4 md:pt-0 md:pl-6">
              <div className="w-12 h-12 bg-bb-gold/10 rounded-full flex items-center justify-center shrink-0">
                <DollarSign className="w-5 h-5 text-bb-gold" />
              </div>
              <div>
                <p className="text-xs text-slate-400 uppercase tracking-widest font-semibold">Consultation Fee</p>
                <p className="font-semibold text-bb-navy">From {service.priceRange}</p>
              </div>
            </div>

            <div className="flex items-center gap-4 pt-4 md:pt-0 md:pl-6">
              <div className="w-12 h-12 bg-bb-sky/10 rounded-full flex items-center justify-center shrink-0">
                <FileText className="w-5 h-5 text-bb-sky" />
              </div>
              <div>
                <p className="text-xs text-slate-400 uppercase tracking-widest font-semibold">Success Probability</p>
                <p className="font-semibold text-bb-navy">Optimized strictly by law.</p>
              </div>
            </div>
          </div>
        </Container>
      </div>

      {/* Main Content */}
      <Section variant="neutral" className="border-b border-slate-200">
        <Container>
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-16">
            
            {/* Left Col - Context & Benefits */}
            <div className="lg:col-span-7 space-y-12">
              <div>
                <h3 className="text-2xl font-bold text-bb-navy mb-6">Strategic Imperative</h3>
                <p className="text-slate-500 font-light leading-relaxed mb-6">
                  {service.longDetails}
                </p>
              </div>

              <div>
                <h3 className="text-2xl font-bold text-bb-navy mb-6">Structural Advantages</h3>
                <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-sm">
                  <ul className="space-y-4">
                    {service.benefits.map((benefit, i) => (
                      <li key={i} className="flex gap-4">
                        <CheckCircle2 className="w-6 h-6 text-bb-gold shrink-0 bg-bb-gold/10 rounded-full" />
                        <span className="text-slate-600 font-medium">{benefit}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>

            {/* Right Col - Timeline */}
            <div className="lg:col-span-5 relative">
              <div className="sticky top-32">
                <div className="bg-bb-navy text-white rounded-3xl p-8 lg:p-10 shadow-premium">
                  <h3 className="text-xl font-bold mb-8 flex items-center gap-3 border-b border-white/10 pb-4">
                    <Clock className="w-5 h-5 text-bb-gold" /> Step-by-Step Execution
                  </h3>
                  
                  <div className="space-y-6 relative before:absolute before:inset-0 before:ml-[11px] before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-[2px] before:bg-white/10">
                    <div className="absolute left-[11px] top-4 bottom-4 w-[2px] bg-white/10" />
                    
                    {service.timeline.map((step, i) => (
                      <div key={i} className="relative z-10 flex gap-6">
                        <div className="w-6 h-6 rounded-full bg-bb-gold flex items-center justify-center shrink-0 ring-4 ring-bb-navy mt-1">
                          <span className="text-bb-navy text-[10px] font-bold">{i + 1}</span>
                        </div>
                        <div>
                          <p className="font-semibold text-white">{step}</p>
                          <p className="text-sm font-light text-slate-400 mt-1">
                            {i === service.timeline.length - 1 ? "Final Outcome" : "Action Step"}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="mt-10 pt-6 border-t border-white/10">
                    <p className="text-xs text-slate-400 font-light mb-4">
                      Timelines are estimated based on standard embassy or corporate processing speeds and are subject to change.
                    </p>
                    <Button variant="secondary" asChild className="w-full h-12 bg-transparent border border-white/20 text-white hover:bg-white hover:text-bb-navy rounded-xl">
                      <Link href={`https://wa.me/${brand.whatsapp.replace(/\D/g, "")}`} target="_blank" rel="noreferrer">
                        Discuss timelines with our team
                      </Link>
                    </Button>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </Container>
      </Section>
    </>
  );
}
