"use client";

import { useMemo } from "react";
import { useTranslations, useLocale } from "next-intl";
import { ArrowRight, PlayCircle, Layers3, Gem } from "lucide-react";
import { Link } from "../../i18n/routing";
import { motion, Variants } from "framer-motion";
import { useQuery } from "@tanstack/react-query";

import { apiClient } from "../../lib/api/client";
import { Project, Asset } from "../../types/project"; // <-- Импортируем оба типа
import { Card } from "../ui/card"; 

// EMBLA CAROUSEL
import useEmblaCarousel from "embla-carousel-react";
import Fade from "embla-carousel-fade";
import Autoplay from "embla-carousel-autoplay";

export function Hero() {
  const t = useTranslations("Hero");
  const locale = useLocale() as "ru" | "en" | "es";

  const [emblaRef] = useEmblaCarousel(
    { loop: true, duration: 40 },
    [
      Fade(), 
      Autoplay({ delay: 5000, stopOnInteraction: true })
    ]
  );

  // 1. Запрашиваем долевые проекты
  const { data: projects, isLoading: isProjectsLoading } = useQuery<Project[]>({
    queryKey: ["projects", "hero-random"],
    queryFn: async () => {
      const response = await apiClient.get("/projects/");
      return response.data.results || response.data;
    },
  });

  // 2. Запрашиваем активы
  const { data: assets, isLoading: isAssetsLoading } = useQuery<Asset[]>({
    queryKey: ["assets", "hero-random"],
    queryFn: async () => {
      const response = await apiClient.get("/assets/");
      return response.data.results || response.data;
    },
  });

  const isLoading = isProjectsLoading || isAssetsLoading;

  // 3. Объединяем, перемешиваем и форматируем
  const stackItems = useMemo(() => {
    const combined = [...(projects || []), ...(assets || [])];
    
    if (combined.length === 0) return [];
    
    // Перемешиваем и берем 5 случайных элементов
    const shuffled = combined.sort(() => 0.5 - Math.random()).slice(0, 5);
    
    return shuffled.map((item) => {
      // Универсальное извлечение заголовка
      const title = typeof item.title === 'object' && item.title !== null
        ? (item.title[locale] || item.title.en || item.title.ru || "Без названия")
        : (item.title || "Без названия");

      // Извлекаем описание (у Asset нет short_description, берем обычное)
      const shortDesc = 'short_description' in item && typeof item.short_description === 'object' && item.short_description !== null
        ? (item.short_description[locale] || item.short_description.en || item.short_description.ru)
        : null;
        
      const fallbackDesc = typeof item.description === 'object' && item.description !== null
        ? (item.description[locale] || item.description.en || item.description.ru || "")
        : (item.description || "");

      // Универсальное извлечение картинки
      const currentImage = typeof item.image === 'object' && item.image !== null
        ? (item.image[locale] || item.image.en)
        : item.image;

      const isAsset = 'is_unique' in item;
      const href = isAsset ? `/assets/${item.id}` : `/project/${(item as Project).slug}`;

      return {
        id: item.id.toString(),
        href,
        title,
        description: shortDesc || (fallbackDesc.substring(0, 150) + "..."),
        image: currentImage,
        isAsset,
        isUnique: isAsset ? (item as Asset).is_unique : false,
      };
    });
  }, [projects, assets, locale]);

  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.15, delayChildren: 0.2 },
    },
  };

  const itemVariants: Variants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 120 } },
  };

  return (
    <section className="relative w-full pt-20 pb-16 md:pt-32 md:pb-32 overflow-hidden bg-[#0a0f1c] text-white border-b border-gray-800">
      
      <div className="absolute top-[-10%] left-[-0%] w-[100%] h-[100%] bg-brand-blue/20 blur-[120px] rounded-full pointer-events-none" />
      
      <div className="container mx-auto px-4 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 items-center">
          
          {/* ЛЕВАЯ ЧАСТЬ */}
          <motion.div variants={containerVariants} initial="hidden" animate="show" className="max-w-2xl">
            <motion.div variants={itemVariants} className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 border border-white/10 text-brand-blue text-xs md:text-sm font-semibold mb-6">
              <span className="flex w-2 h-2 rounded-full bg-brand-blue animate-pulse" />
              {t("badge")}
            </motion.div>
            
            <motion.h1 variants={itemVariants} className="text-4xl md:text-6xl lg:text-7xl font-extrabold leading-[1.1] mb-6 tracking-tight text-white">
              {t("title")} <span className="text-brand-blue">Bimark</span>
            </motion.h1>
            
            <motion.p variants={itemVariants} className="text-base md:text-xl text-gray-400 mb-8 max-w-lg leading-relaxed">
              {t("subtitle")}
            </motion.p>
            
            <motion.div variants={itemVariants} className="flex flex-row items-center justify-start gap-4 flex-wrap md:flex-nowrap">
              {/* АНИМИРОВАННАЯ КНОПКА 1 */}
              <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }} className="w-full sm:w-auto flex">
                <Link href="/category" className="w-full bg-brand-blue text-white px-8 py-4 rounded-xl font-bold text-lg hover:bg-[#007cbd] transition-colors shadow-lg shadow-brand-blue/20 flex items-center justify-center gap-2 text-center group">
                  {t("primaryCta")}
                  <ArrowRight className="w-5 h-5 hidden md:block group-hover:translate-x-1 transition-transform" />
                </Link>
              </motion.div>
              
              {/* АНИМИРОВАННАЯ КНОПКА 2 */}
              <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }} className="w-full sm:w-auto flex">
                <Link href="/vision" className="w-full px-8 py-4 rounded-xl font-bold text-lg text-white hover:bg-white/10 transition-colors flex items-center justify-center gap-2 border border-transparent hover:border-white/20 text-center">
                  <PlayCircle className="w-5 h-5 hidden md:block" />
                  {t("secondaryCta")}
                </Link>
              </motion.div>
            </motion.div>
          </motion.div>

          {/* ПРАВАЯ ЧАСТЬ: EMBLA CAROUSEL */}
          <div className="hidden lg:block w-full h-[640px] relative">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.4, duration: 0.8, ease: "easeOut" }}
              className="relative w-full h-full flex justify-end items-center"
            >
              {isLoading ? (
                 <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-10 h-10 border-4 border-brand-blue border-t-transparent rounded-full animate-spin"></div>
                 </div>
              ) : stackItems.length > 0 ? (
                 
                 <div className="overflow-hidden w-full max-w-2xl h-full rounded-[2rem] shadow-[0_30px_100px_rgba(0,0,0,0.5)]" ref={emblaRef}>
                   <div className="flex touch-pan-y flex-row h-full">
                     {stackItems.map((item) => (
                       <div key={item.id} className="min-w-0 flex-[0_0_100%] h-full relative">
                         
                         <Card className="bg-[#121827]/80 backdrop-blur-2xl border-0 p-0 flex flex-col items-start h-full relative group overflow-hidden">

                           <div className="w-full h-80 min-h-[320px] relative flex-shrink-0 bg-[#0a0f1c] overflow-hidden">
                             {item.image ? (
                               <img 
                                 src={item.image} 
                                 alt={item.title} 
                                 className="absolute inset-0 w-full h-full object-cover z-10 group-hover:scale-105 transition-transform duration-700" 
                               />
                             ) : (
                               <div className="absolute inset-0 flex items-center justify-center z-10">
                                 <Layers3 className="w-24 h-24 text-brand-blue opacity-30" />
                               </div>
                             )}
                             <div className="absolute inset-0 bg-gradient-to-t from-[#121827] via-transparent to-transparent z-20 pointer-events-none" />
                           </div>
                           
                           <div className="flex flex-col flex-1 p-8 lg:p-10 w-full gap-5 relative z-30">
                             <h3 className="text-3xl lg:text-4xl font-black text-white leading-tight break-words line-clamp-2 group-hover:text-brand-blue transition-colors">
                               {item.title}
                             </h3>

                             <p className="text-lg text-gray-300 leading-relaxed font-medium line-clamp-4">
                               {item.description}
                             </p>
                           </div>
                           
                           <Link href={item.href as any} className="absolute inset-0 z-40" aria-label={item.title}></Link>
                         </Card>

                       </div>
                     ))}
                   </div>
                 </div>

              ) : (
                 <div className="absolute inset-0 flex items-center justify-end">
                    <div className="w-full max-w-2xl h-[640px] border-0 rounded-[2rem] flex flex-col items-center justify-center bg-white/5 backdrop-blur-md">
                        <Layers3 className="w-12 h-12 text-gray-500 mb-4" />
                        <p className="text-gray-400 font-medium text-lg">Проектов пока нет</p>
                    </div>
                 </div>
              )}
            </motion.div>
          </div>

        </div>
      </div>
    </section>
  );
}