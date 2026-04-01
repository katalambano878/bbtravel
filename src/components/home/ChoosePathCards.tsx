"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowUpRight, X, FileText, Briefcase, GraduationCap, Globe, CheckCircle2 } from "lucide-react";

import { Section } from "@/components/layout/Section";
import { Container } from "@/components/layout/Container";
import { services } from "@/lib/mockData";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils/cn";
import Link from "next/link";

const iconMap: Record<string, React.ElementType> = {
  Passport: FileText,
  Briefcase: Briefcase,
  GraduationCap: GraduationCap,
  Globe: Globe,
};

export function ChoosePathCards() {
  const [selectedService, setSelectedService] = useState<typeof services[0] | null>(null);

  // Grab the first four for the 2x2 grid
  const coreServices = services.slice(0, 4);

  return (
    <Section variant="white" className="relative">
      <div className="absolute inset-0 grid-overlay opacity-50 mix-blend-multiply pointer-events-none" />
      
      <Container className="relative z-10 max-w-6xl w-full">
        <div className="mb-16 flex flex-col md:flex-row md:items-end md:justify-between gap-8">
          <div className="max-w-xl">
            <span className="eyebrow mb-3 inline-block">Choose Your Path</span>
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-bb-navy leading-[1.1]">
              Strategic routes for <br className="hidden md:block" />
              <span className="text-bb-gold">global execution.</span>
            </h2>
          </div>
          <p className="text-slate-500 font-light max-w-sm text-base leading-relaxed md:mb-1">
            Select your intent. We have mapped the precise documentation, timelines, and legal frameworks required to get you there safely.
          </p>
        </div>

        {/* 2x2 Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
          {coreServices.map((service, idx) => {
            const Icon = iconMap[service.icon] || FileText;
            return (
              <motion.div
                key={service.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.6, delay: idx * 0.1 }}
                onClick={() => setSelectedService(service)}
                className="group relative cursor-pointer bg-white rounded-3xl border border-slate-200 shadow-glass hover:shadow-premium-hover transition-all duration-500 overflow-hidden text-left flex flex-col items-start"
              >
                {/* Image Header Block */}
                <div className="relative w-full h-48 sm:h-56 overflow-hidden shrink-0 bg-slate-100">
                  <div className="absolute inset-0 bg-slate-900/10 group-hover:bg-transparent transition-colors duration-500 z-10" />
                  <img 
                    src={(service as any).image} 
                    alt={service.title} 
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                  />
                  <div className="absolute top-4 left-4 z-20 w-12 h-12 bg-white/95 backdrop-blur-md rounded-xl flex items-center justify-center shadow-sm group-hover:-translate-y-1 transition-transform duration-500">
                    <Icon className="w-5 h-5 text-bb-navy group-hover:text-bb-gold transition-colors duration-300" />
                  </div>
                </div>
                
                {/* Card Content */}
                <div className="p-6 lg:p-8 flex flex-col flex-1 w-full bg-white relative">
                  <h3 className="text-xl font-bold text-bb-navy mb-3 group-hover:text-bb-gold transition-colors duration-300">
                    {service.title}
                  </h3>
                  
                  <p className="text-slate-500 font-light text-sm leading-relaxed mb-8 flex-1">
                    {service.description}
                  </p>

                  <div className="w-full flex items-center justify-between border-t border-slate-100 pt-6 mt-auto">
                    <span className="text-sm font-semibold text-bb-navy group-hover:text-bb-gold transition-colors">
                      Check Requirements
                    </span>
                    <div className="w-10 h-10 rounded-full border border-slate-200 flex items-center justify-center group-hover:border-bb-gold group-hover:bg-bb-gold group-hover:text-white transition-all duration-300">
                      <ArrowUpRight className="w-5 h-5 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </Container>

      {/* Requirement Modal */}
      <AnimatePresence>
        {selectedService && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center px-4">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedService(null)}
              className="absolute inset-0 bg-bb-navy/80 backdrop-blur-sm cursor-pointer"
            />
            
            {/* Modal Box */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="relative w-full max-w-2xl bg-white rounded-[2rem] shadow-2xl overflow-hidden p-8 md:p-12 z-10"
            >
              <button 
                onClick={() => setSelectedService(null)}
                className="absolute top-6 right-6 w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center text-slate-500 hover:bg-slate-200 hover:text-bb-navy transition-colors"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="mb-8">
                <span className="eyebrow inline-block mb-3">Requirement & Timeline Preview</span>
                <h3 className="text-3xl font-bold text-bb-navy">{selectedService.title}</h3>
                <p className="text-slate-500 mt-2">{selectedService.shortDescription}</p>
              </div>

              <div className="space-y-8">
                <div>
                  <h4 className="font-semibold text-bb-navy mb-4 border-b border-slate-100 pb-2 flex items-center justify-between">
                    Standard Checklist
                    <span className="text-xs font-normal text-slate-400 bg-slate-100 px-2 py-1 rounded-md">General</span>
                  </h4>
                  <ul className="space-y-3">
                    {selectedService.benefits.map((benefit, i) => (
                      <li key={i} className="flex gap-3 text-slate-600 text-sm">
                        <CheckCircle2 className="w-5 h-5 text-bb-gold shrink-0" />
                        <span>{benefit}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div>
                  <h4 className="font-semibold text-bb-navy mb-4 border-b border-slate-100 pb-2">
                    Estimated Timeline
                  </h4>
                  <div className="flex justify-between items-center text-xs md:text-sm text-slate-500 max-w-md bg-slate-50 rounded-xl p-4 border border-slate-100">
                    <div className="flex flex-col items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center font-bold text-bb-navy shadow-sm border border-slate-200">1</div>
                      <span>{selectedService.timeline[0]}</span>
                    </div>
                    <div className="h-px bg-slate-200 flex-1 mx-2" />
                    <div className="flex flex-col items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center font-bold text-bb-navy shadow-sm border border-slate-200">2</div>
                      <span>{selectedService.timeline[2]}</span>
                    </div>
                    <div className="h-px bg-slate-200 flex-1 mx-2" />
                    <div className="flex flex-col items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center font-bold text-bb-navy shadow-sm border border-bb-gold text-bb-gold">3</div>
                      <span className="font-semibold text-bb-navy">{selectedService.timeline[4]}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-10 pt-6 border-t border-slate-100 flex items-center justify-end gap-4">
                <Button variant="ghost" onClick={() => setSelectedService(null)} className="text-slate-500 hover:text-bb-navy">Close</Button>
                <Button asChild className="bg-bb-navy text-white hover:bg-bb-gold rounded-xl px-8">
                  <Link href={`/services/${selectedService.slug}`}>View Full Details</Link>
                </Button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </Section>
  );
}
