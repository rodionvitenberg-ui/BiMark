"use client";

import { useTranslations } from "next-intl";
import { useQuery } from "@tanstack/react-query";
import { Layers } from "lucide-react";

import { Project } from "../../../types/project";
import { ProjectCard } from "../../../components/ui/project-card";
import { apiClient } from "../../../lib/api/client";

export default function ProjectsCatalogPage() {
  const t = useTranslations("ProjectsPage");

  // Запрашиваем все проекты с бэкенда
  const { data: projects, isLoading, isError } = useQuery<Project[]>({
    queryKey: ["projects", "all"],
    queryFn: async () => {
      const response = await apiClient.get("/projects/");
      // Поддерживаем как пагинацию DRF (results), так и плоский массив
      return response.data.results || response.data;
    },
  });

  return (
    <div className="min-h-screen bg-brand-light pt-12 pb-24">
      <div className="container mx-auto px-4">
        
        {/* Шапка страницы */}
        <div className="mb-12 max-w-3xl">
          <h1 className="text-4xl md:text-5xl font-extrabold text-brand-black mb-4 tracking-tight">
            {t("title")}
          </h1>
          <p className="text-lg text-gray-500 leading-relaxed">
            {t("subtitle")}
          </p>
        </div>

        {/* Состояние: Загрузка */}
        {isLoading && (
          <div className="flex flex-col items-center justify-center py-32">
            <div className="w-12 h-12 border-4 border-brand-blue border-t-transparent rounded-full animate-spin mb-4"></div>
            <p className="text-gray-500 font-medium">{t("loading")}</p>
          </div>
        )}

        {/* Состояние: Ошибка */}
        {isError && (
          <div className="text-center py-20 text-red-500 font-medium bg-red-50 rounded-2xl border border-red-100">
            {t("error")}
          </div>
        )}

        {/* Состояние: Успех, есть данные */}
        {!isLoading && !isError && projects && projects.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {projects.map((project) => (
              <ProjectCard key={project.id} project={project} />
            ))}
          </div>
        )}

        {/* Состояние: Успех, но база пустая */}
        {!isLoading && !isError && projects?.length === 0 && (
          <div className="flex flex-col items-center justify-center py-32 bg-white rounded-3xl border border-gray-100 shadow-sm">
            <Layers className="w-16 h-16 text-gray-300 mb-4" />
            <p className="text-gray-500 font-medium text-lg">{t("empty")}</p>
          </div>
        )}

      </div>
    </div>
  );
}