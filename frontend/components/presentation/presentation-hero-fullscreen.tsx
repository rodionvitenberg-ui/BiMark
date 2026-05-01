"use client";

import { useState, useRef } from "react";
import { motion, Variants, AnimatePresence } from "framer-motion";
import { ArrowRight, MessagesSquare, RotateCcw } from "lucide-react";
import { useTranslations, useLocale } from "next-intl"; 

export function PresentationHeroFullscreen() {
  const t = useTranslations("PresentationHero");
  const locale = useLocale(); 
  
  const videoSrc = locale === "ru" 
    ? "/videos/presentation-ru.mp4" 
    : "/videos/presentation-en.mp4";

  const [isVideoFinished, setIsVideoFinished] = useState(false);
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

  const handleReplay = () => {
    setIsVideoFinished(false);
    if (videoRef.current) {
      videoRef.current.currentTime = 0;
      videoRef.current.play();
    }
  };

  const textVariants: Variants = {
    hidden: { opacity: 0, y: 30 },
    show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 100, damping: 20 } },
  };

  return (
    // Убрали padding-top, чтобы видео прилипло к самому верху (под хедер)
    <section className="relative w-full pb-20 md:pb-32 bg-[#0a0f1c] text-white border-b border-gray-800">
      
      {/* --- ВЕРХ: ШИРОКОФОРМАТНОЕ ВИДЕО НА ВЕСЬ ЭКРАН --- */}
      <div className="relative w-full h-[70vh] md:h-[85vh] lg:h-screen bg-black overflow-hidden group">
        
        <video
          ref={videoRef}
          src={videoSrc} 
          controls={!isVideoFinished}
          playsInline
          preload="metadata"
          autoPlay 
          muted    
          className="absolute inset-0 w-full h-full object-cover"
          onEnded={() => setIsVideoFinished(true)}
        />

        {/* Теневой градиент снизу для бесшовного перехода к тексту */}
        <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-[#0a0f1c] to-transparent pointer-events-none z-0" />

        {/* Оверлей с кнопками */}
        <AnimatePresence>
          {isVideoFinished && (
            <motion.div
              key="action-buttons"
              initial={{ opacity: 0, backdropFilter: "blur(0px)" }}
              animate={{ opacity: 1, backdropFilter: "blur(16px)", transition: { duration: 0.6 } }}
              exit={{ opacity: 0, backdropFilter: "blur(0px)", transition: { duration: 0.4 } }}
              className="absolute inset-0 flex flex-col sm:flex-row items-center justify-center gap-6 p-8 bg-[#0a0f1c]/60 z-10"
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
                className="absolute bottom-10 right-6 text-sm text-gray-400 hover:text-white flex items-center gap-2 bg-black/40 hover:bg-black/60 px-5 py-3 rounded-full backdrop-blur-md transition-all border border-white/10 cursor-pointer"
              >
                <RotateCcw className="w-4 h-4"/> Повторить видео
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* --- НИЗ: ТЕКСТОВАЯ ЗОНА --- */}
      <motion.div 
        initial="hidden"
        animate="show"
        variants={{
          hidden: { opacity: 0 },
          show: { opacity: 1, transition: { staggerChildren: 0.2, delayChildren: 0.4 } }
        }}
        className="container mx-auto px-4 relative z-10 flex flex-col items-center mt-16 md:mt-24 text-center max-w-4xl"
      >
        {/* Центральное свечение за текстом */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[100%] h-[150%] bg-brand-blue/10 blur-[120px] rounded-full pointer-events-none" />

        <motion.div variants={textVariants} className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 text-brand-blue text-sm md:text-base font-semibold mb-8 shadow-inner">
          <span className="flex w-2.5 h-2.5 rounded-full bg-brand-blue animate-pulse" />
          {t("badge")}
        </motion.div>
        
        <motion.h1 variants={textVariants} className="text-4xl md:text-6xl lg:text-7xl font-extrabold leading-[1.1] mb-8 tracking-tight text-white relative z-10">
          {t("title_start")} <span className="text-brand-blue">{t("title_highlight")}</span>
        </motion.h1>
        
        <motion.p variants={textVariants} className="text-lg md:text-2xl text-gray-400 max-w-3xl leading-relaxed font-medium relative z-10">
          {t("description")}
        </motion.p>
      </motion.div>

    </section>
  );
}