"use client";

import { useTranslations } from "next-intl";
import { useQuery } from "@tanstack/react-query";
import { Flame } from "lucide-react";
import { apiClient } from "../../lib/api/client";
import { Project } from "../../types/project";
import { ProjectCard } from "../ui/project-card";

export default function NewProjects() {
  const t = useTranslations("NewProjects");

  const { data: newProjects, isLoading } = useQuery<Project[]>({
    queryKey: ["projects", "new"],
    queryFn: async () => {
      const response = await apiClient.get("/projects/?is_new=true");
      return response.data.results || response.data;
    },
    staleTime: 60 * 1000,
  });

  if (isLoading) return null;

  if (!newProjects || newProjects.length === 0) {
    return null;
  }

  return (
    <section className="relative py-24 w-full bg-brand-light">
      
      {/* Выравнивание сетки как в token-teaser */}
      <div className="container mx-auto px-4 relative z-10">
        
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-50 text-red-600 font-bold text-sm uppercase tracking-wider mb-4 border border-red-100">
              <Flame className="w-4 h-4" />
              Trending
            </div>
            <h2 className="text-3xl md:text-4xl font-black text-brand-black mb-3">
              {t("title")}
            </h2>
            <p className="text-lg text-gray-500 max-w-xl">
              {t("subtitle")}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
          {newProjects.map((project) => (
             <ProjectCard key={project.id} project={project} />
          ))}
        </div>
        
      </div>
    </section>
  );
}