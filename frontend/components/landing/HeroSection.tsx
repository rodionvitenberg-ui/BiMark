'use client';

import React, { useState, useRef } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { ArrowRight, Play, RotateCcw } from 'lucide-react'; 
import { Link } from '../../i18n/routing';
import { AnimatePresence, motion } from 'framer-motion';

// Игнорируем отсутствие типов для JSX-компонента
// @ts-ignore
import TextTypeComponent from '../../components/TextType'; 

// Явно указываем TS, что это React-компонент, чтобы избежать ошибок при рендере в JSX
const TextType = TextTypeComponent as React.ComponentType<any>;

export default function HeroSection() {
  const t = useTranslations('vision');
  const locale = useLocale();

  const videoSrc = locale === 'ru' 
    ? '/videos/presentation-ru.mp4' 
    : '/videos/presentation-en.mp4';

  const [isVideoFinished, setIsVideoFinished] = useState(false);
  const [hasStartedWithSound, setHasStartedWithSound] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  const handleStartWithSound = () => {
    setHasStartedWithSound(true);
    if (videoRef.current) {
      videoRef.current.muted = false;
      videoRef.current.currentTime = 0;
      videoRef.current.play();
    }
  };

  const handleReplay = () => {
    setIsVideoFinished(false);
    setHasStartedWithSound(true);
    if (videoRef.current) {
      videoRef.current.muted = false;
      videoRef.current.currentTime = 0;
      videoRef.current.play();
    }
  };

  const typingWords = {
    ru: ["YouTube-каналы", "Facebook-группы", "Telegram-сети", "Медиа-активы"],
    en: ["YouTube channels", "Facebook groups", "Telegram networks", "Media assets"],
    es: ["Canales de YouTube", "Grupos de Facebook", "Redes de Telegram", "Activos de medios"]
  }[locale as 'ru' | 'en' | 'es'] || ["YouTube channels", "Facebook groups"];

  const headlineStart = {
    ru: "Купите готовые",
    en: "Acquire turnkey",
    es: "Adquiera rentables"
  }[locale as 'ru' | 'en' | 'es'] || "Acquire turnkey";

  const headlineEnd = {
    ru: "с доходом с первого дня",
    en: "generating revenue",
    es: "llave en mano"
  }[locale as 'ru' | 'en' | 'es'] || "generating revenue";

  return (
    <section className="relative w-full pt-24 pb-20 md:pt-32 md:pb-32 bg-[#0a0f1c] text-[#ffffff] overflow-hidden flex justify-center border-b border-gray-800">
      
      <div className="absolute top-[-10%] left-[-0%] w-[100%] h-[100%] bg-[#007bff]/20 blur-[120px] rounded-full pointer-events-none z-0" />

      <div className="max-w-[1200px] w-full mx-auto px-4 relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-8 items-center">
        
        <div className="flex flex-col items-start text-left max-w-xl">
          
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-[999px] bg-white/10 border border-white/10 text-[#007bff] text-[13px] font-semibold mb-8">
            <span className="flex w-2 h-2 rounded-[999px] bg-[#007bff] animate-pulse" />
            Terminal Update: Multi-asset support live 
            <ArrowRight className="w-3.5 h-3.5 ml-1 opacity-70" />
          </div>

          <h1 className="font-sans text-[42px] md:text-[56px] font-extrabold tracking-[-1.4px] leading-[1.1] text-[#ffffff] mb-6 antialiased">
            {headlineStart} <br className="hidden md:block" />
            
            <span className="text-[#007bff] inline-block relative min-h-[1.2em]">
              <TextType 
                text={typingWords}
                typingSpeed={75}
                pauseDuration={1500}
                showCursor={true}
                cursorCharacter="▎"
                deletingSpeed={50}
                variableSpeed={{ min: 60, max: 120 }}
                cursorBlinkDuration={0.5}
              />
              <span className="absolute inset-0 -m-1" />
            </span> <br className="hidden md:block" />
            {headlineEnd}
          </h1>

          <p className="font-sans text-[17px] font-normal tracking-[-0.17px] leading-[1.50] text-gray-400 mb-10 max-w-md">
            {t('hero.subtitle')}
          </p>

          <Link 
            href="/assets" 
            className="bg-[#007bff] text-[#ffffff] text-[15px] font-bold tracking-normal rounded-[999px] py-4 px-8 shadow-[0px_1px_2px_0px_rgba(0,0,0,0.19)] hover:bg-[#0062cc] transition-all duration-150 flex items-center gap-2 group cursor-pointer"
          >
            Build your portfolio
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        <div className="relative w-full aspect-[4/3] md:aspect-video lg:aspect-square max-h-[500px] rounded-[24px] overflow-hidden bg-[#000000] border border-white/10 shadow-[0_24px_48px_-12px_rgba(0,0,0,0.5)] group">
          
          <video
            ref={videoRef}
            src={videoSrc}
            controls={hasStartedWithSound && !isVideoFinished}
            playsInline
            preload="metadata"
            autoPlay
            muted={!hasStartedWithSound}
            onEnded={() => setIsVideoFinished(true)}
            className="absolute inset-0 w-full h-full object-cover transition-opacity duration-500"
          />

          <AnimatePresence>
            {!hasStartedWithSound && !isVideoFinished && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0, backdropFilter: "blur(0px)", transition: { duration: 0.3 } }}
                className="absolute inset-0 flex items-center justify-center bg-[#0a0f1c]/40 backdrop-blur-[4px] z-10"
              >
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleStartWithSound}
                  className="bg-[#007bff] text-white px-8 py-5 rounded-[999px] font-bold text-lg hover:bg-[#0062cc] transition-all shadow-[0_0_40px_rgba(0,124,189,0.4)] flex items-center gap-3 border border-white/20 cursor-pointer"
                >
                  <Play className="w-6 h-6 fill-white" />
                  Watch Presentation
                </motion.button>
              </motion.div>
            )}
          </AnimatePresence>

          <AnimatePresence>
            {isVideoFinished && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1, backdropFilter: "blur(8px)" }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 flex flex-col items-center justify-center gap-4 bg-[#0a0f1c]/80 z-20"
              >
                <button 
                  onClick={handleReplay} 
                  className="text-[15px] font-semibold text-[#ffffff] flex items-center gap-2 bg-white/10 hover:bg-white/20 px-6 py-3 rounded-[999px] transition-all border border-white/10 cursor-pointer"
                >
                  <RotateCcw className="w-4 h-4"/> Watch Again
                </button>
              </motion.div>
            )}
          </AnimatePresence>

        </div>

      </div>
    </section>
  );
}