"use client";

import { useTranslations, useLocale } from "next-intl";
import { MapPin, PieChart } from "lucide-react";
import { Project } from "../../types/project";
import { Link } from "../../i18n/routing";

import { 
  Card, 
  CardContent, 
  CardFooter, 
  CardHeader, 
  CardTitle, 
  CardDescription 
} from "./card";

interface ProjectCardProps {
  project: Project;
}

export function ProjectCard({ project }: ProjectCardProps) {
  const t = useTranslations("Projects");
  const locale = useLocale() as "ru" | "en" | "es";

  // Локализация
  const title = project.title[locale] || project.title.en || "Без названия";
  const description = project.description[locale] || project.description.en || "";
  const categoryName = project.category?.name[locale] || t("uncategorized");

  // Математика долей для HP бара
  const soldShares = project.total_shares - project.available_shares;
  const progressRaw = project.total_shares > 0 ? (soldShares / project.total_shares) * 100 : 0;
  const progress = Math.min(Math.max(progressRaw, 0), 100);

  // Форматирование цены
  const formatCurrency = (value: number | string) => 
    new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(Number(value));

  // Статусы (для бейджика на фото)
  const statusConfig: Record<string, { textClass: string, label: string }> = {
    DRAFT: { textClass: "text-gray-600", label: "Черновик" },
    PRESALE: { textClass: "text-orange-600", label: t("statusPresale") },
    ACTIVE: { textClass: "text-green-600", label: t("statusLive") },
    SOLD: { textClass: "text-red-600", label: t("statusSold") },
  };

  const currentStatus = statusConfig[project.status] || statusConfig.DRAFT;
  const projectUrl = `/project/${project.slug}`;
  const imageSrc = project.image || "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=2564&auto=format&fit=crop";

  return (
    <Card className="group flex flex-col h-full bg-white hover:shadow-lg transition-all duration-300 border border-gray-100 overflow-hidden gap-0">
      
      {/* ШАПКА: Заголовок и Описание */}
      <CardHeader className="p-3 pb-2 pt-0">
        <Link href={projectUrl} className="block">
          <CardTitle className="text-2xl font-bold text-brand-black line-clamp-1 group-hover:text-brand-blue transition-colors">
            {title}
          </CardTitle>
        </Link>
        <CardDescription className="line-clamp-2 text-md text-gray-500 leading-relaxed">
          {description}
        </CardDescription>
      </CardHeader>

      {/* КОНТЕНТ: Картинка, HP Бар и Информация */}
      <CardContent className="p-2 pt-0 flex-1 flex flex-col">
        
        {/* Картинка (h-36) */}
        <Link href={projectUrl} className="block w-full h-40 relative rounded-xl overflow-hidden shrink-0 mb-2 bg-gray-100">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img 
            src={imageSrc} 
            alt={title} 
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
          />
        </Link>

        {/* HP Bar (на ширину фотографии) */}
        <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden mb-4">
          <div 
            className={`h-full ${project.status === 'SOLD' ? 'bg-gray-400' : 'bg-brand-blue'}`} 
            style={{ width: `${progress}%` }} 
          />
        </div>

        {/* Блок с информацией (Оставшиеся доли и Категория) */}
        <div className="flex flex-col gap-2.5 mt-auto">
          {/* Доли (с использованием ключа t("availableShares")) */}
          <div className="flex items-center text-sm text-gray-500 font-medium">
            <PieChart className="w-4 h-4 mr-2 text-gray-400 shrink-0" />
            <span>{t("availableShares")}: <span className="text-brand-black font-bold">{project.available_shares}</span></span>
          </div>
          
          {/* Категория (под долями) */}
          <div className="flex items-center text-sm text-gray-500 font-medium truncate">
            <div className="w-4 h-4 mr-2 text-gray-400 shrink-0" />
            <span className="truncate">{categoryName}</span>
          </div>
        </div>
        
      </CardContent>

      {/* ФУТЕР: Цена за долю и Кнопка */}
        <CardFooter className="p-3 pt-0 flex items-center justify-between mt-auto border-t border-gray-50/50 mt-0">
          <div className="flex flex-col">
            <span className="text-xl font-black text-brand-black leading-none">
              {formatCurrency(project.price_per_share)}
            </span>
            <span className="text-[11px] text-gray-400 font-bold mt-1 uppercase tracking-wider">
              {t("pricePerShare")}
            </span>
          </div>
          
          <Link 
            href={projectUrl} 
            className="shrink-0 px-5 py-2.5 bg-brand-blue text-white text-sm font-bold rounded-xl hover:bg-[#007cbd] transition-colors"
          >
            {/* Вот здесь используем наш новый ключ перевода */}
            {t("buyBtn")} 
          </Link>
        </CardFooter>

    </Card>
  );
}