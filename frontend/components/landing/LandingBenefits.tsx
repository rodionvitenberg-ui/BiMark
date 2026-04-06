"use client";

import { useTranslations } from "next-intl";
import { motion, Variants } from "framer-motion";
import { LineChart, ShieldCheck, Layers, Coins } from "lucide-react";

export function LandingBenefits() {
  const t = useTranslations("Landing.Benefits");

  const container: Variants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.15 },
    },
  };

  // Типизируем объект элементов
  const item: Variants = {
    hidden: { opacity: 0, y: 30 },
    show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 100, damping: 20 } },
  };

  return (
    <section className="relative w-full py-24 bg-[#0a0f1c] text-white overflow-hidden border-t border-white/5">
      
      {/* Декоративный фоновый свет */}
      <div className="absolute top-1/2 right-0 w-[500px] h-[500px] bg-brand-blue/10 blur-[120px] rounded-full pointer-events-none -translate-y-1/2" />

      <div className="container mx-auto px-4 relative z-10">
        
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl md:text-5xl font-extrabold tracking-tight">
            {t("title")}
          </h2>
        </motion.div>

        {/* BENTO GRID */}
        <motion.div 
          variants={container}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-100px" }}
          className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl mx-auto auto-rows-fr"
        >
          
          {/* КАРТОЧКА 1: Пассивный доход (Широкая - 2 колонки) */}
          <motion.div variants={item} className="md:col-span-2 group relative p-8 md:p-10 rounded-3xl bg-white/5 border border-white/10 overflow-hidden flex flex-col justify-between hover:border-brand-blue/50 transition-colors duration-500">
            {/* Hover Glow */}
            <div className="absolute inset-0 bg-gradient-to-br from-brand-blue/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            
            <div className="relative z-10 mb-8">
              <div className="w-14 h-14 rounded-2xl bg-brand-blue/20 flex items-center justify-center mb-6 border border-brand-blue/30">
                <LineChart className="w-7 h-7 text-brand-blue" />
              </div>
              <h3 className="text-2xl md:text-3xl font-bold mb-3">{t("card1Title")}</h3>
              <p className="text-gray-400 text-lg leading-relaxed max-w-md">{t("card1Text")}</p>
            </div>
            
            {/* Визуальная заглушка графика */}
            <div className="relative z-10 w-full h-24 mt-auto rounded-t-xl bg-gradient-to-t from-brand-blue/20 to-transparent border-t border-brand-blue/30 translate-y-8 group-hover:translate-y-4 transition-transform duration-500 flex items-end">
               <div className="w-full h-full bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-20 mask-image-gradient" />
            </div>
          </motion.div>

          {/* КАРТОЧКА 2: Гарантия 5% (Квадратная - 1 колонка) */}
          <motion.div variants={item} className="md:col-span-1 group relative p-8 md:p-10 rounded-3xl bg-white/5 border border-white/10 overflow-hidden flex flex-col hover:border-green-500/50 transition-colors duration-500">
            <div className="absolute inset-0 bg-gradient-to-br from-green-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <div className="relative z-10">
              <div className="w-14 h-14 rounded-2xl bg-green-500/20 flex items-center justify-center mb-6 border border-green-500/30">
                <ShieldCheck className="w-7 h-7 text-green-400" />
              </div>
              <h3 className="text-2xl font-bold mb-3">{t("card2Title")}</h3>
              <p className="text-gray-400 text-base leading-relaxed">{t("card2Text")}</p>
            </div>
          </motion.div>

          {/* КАРТОЧКА 3: Снежный ком (Квадратная - 1 колонка) */}
          <motion.div variants={item} className="md:col-span-1 group relative p-8 md:p-10 rounded-3xl bg-white/5 border border-white/10 overflow-hidden flex flex-col hover:border-purple-500/50 transition-colors duration-500">
            <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <div className="relative z-10">
              <div className="w-14 h-14 rounded-2xl bg-purple-500/20 flex items-center justify-center mb-6 border border-purple-500/30">
                <Layers className="w-7 h-7 text-purple-400" />
              </div>
              <h3 className="text-2xl font-bold mb-3">{t("card3Title")}</h3>
              <p className="text-gray-400 text-base leading-relaxed">{t("card3Text")}</p>
            </div>
          </motion.div>

          {/* КАРТОЧКА 4: Токен BMK (Широкая - 2 колонки) */}
          <motion.div variants={item} className="md:col-span-2 group relative p-8 md:p-10 rounded-3xl bg-[#121827] border border-brand-blue/30 overflow-hidden flex flex-col md:flex-row items-center justify-between gap-8 hover:shadow-[0_0_40px_rgba(0,124,189,0.2)] transition-shadow duration-500">
            <div className="absolute inset-0 bg-[linear-gradient(45deg,transparent_25%,rgba(0,124,189,0.1)_50%,transparent_75%)] bg-[length:250%_250%,100%_100%] animate-[bg-pan_3s_linear_infinite]" />
            
            <div className="relative z-10 md:w-2/3">
              <div className="w-14 h-14 rounded-2xl bg-brand-blue/20 flex items-center justify-center mb-6 border border-brand-blue/30">
                <Coins className="w-7 h-7 text-brand-blue" />
              </div>
              <h3 className="text-2xl md:text-3xl font-bold mb-3 text-white">{t("card4Title")}</h3>
              <p className="text-gray-300 text-lg leading-relaxed">{t("card4Text")}</p>
            </div>

            {/* Иллюстрация 3D-монетки или логотипа */}
            <div className="relative z-10 w-32 h-32 md:w-40 md:h-40 flex-shrink-0 bg-brand-blue/10 rounded-full border border-brand-blue/20 flex items-center justify-center group-hover:scale-105 group-hover:rotate-6 transition-transform duration-700">
               <span className="text-4xl font-black text-brand-blue tracking-tighter">BMK</span>
            </div>
          </motion.div>

        </motion.div>
      </div>
    </section>
  );
}