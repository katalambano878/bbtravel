"use client";

import { motion } from "framer-motion";
import { ArrowRight, MessageCircle } from "lucide-react";
import Link from "next/link";
import { brand } from "@/lib/mockData";
import { Container } from "@/components/layout/Container";
import { Button } from "@/components/ui/button";

export function FinalCTA() {
  return (
    <section className="bg-white relative py-12 pb-24">
      <Container className="relative z-10">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="bg-bb-navy rounded-[2.5rem] p-10 md:p-16 flex flex-col items-center text-center relative overflow-hidden shadow-2xl mx-auto max-w-5xl"
        >
          {/* Subtle Decorative Elements */}
          <div className="absolute -top-24 -left-24 w-64 h-64 bg-bb-gold/10 rounded-full blur-[80px] pointer-events-none" />
          <div className="absolute -bottom-24 -right-24 w-64 h-64 bg-bb-gold/20 rounded-full blur-[80px] pointer-events-none" />
          <div className="absolute inset-0 border border-white/5 rounded-[2.5rem] pointer-events-none" />

          <div className="max-w-2xl relative z-10 w-full flex flex-col items-center">
            <span className="inline-flex items-center justify-center px-3 py-1 rounded-full bg-bb-gold/15 border border-bb-gold/30 text-bb-gold text-[10px] sm:text-xs font-bold tracking-widest uppercase mb-6 shadow-sm">
              Immediate Execution
            </span>
            
            <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight text-white mb-8 leading-[1.2]">
              Start your application <br className="hidden md:block" />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-bb-gold to-white">
                in just 3 minutes.
              </span>
            </h2>
            
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-8 w-full sm:w-auto">
              <Button asChild className="h-14 px-8 text-base bg-bb-gold text-bb-navy hover:bg-white hover:text-bb-navy hover:scale-105 shadow-xl shadow-bb-gold/20 font-bold w-full sm:w-auto rounded-2xl transition-all duration-300">
                <Link href="/start">
                  Start Now <ArrowRight className="w-4 h-4 ml-2" />
                </Link>
              </Button>
              
              <Button variant="secondary" asChild className="h-14 px-8 text-base bg-white/5 border border-white/10 hover:bg-white/10 hover:border-white/20 text-white font-medium w-full sm:w-auto rounded-2xl transition-all duration-300 backdrop-blur-md">
                <a href={`https://wa.me/${brand.whatsapp.replace(/\D/g, "")}`} target="_blank" rel="noreferrer">
                  <MessageCircle className="w-4 h-4 mr-2 text-bb-gold" /> Speak to an Advisor
                </a>
              </Button>
            </div>
            
            <div className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-black/20 rounded-full backdrop-blur-sm border border-white/5">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
              </span>
              <p className="text-xs text-slate-300 font-medium tracking-wide">
                Expert guidance guaranteed.
              </p>
            </div>
          </div>
        </motion.div>
      </Container>
    </section>
  );
}
