"use client";

import { useState } from "react";
import { motion, Variants, AnimatePresence } from "framer-motion";
import { ArrowRight, Play, MessagesSquare, RotateCcw } from "lucide-react";
import { useTranslations } from "next-intl";

export function PresentationHero() {
  const t = useTranslations("PresentationHero");
  
  // Состояние: проиграно ли видео. Изначально false.
  const [isVideoFinished, setIsVideoFinished] = useState(false);

  // Функция для плавного скролла к каталогу
  const scrollToCatalog = () => {
    const catalogElement = document.getElementById("presentation-catalog");
    if (catalogElement) {
      catalogElement.scrollIntoView({ behavior: "smooth" });
    }
  };

  // Функция для плавного скролла к контактам
  const scrollToContacts = () => {
    const contactsElement = document.getElementById("presentation-contacts");
    if (contactsElement) {
      contactsElement.scrollIntoView({ behavior: "smooth" }); 
    }
  };

  // Анимации для появления всего блока при загрузке
  const pageLoadVariants: Variants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.3, delayChildren: 0.2 },
    },
  };

  const itemVariants: Variants = {
    hidden: { opacity: 0, y: 30 },
    show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 100, damping: 20 } },
  };

  // Анимации для переключения элементов внутри видео-рамки
  const videoContentVariants: Variants = {
    initial: { opacity: 0, scale: 0.9 },
    animate: { opacity: 1, scale: 1, transition: { duration: 0.5, ease: "easeOut" } },
    exit: { opacity: 0, scale: 1.1, transition: { duration: 0.3, ease: "easeIn" } },
  };

  return (
    <section className="relative w-full pt-16 pb-20 md:pt-24 md:pb-32 overflow-hidden bg-[#0a0f1c] text-white border-b border-gray-800 min-h-screen flex items-center">
      
      {/* Свечение на фоне (центрированное) */}
      <div className="absolute top-[10%] left-1/2 -translate-x-1/2 w-[100%] h-[80%] bg-brand-blue/15 blur-[140px] rounded-full pointer-events-none" />
      
      <motion.div 
        className="container mx-auto px-4 relative z-10 flex flex-col items-center"
        variants={pageLoadVariants}
        initial="hidden"
        animate="show"
      >
        
        {/* --- ВЕРХ: ЗОНА ВИДЕО (Центрированная) --- */}
        <motion.div 
          variants={itemVariants}
          className="w-full max-w-5xl aspect-video border border-white/10 rounded-[2rem] bg-[#121827]/60 backdrop-blur-2xl shadow-[0_30px_100px_rgba(0,0,0,0.5)] relative overflow-hidden mb-16 md:mb-20 flex items-center justify-center group"
        >
          <div className="absolute inset-0 bg-gradient-to-b from-brand-blue/5 to-transparent pointer-events-none" />

          <AnimatePresence mode="wait">
            {!isVideoFinished ? (
              // СОСТОЯНИЕ 1: Заглушка видео (Кликабельна для симуляции)
              <motion.div
                key="video-placeholder"
                variants={videoContentVariants}
                initial="initial"
                animate="animate"
                exit="exit"
                className="absolute inset-0 flex flex-col items-center justify-center cursor-pointer group p-8"
                onClick={() => setIsVideoFinished(true)} // Клик = видео закончилось
              >
                {/* Анимированная кнопка Play */}
                <div className="w-20 h-20 md:w-28 md:h-28 rounded-full bg-brand-blue/15 flex items-center justify-center backdrop-blur-md border border-brand-blue/25 group-hover:bg-brand-blue/30 group-hover:scale-105 transition-all duration-500 z-10 shadow-lg shadow-brand-blue/10">
                  <Play className="w-10 h-10 md:w-14 md:h-14 ml-2 md:ml-3 text-brand-blue" />
                </div>
                
                <p className="mt-8 text-gray-300 font-semibold text-lg md:text-xl z-10 text-center">
                  {t("video_placeholder")}
                </p>
                <p className="mt-2 text-gray-500 text-sm z-10 opacity-0 group-hover:opacity-100 transition-opacity">
                  ({t("video_play_instruction")})
                </p>
              </motion.div>
            ) : (
              // СОСТОЯНИЕ 2: Кнопки действий (Появляются после "видео")
              <motion.div
                key="action-buttons"
                variants={videoContentVariants}
                initial="initial"
                animate="animate"
                className="absolute inset-0 flex flex-col sm:flex-row items-center justify-center gap-6 p-8 bg-[#0a0f1c]/80 backdrop-blur-sm"
              >
                
                {/* КНОПКА 1: Каталог (Стиль как в главном Hero) */}
                <motion.button 
                  whileHover={{ scale: 1.03, y: -2 }} 
                  whileTap={{ scale: 0.98 }}
                  onClick={scrollToCatalog}
                  className="w-full sm:w-auto bg-brand-blue text-white px-10 py-5 rounded-2xl font-bold text-xl hover:bg-[#007cbd] transition-all shadow-xl shadow-brand-blue/25 flex items-center justify-center gap-3 cursor-pointer border-none"
                >
                  {t("catalog_btn")}
                  <ArrowRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
                </motion.button>
                
                {/* КНОПКА 2: Контакты (Outline стиль) */}
                <motion.button 
                  whileHover={{ scale: 1.03, backgroundColor: "rgba(255,255,255,0.05)" }} 
                  whileTap={{ scale: 0.98 }}
                  onClick={scrollToContacts}
                  className="w-full sm:w-auto px-10 py-5 rounded-2xl font-bold text-xl text-white transition-all flex items-center justify-center gap-3 border-2 border-white/10 hover:border-white/20 cursor-pointer bg-transparent"
                >
                  <MessagesSquare className="w-6 h-6 text-brand-blue" />
                  {t("contact_btn")}
                </motion.button>

                {/* Кнопка "Сбросить" (только для теста симуляции) */}
                <button 
    onClick={() => setIsVideoFinished(false)} 
    className="absolute bottom-4 right-4 text-xs text-gray-700 hover:text-gray-500 flex items-center gap-1 bg-transparent border-none cursor-pointer"
>
    <RotateCcw className="w-3 h-3"/> Reset SIM
</button>

              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>


        {/* --- НИЗ: ТЕКСТОВАЯ ЗОНА (Центрированная) --- */}
        <motion.div 
          variants={itemVariants} 
          className="max-w-4xl text-center flex flex-col items-center"
        >
          {/* Бадж */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 text-brand-blue text-sm md:text-base font-semibold mb-8 shadow-inner">
            <span className="flex w-2.5 h-2.5 rounded-full bg-brand-blue animate-pulse" />
            {t("badge")}
          </div>
          
          {/* Заголовок */}
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-extrabold leading-[1.1] mb-8 tracking-tight text-white">
            {t("title_start")} <span className="text-brand-blue">{t("title_highlight")}</span>
          </h1>
          
          {/* Описание */}
          <p className="text-lg md:text-2xl text-gray-400 max-w-3xl leading-relaxed font-medium">
            {t("description")}
          </p>
        </motion.div>

      </motion.div>
    </section>
  );
}