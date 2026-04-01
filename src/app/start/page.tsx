"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Check, CheckCircle2, ChevronRight, CornerDownLeft, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

const STEPS = [
  { id: "intent", title: "What do you need help with?" },
  { id: "audience", title: "Who is this application for?" },
  { id: "location", title: "Where are you currently located?" },
  { id: "contact", title: "Where should we send your strategy?" },
];

export default function StartApplicationPage() {
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState({
    intent: "",
    audience: "",
    location: "Ghana",
    name: "",
    email: "",
    phone: "",
  });
  const [isSubmitted, setIsSubmitted] = useState(false);

  const nextStep = () => {
    if (currentStep < STEPS.length - 1) {
      setCurrentStep(curr => curr + 1);
    } else {
      setIsSubmitted(true);
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(curr => curr - 1);
    }
  };

  const handleSelection = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setTimeout(() => nextStep(), 300);
  };

  // Success State
  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-bb-navy flex items-center justify-center p-6 text-center">
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-md w-full glass-panel-dark rounded-[2rem] p-10 ring-1 ring-white/10"
        >
          <div className="w-20 h-20 bg-bb-gold/20 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 className="w-10 h-10 text-bb-gold" />
          </div>
          <h2 className="text-3xl font-bold text-white mb-4">Profile Received.</h2>
          <p className="text-slate-400 font-light mb-8">
            Our assessment team will review your profile and reach out within 24 hours to schedule your strategic consultation.
          </p>
          <Button asChild className="w-full h-14 bg-bb-gold text-bb-navy hover:bg-white text-base rounded-xl font-bold">
            <Link href="/">Return to Homepage</Link>
          </Button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-bb-navy text-white flex flex-col relative overflow-hidden selection:bg-bb-gold selection:text-bb-navy">
      {/* Background Motifs */}
      <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-bb-gold/5 rounded-full blur-[120px] pointer-events-none -translate-y-1/2 translate-x-1/3" />
      <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-bb-sky/5 rounded-full blur-[100px] pointer-events-none translate-y-1/3 -translate-x-1/3" />

      {/* Header */}
      <header className="p-6 md:px-12 md:py-8 flex justify-between items-center relative z-20">
        <Link href="/" className="flex items-center text-sm font-semibold text-slate-400 hover:text-white transition-colors">
          <ArrowLeft className="w-4 h-4 mr-2" /> Cancel & Return
        </Link>
        <div className="text-sm font-semibold text-bb-gold tracking-wide uppercase">
          Step {currentStep + 1} of {STEPS.length}
        </div>
      </header>

      {/* Wizard Content */}
      <main className="flex-1 flex flex-col items-center justify-center p-6 relative z-10 w-full max-w-2xl mx-auto">
        
        {/* Progress Bar */}
        <div className="w-full max-w-md h-1.5 bg-white/10 rounded-full mb-12 overflow-hidden shadow-inner">
          <motion.div 
            className="h-full bg-bb-gold rounded-full"
            initial={{ width: "0%" }}
            animate={{ width: `${((currentStep + 1) / STEPS.length) * 100}%` }}
            transition={{ duration: 0.5, ease: "easeOut" }}
          />
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
            className="w-full max-w-md flex flex-col items-start"
          >
            <h1 className="text-3xl md:text-4xl font-bold mb-8 leading-[1.2]">
              <span className="text-bb-gold">{currentStep + 1} <span className="opacity-50 mx-2">→</span></span>
              {STEPS[currentStep].title}
            </h1>

            {/* Render Steps */}
            {currentStep === 0 && (
              <div className="w-full space-y-3">
                {["Visa Assistance", "Jobs Abroad", "Study Abroad", "Tours / Vacations"].map((opt) => (
                  <button
                    key={opt}
                    onClick={() => handleSelection("intent", opt)}
                    className={`w-full text-left p-5 rounded-xl border transition-all duration-300 flex items-center justify-between group ${
                      formData.intent === opt 
                        ? "bg-bb-gold/10 border-bb-gold text-bb-gold" 
                        : "bg-white/5 border-white/10 hover:border-white/30 hover:bg-white/10"
                    }`}
                  >
                    <span className="font-medium text-lg">{opt}</span>
                    <div className={`w-6 h-6 rounded-md border flex items-center justify-center ${
                      formData.intent === opt ? "bg-bb-gold border-bb-gold text-bb-navy" : "border-white/20 group-hover:border-white/40"
                    }`}>
                      {formData.intent === opt && <Check className="w-4 h-4" />}
                    </div>
                  </button>
                ))}
              </div>
            )}

            {currentStep === 1 && (
              <div className="w-full space-y-3">
                {["Just myself", "Myself and my spouse", "A family unit", "Corporate group"].map((opt) => (
                  <button
                    key={opt}
                    onClick={() => handleSelection("audience", opt)}
                    className={`w-full text-left p-5 rounded-xl border transition-all duration-300 flex items-center justify-between group ${
                      formData.audience === opt 
                        ? "bg-bb-gold/10 border-bb-gold text-bb-gold" 
                        : "bg-white/5 border-white/10 hover:border-white/30 hover:bg-white/10"
                    }`}
                  >
                    <span className="font-medium text-lg">{opt}</span>
                    <div className={`w-6 h-6 rounded-md border flex items-center justify-center ${
                      formData.audience === opt ? "bg-bb-gold border-bb-gold text-bb-navy" : "border-white/20 group-hover:border-white/40"
                    }`}>
                      {formData.audience === opt && <Check className="w-4 h-4" />}
                    </div>
                  </button>
                ))}
              </div>
            )}

            {currentStep === 2 && (
              <div className="w-full">
                <select 
                  value={formData.location}
                  onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
                  className="w-full bg-white/5 border border-white/10 hover:border-white/30 focus:border-bb-gold focus:ring-1 focus:ring-bb-gold rounded-xl p-5 text-lg text-white appearance-none outline-none transition-colors duration-300"
                >
                  <option value="Ghana" className="text-slate-900">Ghana</option>
                  <option value="Nigeria" className="text-slate-900">Nigeria</option>
                  <option value="UAE" className="text-slate-900">UAE (Dubai)</option>
                  <option value="Other" className="text-slate-900">Other Global Location</option>
                </select>
                
                <div className="mt-8 flex items-center gap-4">
                  <Button onClick={nextStep} className="h-14 px-8 bg-bb-gold text-bb-navy hover:bg-white text-base rounded-xl font-bold flex-1">
                    Continue <ChevronRight className="w-5 h-5 ml-1" />
                  </Button>
                </div>
              </div>
            )}

            {currentStep === 3 && (
              <div className="w-full space-y-4">
                <input 
                  type="text" 
                  placeholder="Full Legal Name"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full bg-white/5 border border-white/10 focus:border-bb-gold focus:ring-1 focus:ring-bb-gold transition-colors duration-300 rounded-xl p-5 text-lg text-white outline-none placeholder:text-slate-500"
                />
                <input 
                  type="email" 
                  placeholder="Email Address"
                  value={formData.email}
                  onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                  className="w-full bg-white/5 border border-white/10 focus:border-bb-gold focus:ring-1 focus:ring-bb-gold transition-colors duration-300 rounded-xl p-5 text-lg text-white outline-none placeholder:text-slate-500"
                />
                <input 
                  type="tel" 
                  placeholder="WhatsApp Number"
                  value={formData.phone}
                  onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                  className="w-full bg-white/5 border border-white/10 focus:border-bb-gold focus:ring-1 focus:ring-bb-gold transition-colors duration-300 rounded-xl p-5 text-lg text-white outline-none placeholder:text-slate-500 mb-4"
                />

                <Button 
                  onClick={nextStep} 
                  disabled={!formData.name || !formData.email || !formData.phone}
                  className="w-full h-14 bg-bb-gold text-bb-navy hover:bg-white text-base rounded-xl font-bold mt-4 shadow-[0_0_20px_rgba(200,164,93,0.3)] disabled:opacity-50 disabled:shadow-none transition-all"
                >
                  Submit Application <CornerDownLeft className="w-5 h-5 ml-2" />
                </Button>
                <p className="text-xs text-slate-400 font-light text-center flex items-center justify-center gap-2 mt-4">
                  <CheckCircle2 className="w-3.5 h-3.5 text-green-500" /> End-to-end encrypted. No spam.
                </p>
              </div>
            )}

          </motion.div>
        </AnimatePresence>

      </main>
    </div>
  );
}
