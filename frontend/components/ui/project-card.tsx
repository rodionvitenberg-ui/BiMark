"use client";

import { useTranslations } from "next-intl";
import { motion } from "framer-motion";
import { ArrowUpRight } from "lucide-react";
import { Project } from "../../types/project";
import { Link } from "../../i18n/routing";

interface ProjectCardProps {
  project: Project;
}

export function ProjectCard({ project }: ProjectCardProps) {
  const t = useTranslations("Projects");

  // Математика для прогресс-бара (защита от деления на 0 и переполнения)
  const progressRaw = (project.raised / project.target) * 100;
  const progress = Math.min(Math.max(progressRaw, 0), 100);

  // Форматирование валюты (Senior фишка: используем встроенный Intl API)
  const formatCurrency = (value: number) => 
    new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(value);

  // Конфиг стилей в зависимости от статуса
  const statusConfig = {
    LIVE: { bg: "bg-green-100 text-green-700", dot: "bg-green-500", label: t("statusLive") },
    PRESALE: { bg: "bg-orange-100 text-orange-700", dot: "bg-orange-500", label: t("statusPresale") },
    FUNDED: { bg: "bg-gray-100 text-gray-600", dot: "bg-gray-400", label: t("statusFunded") },
  };

  const currentStatus = statusConfig[project.status];

  return (
    <motion.div 
      whileHover={{ y: -8, transition: { duration: 0.2 } }}
      className="group relative bg-white rounded-2xl border border-gray-200 shadow-sm hover:shadow-xl transition-shadow duration-300 overflow-hidden flex flex-col h-full"
    >
      {/* Изображение / Заглушка */}
      <div className="w-full h-48 bg-gray-100 relative overflow-hidden">
        {project.imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={project.imageUrl} alt={project.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
        ) : (
          <div className="w-full h-full bg-gradient-to-tr from-brand-blue/10 to-gray-200 group-hover:scale-105 transition-transform duration-500" />
        )}
        
        {/* Бейдж статуса */}
        <div className={`absolute top-4 left-4 px-3 py-1.5 rounded-full text-xs font-bold flex items-center gap-1.5 backdrop-blur-md bg-white/90 shadow-sm`}>
          <span className={`w-2 h-2 rounded-full ${currentStatus.dot} ${project.status === 'LIVE' ? 'animate-pulse' : ''}`} />
          <span className="text-brand-black">{currentStatus.label}</span>
        </div>

        {/* Категория (YouTube, Telegram и т.д.) */}
        <div className="absolute bottom-4 left-4 px-2.5 py-1 bg-black/60 backdrop-blur-sm rounded-md text-white text-xs font-medium">
          {project.category}
        </div>
      </div>

      {/* Контент */}
      <div className="p-6 flex flex-col flex-1">
        <h3 className="text-xl font-bold text-brand-black mb-2 line-clamp-1">{project.title}</h3>
        <p className="text-sm text-gray-500 mb-6 line-clamp-2 flex-1">{project.description}</p>

        {/* Прогресс сборов */}
        <div className="space-y-2.5 mb-6">
          <div className="flex justify-between items-end">
            <div className="flex flex-col">
              <span className="text-xs text-gray-500 font-medium mb-0.5">{t("raised")}</span>
              <span className="text-brand-blue font-bold text-lg leading-none">{formatCurrency(project.raised)}</span>
            </div>
            <div className="flex flex-col text-right">
              <span className="text-xs text-gray-500 font-medium mb-0.5">{t("target")}</span>
              <span className="text-brand-black font-semibold text-sm leading-none">{formatCurrency(project.target)}</span>
            </div>
          </div>
          {/* Полоса прогресса */}
          <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
            <motion.div 
              initial={{ width: 0 }}
              whileInView={{ width: `${progress}%` }}
              viewport={{ once: true }}
              transition={{ duration: 1, ease: "easeOut" }}
              className={`h-full rounded-full ${project.status === 'FUNDED' ? 'bg-gray-400' : 'bg-brand-blue'}`} 
            />
          </div>
        </div>

        {/* Подвал карточки: Цена и Кнопка */}
        <div className="flex items-center justify-between pt-4 border-t border-gray-100">
          <div>
            <div className="text-brand-black font-extrabold text-xl">{formatCurrency(project.pricePerShare)}</div>
            <div className="text-xs text-gray-500 font-medium">{t("pricePerShare")}</div>
          </div>
          
          <Link href={`/projects/${project.id}`}>
            <button className={`flex items-center justify-center w-10 h-10 rounded-xl transition-colors ${
              project.status === 'LIVE' 
                ? 'bg-brand-black text-white hover:bg-brand-blue' 
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}>
              <ArrowUpRight className="w-5 h-5" />
            </button>
          </Link>
        </div>
      </div>
    </motion.div>
  );
}