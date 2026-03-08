"use client";

import { useTranslations } from "next-intl";
import { motion, Variants } from "framer-motion";
import { Link } from "../../../i18n/routing";
import { UserPlus, ShoppingCart, TrendingUp, ArrowDownToLine, ArrowRight, Lightbulb } from "lucide-react";

export default function HowItWorks2Page() {
  const t = useTranslations("HowItWorks2");

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
    <div className="min-h-screen bg-[#0a0f1c] text-white pb-24 relative overflow-hidden">
      
      {/* Декоративный фон */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-brand-blue/20 blur-[150px] rounded-full pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-[600px] h-[600px] bg-purple-500/10 blur-[150px] rounded-full pointer-events-none" />

      {/* Заголовок */}
      <div className="pt-32 pb-16 relative z-10 px-4 max-w-4xl mx-auto text-center">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 text-gray-300 font-bold text-sm tracking-widest uppercase mb-6"
        >
          <Lightbulb className="w-4 h-4 text-yellow-500" />
          Guide
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
      </div>

      {/* Шаги (Сетка 2x2) */}
      <div className="max-w-6xl mx-auto px-4 relative z-20 mt-8">
        <motion.div 
          variants={containerVariants}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
          className="grid grid-cols-1 md:grid-cols-2 gap-8"
        >
          {/* Шаг 1 */}
          <motion.div variants={itemVariants} className="bg-white/5 backdrop-blur-md p-8 md:p-10 rounded-3xl border border-white/10 relative overflow-hidden group hover:bg-white/10 transition-colors">
            <div className="w-16 h-16 rounded-2xl bg-blue-500/20 text-blue-400 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform border border-blue-500/30">
              <UserPlus className="w-8 h-8" />
            </div>
            <h3 className="text-2xl font-bold text-white mb-4">{t("step1Title")}</h3>
            <p className="text-gray-400 leading-relaxed text-lg">
              {t("step1Desc")}
            </p>
          </motion.div>

          {/* Шаг 2 */}
          <motion.div variants={itemVariants} className="bg-white/5 backdrop-blur-md p-8 md:p-10 rounded-3xl border border-white/10 relative overflow-hidden group hover:bg-white/10 transition-colors">
            <div className="w-16 h-16 rounded-2xl bg-purple-500/20 text-purple-400 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform border border-purple-500/30">
              <ShoppingCart className="w-8 h-8" />
            </div>
            <h3 className="text-2xl font-bold text-white mb-4">{t("step2Title")}</h3>
            <p className="text-gray-400 leading-relaxed text-lg">
              {t("step2Desc")}
            </p>
          </motion.div>

          {/* Шаг 3 */}
          <motion.div variants={itemVariants} className="bg-white/5 backdrop-blur-md p-8 md:p-10 rounded-3xl border border-white/10 relative overflow-hidden group hover:bg-white/10 transition-colors">
            <div className="w-16 h-16 rounded-2xl bg-green-500/20 text-green-400 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform border border-green-500/30">
              <TrendingUp className="w-8 h-8" />
            </div>
            <h3 className="text-2xl font-bold text-white mb-4">{t("step3Title")}</h3>
            <p className="text-gray-400 leading-relaxed text-lg">
              {t("step3Desc")}
            </p>
          </motion.div>

          {/* Шаг 4 (Акцент на заявке) */}
          <motion.div variants={itemVariants} className="bg-white/5 backdrop-blur-md p-8 md:p-10 rounded-3xl border border-white/10 relative overflow-hidden group hover:bg-white/10 transition-colors">
            <div className="w-16 h-16 rounded-2xl bg-orange-500/20 text-orange-400 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform border border-orange-500/30">
              <ArrowDownToLine className="w-8 h-8" />
            </div>
            <h3 className="text-2xl font-bold text-white mb-4">{t("step4Title")}</h3>
            <p className="text-gray-400 leading-relaxed text-lg">
              {t("step4Desc")}
            </p>
          </motion.div>
        </motion.div>

        {/* Финальный призыв к действию */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mt-16 text-center bg-brand-blue/10 border border-brand-blue/20 rounded-3xl p-10 max-w-3xl mx-auto"
        >
          <p className="text-xl text-white font-medium mb-6">{t("ctaDesc")}</p>
          <Link 
            href="/category"
            className="inline-flex px-8 py-4 bg-brand-blue hover:bg-[#007cbd] text-white rounded-xl font-bold text-lg transition-colors items-center gap-2 shadow-lg shadow-brand-blue/20 group"
          >
            {t("ctaBtn")}
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </Link>
        </motion.div>
      </div>

    </div>
  );
}