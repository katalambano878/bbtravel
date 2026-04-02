import { Metadata } from "next";
import { ArrowRight, Trophy, AlertCircle, ShieldCheck, TrendingUp, Users, Globe, CheckCircle } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

import { Container } from "@/components/layout/Container";
import { Section } from "@/components/layout/Section";
import { caseStudies } from "@/lib/mockData";
import { Button } from "@/components/ui/button";
import { brand } from "@/lib/data/brand";

export const metadata: Metadata = {
  title: "Client Results & Case Studies | B.B. Travel Consult",
  description: "Explore detailed case studies of successfully executed visa applications, international recruitments, study placements, and business export facilitations by B.B. Travel Consult."
};

const stats = [
  { icon: Users, value: "2,500+", label: "Clients Served" },
  { icon: Globe, value: "30+", label: "Countries Covered" },
  { icon: TrendingUp, value: "94%", label: "First-Attempt Success Rate" },
  { icon: CheckCircle, value: "500+", label: "Visas Processed" },
];

export default function SuccessPage() {
  return (
    <>
      {/* Hero Section with Background Image */}
      <Section variant="navy" className="pt-32 pb-20 md:pt-48 md:pb-32 relative overflow-hidden border-b border-white/10">
        <div className="absolute inset-0 z-0">
          <Image
            src="/images/page-hero/services.png"
            alt="B.B. Travel Consult Success Stories"
            fill
            priority
            className="object-cover object-center"
          />
          <div className="absolute inset-0 bg-black/35" />
          <div className="absolute inset-0 bg-gradient-to-t from-bb-navy via-transparent to-transparent opacity-90" />
        </div>

        <Container className="relative z-10 text-center">
          <span className="eyebrow mb-6 inline-block text-bb-gold">Proven Track Record</span>
          <h1 className="text-4xl md:text-6xl font-bold tracking-tight text-white mb-6">
            Real clients. <br className="hidden md:block" />
            <span className="text-bb-gold">
              Real outcomes.
            </span>
          </h1>
          <p className="text-lg md:text-xl text-slate-300 font-light max-w-2xl mx-auto">
            Every case study below represents a real person or business who trusted us with their global ambitions. Names have been changed for privacy, but every detail is drawn from actual client engagements.
          </p>
        </Container>
      </Section>

      {/* Stats Bar */}
      <Section variant="white" className="py-12 border-b border-slate-200">
        <Container>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-12">
            {stats.map((stat) => {
              const Icon = stat.icon;
              return (
                <div key={stat.label} className="text-center">
                  <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-bb-navy/5 mb-4">
                    <Icon className="w-5 h-5 text-bb-gold" />
                  </div>
                  <p className="text-3xl md:text-4xl font-extrabold text-bb-navy tracking-tight">{stat.value}</p>
                  <p className="text-sm text-slate-500 font-medium mt-1">{stat.label}</p>
                </div>
              );
            })}
          </div>
        </Container>
      </Section>

      {/* Case Studies Grid */}
      <Section variant="white" className="border-b border-slate-200 py-20 md:py-28">
        <Container>
          <div className="text-center max-w-3xl mx-auto mb-16">
            <p className="text-sm font-bold uppercase tracking-widest text-bb-gold mb-4">Case Studies</p>
            <h2 className="text-3xl md:text-4xl font-extrabold text-bb-navy tracking-tight mb-4">
              Detailed client trajectories
            </h2>
            <p className="text-lg text-slate-500 font-light">
              Each case follows the same structure: the challenge the client faced, exactly how we intervened, and the measurable outcome delivered.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 md:gap-10">
            {caseStudies.map((study) => (
              <div
                key={study.id}
                className="bg-white rounded-[2rem] p-8 lg:p-10 border border-slate-200 shadow-sm transition-all duration-300 flex flex-col group relative overflow-hidden hover:shadow-lg hover:-translate-y-1"
              >
                <div className="mb-6">
                  <span className="inline-block px-3 py-1 rounded-full bg-bb-navy/5 text-bb-navy text-xs font-bold uppercase tracking-wide mb-4 border border-bb-navy/10">
                    {study.goal}
                  </span>
                  <h3 className="text-xl font-bold text-bb-navy leading-snug">
                    {study.client}
                  </h3>
                </div>

                <div className="space-y-5 flex-1">
                  <div>
                    <h4 className="flex items-center gap-2 text-xs font-semibold text-slate-400 mb-2 uppercase tracking-wide">
                      <AlertCircle className="w-3.5 h-3.5" /> The Challenge
                    </h4>
                    <p className="text-slate-600 text-sm leading-relaxed font-light pl-5 border-l-2 border-slate-100">
                      {study.challenges}
                    </p>
                  </div>
                  
                  <div>
                    <h4 className="flex items-center gap-2 text-xs font-semibold text-bb-navy mb-2 uppercase tracking-wide">
                      <ShieldCheck className="w-3.5 h-3.5 text-bb-gold" /> Our Intervention
                    </h4>
                    <p className="text-slate-600 text-sm leading-relaxed font-light pl-5 border-l-2 border-bb-gold/20">
                      {study.howWeHelped}
                    </p>
                  </div>

                  <div className="pt-4 border-t border-slate-100 mt-auto">
                    <h4 className="flex items-center gap-2 text-xs font-semibold text-bb-navy mb-2 uppercase tracking-wide">
                      <Trophy className="w-3.5 h-3.5 text-bb-sky" /> The Outcome
                    </h4>
                    <p className="text-bb-navy font-medium text-sm leading-relaxed bg-bb-sky/5 p-4 rounded-xl border border-bb-sky/10">
                      {study.outcome}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Confidentiality Note */}
          <div className="mt-12 text-center">
            <div className="inline-flex items-center gap-3 px-6 py-4 bg-slate-50 rounded-2xl border border-slate-200">
              <ShieldCheck className="w-5 h-5 text-bb-navy shrink-0" />
              <p className="text-sm text-slate-600 font-light">
                Client names have been modified for confidentiality. All case details, timelines, and outcomes are factual and drawn from our case management records.
              </p>
            </div>
          </div>
        </Container>
      </Section>

      {/* Bottom CTA */}
      <Section variant="navy" className="relative py-20 md:py-28 text-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          <Image
            src="/images/page-hero/about.png"
            alt="Start your journey with B.B. Travel Consult"
            fill
            className="object-cover object-center"
          />
          <div className="absolute inset-0 bg-black/50" />
          <div className="absolute inset-0 bg-gradient-to-t from-bb-navy via-bb-navy/80 to-transparent" />
        </div>
        <Container className="relative z-10">
          <p className="text-sm font-bold uppercase tracking-widest text-bb-gold mb-4">Your Turn</p>
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
            Your success story starts with a single conversation.
          </h2>
          <p className="text-slate-300 font-light text-lg mb-10 max-w-xl mx-auto">
            Whether it's a visa, a career move, a study placement, or a business expansion — we've done it before, and we'll do it for you.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button asChild className="h-14 px-8 bg-bb-gold text-bb-navy hover:bg-white text-base rounded-xl font-bold">
              <Link href="/start">Begin Your Assessment <ArrowRight className="w-5 h-5 ml-2" /></Link>
            </Button>
            <Button variant="secondary" asChild className="h-14 px-8 bg-white/5 backdrop-blur-md border border-white/10 text-white hover:bg-white/10 text-base rounded-xl font-semibold">
              <a href={`https://wa.me/${brand.whatsapp.replace(/\D/g, "")}`} target="_blank" rel="noreferrer">
                Speak to an Expert
              </a>
            </Button>
          </div>
        </Container>
      </Section>
    </>
  );
}
