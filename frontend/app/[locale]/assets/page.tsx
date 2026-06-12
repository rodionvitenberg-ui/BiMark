"use client";

import { useState, useMemo } from "react";
import { useTranslations, useLocale } from "next-intl";
import { useQuery } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, LayoutGrid } from "lucide-react";
import { apiClient } from "../../../lib/api/client";
import { Asset, AssetCategory } from "../../../types/project";
import { AssetCard } from "../../../components/landing/AssetCard"; // Убедись, что путь импорта карточки верный
import { ContactUs } from "../../../components/modules/contact-us"; 

type FilterType = "ALL" | "UNIQUE" | "REGULAR";
type SortType = "NEWEST" | "PRICE_ASC" | "PRICE_DESC";

export default function AssetsCatalogPage() {
  const t = useTranslations("AssetsCatalog");
  const locale = useLocale() as "ru" | "en" | "es";

  const [categoryFilter, setCategoryFilter] = useState<string | null>(null); // Фильтр по слагам AssetCategory
  const [typeFilter, setTypeFilter] = useState<FilterType>("ALL");
  const [sort, setSort] = useState<SortType>("NEWEST");

  // 1. Загружаем динамические категории ассетов
  const { data: categories } = useQuery<AssetCategory[]>({
    queryKey: ["asset-categories"],
    queryFn: async () => {
      const response = await apiClient.get("/asset-categories/");
      return response.data.results || response.data;
    },
    staleTime: 5 * 60 * 1000,
  });

  // 2. Загружаем активы
  const { data: assets, isLoading, isError } = useQuery<Asset[]>({
    queryKey: ["assets"],
    queryFn: async () => {
      const response = await apiClient.get("/assets/");
      return response.data.results || response.data;
    },
    staleTime: 60 * 1000,
  });

  // Хелпер локализации
  const getLocalizedName = (nameObj: any, defaultStr = ""): string => {
    if (typeof nameObj === 'object' && nameObj !== null) {
      return nameObj[locale] || nameObj.en || nameObj.ru || defaultStr;
    }
    return nameObj || defaultStr;
  };

  // 3. Сквозная фильтрация и сортировка
  const displayedAssets = useMemo(() => {
    if (!assets) return [];
    let result = [...assets];

    // Фильтр 1: По бизнес-нише (Категории)
    if (categoryFilter) {
      result = result.filter((a) => a.category?.slug === categoryFilter);
    }

    // Фильтр 2: По типу передачи прав (Уникальность лота)
    if (typeFilter === "UNIQUE") result = result.filter((a) => a.is_unique);
    else if (typeFilter === "REGULAR") result = result.filter((a) => !a.is_unique);

    // Сортировка по дате/цене
    result.sort((a, b) => {
      if (sort === "NEWEST") return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      if (sort === "PRICE_ASC") return Number(a.price) - Number(b.price);
      if (sort === "PRICE_DESC") return Number(b.price) - Number(a.price);
      return 0;
    });

    return result;
  }, [assets, categoryFilter, typeFilter, sort]);

  const resetAllFilters = () => {
    setCategoryFilter(null);
    setTypeFilter("ALL");
    setSort("NEWEST");
  };

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-black pt-24 flex flex-col">
      
      {/* 1. HERO БЛОК */}
      <div className="w-full max-w-[1600px] mx-auto px-4 sm:px-8 mb-12">
        <section className="relative w-full overflow-hidden bg-brand-blue/5 dark:bg-brand-blue/10 rounded-3xl px-6 py-16 sm:py-24">
          <div className="relative z-10 max-w-3xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-blue/10 text-brand-blue text-xs font-bold uppercase tracking-wider mb-6">
              <Sparkles className="w-4 h-4" />
              {t("heroBadge", { fallback: "Премиум бизнес-брокер" })}
            </div>
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-black text-gray-900 dark:text-white mb-6 tracking-tight leading-tight">
              {t("heroTitle", { fallback: "Эксклюзивные активы и бизнесы" })}
            </h1>
            <p className="text-lg sm:text-xl text-gray-600 dark:text-gray-400">
              {t("heroSubtitle", { fallback: "Инвестируйте в готовые IT-решения, Telegram-каналы и проекты под ключ. Полная передача прав и прозрачные сделки." })}
            </p>
          </div>
        </section>
      </div>

      {/* Основной контейнер сетки */}
      <div className="w-full max-w-[1600px] mx-auto px-4 sm:px-8 flex-1">
        
        {/* 2. РАСШИРЕННАЯ ПАНЕЛЬ УПРАВЛЕНИЯ ФИЛЬТРАМИ */}
        <div className="flex flex-col gap-6 mb-12 bg-white dark:bg-[#111827] p-6 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-sm">
          
          {/* СТРОКА А: Фильтр по Нишам (Категориям) */}
          {categories && categories.length > 0 && (
            <div className="flex flex-col gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-gray-400 dark:text-gray-500 px-1">
                {locale === 'ru' ? 'Направление бизнеса' : 'Business Sector'}
              </span>
              <div className="flex flex-wrap items-center gap-2 bg-gray-50 dark:bg-gray-800/30 p-1.5 rounded-2xl w-fit">
                <FilterPill 
                  active={categoryFilter === null} 
                  onClick={() => setCategoryFilter(null)} 
                  label={locale === 'ru' ? "⚡ Все ниши" : "⚡ All Sectors"} 
                />
                {categories.map((cat) => (
                  <FilterPill 
                    key={cat.id}
                    active={categoryFilter === cat.slug} 
                    onClick={() => setCategoryFilter(cat.slug)} 
                    label={getLocalizedName(cat.name)} 
                  />
                ))}
              </div>
            </div>
          )}

          {/* СТРОКА Б: Фильтр по Типу Владения + Сортировка */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pt-4 border-t border-gray-100 dark:border-gray-800/60">
            <div className="flex flex-wrap items-center gap-2 bg-gray-50 dark:bg-gray-800/50 p-1.5 rounded-2xl">
              <FilterPill active={typeFilter === "ALL"} onClick={() => setTypeFilter("ALL")} label={t("filterAll", { fallback: "Все лоты" })} />
              <FilterPill active={typeFilter === "UNIQUE"} onClick={() => setTypeFilter("UNIQUE")} label={t("filterUnique", { fallback: "В одни руки (100%)" })} />
              <FilterPill active={typeFilter === "REGULAR"} onClick={() => setTypeFilter("REGULAR")} label={t("filterRegular", { fallback: "Франшизы / Сети" })} />
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
                <option value="PRICE_ASC">{t("sortPriceAsc", { fallback: "Сначала дешевые" })}</option>
                <option value="PRICE_DESC">{t("sortPriceDesc", { fallback: "Сначала дорогие" })}</option>
              </select>
            </div>
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
          <motion.div layout className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 min-h-[400px] content-start pb-20">
            <AnimatePresence mode="popLayout">
              {displayedAssets.length > 0 ? (
                displayedAssets.map((asset) => (
                  <motion.div key={asset.id} layout initial={{ opacity: 0, scale: 0.93 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.93 }} transition={{ duration: 0.25 }}>
                    <AssetCard asset={asset} />
                  </motion.div>
                ))
              ) : (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="col-span-full flex flex-col items-center justify-center py-20 text-center">
                  <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mb-4">
                    <LayoutGrid className="w-8 h-8 text-gray-400" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">{t("emptyStateTitle", { fallback: "Ничего не найдено" })}</h3>
                  <p className="text-gray-500 max-w-md mx-auto">{t("emptyStateDesc", { fallback: "В выбранной нише или по заданным критериям пока нет активных предложений." })}</p>
                  <button onClick={resetAllFilters} className="mt-6 text-brand-blue font-bold hover:underline cursor-pointer border-none bg-transparent">
                    {t("resetFilters", { fallback: "Сбросить все фильтры" })}
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        )}
      </div>

      {/* 4. БЛОК ОБРАТНОЙ СВЯЗИ */}
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
      className={`px-4 py-2 rounded-xl font-bold text-xs sm:text-sm transition-all duration-200 cursor-pointer border-none ${
        active 
          ? "bg-white dark:bg-gray-700 text-brand-blue dark:text-white shadow-sm" 
          : "bg-transparent text-gray-500 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100/70 dark:hover:bg-gray-800/50"
      }`}
    >
      {label}
    </button>
  );
}