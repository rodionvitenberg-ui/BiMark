"use client";

import { useParams } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { ArrowLeft, CheckCircle2, AlertCircle } from "lucide-react";
import { Link } from "../../../../i18n/routing";
import { apiClient } from "../../../../lib/api/client";
import { Project } from "../../../../types/project";

export default function ProjectDetail() {
  const t = useTranslations("Projects"); // Используем те же словари, что и для карточек
  const locale = useLocale() as "ru" | "en" | "es";
  const params = useParams();
  const slug = params.slug as string;

  // Запрашиваем конкретный проект по slug
  const { data: project, isLoading, isError } = useQuery<Project>({
    queryKey: ["project", slug],
    queryFn: async () => {
      const response = await apiClient.get(`/projects/${slug}/`);
      return response.data;
    },
    enabled: !!slug, // Не делаем запрос, пока нет slug
  });

  if (isLoading) {
    return (
      <div className="flex-1 flex justify-center items-center py-32">
        <div className="w-10 h-10 border-4 border-brand-blue border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (isError || !project) {
    return (
      <div className="flex-1 container mx-auto px-4 py-32 text-center">
        <div className="inline-flex flex-col items-center justify-center p-8 bg-red-50 rounded-2xl">
          <AlertCircle className="w-12 h-12 text-red-500 mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Проект не найден</h1>
          <Link href="/" className="text-brand-blue hover:underline">Вернуться на главную</Link>
        </div>
      </div>
    );
  }

  // Безопасное извлечение локализованных данных
  const title = project.title?.[locale] || project.title?.en || project.title?.ru || "Без названия";
  const description = project.description?.[locale] || project.description?.en || project.description?.ru || "";
  const categoryName = project.category?.name?.[locale] || project.category?.name?.en || t("uncategorized");

  const formatCurrency = (value: number | string) => 
    new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(Number(value));

  const soldShares = project.total_shares - project.available_shares;
  const progressRaw = project.total_shares > 0 ? (soldShares / project.total_shares) * 100 : 0;
  const progress = Math.min(Math.max(progressRaw, 0), 100);

  return (
    <div className="flex-1 bg-brand-light pb-24">
      {/* Шапка с хлебными крошками */}
      <div className="bg-white border-b border-gray-200 pt-8 pb-8">
        <div className="container mx-auto px-4">
          <Link href="/" className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-brand-blue transition-colors mb-6">
            <ArrowLeft className="w-4 h-4" />
            Назад к списку
          </Link>
          
          <div className="flex items-center gap-3 mb-4">
            <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-md text-xs font-semibold">
              {categoryName}
            </span>
            {project.status === 'ACTIVE' && (
              <span className="px-3 py-1 bg-green-100 text-green-700 rounded-md text-xs font-semibold flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                {t("statusLive")}
              </span>
            )}
          </div>

          <h1 className="text-4xl md:text-5xl font-extrabold text-brand-black mb-4">{title}</h1>
        </div>
      </div>

      <div className="container mx-auto px-4 mt-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* ЛЕВАЯ КОЛОНКА: Изображение и Описание */}
          <div className="lg:col-span-2 space-y-8">
            <div className="w-full aspect-video bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100">
              {project.image ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={project.image} alt={title} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full bg-gradient-to-tr from-brand-blue/10 to-gray-200 flex items-center justify-center text-gray-400">
                  Нет изображения
                </div>
              )}
            </div>

            <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100">
              <h2 className="text-2xl font-bold text-brand-black mb-4">О проекте</h2>
              <div className="prose prose-gray max-w-none text-gray-600 leading-relaxed whitespace-pre-line">
                {description}
              </div>
            </div>
          </div>

          {/* ПРАВАЯ КОЛОНКА: Виджет инвестирования */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 sticky top-24">
              
              <div className="mb-6">
                <div className="text-3xl font-extrabold text-brand-black mb-1">
                  {formatCurrency(project.price_per_share)}
                </div>
                <div className="text-sm text-gray-500 font-medium">{t("pricePerShare")}</div>
              </div>

              {/* Прогресс */}
              <div className="space-y-3 mb-8">
                <div className="flex justify-between items-end text-sm">
                  <span className="text-gray-500">Доступно долей:</span>
                  <span className="font-bold text-brand-black">{project.available_shares} из {project.total_shares}</span>
                </div>
                <div className="w-full h-3 bg-gray-100 rounded-full overflow-hidden">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${progress}%` }}
                    transition={{ duration: 1, ease: "easeOut" }}
                    className="h-full bg-brand-blue rounded-full"
                  />
                </div>
                <div className="text-right text-xs text-brand-blue font-semibold">
                  Распродано {progress.toFixed(0)}%
                </div>
              </div>

              {/* Фичи актива (заглушки для солидности) */}
              <ul className="space-y-3 mb-8">
                <li className="flex items-center gap-2 text-sm text-gray-600">
                  <CheckCircle2 className="w-4 h-4 text-green-500" />
                  Ежемесячные выплаты дивидендов
                </li>
                <li className="flex items-center gap-2 text-sm text-gray-600">
                  <CheckCircle2 className="w-4 h-4 text-green-500" />
                  Полностью проверенный актив
                </li>
              </ul>

              {/* Кнопка покупки */}
              <button 
                className={`w-full py-4 rounded-xl font-bold text-lg transition-colors flex justify-center items-center gap-2 ${
                  project.available_shares > 0 && (project.status === 'ACTIVE' || project.status === 'PRESALE')
                    ? "bg-brand-blue text-white hover:bg-[#007cbd] shadow-lg shadow-brand-blue/20"
                    : "bg-gray-100 text-gray-400 cursor-not-allowed"
                }`}
                disabled={project.available_shares === 0 || !(project.status === 'ACTIVE' || project.status === 'PRESALE')}
              >
                {project.available_shares > 0 ? "Купить долю" : "Распродано"}
              </button>
              
              <p className="text-xs text-center text-gray-400 mt-4">
                Покупка доли означает согласие с <Link href="#" className="underline">условиями оферты</Link>.
              </p>

            </div>
          </div>

        </div>
      </div>
    </div>
  );
}