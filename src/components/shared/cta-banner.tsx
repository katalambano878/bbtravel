"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { MessageCircle, ArrowRight, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { brand } from "@/lib/data/brand";

export function CtaBanner() {
  return (
    <section className="relative py-20 md:py-32 flex items-center justify-center">
      {/* Immersive Background Image Layer */}
      <div className="absolute inset-0 z-0">
        <div 
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url('/images/page-hero/services.webp')` }}
        />
        <div className="absolute inset-0 bg-black/40" />
        <div className="absolute inset-0 bg-gradient-to-t from-bb-navy via-bb-navy/80 to-transparent" />
      </div>

      <div className="container relative z-10 mx-auto px-4">
        <motion.div
           initial={{ opacity: 0, y: 30 }}
           whileInView={{ opacity: 1, y: 0 }}
           viewport={{ once: true }}
           transition={{ duration: 1, ease: "easeOut" }}
           className="mx-auto max-w-3xl p-8 md:p-12 lg:p-14 text-center rounded-[2.5rem] bg-bb-navy/70 backdrop-blur-2xl border border-white/10 shadow-[0_30px_100px_rgba(0,0,0,0.6)]"
        >
          <div className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-white/5 border border-white/10 backdrop-blur-md mb-8 shadow-inner">
            <Sparkles className="w-4 h-4 text-bb-gold" />
            <span className="text-xs font-bold uppercase tracking-[0.2em] text-white/90">Executive Execution</span>
          </div>
          
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-extrabold leading-[1.1] text-white tracking-tight mb-6">
            Ready for absolute <br className="hidden md:block"/>
            <span className="text-bb-gold mt-1 inline-block drop-shadow-[0_0_20px_rgba(201,164,77,0.3)]">clarity?</span>
          </h2>
          
          <p className="mx-auto max-w-xl text-base md:text-lg font-light leading-relaxed text-slate-300 mb-8">
            Stop guessing. Let our experts analyze your profile and construct a definitive roadmap for your global ambitions.
          </p>
          
          <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Button asChild className="h-14 px-8 text-base bg-bb-gold text-bb-navy hover:bg-white font-bold shadow-[0_0_40px_rgba(201,164,77,0.3)] hover:shadow-[0_0_60px_rgba(255,255,255,0.4)] transition-all duration-500 hover:scale-105 border-0 rounded-2xl w-full sm:w-auto relative group overflow-hidden">
              <Link href="/start">
                <span className="relative z-10 flex items-center">
                  Begin Assessment <ArrowRight className="ml-3 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                </span>
                <div className="absolute inset-0 bg-white translate-y-full group-hover:translate-y-0 transition-transform duration-500 ease-in-out" />
              </Link>
            </Button>
            
            <Button variant="secondary" size="lg" className="h-14 px-8 text-base bg-white/5 hover:bg-white/10 backdrop-blur-md border border-white/10 text-white font-semibold transition-all duration-500 hover:scale-105 rounded-2xl w-full sm:w-auto hover:border-white/30" asChild>
              <a href={`https://wa.me/${brand.whatsapp.replace(/\D/g, "")}`} target="_blank" rel="noreferrer">
                <MessageCircle className="mr-3 h-5 w-5 text-bb-gold" />
                Speak to our Experts
              </a>
            </Button>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
