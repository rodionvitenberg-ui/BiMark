"use client";

import { useState, useMemo } from "react";
import { useTranslations, useLocale } from "next-intl";
import { useQuery } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { Layers, SlidersHorizontal } from "lucide-react";

import { Project, Category } from "../../../types/project";
import { ProjectCard } from "../../../components/ui/project-card";
import { apiClient } from "../../../lib/api/client";
import { ContactUs } from "../../../components/modules/contact-us"; 

type StatusFilter = "ALL" | "PRESALE" | "ACTIVE";
type SortType = "NEWEST" | "PRICE_ASC" | "PRICE_DESC";

export default function ProjectsCatalogPage() {
  const t = useTranslations("ProjectsPage");
  const locale = useLocale() as "ru" | "en" | "es";

  const [selectedCategory, setSelectedCategory] = useState<string>("ALL");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("ALL");
  const [sort, setSort] = useState<SortType>("NEWEST");

  // 1. Загружаем категории
  const { data: categories } = useQuery<Category[]>({
    queryKey: ["categories"],
    queryFn: async () => {
      const response = await apiClient.get("/categories/");
      return response.data.results || response.data;
    },
    staleTime: 60 * 1000 * 5, // Кэшируем на 5 минут, категории редко меняются
  });

  // 2. Загружаем проекты
  const { data: projects, isLoading, isError } = useQuery<Project[]>({
    queryKey: ["projects", "all"],
    queryFn: async () => {
      const response = await apiClient.get("/projects/");
      return response.data.results || response.data;
    },
    staleTime: 60 * 1000,
  });

  // 3. Мгновенная клиентская фильтрация и сортировка
  const displayedProjects = useMemo(() => {
    if (!projects) return [];
    let result = [...projects];

    // Фильтр по Категории
    if (selectedCategory !== "ALL") {
      result = result.filter((p) => p.category?.slug === selectedCategory);
    }

    // Фильтр по Статусу
    if (statusFilter === "PRESALE") {
      result = result.filter((p) => p.status === "PRESALE");
    } else if (statusFilter === "ACTIVE") {
      result = result.filter((p) => p.status === "ACTIVE");
    }

    // Сортировка
    result.sort((a, b) => {
      if (sort === "NEWEST") return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      if (sort === "PRICE_ASC") return Number(a.price_per_share) - Number(b.price_per_share);
      if (sort === "PRICE_DESC") return Number(b.price_per_share) - Number(a.price_per_share);
      return 0;
    });

    return result;
  }, [projects, selectedCategory, statusFilter, sort]);

  const handleResetFilters = () => {
    setSelectedCategory("ALL");
    setStatusFilter("ALL");
    setSort("NEWEST");
  };

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-black pt-24 flex flex-col">
      
      {/* 1. HERO БЛОК */}
      <div className="w-full max-w-[1600px] mx-auto px-4 sm:px-8 mb-8">
        <section className="relative w-full overflow-hidden bg-brand-blue/5 dark:bg-brand-blue/10 rounded-3xl px-6 py-16 sm:py-24">
          <div className="relative z-10 max-w-3xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-blue/10 text-brand-blue text-xs font-bold uppercase tracking-wider mb-6">
              <Layers className="w-4 h-4" />
              {t("heroBadge", { fallback: "Каталог долей" })}
            </div>
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-black text-gray-900 dark:text-white mb-6 tracking-tight leading-tight">
              {t("title")}
            </h1>
            <p className="text-lg sm:text-xl text-gray-600 dark:text-gray-400">
              {t("subtitle")}
            </p>
          </div>
        </section>
      </div>

      <div className="w-full max-w-[1600px] mx-auto px-4 sm:px-8 flex-1">
        
        {/* 2. КАТЕГОРИИ (Горизонтальный скролл) */}
        <div className="mb-6 flex overflow-x-auto pb-4 -mx-4 px-4 sm:mx-0 sm:px-0 hide-scrollbar gap-3">
          <CategoryPill 
            active={selectedCategory === "ALL"} 
            onClick={() => setSelectedCategory("ALL")} 
            label={t("allCategories", { fallback: "🔥 Все проекты" })} 
          />
          {categories?.map((cat) => {
            const catName = typeof cat.name === 'string' ? cat.name : (cat.name[locale] || cat.name.en || "Категория");
            return (
              <CategoryPill
                key={cat.id}
                active={selectedCategory === cat.slug}
                onClick={() => setSelectedCategory(cat.slug)}
                label={catName}
              />
            );
          })}
        </div>

        {/* 3. ПАНЕЛЬ НАСТРОЕК (Статус и Сортировка) */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-12 bg-white dark:bg-[#111827] p-4 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-sm">
          
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <div className="w-10 h-10 rounded-xl bg-gray-50 dark:bg-gray-800 flex items-center justify-center shrink-0">
              <SlidersHorizontal className="w-5 h-5 text-gray-400" />
            </div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as StatusFilter)}
              className="w-full sm:w-auto bg-transparent border-none outline-none text-gray-900 dark:text-white text-sm font-bold cursor-pointer transition-all"
            >
              <option value="ALL">{t("filterStatusAll", { fallback: "Любой статус" })}</option>
              <option value="PRESALE">{t("filterPresale", { fallback: "Только Пресейл (Идет сбор)" })}</option>
              <option value="ACTIVE">{t("filterActive", { fallback: "Активные бизнесы" })}</option>
            </select>
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto border-t sm:border-t-0 sm:border-l border-gray-100 dark:border-gray-800 pt-4 sm:pt-0 sm:pl-4">
            <span className="text-sm font-medium text-gray-500 whitespace-nowrap hidden md:inline-block">
              {t("sortBy", { fallback: "Сортировать:" })}
            </span>
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value as SortType)}
              className="w-full sm:w-auto bg-gray-50 dark:bg-gray-800 border-none outline-none text-gray-900 dark:text-white text-sm font-bold rounded-xl px-4 py-3 cursor-pointer focus:ring-2 focus:ring-brand-blue transition-all"
            >
              <option value="NEWEST">{t("sortNewest", { fallback: "Сначала новые" })}</option>
              <option value="PRICE_ASC">{t("sortPriceAsc", { fallback: "Дешевые доли" })}</option>
              <option value="PRICE_DESC">{t("sortPriceDesc", { fallback: "Дорогие доли" })}</option>
            </select>
          </div>
        </div>

        {/* 4. СЕТКА КАРТОЧЕК */}
        {isLoading ? (
          <div className="flex justify-center items-center py-32">
            <div className="w-10 h-10 border-4 border-brand-blue border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : isError ? (
          <div className="text-center py-20 text-red-500 font-medium bg-red-50 dark:bg-red-900/20 rounded-2xl border border-red-100 dark:border-red-900/50">
            {t("error")}
          </div>
        ) : (
          <motion.div layout className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 min-h-[400px] content-start pb-20">
            <AnimatePresence mode="popLayout">
              {displayedProjects.length > 0 ? (
                displayedProjects.map((project) => (
                  <motion.div key={project.id} layout initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }} transition={{ duration: 0.2 }}>
                    <ProjectCard project={project} />
                  </motion.div>
                ))
              ) : (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="col-span-full flex flex-col items-center justify-center py-20 text-center">
                  <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mb-4">
                    <Layers className="w-8 h-8 text-gray-400" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">{t("empty")}</h3>
                  <button onClick={handleResetFilters} className="mt-6 text-brand-blue font-bold hover:underline">
                    {t("resetFilters", { fallback: "Сбросить все фильтры" })}
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        )}
      </div>

      {/* 5. БЛОК ОБРАТНОЙ СВЯЗИ */}
      <div className="w-full mt-auto">
        <ContactUs />
      </div>

      {/* Стили для скрытия скроллбара (полезно для мобилок) */}
      <style dangerouslySetInnerHTML={{__html: `
        .hide-scrollbar::-webkit-scrollbar { display: none; }
        .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}} />
    </div>
  );
}

// Отдельный мини-компонент для кнопок категорий
function CategoryPill({ active, onClick, label }: { active: boolean; onClick: () => void; label: string }) {
  return (
    <button
      onClick={onClick}
      className={`px-6 py-3 rounded-2xl font-bold text-sm whitespace-nowrap transition-all duration-300 shrink-0 border ${
        active 
          ? "bg-brand-black text-white border-brand-black shadow-md" 
          : "bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 border-gray-200 dark:border-gray-700 hover:border-gray-300 hover:shadow-sm"
      }`}
    >
      {label}
    </button>
  );
}