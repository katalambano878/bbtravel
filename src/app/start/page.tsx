"use client";

import { useActionState, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Check, CheckCircle2, ChevronRight, CornerDownLeft, ArrowLeft, Loader2 } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { submitStartProfileAction, type StartProfileState } from "@/app/actions";

const STEPS = [
  { id: "intent", title: "What do you need help with?" },
  { id: "audience", title: "Who is this application for?" },
  { id: "location", title: "Where are you currently located?" },
  { id: "contact", title: "Where should we send your strategy?" }
];

const GHANA_REGIONS = [
  "Greater Accra",
  "Ashanti",
  "Central",
  "Eastern",
  "Western",
  "Western North",
  "Volta",
  "Oti",
  "Bono",
  "Bono East",
  "Ahafo",
  "Northern",
  "Savannah",
  "North East",
  "Upper East",
  "Upper West"
];

export default function StartApplicationPage() {
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState({
    intent: "",
    audience: "",
    location: "Ghana",
    region: "",
    town: "",
    city_other: "",
    name: "",
    email: "",
    phone: ""
  });
  const [state, formAction, isPending] = useActionState(submitStartProfileAction, null as StartProfileState);

  const nextStep = () => {
    if (currentStep < STEPS.length - 1) {
      setCurrentStep((curr) => curr + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep((curr) => curr - 1);
    }
  };

  const handleSelection = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setTimeout(() => nextStep(), 300);
  };

  if (state?.ok) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-bb-navy p-6 text-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="glass-panel-dark w-full max-w-md rounded-[2rem] p-10 ring-1 ring-white/10"
        >
          <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-bb-gold/20">
            <CheckCircle2 className="h-10 w-10 text-bb-gold" />
          </div>
          <h2 className="mb-4 text-3xl font-bold text-white">Profile received.</h2>
          <p className="mb-8 font-light text-slate-400">
            Our assessment team will review your details and reach out within 24 hours. A case file has been opened
            in our system so we can track your request.
          </p>
          <Button asChild className="h-14 w-full rounded-xl bg-bb-gold text-base font-bold text-bb-navy hover:bg-white">
            <Link href="/">Return to Homepage</Link>
          </Button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="relative flex min-h-screen flex-col overflow-hidden bg-bb-navy text-white selection:bg-bb-gold selection:text-bb-navy">
      <div className="pointer-events-none absolute right-0 top-0 h-[800px] w-[800px] -translate-y-1/2 translate-x-1/3 rounded-full bg-bb-gold/5 blur-[120px]" />
      <div className="pointer-events-none absolute bottom-0 left-0 h-[600px] w-[600px] translate-y-1/3 -translate-x-1/3 rounded-full bg-bb-sky/5 blur-[100px]" />

      <header className="relative z-20 flex items-center justify-between p-6 md:px-12 md:py-8">
        <Link href="/" className="flex items-center text-sm font-semibold text-slate-400 transition-colors hover:text-white">
          <ArrowLeft className="mr-2 h-4 w-4" /> Cancel &amp; Return
        </Link>
        <div className="text-sm font-semibold uppercase tracking-wide text-bb-gold">
          Step {currentStep + 1} of {STEPS.length}
        </div>
      </header>

      <main className="relative z-10 mx-auto flex w-full max-w-2xl flex-1 flex-col items-center justify-center p-6">
        <div className="mb-12 h-1.5 w-full max-w-md overflow-hidden rounded-full bg-white/10 shadow-inner">
          <motion.div
            className="h-full rounded-full bg-bb-gold"
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
            className="flex w-full max-w-md flex-col items-start"
          >
            <h1 className="mb-8 text-3xl font-bold leading-[1.2] md:text-4xl">
              <span className="text-bb-gold">
                {currentStep + 1} <span className="mx-2 opacity-50">→</span>
              </span>
              {STEPS[currentStep].title}
            </h1>

            {currentStep === 0 && (
              <div className="w-full space-y-3">
                {["Visa Assistance", "Jobs Abroad", "Study Abroad", "Tours / Vacations"].map((opt) => (
                  <button
                    key={opt}
                    type="button"
                    onClick={() => handleSelection("intent", opt)}
                    className={`group flex w-full items-center justify-between rounded-xl border p-5 text-left transition-all duration-300 ${
                      formData.intent === opt
                        ? "border-bb-gold bg-bb-gold/10 text-bb-gold"
                        : "border-white/10 bg-white/5 hover:border-white/30 hover:bg-white/10"
                    }`}
                  >
                    <span className="text-lg font-medium">{opt}</span>
                    <div
                      className={`flex h-6 w-6 items-center justify-center rounded-md border ${
                        formData.intent === opt ? "border-bb-gold bg-bb-gold text-bb-navy" : "border-white/20 group-hover:border-white/40"
                      }`}
                    >
                      {formData.intent === opt && <Check className="h-4 w-4" />}
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
                    type="button"
                    onClick={() => handleSelection("audience", opt)}
                    className={`group flex w-full items-center justify-between rounded-xl border p-5 text-left transition-all duration-300 ${
                      formData.audience === opt
                        ? "border-bb-gold bg-bb-gold/10 text-bb-gold"
                        : "border-white/10 bg-white/5 hover:border-white/30 hover:bg-white/10"
                    }`}
                  >
                    <span className="text-lg font-medium">{opt}</span>
                    <div
                      className={`flex h-6 w-6 items-center justify-center rounded-md border ${
                        formData.audience === opt ? "border-bb-gold bg-bb-gold text-bb-navy" : "border-white/20 group-hover:border-white/40"
                      }`}
                    >
                      {formData.audience === opt && <Check className="h-4 w-4" />}
                    </div>
                  </button>
                ))}
              </div>
            )}

            {currentStep === 2 && (
              <div className="w-full space-y-4">
                <div>
                  <label className="mb-2 block text-xs font-semibold uppercase tracking-wide text-slate-400">
                    Country
                  </label>
                  <select
                    value={formData.location}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        location: e.target.value,
                        region: e.target.value === "Ghana" ? prev.region : "",
                        town: e.target.value === "Ghana" ? prev.town : "",
                        city_other: e.target.value !== "Ghana" ? prev.city_other : ""
                      }))
                    }
                    className="w-full appearance-none rounded-xl border border-white/10 bg-white/5 p-5 text-lg text-white outline-none transition-colors duration-300 hover:border-white/30 focus:border-bb-gold focus:ring-1 focus:ring-bb-gold"
                  >
                    <option value="Ghana" className="text-slate-900">
                      Ghana
                    </option>
                    <option value="Nigeria" className="text-slate-900">
                      Nigeria
                    </option>
                    <option value="UAE" className="text-slate-900">
                      UAE (Dubai)
                    </option>
                    <option value="Other" className="text-slate-900">
                      Other global location
                    </option>
                  </select>
                </div>

                {formData.location === "Ghana" ? (
                  <>
                    <div>
                      <label className="mb-2 block text-xs font-semibold uppercase tracking-wide text-slate-400">
                        Region in Ghana
                      </label>
                      <select
                        value={formData.region}
                        onChange={(e) => setFormData((prev) => ({ ...prev, region: e.target.value }))}
                        className="w-full appearance-none rounded-xl border border-white/10 bg-white/5 p-5 text-lg text-white outline-none transition-colors duration-300 hover:border-white/30 focus:border-bb-gold focus:ring-1 focus:ring-bb-gold"
                      >
                        <option value="" className="text-slate-900">
                          Select a region…
                        </option>
                        {GHANA_REGIONS.map((region) => (
                          <option key={region} value={region} className="text-slate-900">
                            {region}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="mb-2 block text-xs font-semibold uppercase tracking-wide text-slate-400">
                        Town / area (exact location)
                      </label>
                      <input
                        type="text"
                        value={formData.town}
                        onChange={(e) => setFormData((prev) => ({ ...prev, town: e.target.value }))}
                        placeholder="e.g. Teshie, Accra or Kumasi – Adum"
                        className="w-full rounded-xl border border-white/10 bg-white/5 p-5 text-lg text-white outline-none transition-colors placeholder:text-slate-500 focus:border-bb-gold focus:ring-1 focus:ring-bb-gold"
                      />
                    </div>
                  </>
                ) : (
                  <div>
                    <label className="mb-2 block text-xs font-semibold uppercase tracking-wide text-slate-400">
                      City / area
                    </label>
                    <input
                      type="text"
                      value={formData.city_other}
                      onChange={(e) => setFormData((prev) => ({ ...prev, city_other: e.target.value }))}
                      placeholder="e.g. Lagos, Dubai, London"
                      className="w-full rounded-xl border border-white/10 bg-white/5 p-5 text-lg text-white outline-none transition-colors placeholder:text-slate-500 focus:border-bb-gold focus:ring-1 focus:ring-bb-gold"
                    />
                  </div>
                )}

                <div className="pt-2 flex items-center gap-4">
                  <Button
                    onClick={nextStep}
                    disabled={
                      formData.location === "Ghana"
                        ? !formData.region || formData.town.trim().length < 2
                        : formData.city_other.trim().length < 2
                    }
                    className="h-14 flex-1 rounded-xl bg-bb-gold text-base font-bold text-bb-navy hover:bg-white disabled:opacity-40"
                  >
                    Continue <ChevronRight className="ml-1 h-5 w-5" />
                  </Button>
                </div>
              </div>
            )}

            {currentStep === 3 && (
              <form action={formAction} className="w-full space-y-4">
                <input type="hidden" name="intent" value={formData.intent} />
                <input type="hidden" name="audience" value={formData.audience} />
                <input type="hidden" name="location" value={formData.location} />
                <input type="hidden" name="region" value={formData.region} />
                <input type="hidden" name="town" value={formData.town} />
                <input type="hidden" name="city_other" value={formData.city_other} />
                {state?.error ? <p className="text-sm text-amber-200">{state.error}</p> : null}
                <input
                  type="text"
                  name="name"
                  required
                  placeholder="Full legal name"
                  value={formData.name}
                  onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
                  className="w-full rounded-xl border border-white/10 bg-white/5 p-5 text-lg text-white outline-none transition-colors placeholder:text-slate-500 focus:border-bb-gold focus:ring-1 focus:ring-bb-gold"
                />
                <input
                  type="email"
                  name="email"
                  required
                  placeholder="Email address"
                  value={formData.email}
                  onChange={(e) => setFormData((prev) => ({ ...prev, email: e.target.value }))}
                  className="w-full rounded-xl border border-white/10 bg-white/5 p-5 text-lg text-white outline-none transition-colors placeholder:text-slate-500 focus:border-bb-gold focus:ring-1 focus:ring-bb-gold"
                />
                <input
                  type="tel"
                  name="phone"
                  required
                  placeholder="WhatsApp number"
                  value={formData.phone}
                  onChange={(e) => setFormData((prev) => ({ ...prev, phone: e.target.value }))}
                  className="mb-4 w-full rounded-xl border border-white/10 bg-white/5 p-5 text-lg text-white outline-none transition-colors placeholder:text-slate-500 focus:border-bb-gold focus:ring-1 focus:ring-bb-gold"
                />
                <Button
                  type="submit"
                  disabled={isPending || !formData.name || !formData.email || !formData.phone}
                  className="mt-4 h-14 w-full rounded-xl bg-bb-gold text-base font-bold text-bb-navy shadow-[0_0_20px_rgba(200,164,93,0.3)] transition-all hover:bg-white disabled:opacity-50 disabled:shadow-none"
                >
                  {isPending ? (
                    <>
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                      Submitting…
                    </>
                  ) : (
                    <>
                      Submit profile <CornerDownLeft className="ml-2 h-5 w-5" />
                    </>
                  )}
                </Button>
                <p className="mt-4 flex items-center justify-center gap-2 text-center text-xs font-light text-slate-400">
                  <CheckCircle2 className="h-3.5 w-3.5 text-green-500" /> We use your details only to respond to this request.
                </p>
              </form>
            )}
          </motion.div>
        </AnimatePresence>

        {currentStep > 0 && !state?.ok && (
          <button
            type="button"
            onClick={prevStep}
            className="mt-8 text-sm text-slate-500 underline decoration-white/20 underline-offset-4 hover:text-white"
          >
            Back
          </button>
        )}
      </main>
    </div>
  );
}
