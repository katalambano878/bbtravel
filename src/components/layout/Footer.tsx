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
          <div className="lg:col-span-5 space-y-8 tracking-tight">
            <div>
              <Link href="/" className="inline-block text-2xl font-bold text-white mb-2">
                {brand.name}
              </Link>
              <p className="text-slate-400 font-light text-lg max-w-sm leading-relaxed">
                Where your global dreams take flight with structure, transparency, and elite support.
              </p>
            </div>
            
            <Button asChild className="h-14 px-8 text-base bg-bb-gold text-bb-navy hover:bg-white font-bold transition-all duration-300 rounded-xl group overflow-hidden">
              <Link href="/start">
                <span className="relative z-10 flex items-center">
                  Start Your Journey <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </span>
              </Link>
            </Button>
            
            <div className="flex items-center gap-4 pt-4">
              <a href="#" className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-slate-300 hover:text-bb-gold hover:border-bb-gold transition-colors text-xs font-bold">
                IG
              </a>
              <a href="#" className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-slate-300 hover:text-bb-gold hover:border-bb-gold transition-colors text-xs font-bold">
                FB
              </a>
              <a href="#" className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-slate-300 hover:text-bb-gold hover:border-bb-gold transition-colors text-xs font-bold">
                X
              </a>
              <a href="#" className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-slate-300 hover:text-bb-gold hover:border-bb-gold transition-colors text-xs font-bold">
                IN
              </a>
            </div>
          </div>

          {/* Core Services */}
          <div className="lg:col-span-3">
            <h4 className="text-sm font-semibold text-bb-gold uppercase tracking-[0.15em] mb-6 border-b border-white/10 pb-4">
              Core Expertise
            </h4>
            <ul className="space-y-4">
              {services.map(service => (
                <li key={service.slug}>
                  <Link href={`/services/${service.slug}`} className="text-slate-400 hover:text-white transition-colors flex items-center gap-2 group text-sm">
                    <span className="w-1 h-1 rounded-full bg-white/20 group-hover:bg-bb-gold transition-colors" />
                    {service.title}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Quick Links & Info */}
          <div className="lg:col-span-4">
            <h4 className="text-sm font-semibold text-bb-gold uppercase tracking-[0.15em] mb-6 border-b border-white/10 pb-4">
              Concierge Contact
            </h4>
            <ul className="space-y-5 text-sm text-slate-400">
              <li className="flex items-start gap-4">
                <MapPin className="w-5 h-5 text-bb-gold shrink-0 mt-0.5" />
                <span className="leading-relaxed font-light">{brand.address}</span>
              </li>
              <li className="flex items-center gap-4">
                <Phone className="w-5 h-5 text-bb-gold shrink-0" />
                <a href={`tel:${brand.phone.replace(/\\s/g, "")}`} className="hover:text-white transition-colors font-light">
                  {brand.phone}
                </a>
              </li>
              <li className="flex items-center gap-4">
                <Mail className="w-5 h-5 text-bb-gold shrink-0" />
                <a href={`mailto:${brand.email}`} className="hover:text-white transition-colors font-light">
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
