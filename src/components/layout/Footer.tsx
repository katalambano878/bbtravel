import Link from "next/link";
import { ArrowRight, MapPin, Phone, Mail } from "lucide-react";
import { brand, services } from "@/lib/mockData";
import { Container } from "./Container";
import { Button } from "@/components/ui/button";

export function Footer() {
  return (
    <footer className="bg-bb-navy text-white pt-24 pb-8 overflow-hidden relative">
      {/* Background Motifs */}
      <div className="absolute inset-0 grid-overlay-dark opacity-40 mix-blend-overlay pointer-events-none" />
      <div className="absolute -top-[300px] -right-[300px] w-[800px] h-[800px] bg-bb-gold/5 rounded-full blur-[120px] pointer-events-none" />
      
      <Container className="relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-12 lg:gap-8 mb-20">
          
          {/* Brand & CTA Area */}
          <div className="lg:col-span-4 space-y-8 tracking-tight">
            <div>
              <Link href="/" className="inline-block mb-4">
                <img 
                  src="/images/logo.png" 
                  alt="B.B. Travel Consult Logo" 
                  className="h-10 md:h-12 w-auto object-contain brightness-0 invert opacity-90 hover:opacity-100 transition-opacity"
                />
              </Link>
              <p className="text-slate-400 font-light text-[15px] leading-relaxed pr-4">
                Where your global dreams take flight with structure, transparency, and elite support.
              </p>
            </div>
            
            <Button asChild className="h-12 px-6 text-sm bg-bb-gold text-bb-navy hover:bg-white font-bold transition-all duration-300 rounded-xl group overflow-hidden">
              <Link href="/start">
                <span className="relative z-10 flex items-center">
                  Start Your Journey <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </span>
              </Link>
            </Button>
            
            <div className="flex items-center gap-3 pt-4">
              <a href="#" className="w-9 h-9 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-slate-300 hover:text-bb-gold hover:border-bb-gold transition-colors text-xs font-bold shadow-sm backdrop-blur-sm">
                IG
              </a>
              <a href="#" className="w-9 h-9 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-slate-300 hover:text-bb-gold hover:border-bb-gold transition-colors text-xs font-bold shadow-sm backdrop-blur-sm">
                FB
              </a>
              <a href="#" className="w-9 h-9 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-slate-300 hover:text-bb-gold hover:border-bb-gold transition-colors text-xs font-bold shadow-sm backdrop-blur-sm">
                X
              </a>
              <a href="#" className="w-9 h-9 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-slate-300 hover:text-bb-gold hover:border-bb-gold transition-colors text-xs font-bold shadow-sm backdrop-blur-sm">
                IN
              </a>
            </div>
          </div>

          {/* Core Services */}
          <div className="lg:col-span-5">
            <h4 className="text-xs font-semibold text-bb-gold uppercase tracking-[0.15em] mb-6 border-b border-white/10 pb-4">
              Core Expertise
            </h4>
            <ul className="grid grid-cols-1 sm:grid-cols-2 gap-y-4 gap-x-6">
              {services.map(service => (
                <li key={service.slug}>
                  <Link href={`/services/${service.slug}`} className="text-slate-400 hover:text-white transition-colors flex items-start gap-2 group text-[13px] leading-snug">
                    <span className="w-1.5 h-1.5 shrink-0 rounded-full bg-white/20 group-hover:bg-bb-gold transition-colors mt-1.5" />
                    {service.title}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Quick Links & Info */}
          <div className="lg:col-span-3">
            <h4 className="text-xs font-semibold text-bb-gold uppercase tracking-[0.15em] mb-6 border-b border-white/10 pb-4">
              Concierge Contact
            </h4>
            <ul className="space-y-6 text-[13px] text-slate-400">
              <li className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-white/5 border border-white/10 flex items-center justify-center shrink-0">
                  <MapPin className="w-3.5 h-3.5 text-bb-gold" />
                </div>
                <span className="leading-relaxed font-light mt-1.5">{brand.address}</span>
              </li>
              <li className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-white/5 border border-white/10 flex items-center justify-center shrink-0">
                  <Phone className="w-3.5 h-3.5 text-bb-gold" />
                </div>
                <div className="flex flex-col mt-1">
                  <a href={`tel:${brand.phone.replace(/\\s/g, "")}`} className="hover:text-white transition-colors font-light pb-0.5">
                    {brand.phone}
                  </a>
                  <a href={`tel:${brand.secondaryPhone.replace(/\\s/g, "")}`} className="hover:text-white transition-colors font-light">
                    {brand.secondaryPhone}
                  </a>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-white/5 border border-white/10 flex items-center justify-center shrink-0">
                  <MapPin className="w-3.5 h-3.5 text-bb-gold" />
                </div>
                <span className="leading-relaxed font-light mt-1.5">Digital Address: {brand.digitalAddress}</span>
              </li>
              <li className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-white/5 border border-white/10 flex items-center justify-center shrink-0">
                  <Mail className="w-3.5 h-3.5 text-bb-gold" />
                </div>
                <a href={`mailto:${brand.email}`} className="hover:text-white transition-colors font-light mt-1.5">
                  {brand.email}
                </a>
              </li>
            </ul>
          </div>

        </div>

        {/* Bottom Disclaimer */}
        <div className="border-t border-white/10 pt-8 mt-12 flex flex-col md:flex-row items-center justify-between gap-6 text-xs text-slate-500 font-light">
          <p className="max-w-3xl text-center md:text-left">
            <strong>Disclaimer:</strong> {brand.name} provides expert consulting and documentary guidance. We do not issue visas or guarantee application outcomes, as these decisions are made strictly by respective embassies. We operate transparently within the bounds of immigration law to maximize your possibilities.
          </p>
          <div className="flex items-center gap-6 shrink-0">
            <Link href="/terms" className="hover:text-white transition-colors">Terms</Link>
            <Link href="/privacy" className="hover:text-white transition-colors">Privacy</Link>
            <span>&copy; {new Date().getFullYear()} {brand.name}.</span>
          </div>
        </div>
      </Container>
    </footer>
  );
}
