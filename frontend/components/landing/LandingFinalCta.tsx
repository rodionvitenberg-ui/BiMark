"use client";

import { useTranslations } from "next-intl";
import { motion, Variants } from "framer-motion";
import { Link } from "../../i18n/routing";
import { ArrowRight, Share2, Sparkles, PlayCircle } from "lucide-react";

export function LandingFinalCta() {
  const t = useTranslations("Landing.Final");

  const container: Variants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.15 },
    },
  };

  const item: Variants = {
    hidden: { opacity: 0, y: 30 },
    show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 100, damping: 20 } },
  };

  return (
    <section className="relative w-full pt-24 pb-32 bg-[#0a0f1c] text-white overflow-hidden">
      
      {/* Магическое свечение из-под земли (нижний градиент) */}
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[1000px] h-[500px] bg-brand-blue/20 blur-[200px] rounded-[100%] pointer-events-none translate-y-1/2" />
      
      {/* Верхний разделитель */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-4xl h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />

      <div className="container mx-auto px-4 relative z-10 flex flex-col items-center">
        
        {/* БЛОК 1: Партнерская программа */}
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          className="w-full max-w-5xl bg-gradient-to-r from-brand-blue/10 via-[#121827] to-brand-blue/5 border border-brand-blue/30 rounded-3xl p-8 md:p-12 mb-32 flex flex-col md:flex-row items-center gap-8 shadow-[0_0_50px_rgba(0,124,189,0.1)] relative overflow-hidden group"
        >
          {/* Световой блик при наведении */}
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-[100%] group-hover:animate-[shimmer_2s_infinite]" />
          
          <div className="w-16 h-16 rounded-full bg-brand-blue/20 flex items-center justify-center border border-brand-blue/40 shrink-0">
            <Share2 className="w-8 h-8 text-brand-blue" />
          </div>
          
          <div className="flex-1 text-center md:text-left">
            <h3 className="text-2xl font-bold text-white mb-3 flex items-center justify-center md:justify-start gap-2">
              {t("partnerTitle")}
              <Sparkles className="w-5 h-5 text-yellow-400" />
            </h3>
            <p className="text-gray-300 text-lg leading-relaxed font-light max-w-3xl">
              {t("partnerText")}
            </p>
          </div>
          
          <div className="shrink-0 w-full md:w-auto">
            <Link href="/referral" className="w-full md:w-auto px-8 py-4 rounded-xl bg-white/10 hover:bg-white/20 border border-white/10 text-white font-semibold transition-all flex items-center justify-center gap-2 backdrop-blur-md">
              Узнать больше
            </Link>
          </div>
        </motion.div>

        {/* БЛОК 2: Финальный CTA */}
        <motion.div 
          variants={container}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-100px" }}
          className="max-w-4xl text-center flex flex-col items-center"
        >
          <motion.h2 variants={item} className="text-5xl md:text-7xl font-black text-white tracking-tight mb-8 drop-shadow-2xl">
            {t("title")}
          </motion.h2>
          
          <motion.p variants={item} className="text-xl md:text-2xl text-gray-400 mb-12 max-w-2xl leading-relaxed font-light">
            {t("subtitle")}
          </motion.p>
          
          <motion.div variants={item} className="flex flex-col sm:flex-row items-center justify-center gap-5 w-full sm:w-auto mb-16">
            <Link 
              href="/register" 
              className="w-full sm:w-auto bg-brand-blue text-white px-12 py-5 rounded-2xl font-bold text-xl hover:bg-[#007cbd] transition-all shadow-[0_0_40px_rgba(0,124,189,0.5)] hover:shadow-[0_0_60px_rgba(0,124,189,0.7)] hover:-translate-y-1 flex items-center justify-center gap-3"
            >
              {t("primaryCta")}
              <ArrowRight className="w-6 h-6" />
            </Link>
            
            <Link 
              href="/category" 
              className="w-full sm:w-auto px-12 py-5 rounded-2xl font-bold text-xl text-white hover:bg-white/5 border border-transparent hover:border-white/10 transition-all flex items-center justify-center gap-3"
            >
              <PlayCircle className="w-6 h-6 text-gray-500" />
              {t("secondaryCta")}
            </Link>
          </motion.div>

          {/* Финальный слоган, уходящий в футер */}
          <motion.div variants={item} className="text-transparent bg-clip-text bg-gradient-to-r from-gray-500 via-gray-400 to-gray-500 font-medium tracking-[0.2em] uppercase text-sm md:text-base">
            {t("slogan")}
          </motion.div>
        </motion.div>

      </div>
    </section>
  );
}