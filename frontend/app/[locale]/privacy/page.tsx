"use client";

import { useTranslations } from "next-intl";
import { motion } from "framer-motion";
import { Shield } from "lucide-react";

export default function PrivacyPolicyPage() {
  const t = useTranslations("PrivacyPolicy");

  return (
    // Единый темный фон на всю страницу
    <div className="min-h-screen bg-[#0a0f1c] text-white pb-24 relative overflow-hidden">
      
      {/* Декоративные блюр-пятна */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[600px] bg-brand-blue/10 blur-[150px] rounded-full pointer-events-none" />
      
      {/* Шапка (без собственного фона, плавно переходит в контент) */}
      <div className="pt-32 pb-16 relative z-10 px-4 max-w-3xl mx-auto text-center">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-16 h-16 rounded-2xl bg-brand-blue/20 text-brand-blue flex items-center justify-center mx-auto mb-6 border border-brand-blue/10"
        >
          <Shield className="w-8 h-8" />
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
          className="text-brand-blue font-semibold"
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
              <h2 className="text-2xl font-bold text-white mb-4">{t("dataTitle")}</h2>
              <p>{t("dataText")}</p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mb-4">{t("useTitle")}</h2>
              <p>{t("useText")}</p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mb-4">{t("cookiesTitle")}</h2>
              <p>{t("cookiesText")}</p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mb-4">{t("rightsTitle")}</h2>
              <p>{t("rightsText")}</p>
            </section>
          </div>

        </div>
      </motion.div>

    </div>
  );
}