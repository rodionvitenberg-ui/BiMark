'use client';

import React, { useMemo } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { ArrowRight, Layers3 } from 'lucide-react'; 
import { Link } from '../../i18n/routing';
import { motion, Variants } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';

import { apiClient } from '../../lib/api/client';
import { Asset } from '../../types/project'; 
import { Card } from '../ui/card'; 

// EMBLA CAROUSEL
import useEmblaCarousel from "embla-carousel-react";
import Fade from "embla-carousel-fade";
import Autoplay from "embla-carousel-autoplay";

// @ts-ignore
import TextTypeComponent from '../../components/TextType'; 
const TextType = TextTypeComponent as React.ComponentType<any>;

export default function HeroSection() {
  const t = useTranslations('vision');
  const locale = useLocale() as 'ru' | 'en' | 'es';

  const [emblaRef] = useEmblaCarousel(
    { loop: true, duration: 40 },
    [
      Fade(), 
      Autoplay({ delay: 5000, stopOnInteraction: true })
    ]
  );

  const { data: assets, isLoading } = useQuery<Asset[]>({
    queryKey: ["assets", "hero-random"],
    queryFn: async () => {
      const response = await apiClient.get("/assets/");
      return response.data.results || response.data;
    },
  });

  const stackItems = useMemo(() => {
    if (!assets || assets.length === 0) return [];
    
    const shuffled = [...assets].sort(() => 0.5 - Math.random()).slice(0, 5);
    
    return shuffled.map((item) => {
      const title = typeof item.title === 'object' && item.title !== null
        ? (item.title[locale] || item.title.en || item.title.ru || "Without title")
        : (item.title || "Without title");
        
      // СОХРАНЯЕМ СЫРОЙ HTML ИЗ АДМИНКИ (Убрали очистку и substring)
      const rawDescription = typeof item.description === 'object' && item.description !== null
        ? (item.description[locale] || item.description.en || item.description.ru || "")
        : (item.description || "");

      const currentImage = typeof item.image === 'object' && item.image !== null
        ? (item.image[locale] || item.image.en || "")
        : item.image;

      return {
        id: item.id.toString(),
        href: `/assets/${item.id}`,
        title,
        description: rawDescription, // Сюда теперь летит rich-text с жирным текстом, списками и т.д.
        image: currentImage,
        isAsset: true,
        isUnique: item.is_unique,
      };
    });
  }, [assets, locale]);

  const badgeText = {
    ru: "Обновление терминала: Доступна поддержка мультивалютных активов",
    en: "Terminal Update: Multi-asset support live",
    es: "Actualización del terminal: Soporte multi-activo activo"
  }[locale] || "Terminal Update: Multi-asset support live";

  const ctaText = {
    ru: "Создать свое portfolio",
    en: "Build your portfolio",
    es: "Construya su portafolio"
  }[locale] || "Build your portfolio";

  const typingWords = {
    ru: ["YouTube-каналы", "Facebook-группы", "Telegram-сети", "Медиа-активы"],
    en: ["YouTube channels", "Facebook groups", "Telegram networks", "Media assets"],
    es: ["Canales de YouTube", "Grupos de Facebook", "Redes de Telegram", "Activos de medios"]
  }[locale] || ["YouTube channels", "Media assets"];

  const headlineStart = {
    ru: "Купите готовые",
    en: "Acquire turnkey",
    es: "Adquiera rentables"
  }[locale] || "Acquire turnkey";

  const headlineEnd = {
    ru: "с доходом с первого дня",
    en: "generating revenue",
    es: "llave en mano"
  }[locale] || "generating revenue";

  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.15, delayChildren: 0.2 } },
  };

  const itemVariants: Variants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 120 } },
  };

  return (
    <section className="relative w-full pt-24 pb-20 md:pt-32 md:pb-32 bg-[#0a0f1c] text-[#ffffff] overflow-hidden flex justify-center border-b border-gray-800">
      <div className="absolute top-[-10%] left-[-0%] w-[100%] h-[100%] bg-[#007bff]/20 blur-[120px] rounded-full pointer-events-none z-0" />

      <div className="max-w-[1200px] w-full mx-auto px-4 relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-8 items-center">
        
        {/* ЛЕВАЯ ЧАСТЬ */}
        <motion.div variants={containerVariants} initial="hidden" animate="show" className="flex flex-col items-start text-left max-w-xl">
          <motion.h1 variants={itemVariants} className="font-sans text-[42px] md:text-[56px] font-extrabold tracking-[-1.4px] leading-[1.1] text-[#ffffff] mb-6 antialiased">
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
          </motion.h1>

          <motion.p variants={itemVariants} className="font-sans text-[17px] font-normal tracking-[-0.17px] leading-[1.50] text-gray-400 mb-10 max-w-md">
            {t('hero.subtitle')}
          </motion.p>

          <motion.div variants={itemVariants}>
            <Link 
              href="/assets" 
              className="bg-[#007bff] text-[#ffffff] text-[15px] font-bold tracking-normal rounded-[999px] py-4 px-8 shadow-[0px_1px_2px_0px_rgba(0,0,0,0.19)] hover:bg-[#0062cc] transition-all duration-150 flex items-center gap-2 group cursor-pointer"
            >
              {ctaText}
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
          </motion.div>
        </motion.div>

        {/* ПРАВАЯ ЧАСТЬ: СЛАЙДЕР С ВЫВОДОМ HTML */}
        <div className="w-full h-[500px] relative">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.4, duration: 0.8, ease: "easeOut" }}
            className="relative w-full h-full flex justify-end items-center"
          >
            {isLoading ? (
               <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-10 h-10 border-4 border-[#007bff] border-t-transparent rounded-full animate-spin"></div>
               </div>
            ) : stackItems.length > 0 ? (
               <div className="overflow-hidden w-full h-full rounded-[2rem] shadow-[0_30px_100px_rgba(0,0,0,0.5)] border border-white/10" ref={emblaRef}>
                 <div className="flex touch-pan-y flex-row h-full">
                   {stackItems.map((item) => (
                     <div key={item.id} className="min-w-0 flex-[0_0_100%] h-full relative">
                       <Card className="bg-[#121827]/80 backdrop-blur-2xl border-0 p-0 flex flex-col items-start h-full relative group overflow-hidden gap-0">

                         <div className="w-full h-56 min-h-[224px] relative flex-shrink-0 bg-[#0a0f1c] overflow-hidden">
                           {item.image ? (
                             <img 
                               src={item.image} 
                               alt={item.title} 
                               className="absolute inset-0 w-full h-full object-cover z-10 group-hover:scale-105 transition-transform duration-700" 
                             />
                           ) : (
                             <div className="absolute inset-0 flex items-center justify-center z-10">
                               <Layers3 className="w-24 h-24 text-[#007bff] opacity-30" />
                             </div>
                           )}
                           <div className="absolute inset-0 bg-gradient-to-t from-[#121827] via-transparent to-transparent z-20 pointer-events-none" />
                         </div>
                         
                         <div className="flex flex-col flex-1 p-6 lg:p-8 w-full gap-3 relative z-30 justify-start">
                           <h3 className="text-2xl lg:text-3xl font-black text-white leading-tight break-words line-clamp-2 group-hover:text-[#007bff] transition-colors">
                             {item.title}
                           </h3>

                           {/* ИНТЕГРАЦИЯ HTML ИЗ АДМИНКИ БЕЗ ОШИБОК СЛОЖЕННЫХ ТЕГОВ */}
                           <div 
                             className="text-md text-gray-400 leading-relaxed font-medium line-clamp-4 rich-text-container"
                             dangerouslySetInnerHTML={{ __html: item.description }}
                           />
                         </div>
                         
                         <Link href={item.href as any} className="absolute inset-0 z-40" aria-label={item.title}></Link>
                       </Card>
                     </div>
                   ))}
                 </div>
               </div>
            ) : (
               <div className="absolute inset-0 flex items-center justify-end">
                  <div className="w-full h-[500px] border border-white/10 rounded-[2rem] flex flex-col items-center justify-center bg-white/5 backdrop-blur-md">
                      <Layers3 className="w-12 h-12 text-gray-500 mb-4" />
                      <p className="text-gray-400 font-medium text-lg">No assets found</p>
                  </div>
               </div>
            )}
          </motion.div>
        </div>

      </div>
    </section>
  );
}