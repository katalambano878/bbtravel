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
          className="bg-bb-navy rounded-[2.5rem] flex flex-col-reverse md:flex-row relative overflow-hidden shadow-2xl mx-auto max-w-6xl"
        >
          {/* Subtle Decorative Elements */}
          <div className="absolute -top-24 -left-24 w-64 h-64 bg-bb-gold/10 rounded-full blur-[80px] pointer-events-none z-10" />
          <div className="absolute inset-0 border border-white/5 rounded-[2.5rem] pointer-events-none z-20" />

          {/* Left Content Area */}
          <div className="w-full md:w-1/2 p-10 md:p-16 lg:p-20 flex flex-col justify-center text-left relative z-10">
            <span className="inline-flex w-fit items-center justify-center px-4 py-1.5 rounded-full bg-bb-gold/15 border border-bb-gold/30 text-bb-gold text-[10px] sm:text-xs font-bold tracking-widest uppercase mb-6 shadow-sm">
              Immediate Execution
            </span>
            
            <h2 className="text-4xl md:text-5xl lg:text-5xl font-extrabold tracking-tight text-white mb-6 leading-[1.1]">
              Start your <br />
              application <br />
              <span className="text-bb-gold">
                in 3 minutes.
              </span>
            </h2>
            
            <p className="text-slate-400 text-lg mb-8 max-w-md">
              Don't leave your global future up to chance. Engage our expert consultants and secure a definitive path forward.
            </p>

            <div className="flex flex-col sm:flex-row items-center gap-4 mb-8 w-full sm:w-auto">
              <Button asChild className="h-14 px-8 text-base bg-bb-gold text-bb-navy hover:bg-white hover:text-bb-navy hover:scale-105 shadow-xl shadow-bb-gold/20 font-bold w-full sm:w-auto rounded-2xl transition-all duration-300">
                <Link href="/start">
                  Start Now <ArrowRight className="w-4 h-4 ml-2" />
                </Link>
              </Button>
              
              <Button variant="secondary" asChild className="h-14 px-8 text-base bg-white/5 border border-white/10 hover:bg-white/10 hover:border-white/20 text-white font-medium w-full sm:w-auto rounded-2xl transition-all duration-300 backdrop-blur-md">
                <a href={`https://wa.me/${brand.whatsapp.replace(/\D/g, "").replace(/^0/, "233")}`} target="_blank" rel="noreferrer">
                  <MessageCircle className="w-4 h-4 mr-2 text-bb-gold" /> Speak to an Advisor
                </a>
              </Button>
            </div>
            
            <div className="inline-flex items-center gap-3 px-5 py-2.5 bg-black/20 rounded-full backdrop-blur-sm border border-white/5 w-fit">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
              </span>
              <p className="text-sm text-slate-300 font-medium tracking-wide">
                Expert guidance guaranteed.
              </p>
            </div>
          </div>

          {/* Right Image Area */}
          <div className="w-full md:w-1/2 relative min-h-[350px] md:min-h-full">
            <div 
              className="absolute inset-0 bg-cover bg-center"
              style={{ backgroundImage: `url('https://images.unsplash.com/photo-1524661135-423995f22d0b?auto=format&fit=crop&w=1000&q=80')` }}
            />
            {/* Gradient to blend image into the navy background smoothly */}
            <div className="absolute inset-0 bg-gradient-to-t md:bg-gradient-to-r from-bb-navy via-bb-navy/50 to-transparent" />
          </div>
        </motion.div>
      </Container>
    </section>
  );
}
