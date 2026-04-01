"use client";

import { motion } from "framer-motion";
import { Check } from "lucide-react";

export function ProcessTimeline({ steps }: { steps: string[] }) {
  return (
    <ol className="space-y-0">
      {steps.map((step, index) => {
        const isCompleted = index < 3;
        const isActive = index === 3;
        return (
          <motion.li
            key={step}
            initial={{ opacity: 0, x: -10 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ delay: index * 0.1 }}
            className="relative flex items-start gap-5 pb-8 last:pb-0 group"
          >
            {/* Vertical Line */}
            {index < steps.length - 1 && (
              <div className={`absolute left-[19px] top-[40px] w-[2px] h-[calc(100%-40px)] ${
                isCompleted ? "bg-gradient-to-b from-bb-gold to-bb-gold/30" : "bg-white/10"
              }`} />
            )}

            {/* Circle */}
            <div className={`relative z-10 flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-sm font-bold transition-all duration-300 ${
              isCompleted
                ? "bg-bb-gold text-[#020813] shadow-[0_0_20px_rgba(201,164,77,0.3)]"
                : isActive
                  ? "bg-white/10 text-white ring-4 ring-white/5 shadow-lg border-bb-gold/50 border"
                  : "bg-[#020813] text-white/40 border-2 border-white/10"
            }`}>
              {isCompleted ? <Check className="h-5 w-5" /> : index + 1}
            </div>

            {/* Content */}
            <div className={`pt-2 flex-1 rounded-xl transition-all ${
              isActive ? "bg-white/5 -mx-3 px-3 py-3 -mt-1 border border-white/10" : ""
            }`}>
              <p className={`text-base font-semibold ${
                isCompleted ? "text-bb-gold" : isActive ? "text-white" : "text-white/40"
              }`}>
                {step}
              </p>
              {isActive && (
                <p className="text-xs text-bb-gold mt-1 font-semibold uppercase tracking-wider">In Progress</p>
              )}
            </div>
          </motion.li>
        );
      })}
    </ol>
  );
}
