"use client";

import { useLocale, useTranslations } from "next-intl";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { Link } from "../../i18n/routing";
import { apiClient } from "../../lib/api/client";
import { Category } from "../../types/project";

export function CategoriesPreview() {
  const t = useTranslations("CategoriesPreview");
  const locale = useLocale() as "ru" | "en" | "es";

  // Запрашиваем категории с бэкенда
  const { data: categories, isLoading, isError } = useQuery<Category[]>({
    queryKey: ["categories_preview"],
    queryFn: async () => {
      const response = await apiClient.get("/categories/");
      return response.data.results || response.data;
    },
  });

  return (
    <section className="w-full py-20 bg-white border-t border-gray-100">
      <div className="container mx-auto px-4">
        
        {/* Шапка секции */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
          <div className="max-w-2xl">
            <h2 className="text-3xl md:text-4xl font-extrabold text-brand-black mb-4 tracking-tight">
              {t("title")}
            </h2>
            <p className="text-lg text-gray-500">
              {t("subtitle")}
            </p>
          </div>
          
          <Link href="/category" className="text-brand-blue font-semibold hover:text-[#007cbd] transition-colors flex items-center gap-2 group">
            {t("viewAll")}
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        {/* Состояния загрузки и ошибки */}
        {isLoading && (
          <div className="flex justify-center items-center py-10">
            <div className="w-8 h-8 border-4 border-brand-blue border-t-transparent rounded-full animate-spin"></div>
          </div>
        )}

        {isError && (
          <div className="text-center py-10 text-red-500 bg-red-50 rounded-xl font-medium">
            Не удалось загрузить категории.
          </div>
        )}

        {/* Сетка категорий (показываем только первые 3 для красоты на главной) */}
        {!isLoading && !isError && categories && categories.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {categories.slice(0, 3).map((category) => {
              const categoryName = category.name?.[locale] || category.name?.en || category.name?.ru || "Категория";
              
              return (
                <Link key={category.id} href={`/category/${category.slug}`}>
                  <motion.div 
                    whileHover={{ y: -5, scale: 1.02 }}
                    transition={{ duration: 0.2 }}
                    className="group relative h-64 rounded-2xl overflow-hidden shadow-sm hover:shadow-xl cursor-pointer"
                  >
                    {/* Фон */}
                    {category.image ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img 
                        src={category.image} 
                        alt={categoryName} 
                        className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" 
                      />
                    ) : (
                      <div className="absolute inset-0 w-full h-full bg-gradient-to-br from-brand-blue/80 to-brand-black transition-transform duration-700 group-hover:scale-110" />
                    )}

                    {/* Затемнение */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

                    {/* Контент */}
                    <div className="absolute inset-0 p-6 flex flex-col justify-end">
                      <div className="flex items-center justify-between">
                        <h3 className="text-2xl font-bold text-white group-hover:text-brand-blue transition-colors">
                          {categoryName}
                        </h3>
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
      </div>
    </section>
  );
}