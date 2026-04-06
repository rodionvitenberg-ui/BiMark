"use client";

import { useTranslations } from "next-intl";
import { motion } from "framer-motion";
import { FileText } from "lucide-react";

export default function TermsOfServicePage() {
  const t = useTranslations("TermsOfService");

  // Массив всех наших новых ключей из словаря
  const sections = [
    { title: "introTitle", text: "introText" },
    { title: "subjectTitle", text: "subjectText" },
    { title: "registrationTitle", text: "registrationText" },
    { title: "rulesTitle", text: "rulesText" },
    { title: "escrowTitle", text: "escrowText" },
    { title: "risksTitle", text: "risksText" },
    { title: "liabilityTitle", text: "liabilityText" },
    { title: "disputesTitle", text: "disputesText" },
  ] as const;

  return (
    <div className="min-h-screen bg-[#0a0f1c] text-white pb-24 relative overflow-hidden">
      
      {/* Декоративное блюр-пятно в фирменных цветах */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[600px] bg-brand-blue/10 blur-[150px] rounded-full pointer-events-none" />
      
      {/* Шапка */}
      <div className="pt-32 pb-12 relative z-10 px-4 max-w-3xl mx-auto text-center">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-16 h-16 rounded-2xl bg-white/5 text-brand-blue flex items-center justify-center mx-auto mb-6 border border-white/10 shadow-lg"
        >
          <FileText className="w-8 h-8" />
        </motion.div>
        
        <motion.h1 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-4xl md:text-5xl font-extrabold mb-4 tracking-tight"
        >
          {t("title")}
        </motion.h1>
        
        <motion.p 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-zinc-500 font-medium"
        >
          {t("lastUpdated")}
        </motion.p>
      </div>

      {/* Контент в стеклянной подложке */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="max-w-4xl mx-auto px-4 sm:px-8 relative z-20"
      >
        <div className="bg-white/5 backdrop-blur-xl rounded-3xl border border-white/10 p-8 md:p-12 shadow-2xl">
          
          <div className="space-y-12">
            {sections.map((section, index) => (
              <section key={index} className="group">
                <h2 className="text-2xl font-bold text-white mb-4 group-hover:text-brand-blue transition-colors">
                  {t(section.title)}
                </h2>
                {/* whitespace-pre-line позволяет тексту корректно отображать абзацы, если они есть в словаре */}
                <p className="text-lg text-zinc-400 leading-relaxed whitespace-pre-line font-light">
                  {t(section.text)}
                </p>
              </section>
            ))}
          </div>

        </div>
      </motion.div>
    </div>
  );
}