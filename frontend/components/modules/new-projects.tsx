"use client";

import { useTranslations, useLocale } from "next-intl";
import { useQuery } from "@tanstack/react-query";
import { Flame } from "lucide-react";
import { apiClient } from "../../lib/api/client";
import { Project, Asset } from "../../types/project";
import { Reel, ReelItem } from "../../components/ui/reel"; // Убедись, что путь к компоненту верный

export default function NewProjects() {
  const t = useTranslations("NewProjects");
  const locale = useLocale() as "ru" | "en" | "es";

  // 1. Запрашиваем новые ДОЛЕВЫЕ проекты
  const { data: newProjects, isLoading: isProjectsLoading } = useQuery<Project[]>({
    queryKey: ["projects", "new"],
    queryFn: async () => {
      const response = await apiClient.get("/projects/?is_new=true");
      return response.data.results || response.data;
    },
    staleTime: 60 * 1000,
  });

  // 2. Запрашиваем новые ЦЕЛЫЕ АКТИВЫ (не забудь добавить фильтр на бэкенд!)
  const { data: newAssets, isLoading: isAssetsLoading } = useQuery<Asset[]>({
    queryKey: ["assets", "new"],
    queryFn: async () => {
      const response = await apiClient.get("/assets/?is_new=true");
      return response.data.results || response.data;
    },
    staleTime: 60 * 1000,
  });

  const isLoading = isProjectsLoading || isAssetsLoading;

  if (isLoading) return null;

  const combinedItems = [...(newProjects || []), ...(newAssets || [])];

  if (combinedItems.length === 0) {
    return null;
  }

  // Превращаем проекты и активы в единый формат для Reel
  const reelItems: ReelItem[] = combinedItems.map((item) => {
    // Извлекаем локализованную картинку
    const currentImage = typeof item.image === 'object' && item.image !== null
      ? (item.image[locale] || item.image.en)
      : item.image;
    
    // Извлекаем локализованный заголовок
    const currentTitle = typeof item.title === 'object' && item.title !== null
      ? (item.title[locale] || item.title.en)
      : item.title;

    // Определяем ссылку (актив по UUID, проект по slug)
    const isAsset = 'is_unique' in item; // Простой способ отличить Asset от Project
    const href = isAsset ? `/assets/${item.id}` : `/project/${(item as Project).slug}`;

    return {
      id: item.id.toString(),
      type: 'image',
      src: currentImage || "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=2564&auto=format&fit=crop",
      href: href,
      title: currentTitle || "Без названия",
    };
  });

  return (
    <section className="relative py-24 w-full bg-brand-light overflow-hidden">
      
      <div className="container mx-auto px-4 relative z-10">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-50 text-red-600 font-bold text-sm uppercase tracking-wider mb-4 border border-red-100">
              <Flame className="w-4 h-4" />
              {t("badge", { fallback: "Новинки" })}
            </div>
            <h2 className="text-3xl md:text-4xl font-black text-brand-black mb-3">
              {t("title")}
            </h2>
            <p className="text-lg text-gray-500 max-w-xl">
              {t("subtitle")}
            </p>
          </div>
        </div>
      </div>

      {/* Лента Reel на всю ширину экрана */}
      <div className="w-full mt-8">
        <Reel 
          items={reelItems} 
          rows={1}        // <-- ОДНА СТРОКА
          pauseOnHover={true} 
          duration={120}  // <-- УВЕЛИЧИЛИ В 3 РАЗА (замедлили)
        />
      </div>
      
    </section>
  );
}