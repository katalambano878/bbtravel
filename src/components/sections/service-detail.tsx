"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, CheckCircle2, Shield, Target, Clock, Users, Star, MessageCircle, FileCheck, Zap } from "lucide-react";
import { serviceWorkflows } from "@/lib/data/brand";
import { FaqList } from "@/components/shared/faq-list";
import { Button } from "@/components/ui/button";
import { brand } from "@/lib/data/brand";
import type { ServiceType } from "@/types/domain";

interface ServiceDetailProps {
  title: string;
  overview: string;
  whoFor: string;
  checklistPreview: string[];
  faqs: { question: string; answer: string }[];
  serviceType: ServiceType;
  backgroundImage?: string;
}

export function ServiceDetailSection(props: ServiceDetailProps) {
  const { title, overview, whoFor, checklistPreview, faqs, serviceType, backgroundImage = "/images/page-hero/services.webp" } = props;
  const workflow = serviceWorkflows[serviceType];

  return (
    <>
      {/* ━━━ Section 1: Overview & Who It's For ━━━ */}
      <section className="bg-white py-20 md:py-28">
        <div className="container mx-auto px-6 max-w-6xl">
          <div className="grid lg:grid-cols-5 gap-12 lg:gap-20 items-start">
            {/* Main Content */}
            <div className="lg:col-span-3 space-y-6">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
              >
                <p className="text-sm font-bold uppercase tracking-widest text-bb-gold mb-3">Overview</p>
                <h2 className="text-3xl md:text-4xl font-bold text-bb-navy tracking-tight leading-snug mb-6">
                  What we do — and why it works.
                </h2>
                <p className="text-slate-600 leading-relaxed text-[15px]">
                  {overview}
                </p>
              </motion.div>
            </div>

            {/* Side Card: Who It's For */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="lg:col-span-2"
            >
              <div className="bg-bb-navy rounded-2xl p-8 relative overflow-hidden">
                <div className="absolute -top-16 -right-16 w-48 h-48 bg-bb-gold/10 rounded-full blur-3xl" />
                <div className="relative z-10">
                  <div className="flex items-center gap-3 mb-5">
                    <div className="w-10 h-10 bg-bb-gold/20 rounded-xl flex items-center justify-center">
                      <Target className="w-5 h-5 text-bb-gold" />
                    </div>
                    <p className="text-xs font-bold uppercase tracking-widest text-bb-gold">Ideal Client</p>
                  </div>
                  <p className="text-white/90 leading-relaxed text-[15px]">
                    {whoFor}
                  </p>
                  <div className="mt-6 pt-6 border-t border-white/10">
                    <Button asChild className="w-full h-12 bg-bb-gold text-bb-navy hover:bg-white hover:text-bb-navy text-sm font-bold rounded-xl transition-all">
                      <Link href="/start">
                        Start Your Assessment <ArrowRight className="ml-2 w-4 h-4" />
                      </Link>
                    </Button>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ━━━ Section 2: Why Clients Choose Us (Trust Indicators) ━━━ */}
      <section className="bg-slate-50 border-y border-slate-200 py-16 md:py-20">
        <div className="container mx-auto px-6 max-w-6xl">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8">
            {[
              { icon: Shield, label: "Licensed & Registered", value: "Fully Compliant" },
              { icon: Clock, label: "Average Response Time", value: "Under 2 Hours" },
              { icon: Users, label: "Clients Served", value: "287 people" },
              { icon: Star, label: "Client Satisfaction", value: "4.9/5 Rating" },
            ].map((stat, i) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 15 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08 }}
                className="bg-white rounded-xl p-5 md:p-6 border border-slate-200 text-center"
              >
                <div className="inline-flex items-center justify-center w-10 h-10 rounded-lg bg-bb-navy/5 mb-3">
                  <stat.icon className="w-5 h-5 text-bb-gold" />
                </div>
                <p className="text-xl md:text-2xl font-extrabold text-bb-navy">{stat.value}</p>
                <p className="text-xs text-slate-500 font-medium mt-1">{stat.label}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ━━━ Section 3: Document Checklist ━━━ */}
      <section className="bg-white py-20 md:py-28">
        <div className="container mx-auto px-6 max-w-6xl">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
            {/* Left: Copy */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="space-y-5"
            >
              <p className="text-sm font-bold uppercase tracking-widest text-bb-gold">Required Documentation</p>
              <h2 className="text-3xl md:text-4xl font-bold text-bb-navy tracking-tight leading-snug">
                Your preparation checklist.
              </h2>
              <p className="text-slate-600 leading-relaxed text-[15px]">
                Before we begin, here's what you'll need. Don't worry if you're missing items — during your assessment, we'll identify gaps and guide you on how to source or substitute every document.
              </p>
              <div className="pt-2">
                <Button asChild variant="secondary" className="h-12 px-6 text-sm border border-bb-navy/20 text-bb-navy hover:bg-bb-navy hover:text-white rounded-xl font-semibold transition-all">
                  <Link href="/start">
                    <FileCheck className="w-4 h-4 mr-2" /> Get Your Personalized Checklist
                  </Link>
                </Button>
              </div>
            </motion.div>

            {/* Right: Checklist Items */}
            <div className="space-y-3">
              {checklistPreview.map((item, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, x: 15 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: idx * 0.07 }}
                  className="flex items-start gap-4 p-4 bg-slate-50 rounded-xl border border-slate-200 hover:border-bb-sky/30 hover:bg-white transition-all group"
                >
                  <div className="flex items-center justify-center w-7 h-7 rounded-lg bg-bb-sky/10 shrink-0 mt-0.5 group-hover:bg-bb-sky/20 transition-colors">
                    <CheckCircle2 className="w-4 h-4 text-bb-sky" />
                  </div>
                  <span className="text-sm text-slate-700 font-medium leading-relaxed">{item}</span>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ━━━ Section 4: How It Works (Execution Strategy) ━━━ */}
      <section className="py-20 md:py-28 relative overflow-hidden">
        {/* Background Image */}
        <div className="absolute inset-0 bg-cover bg-center bg-scroll md:bg-fixed" style={{ backgroundImage: `url(${backgroundImage})` }} />
        {/* 35% Dark Overlay */}
        <div className="absolute inset-0 bg-bb-navy/[0.65]" />

        <div className="container mx-auto px-6 max-w-6xl relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center max-w-2xl mx-auto mb-14"
          >
            <p className="text-sm font-bold uppercase tracking-widest text-bb-gold mb-3">Our Process</p>
            <h2 className="text-3xl md:text-4xl font-bold text-white tracking-tight leading-snug mb-4">
              How we execute — step by step.
            </h2>
            <p className="text-slate-400 text-[15px] leading-relaxed">
              Every engagement follows a structured methodology. No guesswork, no surprises — a transparent roadmap from assessment to outcome.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
            {workflow.map((step, idx) => {
              // Split step at the em dash for title vs description
              const parts = step.split(" — ");
              const stepTitle = parts[0];
              const stepDesc = parts[1] || "";

              return (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: idx * 0.08 }}
                  className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10 hover:border-bb-gold/30 hover:bg-white/[0.08] transition-all group"
                >
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-9 h-9 rounded-xl bg-bb-gold/15 flex items-center justify-center text-bb-gold text-sm font-bold group-hover:bg-bb-gold group-hover:text-bb-navy transition-all">
                      {String(idx + 1).padStart(2, "0")}
                    </div>
                  </div>
                  <h4 className="text-white font-semibold text-[15px] mb-2">{stepTitle}</h4>
                  {stepDesc && (
                    <p className="text-slate-400 text-sm leading-relaxed">{stepDesc}</p>
                  )}
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ━━━ Section 5: Why Not DIY? (Objection Handling) ━━━ */}
      <section className="bg-white py-20 md:py-28">
        <div className="container mx-auto px-6 max-w-6xl">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
            {/* Left Copy */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="space-y-5"
            >
              <p className="text-sm font-bold uppercase tracking-widest text-bb-gold">Why Professional Guidance</p>
              <h2 className="text-3xl md:text-4xl font-bold text-bb-navy tracking-tight leading-snug">
                The cost of getting it wrong.
              </h2>
              <p className="text-slate-600 leading-relaxed text-[15px]">
                Many applicants attempt to navigate complex processes alone, only to face costly refusals, lost time, and emotional stress. Here's what professional guidance actually changes:
              </p>
            </motion.div>

            {/* Right: Comparison */}
            <div className="space-y-4">
              {[
                { without: "Guessing what documents the embassy requires", with: "Embassy-specific checklist tailored to your profile" },
                { without: "Submitting applications with inconsistencies", with: "Cross-referenced documentation that tells one coherent story" },
                { without: "Unprepared for interview questions", with: "Mock interview sessions based on real officer patterns" },
                { without: "Missing deadlines and losing appointments", with: "Coordinated timeline management from start to finish" },
              ].map((item, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 10 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.08 }}
                  className="flex gap-4 p-4 rounded-xl bg-slate-50 border border-slate-200"
                >
                  <div className="shrink-0 space-y-2.5 pt-0.5">
                    <div className="w-5 h-5 rounded-full bg-red-100 flex items-center justify-center">
                      <span className="text-red-500 text-xs font-bold">✕</span>
                    </div>
                    <div className="w-5 h-5 rounded-full bg-emerald-100 flex items-center justify-center">
                      <span className="text-emerald-600 text-xs font-bold">✓</span>
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <p className="text-sm text-slate-400 line-through decoration-slate-300">{item.without}</p>
                    <p className="text-sm text-bb-navy font-medium">{item.with}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ━━━ Section 6: Micro-CTA Band ━━━ */}
      <section className="py-12 md:py-14 relative overflow-hidden">
        {/* Background Image */}
        <div className="absolute inset-0 bg-cover bg-center bg-scroll md:bg-fixed" style={{ backgroundImage: `url(${backgroundImage})` }} />
        {/* 35% Dark Overlay */}
        <div className="absolute inset-0 bg-bb-navy/[0.65]" />
        <div className="container mx-auto px-6 max-w-5xl relative z-10">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6 text-center md:text-left">
            <div>
              <h3 className="text-xl md:text-2xl font-bold text-white mb-1">Ready to get started?</h3>
              <p className="text-slate-400 text-sm">Thousands have trusted us. Your assessment takes under 5 minutes.</p>
            </div>
            <div className="flex items-center gap-3 shrink-0">
              <Button asChild className="h-12 px-6 bg-bb-gold text-bb-navy hover:bg-white text-sm font-bold rounded-xl transition-all">
                <Link href="/start">
                  Begin Assessment <ArrowRight className="ml-2 w-4 h-4" />
                </Link>
              </Button>
              <Button variant="secondary" asChild className="h-12 px-6 bg-white/5 border border-white/10 text-white hover:bg-white/10 text-sm font-semibold rounded-xl">
                <a href={`https://wa.me/${brand.whatsapp.replace(/\D/g, "").replace(/^0/, "233")}`} target="_blank" rel="noreferrer">
                  <MessageCircle className="w-4 h-4 mr-2 text-bb-gold" /> WhatsApp
                </a>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* ━━━ Section 7: What Sets Us Apart ━━━ */}
      <section className="bg-slate-50 py-20 md:py-28">
        <div className="container mx-auto px-6 max-w-6xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center max-w-2xl mx-auto mb-14"
          >
            <p className="text-sm font-bold uppercase tracking-widest text-bb-gold mb-3">Our Edge</p>
            <h2 className="text-3xl md:text-4xl font-bold text-bb-navy tracking-tight leading-snug">
              What sets us apart.
            </h2>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                icon: Shield,
                title: "Zero Tolerance for Fraud",
                desc: "We never cut corners, forge documents, or misrepresent client profiles. Every application we submit is 100% genuine and legally compliant. Our reputation is built on integrity, not shortcuts."
              },
              {
                icon: Zap,
                title: "Speed With Precision",
                desc: "We don't believe in choosing between speed and thoroughness. Our structured workflows allow us to deliver fast, audit-quality documentation without sacrificing attention to detail."
              },
              {
                icon: Target,
                title: "Outcome-Focused Strategy",
                desc: "We don't just fill in forms — we reverse-engineer the decision criteria of embassies, employers, and institutions to build the strongest possible case for every client."
              },
            ].map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 15 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="bg-white rounded-2xl p-7 border border-slate-200 hover:shadow-lg transition-all group"
              >
                <div className="w-11 h-11 rounded-xl bg-bb-navy/5 flex items-center justify-center mb-5 group-hover:bg-bb-gold/10 transition-colors">
                  <item.icon className="w-5 h-5 text-bb-navy group-hover:text-bb-gold transition-colors" />
                </div>
                <h4 className="text-lg font-bold text-bb-navy mb-2">{item.title}</h4>
                <p className="text-sm text-slate-500 leading-relaxed">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ━━━ Section 8: FAQs ━━━ */}
      <section className="py-20 md:py-28 relative overflow-hidden">
        {/* Background Image */}
        <div className="absolute inset-0 bg-cover bg-center bg-scroll md:bg-fixed" style={{ backgroundImage: `url(${backgroundImage})` }} />
        {/* 35% Dark Overlay */}
        <div className="absolute inset-0 bg-bb-navy/[0.65]" />
        <div className="container mx-auto px-6 max-w-3xl relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-14"
          >
            <p className="text-sm font-bold uppercase tracking-widest text-bb-gold mb-3">Knowledge Base</p>
            <h2 className="text-3xl md:text-4xl font-bold text-white tracking-tight leading-snug">
              Common questions, honest answers.
            </h2>
          </motion.div>
          <FaqList items={faqs} />
        </div>
      </section>
    </>
  );
}
