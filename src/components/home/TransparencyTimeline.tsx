"use client";

import { motion } from "framer-motion";
import { CheckCircle2 } from "lucide-react";

import { Section } from "@/components/layout/Section";
import { Container } from "@/components/layout/Container";
import { cn } from "@/lib/utils/cn";

const timelineSteps = [
  { title: "Assessment", desc: "Deep dive into your credentials to establish a high-probability strategy." },
  { title: "Documentation", desc: "Rigorous compilation and verification of every required paper trail." },
  { title: "Submission", desc: "Strategic lodgment of your application via priority channels." },
  { title: "Appointment", desc: "Mock interviews and biometric prep so you walk in confident." },
  { title: "Decision", desc: "Transparent tracking. No false promises, just legal precision." },
  { title: "Travel Prep", desc: "Flight logistics, accommodation booking, and arrival orientation." }
];

export function TransparencyTimeline() {
  return (
    <Section className="relative border-y border-slate-200/50 overflow-hidden py-24">
      {/* Background Image with Parallax */}
      <div 
        className="absolute inset-0 bg-[url('/images/page-hero/about.webp')] bg-cover bg-center bg-scroll md:bg-fixed"
      />
      {/* 40% Overlay */}
      <div className="absolute inset-0 bg-bb-navy/40" />

      <Container className="relative z-10 max-w-6xl">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-8 items-center">
          
          {/* Left Column: Context & Trust */}
          <div className="max-w-xl text-center lg:text-left mx-auto lg:mx-0">
            <span className="eyebrow mb-4 inline-block text-bb-gold/90">The Transparency Framework</span>
            <h2 className="text-4xl md:text-5xl font-bold tracking-tight text-white leading-[1.1]">
              You'll always know your <br />
              <span className="text-bb-gold">exact next step.</span>
            </h2>
            <p className="mt-6 text-white/80 text-lg font-light leading-relaxed max-w-md mx-auto lg:mx-0">
              The immigration system thrives on ambiguity. We eliminate it entirely. Our process is a straight line from consultation to departure.
            </p>

            {/* Floating Trust Banner */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="mt-12 bg-white/10 backdrop-blur-md rounded-2xl p-6 flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-5 shadow-glass border border-white/20 max-w-lg mx-auto lg:mx-0"
            >
              <div className="flex -space-x-3 shrink-0">
                <div className="w-12 h-12 rounded-full border-2 border-bb-navy/50 bg-slate-100 overflow-hidden shadow-sm">
                  <img src="/images/female_avatar.png" alt="Client" className="w-full h-full object-cover" />
                </div>
                <div className="w-12 h-12 rounded-full border-2 border-bb-navy/50 bg-slate-100 overflow-hidden shadow-sm">
                  <img src="/images/male_avatar.png" alt="Client" className="w-full h-full object-cover" />
                </div>
                <div className="w-12 h-12 rounded-full border-2 border-bb-navy/50 bg-bb-gold flex items-center justify-center text-xs font-bold text-white shadow-sm z-10">
                  500+
                </div>
              </div>
              <p className="text-white text-sm font-medium text-center sm:text-left leading-relaxed">
                Successful placements globally.<br />
                <span className="text-white/70 font-light">No guesswork, just results.</span>
              </p>
            </motion.div>
          </div>

          {/* Right Column: Compact Vertical Timeline */}
          <div className="relative w-full max-w-lg mx-auto lg:mx-0 lg:ml-auto">
            {/* Decorative offset background */}
            <div className="absolute -inset-4 md:-inset-6 bg-bb-gold/10 rounded-[2.5rem] transform rotate-3" />
            
            <div className="bg-white rounded-[2rem] p-6 md:p-10 shadow-premium border border-slate-100 relative z-10">
              {timelineSteps.map((step, idx) => (
                <motion.div 
                  key={idx}
                  initial={{ opacity: 0, x: 20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: idx * 0.1 }}
                  className="flex gap-4 group relative"
                >
                  {/* Timeline connectors */}
                  <div className="relative flex flex-col items-center">
                    <div className="w-8 h-8 rounded-full bg-slate-50 border border-slate-200 flex items-center justify-center shrink-0 z-10 group-hover:bg-bb-gold group-hover:border-bb-gold transition-all duration-300 shadow-sm relative">
                      <span className="text-xs font-bold text-slate-500 group-hover:text-white transition-colors">
                        {idx + 1}
                      </span>
                    </div>
                    {/* Vertical line connecting to next step */}
                    {idx !== timelineSteps.length - 1 && (
                      <div className="w-[2px] bg-slate-100 absolute top-8 bottom-[-16px] z-0" />
                    )}
                  </div>

                  {/* Content */}
                  <div className={cn("pt-1 flex-1 relative", idx !== timelineSteps.length - 1 ? "pb-4" : "pb-0")}>
                    <h4 className="text-sm font-bold text-bb-navy mb-1 group-hover:text-bb-gold transition-colors flex items-center justify-between">
                      {step.title}
                      <CheckCircle2 className="w-3.5 h-3.5 text-bb-gold opacity-0 group-hover:opacity-100 transition-all -translate-x-2 group-hover:translate-x-0" />
                    </h4>
                    <p className="text-xs text-slate-500 font-light leading-relaxed pr-2">
                      {step.desc}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

        </div>
      </Container>
    </Section>
  );
}
