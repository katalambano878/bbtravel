import { Metadata } from "next";
import { ShieldCheck, Target, Award, ArrowRight } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

import { Container } from "@/components/layout/Container";
import { Section } from "@/components/layout/Section";
import { brand } from "@/lib/mockData";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "About Us | Brand Ethos",
  description: "Learn about the ethos and execution frameworks behind Ghana's premium travel consulting agency.",
  alternates: { canonical: "/about" },
  openGraph: {
    title: "About Us | Brand Ethos",
    description: "Learn about the ethos and execution frameworks behind Ghana's premium travel consulting agency.",
    url: "/about",
    images: [{ url: "/seo/og-image.png", width: 1024, height: 1024, alt: "B.B. Travel Consult" }]
  },
  twitter: {
    card: "summary_large_image",
    title: "About Us | Brand Ethos",
    description: "Learn about the ethos and execution frameworks behind Ghana's premium travel consulting agency.",
    images: ["/seo/og-image.png"]
  }
};

export default function AboutPage() {
  return (
    <>
      <Section variant="navy" className="pt-32 pb-20 md:pt-48 md:pb-32 relative overflow-hidden border-b border-white/10">
        <div className="absolute inset-0 z-0">
          <Image
            src="/images/page-hero/about.webp"
            alt="About B.B. Travel Consult"
            fill
            priority
            className="object-cover object-center"
          />
          {/* 35% dark overlay plus gradient for text readability */}
          <div className="absolute inset-0 bg-black/35" />
          <div className="absolute inset-0 bg-gradient-to-t from-bb-navy via-transparent to-transparent opacity-90" />
        </div>
        
        <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-bb-gold/5 rounded-full blur-[120px] pointer-events-none -translate-y-1/2 translate-x-1/3 z-0" />
        
        <Container className="relative z-10 text-center">
          <span className="eyebrow mb-6 inline-block text-bb-gold">Our Philosophy</span>
          <h1 className="text-4xl md:text-6xl font-bold tracking-tight text-white mb-6">
            We don't sell hope. <br className="hidden md:block" />
            <span className="text-bb-gold">We engineer outcomes.</span>
          </h1>
          <p className="text-lg md:text-xl text-slate-300 font-light max-w-2xl mx-auto">
            B.B. Travel Consult was founded on a singular premise: to eradicate the ambiguity, fraud, and anxiety associated with international mobility in Ghana.
          </p>
        </Container>
      </Section>

      <Section variant="white" className="border-b border-slate-200 py-24">
        <Container>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-24 items-center mb-24">
            <div>
              <h2 className="text-3xl font-bold text-bb-navy mb-6 leading-tight">
                The standard in Ghanaian <br />
                <span className="text-bb-gold">Premium Consulting.</span>
              </h2>
              <div className="space-y-6 text-slate-500 font-light leading-relaxed">
                <p>
                  Immigration and travel should not be a gamble. For years, the industry has been plagued by agencies dealing in false promises, forged documents, and stolen funds. We recognized a desperate need for a firm that operates purely on data, legal precedents, and absolute transparency.
                </p>
                <p>
                  Led by {brand.founder}, our framework applies rigorous scrutiny to every case. We assess your profile, identify vulnerabilities, and only proceed if we can build a legally robust strategy. If an outcome is impossible, we tell you immediately.
                </p>
              </div>
            </div>
            <div className="relative">
              <div className="aspect-square md:aspect-[4/3] rounded-[2rem] overflow-hidden shadow-premium">
                <Image
                  src="/images/ceo-bright-nana-brown.png"
                  alt="Mr. Bright Nana Brown, Founder of B.B. Travel Consult"
                  width={900}
                  height={1200}
                  className="w-full h-full object-cover object-top"
                />
              </div>
              <div className="absolute -bottom-8 -left-8 bg-white p-8 rounded-[2rem] shadow-premium max-w-[280px] hidden md:block">
                <div className="flex items-center gap-4 mb-3">
                  <div className="w-12 h-12 bg-bb-navy/5 rounded-full flex items-center justify-center text-bb-navy font-bold text-xl">
                    5k+
                  </div>
                </div>
                <p className="text-sm font-semibold text-bb-navy">Profiles Assessed</p>
                <p className="text-xs text-slate-500 mt-1">Through rigorous methodology since inception.</p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-slate-50 p-8 rounded-3xl border border-slate-200">
              <Target className="w-8 h-8 text-bb-gold mb-6" />
              <h3 className="text-xl font-bold text-bb-navy mb-4">Our Mission</h3>
              <p className="text-slate-500 font-light leading-relaxed text-sm">
                To provide strategic, legally compliant pathways for global mobility, ensuring our clients cross borders safely, confidently, and efficiently.
              </p>
            </div>
            <div className="bg-slate-50 p-8 rounded-3xl border border-slate-200">
              <ShieldCheck className="w-8 h-8 text-bb-sky mb-6" />
              <h3 className="text-xl font-bold text-bb-navy mb-4">Our Core Values</h3>
              <p className="text-slate-500 font-light leading-relaxed text-sm">
                Absolute transparency. Ethical execution. Data-driven strategy. We never guarantee outcomes outside of our control; we guarantee perfect preparation.
              </p>
            </div>
            <div className="bg-slate-50 p-8 rounded-3xl border border-slate-200">
              <Award className="w-8 h-8 text-bb-gold mb-6" />
              <h3 className="text-xl font-bold text-bb-navy mb-4">Our Standards</h3>
              <p className="text-slate-500 font-light leading-relaxed text-sm">
                Every document is audited. Every strategy is peer-reviewed. We hold ourselves to international standards of immigration compliance.
              </p>
            </div>
          </div>
        </Container>
      </Section>

      <Section variant="navy" className="relative py-24 text-center">
        <Container>
          <h2 className="text-3xl md:text-5xl font-bold text-white mb-6">Ready for absolute clarity?</h2>
          <p className="text-slate-400 font-light text-lg mb-10 max-w-xl mx-auto">
            Stop guessing. Let our experts analyze your profile and construct a definitive roadmap for your global ambitions.
          </p>
          <Button asChild className="h-14 px-8 bg-bb-gold text-bb-navy hover:bg-white text-base rounded-xl font-bold">
            <Link href="/start">Begin Assessment <ArrowRight className="w-5 h-5 ml-2" /></Link>
          </Button>
        </Container>
      </Section>
    </>
  );
}
