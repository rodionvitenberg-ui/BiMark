"use client";

import { useTranslations, useLocale } from "next-intl";
import { useQuery } from "@tanstack/react-query";
import { apiClient } from "../../lib/api/client";
import { Asset } from "../../types/project";
import { Reel, ReelItem } from "../../components/ui/reel";

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

  if (isLoading || !newAssets || newAssets.length === 0) return null;

  // Преобразуем ассеты в формат ReelItem
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
    <section className="relative py-24 w-full bg-brand-light overflow-hidden">
      <div className="container mx-auto px-4 relative z-10">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
          <div>
            <h2 className="text-3xl md:text-4xl font-black text-brand-black mb-3">
              {t("title")}
            </h2>
            <p className="text-lg text-gray-500 max-w-xl">
              {t("subtitle")}
            </p>
          </div>
        </div>
      </div>

      <div className="w-full mt-8">
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