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

  const { data: categories, isLoading, isError } = useQuery<Category[]>({
    queryKey: ["categories_preview"],
    queryFn: async () => {
      const response = await apiClient.get("/categories/");
      return response.data.results || response.data;
    },
  });

  return (
    <section className="relative w-full py-24 bg-[#0a0f1c] text-white overflow-hidden border-b border-gray-800">
      
      <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/3 w-[500px] h-[500px] bg-brand-blue/20 rounded-full blur-[120px] pointer-events-none"></div>
      <div className="absolute bottom-0 left-0 translate-y-1/3 -translate-x-1/4 w-[400px] h-[400px] bg-purple-500/10 rounded-full blur-[120px] pointer-events-none"></div>

      {/* Выравнивание сетки как в token-teaser */}
      <div className="container mx-auto px-4 relative z-10">
        
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
          <div className="max-w-2xl">
            <h2 className="text-3xl md:text-4xl font-black text-white mb-4 tracking-tight">
              {t("title")}
            </h2>
            <p className="text-lg text-gray-400">
              {t("subtitle")}
            </p>
          </div>
          
          <Link 
            href="/category" 
            className="w-full md:w-auto px-8 py-4 bg-brand-blue hover:bg-[#007cbd] text-white rounded-xl font-bold text-lg transition-colors flex items-center justify-center gap-2 shadow-lg shadow-brand-blue/20 group shrink-0"
          >
            {t("viewAll")}
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        {isLoading && (
          <div className="flex justify-center items-center py-10">
            <div className="w-8 h-8 border-4 border-brand-blue border-t-transparent rounded-full animate-spin"></div>
          </div>
        )}

        {isError && (
          <div className="text-center py-10 text-red-400 bg-red-900/20 border border-red-900/50 rounded-xl font-medium">
            Не удалось загрузить категории.
          </div>
        )}

        {!isLoading && !isError && categories && categories.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {categories.slice(0, 3).map((category) => {
              const categoryName = category.name?.[locale] || category.name?.en || category.name?.ru || "Категория";
              
              return (
                <Link key={category.id} href={`/category/${category.slug}`}>
                  <motion.div 
                    whileHover={{ y: -5, scale: 1.02 }}
                    transition={{ duration: 0.2 }}
                    className="group relative h-64 rounded-3xl overflow-hidden border border-white/10 shadow-lg cursor-pointer"
                  >
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

                    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent" />

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