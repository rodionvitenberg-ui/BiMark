"use client";

import { useTranslations } from "next-intl";
import { motion } from "framer-motion";
import { FileText, ShieldCheck } from "lucide-react";

export default function PurchaseAgreementPage() {
  // Используем тот же неймспейс, куда мы только что добавили переводы договора!
  const t = useTranslations("CheckoutConsent");

  // Структурируем пункты, опираясь на наши ключи из JSON
  const sections = [
    { 
      title: "section1Title", 
      clauses: ["clause1_1", "clause1_2", "clause1_3"] 
    },
    { 
      title: "section2Title", 
      clauses: ["clause2_1", "clause2_2", "clause2_3", "clause2_4"] 
    },
    { 
      title: "section3Title", 
      clauses: ["clause3_1", "clause3_2"] 
    },
    { 
      title: "section4Title", 
      clauses: ["clause4_1", "clause4_2"] 
    },
    { 
      title: "section5Title", 
      clauses: ["clause5_1", "clause5_2"] 
    },
    { 
      title: "section6Title", 
      clauses: ["clause6_1", "clause6_2", "clause6_3"] 
    },
    { 
      title: "section7Title", 
      clauses: ["clause7_1", "clause7_2"] 
    },
  ];

  return (
    <div className="min-h-screen bg-[#0a0f1c] text-white pb-24 relative overflow-hidden">
      
      {/* Декоративное блюр-пятно в фирменных цветах */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[600px] bg-brand-blue/10 blur-[150px] rounded-full pointer-events-none" />
      
      {/* Шапка */}
      <div className="pt-32 pb-12 relative z-10 px-4 max-w-4xl mx-auto text-center">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-16 h-16 rounded-2xl bg-white/5 text-brand-blue flex items-center justify-center mx-auto mb-6 border border-white/10 shadow-lg"
        >
          <ShieldCheck className="w-8 h-8" />
        </motion.div>
        
        <motion.h1 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-3xl md:text-5xl font-extrabold mb-4 tracking-tight leading-tight"
        >
          {t("docTitle")}
        </motion.h1>
        
        <motion.p 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-zinc-500 font-medium mt-4"
        >
          {/* Можно захардкодить дату или добавить ключ lastUpdated в CheckoutConsent */}
          Последнее обновление: Сентябрь 2024
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
                <h2 className="text-xl md:text-2xl font-bold text-white mb-6 group-hover:text-brand-blue transition-colors">
                  {t(section.title)}
                </h2>
                
                <div className="space-y-4">
                  {section.clauses.map((clauseKey, idx) => (
                    <p key={idx} className="text-lg text-zinc-400 leading-relaxed font-light">
                      {t(clauseKey)}
                    </p>
                  ))}
                </div>
              </section>
            ))}
          </div>

        </div>
      </motion.div>
    </div>
  );
}