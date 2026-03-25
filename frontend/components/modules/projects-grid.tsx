"use client";

import { useTranslations } from "next-intl";
import { useQuery } from "@tanstack/react-query";
import { Project } from "../../types/project";
import { ProjectCard } from "../ui/project-card";
import { apiClient } from "../../lib/api/client";
import { Link } from "../../i18n/routing";
import { ArrowRight } from "@phosphor-icons/react";

export function ProjectsGrid() {
  const t = useTranslations("Projects");

  const { data: projects, isLoading, isError } = useQuery<Project[]>({
    queryKey: ["projects"],
    queryFn: async () => {
      const response = await apiClient.get("/projects/");
      return response.data.results || response.data; 
    },
  });

  return (
    <section className="relative w-full py-24 bg-brand-light border-t border-gray-200">
      
      {/* Выравнивание сетки как в token-teaser */}
      <div className="container mx-auto px-4 relative z-10">
        
        <div className="mb-12 flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="max-w-2xl">
            <h2 className="text-3xl md:text-4xl font-black text-brand-black mb-4 tracking-tight">
              {t("sectionTitle")}
            </h2>
            <p className="text-lg text-gray-500">
              {t("sectionSubtitle")}
            </p>
          </div>
          
          <Link 
            href="/project"
            className="w-full md:w-auto px-8 py-4 bg-transparent border-2 border-gray-200 text-brand-black hover:border-brand-blue hover:text-brand-blue rounded-xl font-bold text-lg transition-colors flex items-center justify-center gap-2 group shrink-0"
          >
            {t("viewAll")}
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" weight="bold" />
          </Link>
        </div>

        {isLoading && (
          <div className="flex justify-center items-center py-20">
            <div className="w-8 h-8 border-4 border-brand-blue border-t-transparent rounded-full animate-spin"></div>
          </div>
        )}

        {isError && (
          <div className="text-center py-20 text-red-500 font-medium bg-red-50 rounded-xl">
            {t("serverError")}
          </div>
        )}

        {!isLoading && !isError && projects && projects.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {projects.map((project) => (
              <ProjectCard key={project.id} project={project} />
            ))}
          </div>
        )}

        {!isLoading && !isError && projects?.length === 0 && (
          <div className="text-center py-20 text-gray-500 font-medium">
            {t("noProjects")}
          </div>
        )}

      </div>
    </section>
  );
}