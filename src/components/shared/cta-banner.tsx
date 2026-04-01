"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { MessageCircle, ArrowRight, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { brand } from "@/lib/data/brand";

export function CtaBanner() {
  return (
    <section className="relative overflow-hidden bg-[#020813] py-40 md:py-48 isolate border-t border-white/5">
      {/* Immersive Background Layers */}
      <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1436491865332-7a61a109cc05?auto=format&fit=crop&w=2000&q=80')] opacity-[0.02] bg-cover bg-center mix-blend-screen" />
      <div className="absolute inset-0 grid-overlay-dark opacity-40 mix-blend-overlay" />
      <div className="absolute inset-0 bg-gradient-to-b from-[#020813]/50 via-[#020813]/80 to-[#020813]" />
      
      {/* Abstract Animated Glows */}
      <motion.div 
        animate={{ 
          scale: [1, 1.2, 1],
          opacity: [0.1, 0.2, 0.1],
        }}
        transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1000px] h-[1000px] bg-gradient-to-tr from-bb-gold/20 to-bb-navy/20 rounded-full blur-[150px] -z-10" 
      />

      <div className="container relative z-10 mx-auto px-4 text-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 1, ease: "easeOut" }}
          className="mx-auto max-w-4xl space-y-10"
        >
          <div className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-white/5 border border-white/10 backdrop-blur-md mb-6 shadow-2xl">
            <Sparkles className="w-4 h-4 text-bb-gold" />
            <span className="text-xs font-bold uppercase tracking-[0.2em] text-white/90">Executive Execution</span>
          </div>
          
          <h2 className="text-5xl font-semibold leading-[1.1] text-white md:text-7xl tracking-tight">
            Initiate your <br />
            <span className="text-bb-gold mt-2 inline-block drop-shadow-[0_0_30px_rgba(201,164,77,0.3)]">global mobility.</span>
          </h2>
          
          <p className="mx-auto max-w-2xl text-xl font-light leading-relaxed text-slate-400">
            Absolute clarity. Zero friction. Let us construct the precise plan required for your immediate and long-term success.
          </p>
          
          <div className="flex flex-col items-center justify-center gap-6 sm:flex-row pt-12">
            <Button asChild className="h-16 px-10 text-lg bg-bb-gold text-[#020813] hover:bg-white font-bold shadow-[0_0_40px_rgba(201,164,77,0.3)] hover:shadow-[0_0_60px_rgba(255,255,255,0.4)] transition-all duration-500 hover:scale-105 border-0 rounded-2xl w-full sm:w-auto relative group overflow-hidden">
              <Link href="/start-application">
                <span className="relative z-10 flex items-center">
                  Commence Application <ArrowRight className="ml-3 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                </span>
                <div className="absolute inset-0 bg-white translate-y-full group-hover:translate-y-0 transition-transform duration-500 ease-in-out" />
              </Link>
            </Button>
            
            <Button variant="secondary" size="lg" className="h-16 px-10 text-lg bg-white/5 hover:bg-white/10 backdrop-blur-md border border-white/10 text-white font-semibold transition-all duration-500 hover:scale-105 rounded-2xl w-full sm:w-auto hover:border-white/30" asChild>
              <a href={`https://wa.me/${brand.whatsapp.replace(/\D/g, "")}`} target="_blank" rel="noreferrer">
                <MessageCircle className="mr-3 h-5 w-5 text-bb-gold" />
                Speak with an Advisor
              </a>
            </Button>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
