"use client";

import { useTranslations } from "next-intl";
import { useQuery } from "@tanstack/react-query";
import { Project } from "../../types/project";
import { ProjectCard } from "../ui/project-card";
import { apiClient } from "../../lib/api/client";

export function ProjectsGrid() {
  const t = useTranslations("Projects");

  // Запрашиваем данные с бэкенда через Axios + React Query
  const { data: projects, isLoading, isError } = useQuery<Project[]>({
    queryKey: ["projects"],
    queryFn: async () => {
      const response = await apiClient.get("/projects/");
      // Если в Django включена пагинация, данные лежат в response.data.results. 
      // Если пагинации нет — в response.data. Проверяем оба варианта.
      return response.data.results || response.data; 
    },
  });

  return (
    <section className="w-full py-24 bg-white border-t border-gray-100">
      <div className="container mx-auto px-4">
        
        <div className="mb-12 flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="max-w-2xl">
            <h2 className="text-3xl md:text-4xl font-extrabold text-brand-black mb-4 tracking-tight">
              {t("sectionTitle")}
            </h2>
            <p className="text-lg text-gray-500">
              {t("sectionSubtitle")}
            </p>
          </div>
          
          <button className="text-brand-blue font-semibold hover:text-[#007cbd] transition-colors flex items-center gap-1">
            Смотреть все проекты
            <span aria-hidden="true">&rarr;</span>
          </button>
        </div>

        {/* Состояние: Загрузка */}
        {isLoading && (
          <div className="flex justify-center items-center py-20">
            <div className="w-8 h-8 border-4 border-brand-blue border-t-transparent rounded-full animate-spin"></div>
          </div>
        )}

        {/* Состояние: Ошибка сети или бэкенд недоступен */}
        {isError && (
          <div className="text-center py-20 text-red-500 font-medium bg-red-50 rounded-xl">
            Ошибка соединения с сервером. Проверьте, запущен ли бэкенд на порту 8000.
          </div>
        )}

        {/* Состояние: Успех, есть данные */}
        {!isLoading && !isError && projects && projects.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {projects.map((project) => (
              <ProjectCard key={project.id} project={project} />
            ))}
          </div>
        )}

        {/* Состояние: Успех, но база пустая */}
        {!isLoading && !isError && projects?.length === 0 && (
          <div className="text-center py-20 text-gray-500 font-medium">
            Проекты пока не добавлены. Зайдите в админку Django и создайте первый актив.
          </div>
        )}

      </div>
    </section>
  );
}