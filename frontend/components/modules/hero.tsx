"use client";

import { useMemo } from "react";
import { useTranslations, useLocale } from "next-intl";
import { ArrowRight, PlayCircle, Layers } from "lucide-react";
import { Link } from "../../i18n/routing";
import { motion, Variants } from "framer-motion";
import { useQuery } from "@tanstack/react-query";

import { apiClient } from "../../lib/api/client";
import { Project } from "../../types/project";
import Carousel, { CarouselItem } from "../ui/Carousel"; 

export function Hero() {
  const t = useTranslations("Hero");
  const locale = useLocale() as "ru" | "en" | "es";

  // 1. Запрашиваем все проекты с бэкенда
  const { data: projects, isLoading } = useQuery<Project[]>({
    queryKey: ["projects", "hero-random"],
    queryFn: async () => {
      const response = await apiClient.get("/projects/");
      return response.data.results || response.data;
    },
  });

  // 2. Выбираем случайные проекты и мапим их под формат карусели
  const carouselItems: CarouselItem[] = useMemo(() => {
    if (!projects || projects.length === 0) return [];
    
    const shuffled = [...projects].sort(() => 0.5 - Math.random()).slice(0, 5);
    
    return shuffled.map((p) => ({
      id: p.id as any,
      href: `/project/${p.slug}`,
      title: p.title?.[locale] || p.title?.en || p.title?.ru || "Project",
      description: p.description?.[locale] || p.description?.en || p.description?.ru || "",
      icon: p.image ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={p.image} alt="icon" className="w-full h-full object-cover rounded-full" />
      ) : (
        <Layers className="w-5 h-5 text-white" />
      )
    }));
  }, [projects, locale]);

  // Настройки анимации
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
      
      {/* Декоративный фоновый элемент */}
      <div className="absolute top-[-10%] left-[-0%] w-[100%] h-[100%] bg-brand-blue/20 blur-[120px] rounded-full pointer-events-none" />
      
      <div className="container mx-auto px-4 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-8 items-center">
          
          {/* ЛЕВАЯ ЧАСТЬ: Текст и кнопки */}
          <motion.div 
            variants={containerVariants}
            initial="hidden"
            animate="show"
            className="max-w-2xl"
          >
            {/* Бейдж */}
            <motion.div variants={itemVariants} className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 border border-white/10 text-brand-blue text-xs md:text-sm font-semibold mb-6">
              <span className="flex w-2 h-2 rounded-full bg-brand-blue animate-pulse" />
              {t("badge")}
            </motion.div>
            
            {/* Заголовок */}
            <motion.h1 variants={itemVariants} className="text-4xl md:text-6xl lg:text-7xl font-extrabold leading-[1.1] mb-6 tracking-tight text-white">
              {t("title")} <span className="text-brand-blue">Bimark</span>
            </motion.h1>
            
            {/* Подзаголовок */}
            <motion.p variants={itemVariants} className="text-base md:text-xl text-gray-400 mb-8 max-w-lg leading-relaxed">
              {t("subtitle")}
            </motion.p>
            
            {/* Кнопки */}
            <motion.div 
              variants={itemVariants} 
              className="flex flex-row items-center justify-start gap-2 md:gap-4 flex-wrap md:flex-nowrap"
            >
              {/* Первая CTA ведет в каталог долей */}
              <Link 
                href="/category" 
                className="w-full sm:w-auto flex-1 md:flex-none bg-brand-blue text-white px-4 py-3 md:px-8 md:py-4 rounded-xl font-bold text-sm md:text-lg hover:bg-[#007cbd] transition-all shadow-lg shadow-brand-blue/20 flex items-center justify-center gap-2 text-center"
              >
                {t("primaryCta")}
                <ArrowRight className="w-5 h-5 hidden md:block" />
              </Link>
              
              {/* Вторая CTA ведет к полным проектам */}
              <Link 
                href="/project"
                className="w-full sm:w-auto flex-1 md:flex-none px-4 py-3 md:px-8 md:py-4 rounded-xl font-bold text-sm md:text-lg text-white hover:bg-white/10 transition-colors flex items-center justify-center gap-2 border border-transparent hover:border-white/20 text-center"
              >
                <PlayCircle className="w-5 h-5 hidden md:block" />
                {t("secondaryCta")}
              </Link>
            </motion.div>
          </motion.div>

          {/* ПРАВАЯ ЧАСТЬ: Динамическая Карусель */}
          {/* ДОБАВЛЯЕМ ОБЕРТКУ СДЕСЬ: */}
          <div className="hidden md:block w-full">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.4, duration: 0.8, ease: "easeOut" }}
              className="relative lg:h-[500px] flex flex-col items-center justify-center"
            >

              {isLoading ? (
                 <div className="w-10 h-10 border-4 border-brand-blue border-t-transparent rounded-full animate-spin"></div>
              ) : carouselItems.length > 0 ? (
                 <div className="w-full max-w-[280px] sm:max-w-sm md:max-w-md relative z-20 scale-90 sm:scale-100 origin-center">
                   <Carousel 
                     items={carouselItems} 
                     loop={true} 
                     autoplay={true} 
                     autoplayDelay={3000} 
                     round={true} 
                   />
                 </div>
              ) : (
                 <div className="w-full max-w-[280px] sm:max-w-sm h-48 md:h-64 border border-white/10 rounded-3xl flex flex-col items-center justify-center bg-white/5 backdrop-blur-md">
                   <Layers className="w-8 h-8 text-gray-500 mb-4" />
                   <p className="text-gray-400 font-medium text-sm md:text-base">Loading projects...</p>
                 </div>
              )}
            </motion.div>
          </div>

        </div>
      </div>
    </section>
  );
}