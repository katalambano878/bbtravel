"use client";

import { motion } from "framer-motion";
import { ShieldCheck, MapPin, Award, Building2, Quote, Star } from "lucide-react";

import { Section } from "@/components/layout/Section";
import { Container } from "@/components/layout/Container";
import { brand } from "@/lib/mockData";
import { cn } from "@/lib/utils/cn";

export function ProofWall() {
  return (
    <Section variant="white" className="relative overflow-hidden">
      <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-slate-50 rounded-full blur-[100px] pointer-events-none -translate-y-1/2 translate-x-1/3" />
      
      <Container className="relative z-10">
        <div className="mb-16 md:mb-20 max-w-2xl">
          <span className="eyebrow mb-4 inline-block">Absolute Credibility</span>
          <h2 className="text-3xl md:text-5xl font-bold tracking-tight text-bb-navy leading-[1.1]">
            We operate on <br />
            <span className="text-bb-gold">verifiable truth.</span>
          </h2>
          <p className="mt-6 text-slate-500 font-light text-lg">
            No cutting corners. No fabricated guarantees. Just rigorous preparation and ethical execution backed by our track record.
          </p>
        </div>

        {/* Bento Box Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 auto-rows-[320px]">
          
          {/* Founder Profile Card (Span 1x2 on large screens) */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="lg:row-span-2 group relative overflow-hidden rounded-[2rem] border border-slate-200 bg-white p-8 flex flex-col justify-end shadow-glass hover:shadow-premium-hover transition-shadow duration-500"
          >
            <div className="absolute inset-0 bg-slate-900/10 z-10 transition-opacity group-hover:opacity-0" />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-900/90 via-slate-900/40 to-transparent z-10" />
            <div className="absolute inset-0 bg-[url('/images/ceo-bright-nana-brown.png')] bg-cover bg-top transition-transform duration-1000 group-hover:scale-105" />
            
            <div className="relative z-20 mt-auto">
              <div className="bg-bb-gold/90 backdrop-blur-md w-12 h-12 rounded-2xl flex items-center justify-center mb-6 shadow-xl">
                <Quote className="w-5 h-5 text-bb-navy fill-bb-navy" />
              </div>
              <p className="text-white font-medium text-lg leading-snug mb-6 opacity-90">
                "Our reputation is built on one simple principle: telling our clients the truth and executing their applications with absolute precision."
              </p>
              <div>
                <h4 className="text-white font-bold text-xl">{brand.founder}</h4>
                <p className="text-bb-gold text-sm font-semibold tracking-wide uppercase">Managing Director</p>
              </div>
            </div>
          </motion.div>

          {/* Process Promise */}
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="rounded-[2rem] border border-slate-200 bg-white p-8 shadow-sm flex flex-col hover:border-bb-gold/50 transition-colors group"
          >
            <div className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center mb-auto group-hover:bg-bb-gold/10 transition-colors">
              <ShieldCheck className="w-6 h-6 text-bb-navy group-hover:text-bb-gold" />
            </div>
            <div className="mt-8">
              <h3 className="text-xl font-bold text-bb-navy mb-3">No False Guarantees</h3>
              <p className="text-slate-500 text-sm leading-relaxed">
                Visa decisions are made solely by the respective embassies. We guarantee a 100% legally compliant, perfectly structured application to maximize your success probability, but we will never lie about guaranteed outcomes.
              </p>
            </div>
          </motion.div>

          {/* Client Satisfaction (Stats) */}
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="rounded-[2rem] border border-transparent bg-bb-navy p-8 shadow-premium flex flex-col relative overflow-hidden group"
          >
            <div className="absolute top-0 right-0 w-40 h-40 bg-bb-sky/20 rounded-full blur-[50px] group-hover:bg-bb-gold/20 transition-colors duration-700" />
            <div className="w-12 h-12 bg-white/10 backdrop-blur-md rounded-2xl flex items-center justify-center mb-auto">
              <Star className="w-6 h-6 text-bb-gold fill-bb-gold" />
            </div>
            <div className="mt-8 relative z-10">
              <div className="flex items-baseline gap-2 mb-2">
                <span className="text-5xl font-bold text-white tracking-tight">98</span>
                <span className="text-2xl font-bold text-bb-gold">%</span>
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">Compliance Rating</h3>
              <p className="text-slate-400 text-sm leading-relaxed font-light">
                On first-time application submissions audited and verified by our legal partners.
              </p>
            </div>
          </motion.div>

          {/* Location & Contact */}
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="rounded-[2rem] border border-slate-200 bg-white p-8 shadow-sm flex flex-col relative overflow-hidden group col-span-1 md:col-span-2 lg:col-span-1"
          >
            {/* Faint Map Background */}
            <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1524661135-423995f22d0b?auto=format&fit=crop&w=800&q=80')] opacity-[0.03] bg-cover bg-center grayscale pointer-events-none" />
            
            <div className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center mb-auto relative z-10 group-hover:bg-bb-gold/10 transition-colors">
              <MapPin className="w-6 h-6 text-bb-navy group-hover:text-bb-gold" />
            </div>
            <div className="mt-8 relative z-10">
              <h3 className="text-xl font-bold text-bb-navy mb-3">Headquarters</h3>
              <p className="text-slate-600 font-medium mb-1">{brand.address}</p>
              <p className="text-slate-500 text-sm leading-relaxed mb-4">
                Operating locally, executing globally. Visit our office for in-person consultations.
              </p>
              <div className="flex flex-col gap-2 pt-4 border-t border-slate-100">
                <span className="text-sm font-medium text-bb-navy flex justify-between">
                  <span className="text-slate-500">Phone:</span> {brand.phone}
                </span>
                <span className="text-sm font-medium text-bb-navy flex justify-between">
                  <span className="text-slate-500">Alt Phone:</span> {brand.secondaryPhone}
                </span>
                <span className="text-sm font-medium text-bb-navy flex justify-between">
                  <span className="text-slate-500">Email:</span> {brand.email}
                </span>
                <span className="text-sm font-medium text-bb-navy flex justify-between">
                  <span className="text-slate-500">Digital Address:</span> {brand.digitalAddress}
                </span>
              </div>
            </div>
          </motion.div>

          {/* Partnerships Placeholder */}
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, ease: "easeOut" }}
            className="bg-white rounded-3xl p-6 md:p-8 flex flex-col items-center justify-center text-center border border-slate-200 shadow-sm hover:shadow-[0_20px_40px_rgba(0,0,0,0.08)] hover:-translate-y-1.5 transition-all duration-700 ease-out group"
          >
            <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mb-6 shadow-sm border border-slate-100 group-hover:border-bb-gold transition-colors">
              <Building2 className="w-6 h-6 text-slate-400 group-hover:text-bb-gold" />
            </div>
            <h3 className="text-lg font-bold text-bb-navy mb-2">Global Partnerships</h3>
            <p className="text-slate-500 text-sm">
              We operate alongside verified UK NHS Trusts, Canadian Universities, and leading EU Logistics firms.
            </p>
          </motion.div>

        </div>
      </Container>
    </Section>
  );
}
