"use client";

import { useTranslations, useLocale } from "next-intl";
import { useQuery } from "@tanstack/react-query";
import { apiClient } from "../../lib/api/client";
import { Asset } from "../../types/project";
import { Reel, ReelItem } from "../../components/ui/reel";
import { Link } from "../../i18n/routing";
import { ArrowRight, Flame } from "lucide-react";

export default function NewProjects() {
  const t = useTranslations("NewProjects");
  const locale = useLocale() as "ru" | "en" | "es";

  // Загружаем только новые ассеты
  const { data: newAssets, isLoading } = useQuery<Asset[]>({
    queryKey: ["assets", "new"],
    queryFn: async () => {
      const response = await apiClient.get("/assets/?is_new=true");
      return response.data.results || response.data;
    },
    staleTime: 60 * 1000,
  });

  if (isLoading || !newAssets || newAssets.length === 0) return null; //

  // Преобразуем ассеты в формат ReelItem для десктопной версии[cite: 12]
  const reelItems: ReelItem[] = newAssets.map((item) => {
    const currentImage =
      typeof item.image === "object" && item.image !== null
        ? item.image[locale] || item.image.en
        : item.image;

    const currentTitle =
      typeof item.title === "object" && item.title !== null
        ? item.title[locale] || item.title.en
        : item.title;

    return {
      id: item.id.toString(),
      type: "image",
      src:
        currentImage ||
        "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=2564&auto=format&fit=crop",
      href: `/assets/${item.id}`,
      title: currentTitle || "Без названия",
    };
  });

  return (
    <section className="relative py-16 md:py-24 w-full bg-[#f5f7fb] overflow-hidden">
      <div className="container mx-auto px-4 relative z-10">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8 md:mb-12">
          <div>
            <h2 className="text-3xl md:text-4xl font-black text-brand-black mb-3">
              {t("title")}
            </h2>
            <p className="text-base md:text-lg text-gray-500 max-w-xl">
              {t("subtitle")}
            </p>
          </div>
        </div>
      </div>

      {/* ================= МОБИЛЬНАЯ ВЕРСИЯ: CSS SCROLL SNAP КАРУСЕЛЬ ================= */}
      <div 
        className="block md:hidden w-full overflow-x-auto snap-x snap-mandatory flex gap-5 px-4 pb-6 scrollbar-none"
        style={{ scrollbarWidth: 'none', WebkitOverflowScrolling: 'touch' }}
      >
        {newAssets.map((item) => {
          // Безопасно извлекаем локализованные данные[cite: 12]
          const img = typeof item.image === "object" && item.image !== null 
            ? item.image[locale] || item.image.en 
            : item.image;
            
          const title = typeof item.title === "object" && item.title !== null 
            ? item.title[locale] || item.title.en 
            : item.title;

          return (
            <Link
              key={item.id}
              href={`/assets/${item.id}`}
              className="snap-center shrink-0 w-[82vw] sm:w-[50vw] bg-white rounded-3xl overflow-hidden border border-gray-100 shadow-sm flex flex-col group active:scale-[0.99] transition-transform"
            >
              {/* Изображение лота */}
              <div className="aspect-[16/10] w-full bg-gray-100 relative overflow-hidden">
                <img
                  src={img || "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=2564&auto=format&fit=crop"}
                  alt={title}
                  className="w-full h-full object-cover"
                  loading="lazy"
                />
              </div>

              {/* Информационный блок */}
              <div className="p-5 flex-1 flex flex-col justify-between gap-4">
                <h3 className="font-bold text-brand-black text-lg line-clamp-2 leading-snug">
                  {title}
                </h3>
                <div className="flex items-center justify-between pt-3 border-t border-gray-50">
                  <span className="text-brand-blue font-black text-lg">
                    ${Number(item.price).toLocaleString()}
                  </span>
                  <span className="text-xs font-bold text-gray-400 uppercase tracking-wider inline-flex items-center gap-1">
                    {locale === 'ru' ? 'Смотреть' : 'View'} <ArrowRight className="w-3.5 h-3.5" />
                  </span>
                </div>
              </div>
            </Link>
          );
        })}
      </div>

      {/* ================= ДЕСКТОПНАЯ ВЕРСИЯ: INFINITE REEL MARQUEE ================= */}
      <div className="hidden md:block w-full mt-8">
        <Reel
          items={reelItems}
          rows={1}
          pauseOnHover={true}
          duration={120}
        />
      </div>
    </section>
  );
}