"use client";

import { useTranslations } from "next-intl";
import { motion, Variants } from "framer-motion";
import { Link } from "../../../i18n/routing";
import { Copy, Share2, Wallet, ArrowRight, Gift } from "lucide-react";

export default function ReferralPage() {
  const t = useTranslations("ReferralPage");

  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.15 },
    },
  };

  const itemVariants: Variants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 120 } },
  };

  return (
    <div className="min-h-screen bg-[#0a0f1c] text-white relative overflow-hidden pb-24">
      
      {/* Декоративный фон */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-brand-blue/20 blur-[150px] rounded-full pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-[600px] h-[600px] bg-yellow-500/10 blur-[150px] rounded-full pointer-events-none" />

      {/* Заголовок */}
      <div className="pt-32 pb-16 relative z-10 px-4 max-w-4xl mx-auto text-center">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 text-gray-300 font-bold text-sm tracking-widest uppercase mb-6"
        >
          <Gift className="w-4 h-4 text-yellow-500" />
          Bimark Partners
        </motion.div>
        
        <motion.h1 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-5xl md:text-6xl lg:text-7xl font-black text-white mb-6 tracking-tight"
        >
          {t("title")}
        </motion.h1>
        
        <motion.p 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-xl text-gray-400 max-w-2xl mx-auto leading-relaxed"
        >
          {t("subtitle")}
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mt-10 flex justify-center"
        >
          <Link 
            href="/dashboard"
            className="px-8 py-4 bg-brand-blue hover:bg-[#007cbd] text-white rounded-xl font-bold text-lg transition-colors flex items-center gap-2 shadow-lg shadow-brand-blue/20"
          >
            {t("cta")}
            <ArrowRight className="w-5 h-5" />
          </Link>
        </motion.div>
      </div>

      {/* Как это работает (Шаги) */}
      <div className="max-w-7xl mx-auto px-4 relative z-20 mt-12">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-white mb-4">{t("howItWorks")}</h2>
        </div>

        <motion.div 
          variants={containerVariants}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
          className="grid grid-cols-1 md:grid-cols-3 gap-8"
        >
          {/* Шаг 1 */}
          <motion.div variants={itemVariants} className="bg-white/5 backdrop-blur-md p-8 rounded-3xl border border-white/10 text-center relative overflow-hidden group hover:bg-white/10 transition-colors">
            <div className="w-16 h-16 rounded-2xl bg-brand-blue/20 text-brand-blue flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform">
              <Copy className="w-8 h-8" />
            </div>
            <h3 className="text-2xl font-bold text-white mb-3">{t("step1Title")}</h3>
            <p className="text-gray-400 leading-relaxed">
              {t("step1Desc")}
            </p>
          </motion.div>

          {/* Шаг 2 */}
          <motion.div variants={itemVariants} className="bg-white/5 backdrop-blur-md p-8 rounded-3xl border border-white/10 text-center relative overflow-hidden group hover:bg-white/10 transition-colors">
            <div className="w-16 h-16 rounded-2xl bg-purple-500/20 text-purple-400 flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform">
              <Share2 className="w-8 h-8" />
            </div>
            <h3 className="text-2xl font-bold text-white mb-3">{t("step2Title")}</h3>
            <p className="text-gray-400 leading-relaxed">
              {t("step2Desc")}
            </p>
          </motion.div>

          {/* Шаг 3 */}
          <motion.div variants={itemVariants} className="bg-white/5 backdrop-blur-md p-8 rounded-3xl border border-white/10 text-center relative overflow-hidden group hover:bg-white/10 transition-colors">
            <div className="w-16 h-16 rounded-2xl bg-green-500/20 text-green-400 flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform">
              <Wallet className="w-8 h-8" />
            </div>
            <h3 className="text-2xl font-bold text-white mb-3">{t("step3Title")}</h3>
            <p className="text-gray-400 leading-relaxed">
              {t("step3Desc")}
            </p>
          </motion.div>
        </motion.div>
      </div>

    </div>
  );
}