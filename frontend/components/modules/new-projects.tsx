"use client";

import { useTranslations, useLocale } from "next-intl";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Flame, ArrowRight } from "lucide-react";
import { Link } from "../../i18n/routing";
import { apiClient } from "../../lib/api/client";
import { Project } from "../../types/project";

export default function NewProjects() {
  const t = useTranslations("NewProjects");
  const locale = useLocale() as "ru" | "en" | "es";

  // Запрашиваем только проекты с флагом is_new=true
  const { data: newProjects, isLoading } = useQuery<Project[]>({
    queryKey: ["projects", "new"],
    queryFn: async () => {
      const response = await apiClient.get("/projects/?is_new=true");
      // Учитываем пагинацию DRF (если она включена, данные лежат в results)
      return response.data.results || response.data;
    },
    staleTime: 60 * 1000,
  });

  // Если грузимся - ничего не показываем (чтобы не было моргания скелетонов, если новинок нет)
  if (isLoading) return null;

  // Если новинок нет - компонент НЕ рендерится вообще
  if (!newProjects || newProjects.length === 0) {
    return null;
  }

  return (
    <section className="py-16 px-4 bg-white dark:bg-[#0a0f1c]">
      <div className="max-w-7xl mx-auto">
        
        {/* Заголовок секции */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-50 dark:bg-red-900/20 text-red-600 font-bold text-sm uppercase tracking-wider mb-4">
              <Flame className="w-4 h-4" />
              Trending
            </div>
            <h2 className="text-3xl md:text-4xl font-black text-gray-900 dark:text-white mb-3">
              {t("title")}
            </h2>
            <p className="text-gray-500 dark:text-gray-400 max-w-xl">
              {t("subtitle")}
            </p>
          </div>
        </div>

        {/* Сетка проектов */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {newProjects.map((project, index) => {
            // Безопасное извлечение локализованных данных
            const title = typeof project.title === 'string' ? project.title : (project.title[locale] || project.title["en"]);
            const categoryName = project.category?.name 
              ? (typeof project.category.name === 'string' ? project.category.name : project.category.name[locale])
              : "Категория";

            return (
              <motion.div
                key={project.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="group flex flex-col bg-zinc-50 dark:bg-[#111827] rounded-3xl overflow-hidden border border-gray-100 dark:border-gray-800 hover:border-brand-blue/30 transition-all hover:shadow-xl hover:shadow-brand-blue/5"
              >
                {/* Изображение */}
                <Link href={`/project/${project.slug}`} className="block relative aspect-video overflow-hidden bg-gray-200 dark:bg-zinc-800">
                  {project.image ? (
                    <img 
                      src={project.image} 
                      alt={title} 
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400">Нет фото</div>
                  )}
                  {/* Плашка NEW поверх картинки */}
                  <div className="absolute top-4 left-4 px-3 py-1 bg-white dark:bg-black/50 backdrop-blur-md rounded-full text-xs font-black uppercase tracking-wider text-gray-900 dark:text-white shadow-sm">
                    NEW
                  </div>
                </Link>

                {/* Контент карточки */}
                <div className="p-6 flex-1 flex flex-col">
                  <div className="text-xs font-bold text-brand-blue uppercase tracking-wider mb-2">
                    {categoryName}
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4 line-clamp-2">
                    {title}
                  </h3>

                  <div className="mt-auto space-y-4">
                    <div className="flex justify-between items-center text-sm border-t border-gray-200 dark:border-gray-800 pt-4">
                      <span className="text-gray-500 dark:text-gray-400">{t("pricePerShare")}</span>
                      <span className="font-black text-gray-900 dark:text-white text-lg">${project.price_per_share}</span>
                    </div>
                    <div className="flex justify-between items-center text-sm border-t border-gray-200 dark:border-gray-800 pt-4">
                      <span className="text-gray-500 dark:text-gray-400">{t("available")}</span>
                      <span className="font-bold text-gray-900 dark:text-white">{project.available_shares} {t("pcs")}</span>
                    </div>

                    <Link 
                      href={`/project/${project.slug}`}
                      className="w-full py-3 mt-2 rounded-xl bg-gray-200 dark:bg-gray-800 text-gray-900 dark:text-white font-bold hover:bg-brand-blue hover:text-white dark:hover:bg-brand-blue transition-colors flex items-center justify-center gap-2 group/btn"
                    >
                      {t("viewDetails")}
                      <ArrowRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
                    </Link>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
        
      </div>
    </section>
  );
}