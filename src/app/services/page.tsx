import { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, FileText, Briefcase, GraduationCap, Globe, Building, PlaneTakeoff, Hotel } from "lucide-react";
import Image from "next/image";

import { Container } from "@/components/layout/Container";
import { Section } from "@/components/layout/Section";
import { services } from "@/lib/mockData";
import { FlightPathBackground } from "@/components/brand/FlightPathBackground";

export const metadata: Metadata = {
  title: "Services",
  description: "Explore our premium travel, study, and recruitment consultancy services.",
  alternates: { canonical: "/services" },
  openGraph: {
    title: "Services | B.B. Travel Consult",
    description: "Explore our premium travel, study, and recruitment consultancy services.",
    url: "/services",
    images: [{ url: "/seo/og-image.png", width: 1024, height: 1024, alt: "B.B. Travel Consult" }]
  },
  twitter: {
    card: "summary_large_image",
    title: "Services | B.B. Travel Consult",
    description: "Explore our premium travel, study, and recruitment consultancy services.",
    images: ["/seo/og-image.png"]
  }
};

const iconMap: Record<string, React.ElementType> = {
  Passport: FileText,
  Briefcase: Briefcase,
  GraduationCap: GraduationCap,
  Globe: Globe,
  Building: Building,
  PlaneTakeoff: PlaneTakeoff,
  Hotel: Hotel
};

export default function ServicesHubPage() {
  return (
    <>
      {/* Services Hero */}
      <section className="relative pt-32 pb-20 md:pt-48 md:pb-32 bg-bb-navy overflow-hidden border-b border-white/10">
        <div className="absolute inset-0 z-0">
          <Image
            src="/images/page-hero/services.webp"
            alt="B.B. Travel Consult Services"
            fill
            priority
            className="object-cover object-center"
          />
          <div className="absolute inset-0 bg-black/35" />
          <div className="absolute inset-0 bg-gradient-to-t from-bb-navy via-transparent to-transparent opacity-90" />
        </div>

        <FlightPathBackground />
        <Container className="relative z-10 text-center">
          <span className="eyebrow mb-6 inline-block">Core Expertise</span>
          <h1 className="text-4xl md:text-6xl font-bold tracking-tight text-white mb-6">
            Global mobility, <br className="hidden md:block" />
            <span className="text-bb-gold">flawlessly executed.</span>
          </h1>
          <p className="text-lg md:text-xl text-slate-300 font-light max-w-2xl mx-auto">
            From complex visa appeals to sourcing global talent, our structured frameworks eliminate the guesswork.
          </p>
        </Container>
      </section>

      {/* Services Grid */}
      <Section variant="white" className="border-b border-slate-200">
        <Container>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {services.map((service) => {
              const Icon = iconMap[service.icon] || FileText;
              return (
                <Link
                  key={service.slug}
                  href={`/services/${service.slug}`}
                  className="group bg-white rounded-3xl p-8 border border-slate-200 shadow-sm hover:shadow-[0_20px_40px_rgba(0,0,0,0.08)] hover:-translate-y-1 transition-all duration-500 ease-out flex flex-col relative overflow-hidden"
                >
                  <div className="absolute top-0 right-0 w-32 h-32 bg-slate-50 rounded-bl-[100px] -z-10 group-hover:bg-bb-gold/5 transition-colors duration-500" />

                  <div className="w-14 h-14 bg-bb-navy/5 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-bb-gold group-hover:-translate-y-1 transition-all duration-300">
                    <Icon className="w-6 h-6 text-bb-navy group-hover:text-white transition-colors" />
                  </div>

                  <h3 className="text-2xl font-bold text-bb-navy mb-4 group-hover:text-bb-gold transition-colors">
                    {service.title}
                  </h3>

                  <p className="text-slate-500 font-light leading-relaxed mb-8 flex-1">
                    {service.description}
                  </p>

                  <div className="flex items-center text-sm font-semibold text-bb-navy mt-auto group-hover:text-bb-gold transition-colors">
                    View Methodology <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                  </div>
                </Link>
              );
            })}
          </div>
        </Container>
      </Section>
    </>
  );
}
