"use client";

import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { ArrowRight, PlaneTakeoff, Globe, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";

export function HomeHero() {
  return (
    <section className="relative min-h-screen w-full overflow-hidden bg-[#020813] flex items-center justify-center pt-20">
      {/* Deep Space Background / Cinematic Image */}
      <div className="absolute inset-0 z-0 select-none pointer-events-none">
        <motion.div 
          initial={{ scale: 1.1 }}
          animate={{ scale: 1 }}
          transition={{ duration: 20, ease: "linear", repeat: Infinity, repeatType: "reverse" }}
          className="absolute inset-0"
        >
          <Image
            src="https://images.unsplash.com/photo-1436491865332-7a61a109cc05?auto=format&fit=crop&w=2500&q=80"
            alt="Cinematic Global Travel"
            fill
            className="object-cover opacity-20"
            priority
          />
        </motion.div>
        
        {/* Aggressive Vignette and Gradients for Depth */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#020813] via-[#020813]/80 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-b from-[#020813] via-transparent to-transparent" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,#020813_100%)] opacity-80" />
        
        {/* Glow behind text */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[500px] bg-bb-sky/20 rounded-full blur-[150px] opacity-50" />
      </div>

      <div className="container relative z-10 mx-auto px-4 flex flex-col items-center text-center">
        
        {/* Premium Eyebrow */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
          className="mb-8"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-bb-gold/30 bg-bb-gold/10 backdrop-blur-md">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-bb-gold opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-bb-gold"></span>
            </span>
            <span className="text-xs font-bold uppercase tracking-[0.25em] text-bb-gold">
              Beyond Boundaries
            </span>
          </div>
        </motion.div>

        {/* Massive Typography */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
          className="max-w-5xl"
        >
          <h1 className="text-6xl font-medium tracking-tight text-white md:text-8xl lg:text-[7rem] leading-[1.05]">
            Global mobility, <br />
            <span className="text-white/80">engineered.</span>
          </h1>
        </motion.div>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
          className="mt-8 max-w-2xl text-lg font-light leading-relaxed text-slate-400 md:text-xl"
        >
          An elite advisory firm delivering frictionless visa processing, strategic international recruitment, and curated travel experiences.
        </motion.p>

        {/* Glowing CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.45, ease: [0.16, 1, 0.3, 1] }}
          className="mt-12 flex flex-col sm:flex-row items-center gap-6"
        >
          <div className="relative group">
            <div className="absolute -inset-1 rounded-full bg-gradient-to-r from-bb-gold via-yellow-400 to-bb-gold opacity-40 blur-lg transition duration-500 group-hover:opacity-75 group-hover:duration-200"></div>
            <Button size="lg" className="relative h-14 px-10 text-base font-bold bg-bb-gold text-[#020813] hover:bg-yellow-400 rounded-full transition-all">
              <Link href="/start-application" className="flex items-center">
                Initiate Assessment <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
          </div>
          
          <Link href="/services" className="text-sm font-semibold uppercase tracking-widest text-white/70 hover:text-white transition-colors underline-offset-8 hover:underline">
            Explore Services
          </Link>
        </motion.div>
      </div>

      {/* Floating abstract stats/trust bar */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 2, delay: 1 }}
        className="absolute bottom-10 left-0 right-0 z-20 hidden md:block"
      >
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-center gap-16 px-8 py-4 bg-white/5 backdrop-blur-2xl border border-white/10 rounded-full w-fit mx-auto">
            <div className="flex items-center gap-3">
              <Globe className="h-5 w-5 text-bb-gold" />
              <span className="text-sm font-medium text-white/80">Worldwide Reach</span>
            </div>
            <div className="w-px h-4 bg-white/20" />
            <div className="flex items-center gap-3">
              <Shield className="h-5 w-5 text-bb-gold" />
              <span className="text-sm font-medium text-white/80">Uncompromising Ethics</span>
            </div>
            <div className="w-px h-4 bg-white/20" />
            <div className="flex items-center gap-3">
              <PlaneTakeoff className="h-5 w-5 text-bb-gold" />
              <span className="text-sm font-medium text-white/80">Seamless Execution</span>
            </div>
          </div>
        </div>
      </motion.div>
    </section>
  );
}
