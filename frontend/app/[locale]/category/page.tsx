"use client";

import { useState, useMemo } from "react";
import { useTranslations } from "next-intl";
import { useQuery } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { Layers } from "lucide-react";

import { Project } from "../../../types/project";
import { ProjectCard } from "../../../components/ui/project-card";
import { apiClient } from "../../../lib/api/client";
import { ContactUs } from "../../../components/modules/contact-us"; 

// Фильтруем по статусу проекта
type FilterType = "ALL" | "PRESALE" | "ACTIVE";
// Сортируем по дате или цене за долю
type SortType = "NEWEST" | "PRICE_ASC" | "PRICE_DESC";

export default function ProjectsCatalogPage() {
  const t = useTranslations("ProjectsPage");

  const [filter, setFilter] = useState<FilterType>("ALL");
  const [sort, setSort] = useState<SortType>("NEWEST");

  // Запрашиваем все проекты с бэкенда
  const { data: projects, isLoading, isError } = useQuery<Project[]>({
    queryKey: ["projects", "all"],
    queryFn: async () => {
      const response = await apiClient.get("/projects/");
      return response.data.results || response.data;
    },
    staleTime: 60 * 1000,
  });

  // Магия на клиенте: фильтруем и сортируем без лишних запросов к БД
  const displayedProjects = useMemo(() => {
    if (!projects) return [];
    let result = [...projects];

    // 1. Фильтрация
    if (filter === "PRESALE") {
      result = result.filter((p) => p.status === "PRESALE");
    } else if (filter === "ACTIVE") {
      result = result.filter((p) => p.status === "ACTIVE");
    }

    // 2. Сортировка
    result.sort((a, b) => {
      if (sort === "NEWEST") {
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      }
      if (sort === "PRICE_ASC") {
        return Number(a.price_per_share) - Number(b.price_per_share);
      }
      if (sort === "PRICE_DESC") {
        return Number(b.price_per_share) - Number(a.price_per_share);
      }
      return 0;
    });

    return result;
  }, [projects, filter, sort]);

  return (
    // Flex-col чтобы подвал всегда прижимался к низу
    <div className="min-h-screen bg-zinc-50 dark:bg-black pt-24 flex flex-col">
      
      {/* 1. HERO БЛОК (Шапка) - Растянули контейнер */}
      <div className="w-full max-w-[1600px] mx-auto px-4 sm:px-8 mb-12">
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

      {/* Основной контейнер сетки (Сделали шире: max-w-[1600px]) */}
      <div className="w-full max-w-[1600px] mx-auto px-4 sm:px-8 flex-1">
        
        {/* 2. ПАНЕЛЬ УПРАВЛЕНИЯ (Фильтры и Сортировка) */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12 bg-white dark:bg-[#111827] p-4 sm:p-6 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-sm">
          
          <div className="flex flex-wrap items-center gap-2 bg-gray-50 dark:bg-gray-800/50 p-1.5 rounded-2xl">
            <FilterPill active={filter === "ALL"} onClick={() => setFilter("ALL")} label={t("filterAll", { fallback: "Все проекты" })} />
            <FilterPill active={filter === "PRESALE"} onClick={() => setFilter("PRESALE")} label={t("filterPresale", { fallback: "Пресейл (Сбор)" })} />
            <FilterPill active={filter === "ACTIVE"} onClick={() => setFilter("ACTIVE")} label={t("filterActive", { fallback: "Активные бизнесы" })} />
          </div>

          <div className="flex items-center gap-3">
            <span className="text-sm font-medium text-gray-500 whitespace-nowrap">
              {t("sortBy", { fallback: "Сортировать:" })}
            </span>
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value as SortType)}
              className="bg-gray-50 dark:bg-gray-800 border-none outline-none text-gray-900 dark:text-white text-sm font-bold rounded-xl px-4 py-3 cursor-pointer focus:ring-2 focus:ring-brand-blue transition-all"
            >
              <option value="NEWEST">{t("sortNewest", { fallback: "Сначала новые" })}</option>
              <option value="PRICE_ASC">{t("sortPriceAsc", { fallback: "Дешевые доли" })}</option>
              <option value="PRICE_DESC">{t("sortPriceDesc", { fallback: "Дорогие доли" })}</option>
            </select>
          </div>
        </div>

        {/* 3. СЕТКА КАРТОЧЕК */}
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
                  <button onClick={() => { setFilter("ALL"); setSort("NEWEST"); }} className="mt-6 text-brand-blue font-bold hover:underline">
                    {t("resetFilters", { fallback: "Сбросить фильтры" })}
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        )}
      </div>

      {/* 4. БЛОК ОБРАТНОЙ СВЯЗИ (Вынесен из контейнера, тянется на 100%) */}
      <div className="w-full mt-auto">
        <ContactUs />
      </div>

    </div>
  );
}

function FilterPill({ active, onClick, label }: { active: boolean; onClick: () => void; label: string }) {
  return (
    <button
      onClick={onClick}
      className={`px-5 py-2.5 rounded-xl font-bold text-sm transition-all duration-300 ${
        active 
          ? "bg-white dark:bg-gray-700 text-brand-blue shadow-sm" 
          : "text-gray-500 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800"
      }`}
    >
      {label}
    </button>
  );
}