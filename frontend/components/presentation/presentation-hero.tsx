"use client";

import { useState, useRef } from "react";
import { motion, Variants, AnimatePresence } from "framer-motion";
import { ArrowRight, MessagesSquare, RotateCcw, TrendingUp, Settings, ShieldCheck, Play } from "lucide-react";
import { useTranslations, useLocale } from "next-intl"; 

export function PresentationHero() {
  const t = useTranslations("PresentationHero");
  const locale = useLocale(); 
  
  const videoSrc = locale === "ru" 
    ? "/videos/presentation-ru.mp4" 
    : "/videos/presentation-en.mp4";

  const [isVideoFinished, setIsVideoFinished] = useState(false);
  
  // НОВОЕ СОСТОЯНИЕ: Включил ли юзер звук
  const [hasStartedWithSound, setHasStartedWithSound] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  const scrollToCatalog = () => {
    const catalogElement = document.getElementById("presentation-catalog");
    if (catalogElement) {
      catalogElement.scrollIntoView({ behavior: "smooth" });
    }
  };

  const scrollToContacts = () => {
    const contactsElement = document.getElementById("presentation-contacts");
    if (contactsElement) {
      contactsElement.scrollIntoView({ behavior: "smooth" });
    }
  };

  // НОВАЯ ФУНКЦИЯ: Запуск со звуком с самого начала
  const handleStartWithSound = () => {
    setHasStartedWithSound(true);
    if (videoRef.current) {
      videoRef.current.muted = false; // Принудительно включаем звук
      videoRef.current.currentTime = 0; // Откидываем на начало
      videoRef.current.play();
    }
  };

  // Обновленный реплей: тоже запускаем со звуком
  const handleReplay = () => {
    setIsVideoFinished(false);
    setHasStartedWithSound(true);
    if (videoRef.current) {
      videoRef.current.muted = false;
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
          {/* Видео плеер. Muted завязан на стейт */}
          <video
            ref={videoRef}
            src={videoSrc} 
            controls={hasStartedWithSound && !isVideoFinished} // Показываем контролы только когда юзер уже в процессе
            playsInline
            preload="metadata"
            autoPlay
            muted={!hasStartedWithSound} // Звук выключен до клика
            className="absolute inset-0 w-full h-full object-cover"
            onEnded={() => setIsVideoFinished(true)}
          />

          {/* НОВЫЙ ОВЕРЛЕЙ: Кнопка старта со звуком */}
          <AnimatePresence>
            {!hasStartedWithSound && !isVideoFinished && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0, backdropFilter: "blur(0px)", transition: { duration: 0.5 } }}
                className="absolute inset-0 flex items-center justify-center bg-[#0a0f1c]/40 backdrop-blur-[2px] z-10"
              >
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleStartWithSound}
                  className="bg-brand-blue/90 text-white px-8 py-5 rounded-full font-bold text-lg hover:bg-brand-blue transition-all shadow-[0_0_40px_rgba(0,124,189,0.4)] flex items-center gap-3 border border-white/20 cursor-pointer"
                >
                  <Play className="w-6 h-6 fill-white" />
                  {t("watch_presentation_btn")}
                </motion.button>
              </motion.div>
            )}
          </AnimatePresence>

          {/* ОВЕРЛЕЙ КОНЦА ВИДЕО (Существующий) */}
          <AnimatePresence>
            {isVideoFinished && (
              <motion.div
                key="action-buttons"
                initial={{ opacity: 0, backdropFilter: "blur(0px)" }}
                animate={{ opacity: 1, backdropFilter: "blur(12px)", transition: { duration: 0.6 } }}
                exit={{ opacity: 0, backdropFilter: "blur(0px)", transition: { duration: 0.4 } }}
                className="absolute inset-0 flex flex-col sm:flex-row items-center justify-center gap-6 p-8 bg-[#0a0f1c]/70 z-20"
              >
                
                <motion.button 
                  whileHover={{ scale: 1.03, y: -2 }} 
                  whileTap={{ scale: 0.98 }}
                  onClick={scrollToCatalog}
                  className="w-full sm:w-auto bg-brand-blue text-white px-10 py-5 rounded-2xl font-bold text-xl hover:bg-[#007cbd] transition-all shadow-xl shadow-brand-blue/25 flex items-center justify-center gap-3 cursor-pointer border-none"
                >
                  {t("catalog_btn")}
                  <ArrowRight className="w-6 h-6" />
                </motion.button>
                
                <motion.button 
                  whileHover={{ scale: 1.03, backgroundColor: "rgba(255,255,255,0.05)" }} 
                  whileTap={{ scale: 0.98 }}
                  onClick={scrollToContacts}
                  className="w-full sm:w-auto px-10 py-5 rounded-2xl font-bold text-xl text-white transition-all flex items-center justify-center gap-3 border-2 border-white/10 hover:border-white/20 cursor-pointer bg-transparent"
                >
                  <MessagesSquare className="w-6 h-6 text-brand-blue" />
                  {t("contact_btn")}
                </motion.button>

                <button 
                  onClick={handleReplay} 
                  className="absolute bottom-6 right-6 text-sm text-gray-400 hover:text-white flex items-center gap-2 bg-black/40 hover:bg-black/60 px-4 py-2 rounded-full backdrop-blur-md transition-all border border-white/10 cursor-pointer"
                >
                  <RotateCcw className="w-4 h-4"/> {t("replay_btn")}
                </button>

              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* --- НИЗ: ТЕКСТОВАЯ ЗОНА --- */}
        <motion.div 
          variants={itemVariants} 
          className="max-w-5xl text-center flex flex-col items-center w-full"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 text-brand-blue text-sm md:text-base font-semibold mb-8 shadow-inner">
            <span className="flex w-2.5 h-2.5 rounded-full bg-brand-blue animate-pulse" />
            {t("badge")}
          </div>
          
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-extrabold leading-[1.1] mb-6 tracking-tight text-white">
            {t("title_start")} <span className="text-brand-blue">{t("title_highlight")}</span>
          </h1>
          
          <p className="text-lg md:text-xl text-gray-400 max-w-3xl leading-relaxed font-medium mb-12">
            {t("description")}
          </p>

          {/* --- СЕТКА ПРЕИМУЩЕСТВ --- */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full text-left">
            
            <div className="bg-white/5 border border-white/10 rounded-2xl p-6 hover:bg-white/10 transition-colors">
              <TrendingUp className="w-8 h-8 text-brand-blue mb-4" />
              <h3 className="text-xl font-bold text-white mb-2">{t("feature_1_title")}</h3>
              <p className="text-sm text-gray-400 leading-relaxed">{t("feature_1_desc")}</p>
            </div>

            <div className="bg-white/5 border border-white/10 rounded-2xl p-6 hover:bg-white/10 transition-colors">
              <Settings className="w-8 h-8 text-brand-blue mb-4" />
              <h3 className="text-xl font-bold text-white mb-2">{t("feature_2_title")}</h3>
              <p className="text-sm text-gray-400 leading-relaxed">{t("feature_2_desc")}</p>
            </div>

            <div className="bg-white/5 border border-white/10 rounded-2xl p-6 hover:bg-white/10 transition-colors">
              <ShieldCheck className="w-8 h-8 text-brand-blue mb-4" />
              <h3 className="text-xl font-bold text-white mb-2">{t("feature_3_title")}</h3>
              <p className="text-sm text-gray-400 leading-relaxed">{t("feature_3_desc")}</p>
            </div>

          </div>

        </motion.div>

      </motion.div>
    </section>
  );
}