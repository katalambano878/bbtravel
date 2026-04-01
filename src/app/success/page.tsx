import { Metadata } from "next";
import { ArrowRight, Trophy, AlertCircle, ShieldCheck } from "lucide-react";
import Link from "next/link";

import { Container } from "@/components/layout/Container";
import { Section } from "@/components/layout/Section";
import { caseStudies } from "@/lib/mockData";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "Success Stories | Measurable Outcomes",
  description: "Explore verifiable case studies of successfully executed visa applications, recruitments, and study pathways."
};

export default function SuccessPage() {
  return (
    <>
      <Section variant="navy" className="pt-32 pb-20 md:pt-48 md:pb-32 relative overflow-hidden">
        <div className="absolute bottom-0 left-0 w-[800px] h-[800px] bg-bb-sky/5 rounded-full blur-[120px] pointer-events-none translate-y-1/2 -translate-x-1/3" />
        <Container className="relative z-10 text-center">
          <span className="eyebrow mb-6 inline-block text-bb-sky">Measurable Outcomes</span>
          <h1 className="text-4xl md:text-6xl font-bold tracking-tight text-white mb-6">
            Data. Execution. <br className="hidden md:block" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-bb-sky to-bb-gold">
              Results.
            </span>
          </h1>
          <p className="text-lg md:text-xl text-slate-300 font-light max-w-2xl mx-auto">
            Review detailed case trajectories that demonstrate how we dismantle legal barriers and secure complex global placements.
          </p>
        </Container>
      </Section>

      <Section variant="white" className="border-b border-slate-200 py-24">
        <Container>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-10">
            {caseStudies.map((study) => (
              <div
                key={study.id}
                className="bg-white rounded-[2rem] p-8 lg:p-10 border border-slate-200 shadow-sm transition-all duration-300 flex flex-col group relative overflow-hidden"
              >
                <div className="mb-8">
                  <span className="inline-block px-3 py-1 rounded-full bg-slate-100 text-bb-navy text-xs font-bold uppercase tracking-wide mb-4 border border-slate-200">
                    {study.goal}
                  </span>
                  <h3 className="text-2xl font-bold text-bb-navy leading-snug">
                    {study.client}
                  </h3>
                </div>

                <div className="space-y-6 flex-1">
                  <div>
                    <h4 className="flex items-center gap-2 text-sm font-semibold text-bb-navy mb-2 uppercase tracking-wide">
                      <AlertCircle className="w-4 h-4 text-slate-400" /> The Challenge
                    </h4>
                    <p className="text-slate-500 text-sm leading-relaxed font-light pl-6 relative before:absolute before:left-[7px] before:top-2 before:w-[2px] before:h-full before:bg-slate-100">
                      {study.challenges}
                    </p>
                  </div>
                  
                  <div>
                    <h4 className="flex items-center gap-2 text-sm font-semibold text-bb-navy mb-2 uppercase tracking-wide">
                      <ShieldCheck className="w-4 h-4 text-bb-gold" /> The Intervention
                    </h4>
                    <p className="text-slate-500 text-sm leading-relaxed font-light pl-6 relative before:absolute before:left-[7px] before:top-2 before:w-[2px] before:h-full before:bg-bb-gold/20">
                      {study.howWeHelped}
                    </p>
                  </div>

                  <div className="pt-6 border-t border-slate-100 mt-auto">
                    <h4 className="flex items-center gap-2 text-sm font-semibold text-bb-navy mb-2 uppercase tracking-wide">
                      <Trophy className="w-4 h-4 text-bb-sky" /> The Outcome
                    </h4>
                    <p className="text-bb-navy font-medium text-sm leading-relaxed bg-bb-sky/5 p-4 rounded-xl border border-bb-sky/10">
                      {study.outcome}
                    </p>
                  </div>
                </div>
              </div>
            ))}

            {/* Placeholder Empty State for More Cases */}
            <div className="bg-slate-50 rounded-[2rem] p-8 lg:p-10 border border-slate-200 border-dashed flex flex-col items-center justify-center text-center opacity-80 min-h-[400px]">
              <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center text-slate-300 font-bold text-2xl mb-6 shadow-sm border border-slate-100">
                +400
              </div>
              <h3 className="text-xl font-bold text-bb-navy mb-3">Audited Cases</h3>
              <p className="text-slate-500 text-sm leading-relaxed max-w-sm">
                Hundreds of additional case files exist in our secure offline ledger protecting client confidentiality.
              </p>
            </div>
          </div>
        </Container>
      </Section>

      <Section variant="navy" className="relative py-24 text-center">
        <Container>
          <h2 className="text-3xl md:text-5xl font-bold text-white mb-6">Become our next success metric.</h2>
          <p className="text-slate-400 font-light text-lg mb-10 max-w-xl mx-auto">
            Stop gambling on your future. Obtain a structured protocol for your visa or employment application today.
          </p>
          <Button asChild className="h-14 px-8 bg-white text-bb-navy hover:bg-bb-gold hover:text-bb-navy text-base rounded-xl font-bold">
            <Link href="/start">Begin Assessment <ArrowRight className="w-5 h-5 ml-2" /></Link>
          </Button>
        </Container>
      </Section>
    </>
  );
}
