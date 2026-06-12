"use client";

import { useState, useMemo } from "react";
import { useTranslations, useLocale } from "next-intl";
import { useQuery } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, ChevronDown, Layers } from "lucide-react";

import { apiClient } from "../../lib/api/client";
import { Asset, AssetCategory } from "../../types/project";
import { AssetCard } from "../landing/AssetCard";

export function PresentationCatalog() {
  const t = useTranslations("Assets");
  const locale = useLocale() as "ru" | "en" | "es";
  
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null); // Хранит slug категории
  const [visibleCount, setVisibleCount] = useState(8);

  // 1. Загружаем изолированные категории ассетов
  const { data: categories } = useQuery<AssetCategory[]>({
    queryKey: ["asset-categories", "catalog"],
    queryFn: async () => {
      const response = await apiClient.get("/asset-categories/");
      return response.data.results || response.data;
    },
    staleTime: 5 * 60 * 1000,
  });

  // 2. Загружаем ассеты
  const { data: assets, isLoading, isError } = useQuery<Asset[]>({
    queryKey: ["assets", "catalog"],
    queryFn: async () => {
      const response = await apiClient.get("/assets/");
      return response.data.results || response.data;
    },
    staleTime: 60 * 1000,
  });

  // Хелпер безопасного извлечения локализованного названия
  const getLocalizedName = (nameObj: any, defaultStr = ""): string => {
    if (typeof nameObj === 'object' && nameObj !== null) {
      return nameObj[locale] || nameObj.en || nameObj.ru || defaultStr;
    }
    return nameObj || defaultStr;
  };

  // 3. Комбинированная фильтрация по категории и ограничение количества
  const filteredAssets = useMemo(() => {
    if (!assets) return [];
    let result = [...assets];
    
    if (selectedCategory) {
      result = result.filter((a) => a.category?.slug === selectedCategory);
    }
    return result;
  }, [assets, selectedCategory]);

  const displayedItems = useMemo(() => {
    return filteredAssets.slice(0, visibleCount);
  }, [filteredAssets, visibleCount]);

  const handleShowMore = () => {
    setVisibleCount((prev) => prev + 8);
  };

  const handleCategoryChange = (slug: string | null) => {
    setSelectedCategory(slug);
    setVisibleCount(8); // Сбрасываем пагинацию при смене фильтра
  };

  return (
    <section id="assets-catalog" className="w-full py-24 bg-[#0a0f1c] relative min-h-screen border-t border-gray-800 overflow-hidden">
      
      <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-brand-blue/10 blur-[150px] pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-brand-blue/5 blur-[120px] pointer-events-none" />

      <div className="container mx-auto px-4 relative z-10 max-w-[1600px]">
        
        {/* Шапка каталога */}
        <div className="text-center max-w-3xl mx-auto mb-12">
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-4xl md:text-5xl font-extrabold text-white mb-6 tracking-tight"
          >
            {t("sectionTitle", { fallback: "Доступные медиа-активы" })}
          </motion.h2>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-gray-400 text-lg md:text-xl leading-relaxed"
          >
            {t("sectionSubtitle", { fallback: "Инвестируйте в готовые цифровые каналы с проверенной доходностью и автономным управлением" })}
          </motion.p>
        </div>

        {/* ДИНАМИЧЕСКИЙ БЛОК ФИЛЬТРОВ КАТЕГОРИЙ */}
        {categories && categories.length > 0 && (
          <div className="flex flex-wrap justify-center items-center gap-2 mb-16 max-w-5xl mx-auto bg-[#111827]/40 backdrop-blur-md p-2 rounded-2xl border border-white/5 shadow-inner">
            <button
              onClick={() => handleCategoryChange(null)}
              className={`px-5 py-2.5 rounded-xl font-bold text-sm transition-all flex items-center gap-2 border cursor-pointer ${
                selectedCategory === null 
                  ? "bg-brand-blue border-brand-blue text-white shadow-[0_4px_12px_rgba(0,123,255,0.3)]" 
                  : "bg-transparent border-transparent text-gray-400 hover:text-white hover:bg-white/5"
              }`}
            >
              <Layers className="w-4 h-4" />
              {locale === "ru" ? "Все ниши" : locale === "es" ? "Todas" : "All Categories"}
            </button>
            
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => handleCategoryChange(cat.slug)}
                className={`px-5 py-2.5 rounded-xl font-bold text-sm transition-all border cursor-pointer ${
                  selectedCategory === cat.slug 
                    ? "bg-brand-blue border-brand-blue text-white shadow-[0_4px_12px_rgba(0,123,255,0.3)]" 
                    : "bg-transparent border-transparent text-gray-400 hover:text-white hover:bg-white/5"
                }`}
              >
                {getLocalizedName(cat.name)}
              </button>
            ))}
          </div>
        )}

        {/* Состояние загрузки */}
        {isLoading && (
          <div className="flex justify-center items-center py-32">
            <div className="w-12 h-12 border-4 border-brand-blue border-t-transparent rounded-full animate-spin"></div>
          </div>
        )}

        {/* Состояние ошибки */}
        {isError && (
          <div className="text-center py-16 text-red-400 font-mono bg-red-500/5 border border-red-500/10 rounded-2xl max-w-md mx-auto">
            {t("serverError", { fallback: "SYSTEM_ERROR: Ошибка загрузки каталога активов" })}
          </div>
        )}

        {/* Сетка ассетов */}
        {!isLoading && !isError && (
          <motion.div layout className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 min-h-[200px] content-start">
            <AnimatePresence mode="popLayout">
              {displayedItems.length > 0 ? (
                displayedItems.map((asset) => (
                  <motion.div 
                    key={asset.id} 
                    layout 
                    initial={{ opacity: 0, scale: 0.95 }} 
                    animate={{ opacity: 1, scale: 1 }} 
                    exit={{ opacity: 0, scale: 0.95 }} 
                    transition={{ duration: 0.3 }}
                    className="h-full"
                  >
                    <AssetCard asset={asset} />
                  </motion.div>
                ))
              ) : !isLoading && (
                <motion.div 
                  initial={{ opacity: 0 }} 
                  animate={{ opacity: 1 }} 
                  className="col-span-full flex flex-col items-center justify-center py-20 text-center w-full"
                >
                  <div className="w-16 h-16 bg-white/5 border border-white/10 rounded-full flex items-center justify-center mb-6">
                    <Sparkles className="w-8 h-8 text-gray-500" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-400 mb-3">
                    {t("noAssets", { fallback: "В этой категории пока нет проектов" })}
                  </h3>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        )}

        {/* Кнопка SHOW MORE */}
        {!isLoading && !isError && filteredAssets.length > visibleCount && (
          <div className="flex justify-center mt-16">
            <button
              onClick={handleShowMore}
              className="px-8 py-4 bg-transparent border-2 border-gray-700 text-white hover:border-brand-blue hover:text-brand-blue rounded-xl font-bold text-lg transition-all flex items-center gap-2.5 group cursor-pointer shadow-lg"
            >
              {t("showMore", { fallback: "Показать еще" })}
              <ChevronDown className="w-5 h-5 group-hover:translate-y-1 transition-transform duration-200" />
            </button>
          </div>
        )}

      </div>
    </section>
  );
}