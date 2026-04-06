"use client";

import { useRef } from "react";
import { useTranslations } from "next-intl";
import { useQuery } from "@tanstack/react-query";
import { Asset } from "../../types/project";
import { AssetCard } from "../ui/asset-card";
import { apiClient } from "../../lib/api/client";
import { Link } from "../../i18n/routing";
import { ArrowRight, CaretLeft, CaretRight } from "@phosphor-icons/react";

export function AssetsGrid() {
  const t = useTranslations("Assets");
  const scrollRef = useRef<HTMLDivElement>(null);

  const { data: assets, isLoading, isError } = useQuery<Asset[]>({
    queryKey: ["assets"],
    queryFn: async () => {
      const response = await apiClient.get("/assets/");
      return response.data.results || response.data; 
    },
  });

  // Функция плавной прокрутки карусели
  const scroll = (direction: "left" | "right") => {
    if (scrollRef.current) {
      const scrollAmount = scrollRef.current.clientWidth; // Прокручиваем на всю ширину видимой области
      scrollRef.current.scrollBy({
        left: direction === "left" ? -scrollAmount : scrollAmount,
        behavior: "smooth",
      });
    }
  };

  return (
    <section className="relative w-full py-24 bg-brand-light border-t border-gray-200 overflow-hidden">
      <div className="container mx-auto px-4 relative z-10">
        
        {/* ШАПКА СЕТКИ И КНОПКИ УПРАВЛЕНИЯ */}
        <div className="mb-12 flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="max-w-2xl">
            <h2 className="text-3xl md:text-4xl font-black text-brand-black mb-4 tracking-tight">
              {t("sectionTitle")}
            </h2>
            <p className="text-lg text-gray-500">
              {t("sectionSubtitle")}
            </p>
          </div>
          
          <div className="flex items-center gap-4">
            {/* Стрелочки (скрыты на мобилках, там юзеры просто свайпают пальцем) */}
            <div className="hidden md:flex items-center gap-2">
              <button 
                onClick={() => scroll("left")}
                className="p-4 rounded-xl border-2 border-gray-200 bg-transparent text-gray-500 hover:border-brand-blue hover:text-brand-blue transition-all"
              >
                <CaretLeft className="w-6 h-6" weight="bold" />
              </button>
              <button 
                onClick={() => scroll("right")}
                className="p-4 rounded-xl border-2 border-gray-200 bg-transparent text-gray-500 hover:border-brand-blue hover:text-brand-blue transition-all"
              >
                <CaretRight className="w-6 h-6" weight="bold" />
              </button>
            </div>

            <Link 
              href="/assets"
              className="w-full md:w-auto px-8 py-4 bg-transparent border-2 border-gray-200 text-brand-black hover:border-brand-blue hover:text-brand-blue rounded-xl font-bold text-lg transition-colors flex items-center justify-center gap-2 group shrink-0"
            >
              {t("viewAll")}
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" weight="bold" />
            </Link>
          </div>
        </div>

        {/* СОСТОЯНИЯ ЗАГРУЗКИ И ОШИБОК */}
        {isLoading && (
          <div className="flex justify-center items-center py-20">
            <div className="w-8 h-8 border-4 border-brand-blue border-t-transparent rounded-full animate-spin"></div>
          </div>
        )}

        {isError && (
          <div className="text-center py-20 text-red-500 font-medium bg-red-50 rounded-xl">
            {t("serverError")}
          </div>
        )}

        {/* ВЫВОД КАРТОЧЕК (КАРУСЕЛЬ) */}
        {!isLoading && !isError && assets && assets.length > 0 && (
          <div className="relative -mx-4 px-4 sm:mx-0 sm:px-0">
            <div 
              ref={scrollRef}
              className="flex gap-8 overflow-x-auto snap-x snap-mandatory hide-scrollbar pb-8"
            >
              {assets.map((asset) => (
                <div 
                  key={asset.id} 
                  // Ширина высчитывается математически, чтобы помещалось ровно 1/2/3/4 карточки с учетом gap-8 (32px)
                  className="w-full sm:w-[calc(50%-16px)] lg:w-[calc(33.333%-21.33px)] xl:w-[calc(25%-24px)] shrink-0 snap-start"
                >
                  <AssetCard asset={asset} />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ПУСТОЕ СОСТОЯНИЕ */}
        {!isLoading && !isError && assets?.length === 0 && (
          <div className="text-center py-20 text-gray-500 font-medium">
            {t("noAssets")}
          </div>
        )}

      </div>

      {/* Стили для скрытия системного скроллбара */}
      <style dangerouslySetInnerHTML={{__html: `
        .hide-scrollbar::-webkit-scrollbar { display: none; }
        .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}} />
    </section>
  );
}