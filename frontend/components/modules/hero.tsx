"use client";

import { useTranslations } from "next-intl";
import { ArrowRight, PlayCircle } from "lucide-react";
import { Link } from "../../i18n/routing";
import { motion, Variants } from "framer-motion";

export function Hero() {
  const t = useTranslations("Hero");

  // Настройки анимации для родительского контейнера (каскадное появление детей)
  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.15, delayChildren: 0.2 },
    },
  };

  // Настройки анимации для каждого отдельного элемента
  const itemVariants: Variants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 120 } },
  };
  

  return (
    <section className="relative w-full pt-20 pb-24 md:pt-32 md:pb-32 overflow-hidden">
      
      {/* Декоративный фоновый элемент (легкий градиент в стиле CoinList) */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-brand-blue/10 blur-[120px] rounded-full pointer-events-none" />
      
      <div className="container mx-auto px-4 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-8 items-center">
          
          {/* ЛЕВАЯ ЧАСТЬ: Текст и кнопки */}
          <motion.div 
            variants={containerVariants}
            initial="hidden"
            animate="show"
            className="flex flex-col items-start text-left"
          >
            {/* Badge */}
            <motion.div variants={itemVariants} className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-brand-blue/10 text-brand-blue text-sm font-semibold mb-6">
              <span className="w-2 h-2 rounded-full bg-brand-blue animate-pulse" />
              {t("badge")}
            </motion.div>

            {/* Заголовок */}
            <motion.h1 variants={itemVariants} className="text-5xl md:text-6xl lg:text-7xl font-extrabold text-brand-black leading-[1.1] mb-6 tracking-tight">
              {t("title")}
            </motion.h1>

            {/* Подзаголовок */}
            <motion.p variants={itemVariants} className="text-lg md:text-xl text-gray-600 mb-8 max-w-lg leading-relaxed">
              {t("subtitle")}
            </motion.p>

            {/* Кнопки (Стиль CoinList) */}
            <motion.div variants={itemVariants} className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto">
              <Link href="#" className="w-full sm:w-auto">
                <motion.button 
                  whileHover={{ scale: 1.02, boxShadow: "0 10px 30px -10px rgba(0,150,223,0.5)" }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full sm:w-auto flex items-center justify-center gap-2 bg-brand-blue text-white px-8 py-4 rounded-xl font-bold text-lg transition-colors hover:bg-[#007cbd]"
                >
                  {t("primaryCta")}
                  <ArrowRight className="w-5 h-5" />
                </motion.button>
              </Link>
              
              <Link href="#" className="w-full sm:w-auto">
                <motion.button 
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full sm:w-auto flex items-center justify-center gap-2 bg-transparent text-brand-black border-2 border-gray-200 px-8 py-4 rounded-xl font-bold text-lg transition-colors hover:border-gray-300 hover:bg-gray-50"
                >
                  <PlayCircle className="w-5 h-5 text-gray-500" />
                  {t("secondaryCta")}
                </motion.button>
              </Link>
            </motion.div>

            {/* Трастовая статистика прямо под кнопками (как у Republic) */}
            <motion.div variants={itemVariants} className="mt-12 flex items-center gap-8 pt-8 border-t border-gray-200 w-full max-w-lg">
              <div>
                <div className="text-3xl font-extrabold text-brand-black">{t("statUsers")}</div>
                <div className="text-sm font-medium text-gray-500 mt-1">{t("statUsersText")}</div>
              </div>
              <div className="w-px h-12 bg-gray-200" />
              <div>
                <div className="text-3xl font-extrabold text-brand-black">{t("statVolume")}</div>
                <div className="text-sm font-medium text-gray-500 mt-1">{t("statVolumeText")}</div>
              </div>
            </motion.div>
          </motion.div>

          {/* ПРАВАЯ ЧАСТЬ: Абстрактная карточка актива (Mockup) */}
          <motion.div 
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.4, type: "spring" }}
            className="hidden lg:flex relative w-full h-full min-h-[500px] items-center justify-center"
          >
            {/* Здесь мы создаем красивую "левитирующую" карточку, которая показывает, как выглядит продукт */}
            <motion.div 
              animate={{ y: [-10, 10, -10] }}
              transition={{ repeat: Infinity, duration: 6, ease: "easeInOut" }}
              className="relative z-10 w-[80%] bg-white rounded-2xl shadow-2xl border border-gray-100 p-6"
            >
              <div className="w-full h-48 bg-gray-100 rounded-xl mb-6 overflow-hidden relative">
                 <div className="absolute inset-0 bg-gradient-to-br from-brand-blue/20 to-transparent" />
                 {/* Имитация UI карточки проекта */}
                 <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-bold text-brand-black shadow-sm">
                   Live
                 </div>
              </div>
              <h3 className="text-xl font-bold text-brand-black mb-2">Bimark.shop Revenue Share</h3>
              <p className="text-sm text-gray-500 mb-6">Получайте долю от ежемесячной прибыли IT-продукта.</p>
              
              <div className="space-y-2 mb-6">
                <div className="flex justify-between text-sm font-medium">
                  <span className="text-brand-blue">Собрано $45,000</span>
                  <span className="text-gray-500">Цель $100,000</span>
                </div>
                <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div className="h-full bg-brand-blue w-[45%] rounded-full" />
                </div>
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                <div className="text-lg font-bold text-brand-black">$50 / доля</div>
                <button className="bg-brand-black text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-gray-800 transition-colors">
                  Инвестировать
                </button>
              </div>
            </motion.div>

            {/* Декоративные круги на фоне карточки */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[110%] h-[110%] rounded-full border border-gray-200/50 border-dashed" />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[80%] h-[80%] rounded-full border border-gray-200/50 border-dashed" />
          </motion.div>

        </div>
      </div>
    </section>
  );
}