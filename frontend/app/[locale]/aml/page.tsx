"use client";

import { useTranslations } from "next-intl";
import { motion } from "framer-motion";
import { FileSearch } from "lucide-react";

export default function AmlPolicyPage() {
  const t = useTranslations("AmlPolicy");

  return (
    // Единый темный фон на всю страницу
    <div className="min-h-screen bg-[#0a0f1c] text-white pb-24 relative overflow-hidden">
      
      {/* Декоративные блюр-пятна (сине-зеленый оттенок безопасности) */}
      <div className="absolute top-0 right-0 -translate-y-1/4 translate-x-1/4 w-[700px] h-[700px] bg-brand-blue/10 blur-[150px] rounded-full pointer-events-none" />
      <div className="absolute bottom-0 left-0 translate-y-1/4 -translate-x-1/4 w-[600px] h-[600px] bg-teal-500/10 blur-[150px] rounded-full pointer-events-none" />
      
      {/* Шапка */}
      <div className="pt-32 pb-16 relative z-10 px-4 max-w-3xl mx-auto text-center">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-16 h-16 rounded-2xl bg-white/10 text-gray-300 flex items-center justify-center mx-auto mb-6 border border-white/10"
        >
          <FileSearch className="w-8 h-8" />
        </motion.div>
        <motion.h1 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-4xl md:text-5xl font-black text-white mb-4 tracking-tight"
        >
          {t("title")}
        </motion.h1>
        <motion.p 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-gray-400 font-semibold"
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
        <div className="bg-white/5 backdrop-blur-md rounded-3xl border border-white/10 p-8 md:p-12 shadow-2xl">
          
          <div className="space-y-10 text-gray-300 leading-relaxed">
            <section>
              <h2 className="text-2xl font-bold text-white mb-4">{t("introTitle")}</h2>
              <p>{t("introText")}</p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mb-4">{t("kycTitle")}</h2>
              <p>{t("kycText")}</p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mb-4">{t("monitoringTitle")}</h2>
              <p>{t("monitoringText")}</p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mb-4">{t("sanctionsTitle")}</h2>
              <p>{t("sanctionsText")}</p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mb-4">{t("reportingTitle")}</h2>
              <p>{t("reportingText")}</p>
            </section>
          </div>

        </div>
      </motion.div>

    </div>
  );
}