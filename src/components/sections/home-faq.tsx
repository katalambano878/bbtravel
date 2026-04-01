import { faqs } from "@/lib/data/brand";
import { FaqList } from "@/components/shared/faq-list";
import { HelpCircle, ArrowRight } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export function HomeFaqSection() {
  return (
    <section className="relative overflow-hidden py-32 bg-[#020813]">
      {/* Background Ambience */}
      <div className="absolute inset-0 grid-overlay-dark opacity-30" />
      <div className="absolute top-1/4 left-0 w-[800px] h-[800px] bg-bb-gold/10 rounded-full blur-[150px] pointer-events-none" />
      
      <div className="container relative z-10 mx-auto px-4">
        <div className="grid gap-16 lg:grid-cols-[1fr_1.4fr] lg:gap-24 items-start">
          {/* Left sticky column */}
          <div className="lg:sticky lg:top-32 space-y-10">
            <div className="inline-flex h-16 w-16 items-center justify-center rounded-2xl glass-panel-dark text-bb-gold shadow-[0_0_30px_rgba(201,164,77,0.2)]">
              <HelpCircle className="h-8 w-8" />
            </div>
            
            <div className="space-y-6">
              <p className="flex items-center gap-3 text-sm font-bold uppercase tracking-[0.2em] text-bb-gold">
                <span className="h-px w-8 bg-bb-gold/50" />
                Intelligence base
              </p>
              <h2 className="text-4xl font-semibold tracking-tight text-white md:text-5xl leading-[1.1]">
                Clear answers before you <span className="text-white/60">commit.</span>
              </h2>
              <p className="text-lg font-light leading-relaxed text-slate-400 max-w-md">
                No inflated promises. Just practical guidance, structured support, and total transparency for your journey.
              </p>
            </div>
            
            <div className="rounded-3xl glass-panel-dark p-8 border border-white/10 shadow-2xl relative overflow-hidden group hover:border-bb-gold/30 transition-colors duration-500 max-w-sm">
              <div className="absolute inset-0 bg-gradient-to-br from-bb-gold/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <div className="relative z-10">
                <h4 className="font-semibold text-white mb-3 text-xl">Specific scenario?</h4>
                <p className="text-sm font-light leading-relaxed text-slate-400 mb-6">Our advisory team is ready to review your exact situation and construct a precise plan.</p>
                <Button asChild className="w-full bg-white/5 hover:bg-bb-gold hover:text-[#020813] text-white border border-white/10 rounded-xl transition-all duration-300">
                  <Link href="/contact" className="group">
                    Connect with an Advisor <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </Link>
                </Button>
              </div>
            </div>
          </div>
          
          {/* Right accordion column */}
          <div className="relative z-10">
            <FaqList items={faqs} />
          </div>
        </div>
      </div>
    </section>
  );
}
