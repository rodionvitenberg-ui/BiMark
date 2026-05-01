"use client";

import { useState, useRef } from "react";
import { motion, Variants, AnimatePresence } from "framer-motion";
import { ArrowRight, MessagesSquare, RotateCcw } from "lucide-react";
// ДОБАВИЛИ useLocale
import { useTranslations, useLocale } from "next-intl"; 

export function PresentationHero() {
  const t = useTranslations("PresentationHero");
  
  // ПОЛУЧАЕМ ТЕКУЩУЮ ЛОКАЛЬ
  const locale = useLocale(); 
  
  // Определяем путь к видео. Если 'ru' - русское, иначе (для 'en' и 'es') - английское
  const videoSrc = locale === "ru" 
    ? "/videos/presentation-ru.mp4" 
    : "/videos/presentation-en.mp4";

  // Состояние: проиграно ли видео
  const [isVideoFinished, setIsVideoFinished] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  // Плавный скролл к каталогу
  const scrollToCatalog = () => {
    const catalogElement = document.getElementById("presentation-catalog");
    if (catalogElement) {
      catalogElement.scrollIntoView({ behavior: "smooth" });
    }
  };

  // Плавный скролл к контактам
  const scrollToContacts = () => {
    const contactsElement = document.getElementById("presentation-contacts");
    if (contactsElement) {
      contactsElement.scrollIntoView({ behavior: "smooth" });
    }
  };

  // Перезапуск видео
  const handleReplay = () => {
    setIsVideoFinished(false);
    if (videoRef.current) {
      videoRef.current.currentTime = 0;
      videoRef.current.play();
    }
  };

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

  return (
    <section className="relative w-full pt-16 pb-20 md:pt-24 md:pb-32 overflow-hidden bg-[#0a0f1c] text-white border-b border-gray-800 min-h-screen flex items-center">
      
      {/* Свечение на фоне */}
      <div className="absolute top-[10%] left-1/2 -translate-x-1/2 w-[100%] h-[80%] bg-brand-blue/15 blur-[140px] rounded-full pointer-events-none" />
      
      <motion.div 
        className="container mx-auto px-4 relative z-10 flex flex-col items-center"
        variants={pageLoadVariants}
        initial="hidden"
        animate="show"
      >
        
        {/* --- ВЕРХ: ЗОНА ВИДЕО --- */}
        <motion.div 
          variants={itemVariants}
          className="w-full max-w-5xl aspect-video border border-white/10 rounded-[2rem] bg-black shadow-[0_30px_100px_rgba(0,0,0,0.5)] relative overflow-hidden mb-16 md:mb-20 flex items-center justify-center group"
        >
          {/* Нативный видеоплеер с динамическим src */}
          {/* Нативный видеоплеер с динамическим src */}
          <video
            ref={videoRef}
            src={videoSrc} 
            controls={!isVideoFinished}
            playsInline
            preload="metadata"
            autoPlay /* <-- ДОБАВЛЕНО: Автостарт */
            muted    /* <-- ДОБАВЛЕНО: Обязательное условие для автостарта в браузерах */
            className="absolute inset-0 w-full h-full object-cover"
            onEnded={() => setIsVideoFinished(true)}
          />

          {/* Оверлей с кнопками (Появляется поверх последнего кадра видео) */}
          <AnimatePresence>
            {isVideoFinished && (
              <motion.div
                key="action-buttons"
                initial={{ opacity: 0, backdropFilter: "blur(0px)" }}
                animate={{ opacity: 1, backdropFilter: "blur(12px)", transition: { duration: 0.6 } }}
                exit={{ opacity: 0, backdropFilter: "blur(0px)", transition: { duration: 0.4 } }}
                className="absolute inset-0 flex flex-col sm:flex-row items-center justify-center gap-6 p-8 bg-[#0a0f1c]/70 z-10"
              >
                
                {/* КНОПКА 1: Каталог */}
                <motion.button 
                  whileHover={{ scale: 1.03, y: -2 }} 
                  whileTap={{ scale: 0.98 }}
                  onClick={scrollToCatalog}
                  className="w-full sm:w-auto bg-brand-blue text-white px-10 py-5 rounded-2xl font-bold text-xl hover:bg-[#007cbd] transition-all shadow-xl shadow-brand-blue/25 flex items-center justify-center gap-3 cursor-pointer border-none"
                >
                  {t("catalog_btn")}
                  <ArrowRight className="w-6 h-6" />
                </motion.button>
                
                {/* КНОПКА 2: Контакты */}
                <motion.button 
                  whileHover={{ scale: 1.03, backgroundColor: "rgba(255,255,255,0.05)" }} 
                  whileTap={{ scale: 0.98 }}
                  onClick={scrollToContacts}
                  className="w-full sm:w-auto px-10 py-5 rounded-2xl font-bold text-xl text-white transition-all flex items-center justify-center gap-3 border-2 border-white/10 hover:border-white/20 cursor-pointer bg-transparent"
                >
                  <MessagesSquare className="w-6 h-6 text-brand-blue" />
                  {t("contact_btn")}
                </motion.button>

                {/* Кнопка "Повторить видео" */}
                <button 
                  onClick={handleReplay} 
                  className="absolute bottom-6 right-6 text-sm text-gray-400 hover:text-white flex items-center gap-2 bg-black/40 hover:bg-black/60 px-4 py-2 rounded-full backdrop-blur-md transition-all border border-white/10 cursor-pointer"
                >
                  <RotateCcw className="w-4 h-4"/> Повторить видео
                </button>

              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* --- НИЗ: ТЕКСТОВАЯ ЗОНА --- */}
        <motion.div 
          variants={itemVariants} 
          className="max-w-4xl text-center flex flex-col items-center"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 text-brand-blue text-sm md:text-base font-semibold mb-8 shadow-inner">
            <span className="flex w-2.5 h-2.5 rounded-full bg-brand-blue animate-pulse" />
            {t("badge")}
          </div>
          
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-extrabold leading-[1.1] mb-8 tracking-tight text-white">
            {t("title_start")} <span className="text-brand-blue">{t("title_highlight")}</span>
          </h1>
          
          <p className="text-lg md:text-2xl text-gray-400 max-w-3xl leading-relaxed font-medium">
            {t("description")}
          </p>
        </motion.div>

      </motion.div>
    </section>
  );
}