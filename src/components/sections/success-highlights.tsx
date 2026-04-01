"use client";

import { motion } from "framer-motion";
import { successStories } from "@/lib/data/content";
import { Quote } from "lucide-react";

export function SuccessHighlights() {
  return (
    <section className="relative overflow-hidden py-32 bg-[#020813] text-white">
      {/* Abstract Background Elements */}
      <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1557683316-973673baf926?auto=format&fit=crop&w=2000&q=80')] opacity-[0.02] bg-cover bg-center mix-blend-screen" />
      
      {/* Slow moving ambient orbs */}
      <motion.div 
        animate={{ 
          scale: [1, 1.2, 1],
          opacity: [0.3, 0.5, 0.3],
          x: [0, 50, 0]
        }}
        transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
        className="absolute top-0 right-0 w-[800px] h-[800px] bg-bb-gold/10 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/2 pointer-events-none" 
      />
      <motion.div 
        animate={{ 
          scale: [1, 1.5, 1],
          opacity: [0.2, 0.4, 0.2],
          x: [0, -50, 0]
        }}
        transition={{ duration: 20, repeat: Infinity, ease: "linear", delay: 2 }}
        className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-bb-sky/10 rounded-full blur-[120px] translate-y-1/2 -translate-x-1/2 pointer-events-none" 
      />
      
      <div className="container relative z-10 mx-auto px-4">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="max-w-3xl space-y-6 mb-20 relative"
        >
          <Quote className="absolute -top-10 -left-10 w-24 h-24 text-white/5 rotate-180" />
          <p className="flex items-center gap-4 text-sm font-bold uppercase tracking-[0.2em] text-bb-gold">
            <span className="h-px w-8 bg-bb-gold/50" /> Success Stories
          </p>
          <h2 className="text-4xl font-semibold tracking-tight md:text-5xl lg:text-6xl max-w-3xl leading-[1.1]">
            Real outcomes from <br/><span className="text-white/50">guided global mobility.</span>
          </h2>
        </motion.div>

        <div className="grid gap-8 md:grid-cols-3">
          {successStories.map((story, i) => (
            <motion.div 
              key={story.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.15, duration: 0.7, ease: "easeOut" }}
              className="group relative overflow-hidden rounded-[2rem] bg-white/[0.02] p-px transition-all hover:bg-white/[0.05]"
            >
              {/* Animated glowing border */}
              <div className="absolute inset-0 bg-gradient-to-br from-bb-gold/20 via-transparent to-bb-sky/20 opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />
              
              <div className="relative h-full rounded-[2rem] bg-[#020813]/50 backdrop-blur-2xl border border-white/5 p-10 flex flex-col justify-between group-hover:-translate-y-1 transition-transform duration-500">
                <div className="space-y-6">
                  <div className="inline-block rounded-full bg-white/5 px-4 py-1.5 border border-white/10 text-xs font-bold uppercase tracking-[0.2em] text-bb-gold shadow-lg shadow-black/20">
                    <p>{story.service}</p>
                  </div>
                  <h3 className="text-3xl font-semibold leading-tight text-white">{story.title}</h3>
                  <p className="text-base font-light leading-relaxed text-slate-400 relative z-10">
                    <span className="absolute -left-6 -top-4 text-white/10 text-6xl leading-none font-serif">"</span>
                    {story.outcome}
                  </p>
                </div>
                <div className="mt-8 pt-6 border-t border-white/10 relative overflow-hidden flex items-center justify-between">
                  <div className="absolute inset-0 bg-gradient-to-r from-bb-gold/0 via-bb-gold/10 to-bb-gold/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
                  <p className="text-xs font-bold text-white/60 uppercase tracking-widest">{story.metric}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
