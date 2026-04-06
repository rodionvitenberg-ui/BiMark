"use client";

import { useTranslations } from "next-intl";
import { motion } from "framer-motion";
import { TrendingDown, Users, Zap } from "lucide-react";

export function LandingShift() {
  const t = useTranslations("Landing.Shift");

  return (
    <section className="relative w-full py-24 md:py-32 bg-[#0a0f1c] text-white overflow-hidden">
      <div className="container mx-auto px-4 relative z-10">
        
        {/* Заголовок секции */}
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
          className="max-w-3xl mx-auto text-center mb-16 md:mb-24"
        >
          <h2 className="text-3xl md:text-5xl font-extrabold tracking-tight">
            {t("title")}
          </h2>
        </motion.div>

        {/* Две колонки: Проблема (слева) и Решение (справа) */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 md:gap-12 max-w-6xl mx-auto mb-12">
          
          {/* КАРТОЧКА: ПРОБЛЕМА */}
          <motion.div 
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="p-8 md:p-10 rounded-3xl bg-white/5 border border-white/10 flex flex-col justify-center relative overflow-hidden group"
          >
            <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:opacity-20 transition-opacity">
              <TrendingDown className="w-32 h-32 text-red-500" />
            </div>
            <p className="text-lg md:text-xl text-gray-300 leading-relaxed relative z-10 font-light">
              {t("problem")}
            </p>
          </motion.div>

          {/* КАРТОЧКА: РЕШЕНИЕ (Акцентная) */}
          <motion.div 
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="p-8 md:p-10 rounded-3xl bg-brand-blue/10 border border-brand-blue/30 flex flex-col justify-center relative overflow-hidden group"
          >
            <div className="absolute top-[-20%] right-[-10%] w-64 h-64 bg-brand-blue/20 blur-[80px] rounded-full pointer-events-none group-hover:bg-brand-blue/30 transition-colors" />
            
            <div className="relative z-10">
              <h3 className="text-2xl font-bold text-white mb-3 flex items-center gap-3">
                <Users className="w-6 h-6 text-brand-blue" />
                {t("solutionTitle")}
              </h3>
              <p className="text-lg text-blue-100/80 leading-relaxed mb-8">
                {t("solutionText")}
              </p>
              
              <div className="pt-6 border-t border-brand-blue/20">
                <p className="text-4xl md:text-5xl font-black text-white tracking-tighter drop-shadow-lg">
                  <span className="bg-clip-text text-transparent bg-gradient-to-r from-brand-blue to-blue-300">
                    {t("statNumber")}
                  </span>
                </p>
                <p className="text-sm uppercase tracking-widest text-brand-blue font-semibold mt-2">
                  {t("statLabel")}
                </p>
              </div>
            </div>
          </motion.div>
        </div>

        {/* ШИРОКАЯ КАРТОЧКА: ВИДЕНИЕ (Vision) */}
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="max-w-6xl mx-auto p-8 md:p-12 rounded-3xl bg-gradient-to-br from-white/10 to-white/5 border border-white/10 relative overflow-hidden"
        >
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-brand-blue to-transparent opacity-50" />
          
          <div className="flex flex-col md:flex-row gap-8 items-center md:items-start">
            <div className="shrink-0 w-16 h-16 rounded-2xl bg-brand-blue/20 flex items-center justify-center border border-brand-blue/30">
              <Zap className="w-8 h-8 text-brand-blue" />
            </div>
            
            <div>
              <h3 className="text-2xl md:text-3xl font-bold text-white mb-4">
                {t("visionTitle")}
              </h3>
              <p className="text-lg text-gray-300 leading-relaxed font-light">
                {t("visionText")}
              </p>
            </div>
          </div>
        </motion.div>

      </div>
    </section>
  );
}