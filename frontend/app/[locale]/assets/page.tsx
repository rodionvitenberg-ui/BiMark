"use client";

import { useState, useMemo } from "react";
import { useTranslations } from "next-intl";
import { useQuery } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, ArrowRight } from "lucide-react";
import { apiClient } from "../../../lib/api/client";
import { Asset } from "../../../types/project";
import { AssetCard } from "../../../components/ui/asset-card"; // Убедись, что путь правильный
import { Link } from "../../../i18n/routing";

type FilterType = "ALL" | "UNIQUE" | "REGULAR";
type SortType = "NEWEST" | "PRICE_ASC" | "PRICE_DESC";

export default function AssetsCatalogPage() {
  const t = useTranslations("AssetsCatalog");

  const [filter, setFilter] = useState<FilterType>("ALL");
  const [sort, setSort] = useState<SortType>("NEWEST");

  // Загружаем все активы с бэкенда
  const { data: assets, isLoading, isError } = useQuery<Asset[]>({
    queryKey: ["assets"],
    queryFn: async () => {
      const response = await apiClient.get("/assets/");
      return response.data.results || response.data;
    },
    staleTime: 60 * 1000,
  });

  // Магия на клиенте: фильтруем и сортируем без лишних запросов к БД
  const displayedAssets = useMemo(() => {
    if (!assets) return [];

    let result = [...assets];

    // 1. Фильтрация
    if (filter === "UNIQUE") {
      result = result.filter((a) => a.is_unique);
    } else if (filter === "REGULAR") {
      result = result.filter((a) => !a.is_unique);
    }

    // 2. Сортировка
    result.sort((a, b) => {
      if (sort === "NEWEST") {
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      }
      if (sort === "PRICE_ASC") {
        return Number(a.price) - Number(b.price);
      }
      if (sort === "PRICE_DESC") {
        return Number(b.price) - Number(a.price);
      }
      return 0;
    });

    return result;
  }, [assets, filter, sort]);

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-black pt-24 pb-20">
      
      {/* 1. HERO БЛОК (Шапка) */}
      <section className="relative w-full overflow-hidden bg-brand-blue/5 dark:bg-brand-blue/10 rounded-3xl max-w-7xl mx-auto px-6 py-16 sm:py-24 mb-12">
        <div className="relative z-10 max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-blue/10 text-brand-blue text-xs font-bold uppercase tracking-wider mb-6">
            <Sparkles className="w-4 h-4" />
            {t("heroBadge", { fallback: "Премиум сегмент" })}
          </div>
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-black text-gray-900 dark:text-white mb-6 tracking-tight leading-tight">
            {t("heroTitle", { fallback: "Эксклюзивные активы и бизнесы" })}
          </h1>
          <p className="text-lg sm:text-xl text-gray-600 dark:text-gray-400">
            {t("heroSubtitle", { fallback: "Инвестируйте в готовые IT-решения, Telegram-каналы и проекты под ключ. Полная передача прав и прозрачные сделки." })}
          </p>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4">
        
        {/* 2. ПАНЕЛЬ УПРАВЛЕНИЯ (Фильтры и Сортировка) */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12 bg-white dark:bg-[#111827] p-4 sm:p-6 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-sm">
          
          {/* Табы фильтров */}
          <div className="flex flex-wrap items-center gap-2 bg-gray-50 dark:bg-gray-800/50 p-1.5 rounded-2xl">
            <FilterPill 
              active={filter === "ALL"} 
              onClick={() => setFilter("ALL")} 
              label={t("filterAll", { fallback: "Все проекты" })} 
            />
            <FilterPill 
              active={filter === "UNIQUE"} 
              onClick={() => setFilter("UNIQUE")} 
              label={t("filterUnique", { fallback: "Эксклюзивы (в 1 руки)" })} 
            />
            <FilterPill 
              active={filter === "REGULAR"} 
              onClick={() => setFilter("REGULAR")} 
              label={t("filterRegular", { fallback: "Готовый бизнес" })} 
            />
          </div>

          {/* Сортировка (Нативный селект для лучшего UX на мобилках) */}
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
              <option value="PRICE_ASC">{t("sortPriceAsc", { fallback: "Сначала дешевые" })}</option>
              <option value="PRICE_DESC">{t("sortPriceDesc", { fallback: "Сначала дорогие" })}</option>
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
            {t("errorLoading", { fallback: "Ошибка загрузки активов" })}
          </div>
        ) : (
          <motion.div layout className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 min-h-[400px] content-start">
            <AnimatePresence mode="popLayout">
              {displayedAssets.length > 0 ? (
                displayedAssets.map((asset) => (
                  <motion.div
                    key={asset.id}
                    layout
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    transition={{ duration: 0.2 }}
                  >
                    <AssetCard asset={asset} />
                  </motion.div>
                ))
              ) : (
                <motion.div 
                  initial={{ opacity: 0 }} 
                  animate={{ opacity: 1 }} 
                  className="col-span-full flex flex-col items-center justify-center py-20 text-center"
                >
                  <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mb-4">
                    <Sparkles className="w-8 h-8 text-gray-400" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                    {t("emptyStateTitle", { fallback: "Ничего не найдено" })}
                  </h3>
                  <p className="text-gray-500 max-w-md mx-auto">
                    {t("emptyStateDesc", { fallback: "В этой категории пока нет доступных проектов, но мы уже готовим новые активы к публикации." })}
                  </p>
                  <button 
                    onClick={() => { setFilter("ALL"); setSort("NEWEST"); }}
                    className="mt-6 text-brand-blue font-bold hover:underline"
                  >
                    {t("resetFilters", { fallback: "Сбросить фильтры" })}
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        )}

        {/* 4. CTA БЛОК В ПОДВАЛЕ */}
        <section className="mt-24 bg-gradient-to-br from-gray-900 to-black rounded-3xl p-8 sm:p-12 text-center border border-gray-800">
          <h2 className="text-2xl sm:text-3xl font-bold text-white mb-4">
            {t("ctaTitle", { fallback: "Хотите продать свой IT-проект или бизнес?" })}
          </h2>
          <p className="text-gray-400 max-w-2xl mx-auto mb-8">
            {t("ctaSubtitle", { fallback: "BiMark обеспечивает безопасную сделку и помогает найти покупателей среди нашей базы инвесторов." })}
          </p>
          <Link 
            href="/contact" 
            className="inline-flex items-center gap-2 bg-white text-black px-8 py-4 rounded-xl font-bold hover:bg-gray-200 transition-colors"
          >
            {t("ctaButton", { fallback: "Связаться с нами" })}
            <ArrowRight className="w-5 h-5" />
          </Link>
        </section>

      </div>
    </div>
  );
}

// Мини-компонент для кнопки-таба
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