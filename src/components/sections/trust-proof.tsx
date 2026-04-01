"use client";

import { motion } from "framer-motion";
import { ShieldCheck, BadgeCheck, HeartHandshake } from "lucide-react";
import { ProcessTimeline } from "@/components/shared/process-timeline";

const trustItems = [
  { title: "Proven record", copy: "Documented process outcomes across visa, recruitment, and student placement.", icon: ShieldCheck },
  { title: "Ethical practices", copy: "Transparent handling, realistic expectations, and no misleading guarantees.", icon: BadgeCheck },
  { title: "Personalized care", copy: "Service plans built around each client's goals, timeline, and constraints.", icon: HeartHandshake }
];

export function TrustProofSection() {
  return (
    <section className="relative overflow-hidden bg-[#020813] py-32 border-t border-white/5">
      {/* Abstract background */}
      <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1558486012-817176f84c6d?auto=format&fit=crop&w=2000&q=80')] opacity-[0.03] bg-cover bg-center grayscale" />
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[600px] bg-gradient-to-b from-bb-gold/5 to-transparent rounded-full blur-[100px] pointer-events-none" />

      <div className="container relative z-10 mx-auto px-4">
        <div className="grid gap-16 lg:gap-20 lg:grid-cols-[1fr_1.1fr] items-start">
          {/* Left Column */}
          <div className="space-y-12">
            <div className="max-w-xl space-y-6">
              <motion.p 
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                className="flex items-center gap-3 text-sm font-bold uppercase tracking-[0.2em] text-bb-gold"
              >
                <span className="h-px w-8 bg-bb-gold/50" />
                Proof & Trust
              </motion.p>
              <motion.h2 
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.1 }}
                className="text-4xl font-semibold tracking-tight text-white md:text-5xl leading-[1.15]"
              >
                Trust is built when clients can <span className="text-white/60">see every step.</span>
              </motion.h2>
              <motion.p 
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.2 }}
                className="text-lg font-light leading-relaxed text-slate-400 max-w-lg"
              >
                Our process combines premium consulting with operational transparency that keeps clients informed at every stage.
              </motion.p>
            </div>
            
            {/* Stats Row */}
            <div className="flex gap-5">
              <motion.div 
                initial={{ opacity: 0, y: 20, scale: 0.95 }}
                whileInView={{ opacity: 1, y: 0, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: 0.3 }}
                className="flex-1 rounded-3xl p-[1px] bg-gradient-to-b from-white/10 to-transparent"
              >
                <div className="h-full rounded-[23px] bg-white/[0.03] backdrop-blur-md p-8">
                  <p className="text-5xl font-semibold tracking-tight text-white">
                    10<span className="text-bb-gold">+</span>
                  </p>
                  <p className="mt-3 text-sm font-bold uppercase tracking-widest text-slate-500">Years</p>
                </div>
              </motion.div>

              <motion.div 
                initial={{ opacity: 0, y: 20, scale: 0.95 }}
                whileInView={{ opacity: 1, y: 0, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: 0.4 }}
                className="flex-1 rounded-3xl p-[1px] bg-gradient-to-b from-bb-gold/20 to-transparent"
              >
                <div className="h-full rounded-[23px] bg-bb-gold/5 backdrop-blur-md p-8 relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-bb-gold/20 rounded-full blur-[40px]" />
                  <p className="relative text-5xl font-semibold tracking-tight text-white">
                    50<span className="text-bb-gold">+</span>
                  </p>
                  <p className="relative mt-3 text-sm font-bold uppercase tracking-widest text-bb-gold/70">Partners</p>
                </div>
              </motion.div>
            </div>

            {/* Trust Items */}
            <div className="space-y-4 pt-4">
              {trustItems.map((item, i) => (
                <motion.div 
                  key={item.title}
                  initial={{ opacity: 0, x: -15 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 + 0.5 }}
                  className="group flex gap-5 rounded-2xl p-5 transition-all hover:bg-white/[0.02] border border-transparent hover:border-white/5"
                >
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-white/5 border border-white/10 text-bb-gold group-hover:bg-bb-gold group-hover:text-[#020813] transition-all duration-500">
                    <item.icon className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-white">{item.title}</h3>
                    <p className="mt-1 text-sm font-light leading-relaxed text-slate-400">{item.copy}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
          
          {/* Right Column — Process Tracker */}
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
            className="sticky top-32"
          >
            <div className="relative overflow-hidden rounded-[2rem] bg-[#020813] border border-white/10 shadow-[0_0_50px_rgba(0,0,0,0.5)]">
              {/* Header Bar */}
              <div className="bg-white/5 backdrop-blur-md px-8 py-5 border-b border-white/5 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="flex gap-2">
                    <div className="w-3 h-3 rounded-full bg-white/10" />
                    <div className="w-3 h-3 rounded-full bg-white/10" />
                    <div className="w-3 h-3 rounded-full bg-white/10" />
                  </div>
                  <span className="text-xs text-slate-500 font-mono tracking-wider items-center flex gap-2">
                    <ShieldCheck className="w-3 h-3" />
                    portal.bbtravel.com
                  </span>
                </div>
              </div>
              
              <div className="p-10 space-y-10 relative">
                <div className="absolute top-0 right-0 w-[200px] h-[200px] bg-bb-gold/5 rounded-full blur-[60px]" />
                
                <div className="flex items-center justify-between border-b border-white/10 pb-6 relative">
                  <div>
                    <p className="text-xs font-bold uppercase tracking-[0.2em] text-bb-gold mb-2">Live Status</p>
                    <h3 className="text-2xl font-semibold text-white tracking-tight">Your Case Progress</h3>
                  </div>
                  <div className="flex items-center gap-2 text-xs font-bold text-bb-gold bg-bb-gold/10 px-4 py-2 rounded-full border border-bb-gold/20">
                    <div className="w-2 h-2 rounded-full bg-bb-gold animate-pulse" />
                    Active
                  </div>
                </div>
                
                <div className="relative">
                  <ProcessTimeline
                    steps={["Case submitted", "Document review", "Appointment booked", "Decision follow-up", "Completion briefing"]}
                  />
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
