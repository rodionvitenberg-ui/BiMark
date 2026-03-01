"use client";

import { useParams } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import { useQuery } from "@tanstack/react-query";
import { AlertCircle, ArrowLeft } from "lucide-react";
import { Link } from "../../../../i18n/routing";
import { apiClient } from "../../../../lib/api/client";
import { Project, Category } from "../../../../types/project";
import { ProjectCard } from "../../../../components/ui/project-card";

export default function CategoryPage() {
  const t = useTranslations("Category");
  const locale = useLocale() as "ru" | "en" | "es";
  const params = useParams();
  const slug = params.slug as string;

  // 1. Получаем данные самой категории (для красивого заголовка)
  const { 
    data: category, 
    isLoading: isCategoryLoading, 
    isError: isCategoryError 
  } = useQuery<Category>({
    queryKey: ["category", slug],
    queryFn: async () => {
      const response = await apiClient.get(`/categories/${slug}/`);
      return response.data;
    },
    enabled: !!slug,
  });

  // 2. Получаем проекты, отфильтрованные по этой категории
  const { 
    data: projects, 
    isLoading: isProjectsLoading 
  } = useQuery<Project[]>({
    queryKey: ["projects", "category", slug],
    queryFn: async () => {
      const response = await apiClient.get(`/projects/?category=${slug}`);
      return response.data.results || response.data;
    },
    enabled: !!slug,
  });

  // Обработка загрузки
  if (isCategoryLoading || isProjectsLoading) {
    return (
      <div className="flex-1 flex justify-center items-center py-32 bg-brand-light">
        <div className="w-10 h-10 border-4 border-brand-blue border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  // Обработка ошибки (если ввели неверный URL категории)
  if (isCategoryError || !category) {
    return (
      <div className="flex-1 container mx-auto px-4 py-32 text-center bg-brand-light">
        <div className="inline-flex flex-col items-center justify-center p-8 bg-red-50 rounded-2xl">
          <AlertCircle className="w-12 h-12 text-red-500 mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">{t("notFound")}</h1>
          <Link href="/" className="text-brand-blue hover:underline">{t("backToHome")}</Link>
        </div>
      </div>
    );
  }

  // Безопасно достаем название категории на текущем языке
  const categoryName = category.name?.[locale] || category.name?.en || category.name?.ru || "Категория";

  return (
    <div className="flex-1 bg-brand-light pb-24">
      {/* Шапка категории */}
      <div className="bg-white border-b border-gray-200 pt-8 pb-12">
        <div className="container mx-auto px-4">
          <Link href="/" className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-brand-blue transition-colors mb-6">
            <ArrowLeft className="w-4 h-4" />
            {t("backToHome")}
          </Link>
          
          <div className="flex items-center gap-6">
            {/* Если у категории есть иконка/картинка, выводим её */}
            {category.image && (
              <div className="w-20 h-20 rounded-2xl overflow-hidden bg-gray-100 flex-shrink-0 border border-gray-200 shadow-sm">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={category.image} alt={categoryName} className="w-full h-full object-cover" />
              </div>
            )}
            
            <div>
              <h1 className="text-4xl md:text-5xl font-extrabold text-brand-black mb-2 tracking-tight">
                {categoryName}
              </h1>
              <p className="text-gray-500 font-medium">
                {t("projectsCount")} <span className="text-brand-black">{projects?.length || 0}</span>
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Сетка проектов */}
      <div className="container mx-auto px-4 mt-12">
        {projects && projects.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {projects.map((project) => (
              <ProjectCard key={project.id} project={project} />
            ))}
          </div>
        ) : (
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