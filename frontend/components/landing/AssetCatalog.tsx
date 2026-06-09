"use client";

import { useState, useMemo } from "react";
import { useTranslations } from "next-intl";
import { useQuery } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, ChevronDown } from "lucide-react";

import { apiClient } from "../../lib/api/client";
import { Asset } from "../../types/project";
import { AssetCard } from "../landing/AssetCard";

export function PresentationCatalog() {
  const t = useTranslations("Assets");
  const [visibleCount, setVisibleCount] = useState(8);

  // Загружаем только ассеты
  const { data: assets, isLoading, isError } = useQuery<Asset[]>({
    queryKey: ["assets", "catalog"],
    queryFn: async () => {
      const response = await apiClient.get("/assets/");
      return response.data.results || response.data;
    },
    staleTime: 60 * 1000,
  });

  // Ограничиваем количество выводимых карточек (стейт visibleCount)
  const displayedItems = useMemo(() => {
    if (!assets) return [];
    return assets.slice(0, visibleCount);
  }, [assets, visibleCount]);

  const handleShowMore = () => {
    setVisibleCount((prev) => prev + 8);
  };

  return (
    // Фирменный темно-синий фон #0a0f1c для бесшовного слияния с Hero и VisionContent
    <section id="assets-catalog" className="w-full py-24 bg-[#0a0f1c] relative min-h-screen border-t border-gray-800 overflow-hidden">
      
      {/* Глубокое синее свечение для премиальной атмосферы */}
      <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-brand-blue/10 blur-[150px] rounded-full pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-brand-blue/5 blur-[120px] rounded-full pointer-events-none" />

      <div className="container mx-auto px-4 relative z-10 max-w-[1600px]">
        
        {/* Шапка каталога */}
        <div className="text-center max-w-3xl mx-auto mb-20">
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
                    transition={{ duration: 0.4, type: "spring", stiffness: 110 }}
                    className="h-full"
                  >
                    <AssetCard asset={asset} />
                  </motion.div>
                ))
              ) : !isLoading && (
                <motion.div 
                  initial={{ opacity: 0 }} 
                  animate={{ opacity: 1 }} 
                  className="col-span-full flex flex-col items-center justify-center py-20 text-center"
                >
                  <div className="w-16 h-16 bg-white/5 border border-white/10 rounded-full flex items-center justify-center mb-6 shadow-sm">
                    <Sparkles className="w-8 h-8 text-gray-500" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-400 mb-3">
                    {t("noAssets", { fallback: "Каталог пуст" })}
                  </h3>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        )}

        {/* Кнопка SHOW MORE */}
        {!isLoading && !isError && assets && assets.length > visibleCount && (
          <div className="flex justify-center mt-16">
            <button
              onClick={handleShowMore}
              className="px-8 py-4 bg-transparent border-2 border-gray-700 text-white hover:border-brand-blue hover:text-brand-blue rounded-xl font-bold text-lg transition-all flex items-center gap-2.5 group cursor-pointer shadow-lg hover:shadow-brand-blue/5"
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