"use client";

import Link from "next/link";
import { ArrowRight, Sparkles } from "lucide-react";
import { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

import { serviceCatalog } from "@/lib/data/brand";
import { checklistTemplates } from "@/lib/data/content";
import { ServiceIcon } from "@/components/shared/service-icon";

export function ChoosePathSection() {
  const [selected, setSelected] = useState<string>("VISA_ASSISTANCE");

  const preview = useMemo(() => {
    return checklistTemplates[selected as keyof typeof checklistTemplates] ?? [];
  }, [selected]);

  return (
    <section className="relative overflow-hidden bg-[#020813] py-32">
      {/* Background Ambience */}
      <div className="absolute inset-0 grid-overlay-dark opacity-30" />
      <div className="absolute top-1/4 left-0 w-[800px] h-[800px] bg-bb-navy/30 rounded-full blur-[150px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-0 w-[600px] h-[600px] bg-bb-gold/10 rounded-full blur-[150px] pointer-events-none" />
      
      <div className="container relative z-10 mx-auto px-4">
        <div className="flex flex-col md:flex-row justify-between items-end gap-8 mb-20">
          <div className="max-w-2xl space-y-5">
            <motion.p 
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="flex items-center gap-3 text-sm font-bold uppercase tracking-[0.2em] text-bb-gold"
            >
              <span className="h-px w-8 bg-bb-gold/50" />
              Strategic Pathways
            </motion.p>
            <motion.h2 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="text-4xl font-semibold tracking-tight text-white md:text-5xl lg:text-6xl"
            >
              Precision <span className="text-white/60">execution.</span>
            </motion.h2>
          </div>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="text-base font-light leading-relaxed text-slate-400 max-w-sm hidden md:block"
          >
            Select your objective and preview the exact methodology we use to guarantee success.
          </motion.p>
        </div>
        
        {/* Bento Box Grid */}
        <div className="grid gap-6 lg:grid-cols-[1fr_400px]">
          
          {/* Services Grid */}
          <div className="grid gap-6 sm:grid-cols-2">
            {serviceCatalog.map((service, i) => (
              <motion.button 
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 + 0.3 }}
                key={service.type} 
                className={`group text-left relative overflow-hidden rounded-3xl transition-all duration-500 hover:-translate-y-1 p-[1px] ${
                  selected === service.type ? 'scale-[1.02]' : ''
                }`}
                onClick={() => setSelected(service.type)}
              >
                {/* Glowing border effect on selected */}
                {selected === service.type && (
                  <div className="absolute inset-0 bg-gradient-to-br from-bb-gold via-transparent to-bb-gold opacity-50 blur-sm pointer-events-none" />
                )}
                
                <div className={`relative h-full flex flex-col p-8 rounded-3xl transition-colors duration-500 glass-panel-dark ${
                  selected === service.type 
                    ? "bg-white/10" 
                    : "hover:bg-white/[0.08]"
                }`}>
                  <div className={`mb-auto inline-flex h-14 w-14 items-center justify-center rounded-2xl transition-all duration-500 ${
                    selected === service.type 
                      ? "bg-bb-gold text-[#020813] shadow-[0_0_30px_rgba(201,164,77,0.4)]" 
                      : "bg-white/5 text-white/70 group-hover:bg-white/10 group-hover:text-white"
                  }`}>
                    <ServiceIcon name={service.icon} />
                  </div>
                  <div className="mt-12">
                    <h3 className={`text-2xl font-semibold mb-2 transition-colors ${
                      selected === service.type ? "text-bb-gold" : "text-white group-hover:text-white"
                    }`}>{service.title}</h3>
                    <p className="text-sm font-light leading-relaxed text-slate-400">{service.short}</p>
                  </div>
                </div>
              </motion.button>
            ))}
          </div>

          {/* Dynamic Preview sticky column */}
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.5 }}
            className="sticky top-24 relative overflow-hidden rounded-3xl glass-panel-dark h-fit min-h-[500px] flex flex-col"
          >
            <div className="absolute top-0 right-0 w-[300px] h-[300px] rounded-full bg-bb-gold/10 blur-[80px] pointer-events-none" />
            
            <div className="relative p-8 flex-1 flex flex-col">
              <div className="mb-8">
                <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-bb-gold/80">
                  <Sparkles className="w-4 h-4" /> The Protocol
                </p>
                <h3 className="mt-4 text-3xl font-semibold text-white tracking-tight">Execution Plan</h3>
              </div>
              
              <div className="relative flex-1">
                <AnimatePresence mode="wait">
                  <motion.ul 
                    key={selected}
                    initial={{ opacity: 0, filter: "blur(10px)", y: 10 }}
                    animate={{ opacity: 1, filter: "blur(0px)", y: 0 }}
                    exit={{ opacity: 0, filter: "blur(10px)", y: -10 }}
                    transition={{ duration: 0.3 }}
                    className="space-y-4"
                  >
                    {preview.map((item, i) => (
                      <motion.li 
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.1 + 0.2 }}
                        key={`${selected}-${i}`} 
                        className="flex items-start gap-4"
                      >
                        <div className="mt-1 relative flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-bb-gold/10 text-[10px] font-bold text-bb-gold border border-bb-gold/20">
                          {i + 1}
                          <div className="absolute top-full left-1/2 w-px h-6 bg-bb-gold/20 -translate-x-1/2" />
                        </div>
                        <span className="text-sm font-light text-slate-300 leading-relaxed">{item}</span>
                      </motion.li>
                    ))}
                  </motion.ul>
                </AnimatePresence>
              </div>
              
              <div className="mt-8 pt-8 border-t border-white/10">
                <Link 
                  href="/start-application"
                  className="group flex w-full items-center justify-between rounded-full bg-white/5 px-6 py-4 transition-all hover:bg-bb-gold"
                >
                  <span className="text-sm font-bold text-white group-hover:text-[#020813]">Commence Application</span>
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white/10 text-white transition-all group-hover:bg-[#020813] group-hover:text-bb-gold group-hover:translate-x-1">
                    <ArrowRight className="h-4 w-4" />
                  </div>
                </Link>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
