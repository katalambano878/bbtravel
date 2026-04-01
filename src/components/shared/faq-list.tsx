"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Minus } from "lucide-react";

export function FaqList({ items }: { items: { question: string; answer: string }[] }) {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <div className="w-full space-y-2 max-w-3xl mx-auto">
      {items.map((item, i) => {
        const isOpen = openIndex === i;
        return (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.1 }}
            key={item.question}
            className={`group relative overflow-hidden rounded-2xl border transition-all duration-500 ${
              isOpen 
                ? "bg-white/[0.03] border-bb-gold/20 shadow-[0_0_30px_rgba(201,164,77,0.05)]" 
                : "bg-transparent border-white/5 hover:border-white/10 hover:bg-white/[0.01]"
            }`}
          >
            {/* Glowing active divider */}
            <div className={`absolute top-0 left-0 bottom-0 w-[2px] bg-bb-gold transition-opacity duration-300 ${isOpen ? "opacity-100 shadow-[0_0_15px_rgba(201,164,77,1)]" : "opacity-0"}`} />

            <button
              onClick={() => setOpenIndex(isOpen ? null : i)}
              className="flex w-full items-center justify-between p-6 text-left relative z-10"
            >
              <h3 className={`text-lg font-medium pr-8 transition-colors duration-300 ${
                isOpen ? "text-bb-gold" : "text-white/80 group-hover:text-white"
              }`}>
                {item.question}
              </h3>
              <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full border transition-all duration-300 ${
                isOpen ? "bg-bb-gold/10 border-bb-gold/30 text-bb-gold" : "bg-white/5 border-white/10 text-white/50 group-hover:bg-white/10 group-hover:text-white"
              }`}>
                {isOpen ? <Minus className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
              </div>
            </button>
            <AnimatePresence>
              {isOpen && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.3, ease: "easeInOut" }}
                  className="overflow-hidden relative z-10"
                >
                  <div className="p-6 pt-0 text-base font-light leading-relaxed text-slate-400">
                    {item.answer}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        );
      })}
    </div>
  );
}
