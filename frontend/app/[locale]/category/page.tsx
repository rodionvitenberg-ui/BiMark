"use client";

import { useLocale, useTranslations } from "next-intl";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { ArrowRight, Layers } from "lucide-react";
import { Link } from "../../../i18n/routing";
import { apiClient } from "../../../lib/api/client";
import { Category } from "../../../types/project";

export default function CategoriesIndexPage() {
  const t = useTranslations("CategoriesIndex");
  const locale = useLocale() as "ru" | "en" | "es";

  // Запрашиваем все категории
  const { data: categories, isLoading, isError } = useQuery<Category[]>({
    queryKey: ["categories"],
    queryFn: async () => {
      const response = await apiClient.get("/categories/");
      return response.data.results || response.data;
    },
  });

  return (
    <div className="flex-1 bg-brand-light pb-24">
      {/* Шапка страницы */}
      <div className="bg-white border-b border-gray-200 pt-16 pb-16">
        <div className="container mx-auto px-4 text-center max-w-3xl">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-brand-blue/10 text-brand-blue mb-6">
            <Layers className="w-8 h-8" />
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold text-brand-black mb-4 tracking-tight">
            {t("title")}
          </h1>
          <p className="text-lg text-gray-500">
            {t("subtitle")}
          </p>
        </div>
      </div>

      {/* Сетка категорий */}
      <div className="container mx-auto px-4 mt-12">
        {isLoading && (
          <div className="flex justify-center items-center py-20">
            <div className="w-10 h-10 border-4 border-brand-blue border-t-transparent rounded-full animate-spin"></div>
          </div>
        )}

        {isError && (
          <div className="text-center py-20 text-red-500 font-medium bg-red-50 rounded-xl">
            Ошибка при загрузке категорий.
          </div>
        )}

        {!isLoading && !isError && categories && categories.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {categories.map((category) => {
              const categoryName = category.name?.[locale] || category.name?.en || category.name?.ru || "Категория";
              
              return (
                <Link key={category.id} href={`/category/${category.slug}`}>
                  <motion.div 
                    whileHover={{ y: -5, scale: 1.02 }}
                    transition={{ duration: 0.2 }}
                    className="group relative h-64 rounded-2xl overflow-hidden shadow-sm hover:shadow-xl cursor-pointer"
                  >
                    {/* Фоновое изображение или градиент */}
                    {category.image ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img 
                        src={category.image} 
                        alt={categoryName} 
                        className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" 
                      />
                    ) : (
                      <div className="absolute inset-0 w-full h-full bg-gradient-to-br from-gray-800 to-brand-black transition-transform duration-700 group-hover:scale-110" />
                    )}

                    {/* Градиентное затемнение для читаемости текста */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />

                    {/* Контент карточки */}
                    <div className="absolute inset-0 p-6 flex flex-col justify-end">
                      <div className="flex items-center justify-between">
                        <h2 className="text-2xl font-bold text-white group-hover:text-brand-blue transition-colors">
                          {categoryName}
                        </h2>
                        <div className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transform translate-x-4 group-hover:translate-x-0 transition-all duration-300">
                          <ArrowRight className="w-5 h-5" />
                        </div>
                      </div>
                    </div>
                  </motion.div>
                </Link>
              );
            })}
          </div>
        )}

        {!isLoading && !isError && categories?.length === 0 && (
          <div className="text-center py-20 bg-white rounded-2xl border border-gray-200 shadow-sm">
            <div className="text-gray-500 font-medium text-lg">
              {t("empty")}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}