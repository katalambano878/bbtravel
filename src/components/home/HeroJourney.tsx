"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, MessageCircle, ShieldCheck, FileText, CheckCircle2, Clock, Globe } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Container } from "@/components/layout/Container";
import { brand } from "@/lib/mockData";
import { cn } from "@/lib/utils/cn";

const heroImages = [
  "https://images.unsplash.com/photo-1436491865332-7a61a109cc05?auto=format&fit=crop&w=2000&q=80",
  "https://images.unsplash.com/photo-1512453979798-5ea266f8880c?auto=format&fit=crop&w=2000&q=80",
  "https://images.unsplash.com/photo-1524661135-423995f22d0b?auto=format&fit=crop&w=2000&q=80"
];

const journeyData = [
  { id: "visa", label: "Visa", icon: FileText, score: 85, steps: ["Profile Assessment", "Document Compilation", "Submission Strategy", "Embassy Decision"] },
  { id: "jobs", label: "Jobs", icon: ShieldCheck, score: 92, steps: ["Skills Review", "Vetted Match", "Offer & Contract", "Relocation Prep"] },
  { id: "study", label: "Study", icon: Globe, score: 78, steps: ["Course Matching", "Scholarships", "Application Sent", "Student Visa"] },
  { id: "tours", label: "Tours", icon: Clock, score: 100, steps: ["Destination Pick", "Itinerary Build", "Booking & Payment", "Travel Prep"] },
];

export function HeroJourney() {
  const [activePath, setActivePath] = useState("visa");
  const [currentImage, setCurrentImage] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentImage((prev) => (prev + 1) % heroImages.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  const currentPath = journeyData.find((p) => p.id === activePath)!;

  return (
    <section className="relative min-h-[90vh] md:min-h-screen bg-bb-navy flex items-center pt-24 pb-16 overflow-hidden">
      <div className="absolute inset-0 z-0">
        <AnimatePresence mode="popLayout">
          <motion.div
            key={currentImage}
            initial={{ opacity: 0, scale: 1.02 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.5, ease: "easeInOut" }}
            className="absolute inset-0 bg-cover bg-center"
            style={{ backgroundImage: `url(${heroImages[currentImage]})` }}
          />
        </AnimatePresence>
        {/* 30% overlay */}
        <div className="absolute inset-0 bg-black/40" />
        <div className="absolute inset-0 bg-gradient-to-t from-bb-navy via-transparent to-transparent opacity-90" />
      </div>

      <Container className="relative z-10 w-full flex flex-col items-center justify-center min-h-[70vh]">
        <div className="w-full max-w-4xl mx-auto">
          
          {/* Main Content */}
          <div className="space-y-8 flex flex-col items-center text-center w-full">


            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="text-5xl md:text-6xl lg:text-7xl font-bold text-white tracking-tight leading-[1.1]"
            >
              Where Your <br className="hidden md:block" />
              <span className="text-bb-gold">
                Travel Dreams
              </span>{" "}
              Take Flight.
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-lg md:text-xl text-slate-300 font-light leading-relaxed max-w-3xl mx-auto"
            >
              Visa support <span className="text-bb-gold/70">•</span> Flight & hotel booking{" "}
              <span className="text-bb-gold/70">•</span> Jobs abroad{" "}
              <span className="text-bb-gold/70">•</span> Study abroad{" "}
              <span className="text-bb-gold/70">•</span> Tours{" "}
              <span className="text-bb-gold/70">•</span> Travel document authentication{" "}
              <span className="text-bb-gold/70">•</span> Travel consulting{" "}
              <span className="text-bb-gold/70">•</span> and many more{" "}
              <span className="text-white/50">—</span> guided ethically, legally, and transparently.
            </motion.p>

            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-6 w-full"
            >
              <Button asChild className="h-14 px-8 text-base bg-bb-gold hover:bg-white text-bb-navy hover:text-bb-navy font-bold shadow-[0_0_30px_rgba(200,164,93,0.3)] transition-all duration-300 w-full sm:w-auto rounded-xl">
                <Link href="/start">
                  Start Application <ArrowRight className="ml-2 w-5 h-5" />
                </Link>
              </Button>
              <Button asChild className="h-14 px-8 text-base bg-white/5 border border-white/10 hover:border-white/20 hover:bg-white/10 text-white font-medium transition-all w-full sm:w-auto rounded-xl">
                <a href={`https://wa.me/${brand.whatsapp.replace(/\D/g, "").replace(/^0/, "233")}`} target="_blank" rel="noreferrer">
                  <MessageCircle className="ml-0 mr-2 w-5 h-5 text-bb-gold" /> Speak to a Consultant
                </a>
              </Button>
            </motion.div>
          </div>

          {/* Right Content - Interactive Journey Card - Commented out for now
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="w-full max-w-[480px] mx-auto lg:ml-auto"
          >
            <div className="glass-panel-dark rounded-3xl p-6 relative overflow-hidden ring-1 ring-white/10">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-white font-semibold text-lg">Journey Preview</h3>
                <div className="flex bg-bb-navy/50 p-1 rounded-lg ring-1 ring-white/5">
                  {journeyData.map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => setActivePath(tab.id)}
                      className={cn(
                        "text-xs font-semibold px-3 py-1.5 rounded-md transition-all",
                        activePath === tab.id 
                          ? "bg-bb-gold text-bb-navy shadow-sm"
                          : "text-slate-400 hover:text-white"
                      )}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>
              </div>

              <AnimatePresence mode="wait">
                <motion.div
                  key={activePath}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3 }}
                  className="space-y-6"
                >
                  <div className="bg-white/5 rounded-2xl p-4 flex items-center justify-between border border-white/5">
                    <div className="flex items-center gap-3">
                      <div className="bg-bb-gold/20 p-2 rounded-lg">
                        <currentPath.icon className="w-6 h-6 text-bb-gold" />
                      </div>
                      <div>
                         <p className="text-xs text-slate-400 uppercase tracking-wider font-semibold">Success Vector</p>
                         <p className="text-white text-sm font-medium">{currentPath.label} Prep</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-bb-sky">{currentPath.score}%</div>
                      <div className="text-[10px] text-slate-500 uppercase tracking-wider">Readiness</div>
                    </div>
                  </div>

                  <div className="space-y-4 pt-2">
                    {currentPath.steps.map((step, idx) => (
                      <motion.div 
                        initial={{ opacity: 0, x: 10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.1 * idx }}
                        key={idx} 
                        className="flex gap-4 relative"
                      >
                        {idx !== currentPath.steps.length - 1 && (
                          <div className="absolute left-[11px] top-6 bottom-[-16px] w-[2px] bg-gradient-to-b from-bb-gold/50 to-white/10" />
                        )}
                        <div className={cn(
                          "w-6 h-6 rounded-full flex items-center justify-center shrink-0 z-10",
                          idx === 0 ? "bg-bb-gold text-bb-navy ring-4 ring-bb-gold/20" : "bg-white/10 ring-1 ring-white/20"
                        )}>
                          {idx === 0 ? <CheckCircle2 className="w-4 h-4" /> : <div className="w-1.5 h-1.5 rounded-full bg-slate-400" />}
                        </div>
                        <div className="flex-1 pb-2">
                           <p className={cn(
                             "text-sm font-medium",
                             idx === 0 ? "text-bb-gold" : "text-slate-300"
                           )}>
                             {step}
                           </p>
                           {idx === 0 && <p className="text-xs text-slate-500 mt-0.5">Your current position</p>}
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </motion.div>
              </AnimatePresence>
            </div>
          </motion.div>
          */}

        </div>
      </Container>
    </section>
  );
}
