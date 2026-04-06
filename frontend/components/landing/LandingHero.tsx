"use client";

import { useTranslations } from "next-intl";
import { motion, Variants } from "framer-motion"; // <-- Добавили импорт Variants
import { ArrowRight, PlayCircle, Sparkles } from "lucide-react";
import { Link } from "../../i18n/routing";

export function LandingHero() {
  const t = useTranslations("Landing.Hero");

  // <-- Явно указываем тип : Variants
  const container: Variants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.2, delayChildren: 0.1 },
    },
  };

  // <-- Явно указываем тип : Variants
  const item: Variants = {
    hidden: { opacity: 0, y: 30 },
    show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 100, damping: 20 } },
  };

  return (
    <section className="relative w-full min-h-[90vh] flex items-center justify-center bg-[#0a0f1c] text-white overflow-hidden pt-24 pb-16">
      
      {/* Магический фон: пульсирующие неоновые пятна */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] md:w-[800px] md:h-[800px] bg-brand-blue/20 blur-[150px] rounded-full pointer-events-none animate-pulse duration-[7000ms]" />
      <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-purple-600/10 blur-[120px] rounded-full pointer-events-none" />
      
      {/* Сетка на фоне для технологичности (опционально) */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff05_1px,transparent_1px),linear-gradient(to_bottom,#ffffff05_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)] pointer-events-none" />

      <div className="container mx-auto px-4 relative z-10">
        <motion.div 
          variants={container}
          initial="hidden"
          animate="show"
          className="max-w-4xl mx-auto text-center flex flex-col items-center"
        >
          {/* Мерцающий бейдж */}
          <motion.div variants={item} className="mb-8">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 backdrop-blur-md shadow-lg shadow-brand-blue/5 group cursor-default hover:bg-white/10 transition-colors">
              <Sparkles className="w-4 h-4 text-brand-blue animate-pulse" />
              <span className="text-sm md:text-base font-medium text-gray-200">
                {t("badge")}
              </span>
            </div>
          </motion.div>

          {/* Главный заголовок с переливающимся текстом */}
          <motion.h1 variants={item} className="text-5xl md:text-7xl lg:text-8xl font-extrabold leading-[1.1] tracking-tight mb-8">
            <span className="text-white drop-shadow-sm">{t("titlePart1")}</span>
            <br className="hidden md:block" />
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-brand-blue via-blue-400 to-purple-500 animate-gradient-x">
              {t("titleHighlight")}
            </span>
          </motion.h1>

          {/* Подзаголовок */}
          <motion.p variants={item} className="text-lg md:text-2xl text-gray-400 mb-12 max-w-2xl leading-relaxed font-light">
            {t("subtitle")}
          </motion.p>

          {/* Кнопки с мощными тенями */}
          <motion.div variants={item} className="flex flex-col sm:flex-row items-center justify-center gap-5 w-full sm:w-auto">
            <Link 
              href="/register" 
              className="w-full sm:w-auto bg-brand-blue text-white px-10 py-5 rounded-2xl font-bold text-lg md:text-xl hover:bg-[#007cbd] transition-all shadow-[0_0_40px_rgba(0,124,189,0.4)] hover:shadow-[0_0_60px_rgba(0,124,189,0.6)] hover:-translate-y-1 flex items-center justify-center gap-3"
            >
              {t("primaryCta")}
              <ArrowRight className="w-6 h-6" />
            </Link>
            
            <Link 
              href="/category" 
              className="w-full sm:w-auto px-10 py-5 rounded-2xl font-bold text-lg md:text-xl text-white bg-white/5 hover:bg-white/10 border border-white/10 backdrop-blur-md transition-all flex items-center justify-center gap-3 group"
            >
              <PlayCircle className="w-6 h-6 text-gray-400 group-hover:text-white transition-colors" />
              {t("secondaryCta")}
            </Link>
          </motion.div>

        </motion.div>
      </div>
    </section>
  );
}