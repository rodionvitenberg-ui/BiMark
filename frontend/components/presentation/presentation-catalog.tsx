"use client";

import { useState, useMemo } from "react";
import { useTranslations } from "next-intl";
import { useQuery } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { Layers, Briefcase, LayoutGrid, Sparkles } from "lucide-react";

import { apiClient } from "@/lib/api/client";
import { Project, Asset } from "@/types/project";
import { ProjectCard } from "@/components/ui/project-card";
import { AssetCard } from "@/components/ui/asset-card";

type TabType = "ALL" | "PROJECTS" | "ASSETS";

type CatalogItem = 
  | { type: "project"; data: Project }
  | { type: "asset"; data: Asset };

export function PresentationCatalog() {
  const t = useTranslations("PresentationCatalog");
  const [activeTab, setActiveTab] = useState<TabType>("ALL");

  // 1. Параллельно загружаем оба типа товаров
  const { data: projects, isLoading: isProjectsLoading } = useQuery<Project[]>({
    queryKey: ["projects", "presentation"],
    queryFn: async () => {
      const response = await apiClient.get("/projects/");
      return response.data.results || response.data;
    },
    staleTime: 60 * 1000,
  });

  const { data: assets, isLoading: isAssetsLoading } = useQuery<Asset[]>({
    queryKey: ["assets", "presentation"],
    queryFn: async () => {
      const response = await apiClient.get("/assets/");
      return response.data.results || response.data;
    },
    staleTime: 60 * 1000,
  });

  const isLoading = isProjectsLoading || isAssetsLoading;

  // 2. Объединяем и "тасуем" данные
  const allItems = useMemo(() => {
    const items: CatalogItem[] = [];
    const p = projects || [];
    const a = assets || [];
    
    // Красиво чередуем: 1 проект, 1 ассет
    const maxLength = Math.max(p.length, a.length);
    for (let i = 0; i < maxLength; i++) {
      if (i < p.length) items.push({ type: "project", data: p[i] });
      if (i < a.length) items.push({ type: "asset", data: a[i] });
    }
    
    return items;
  }, [projects, assets]);

  // 3. Фильтруем данные на основе активного таба
  const displayedItems = useMemo(() => {
    if (activeTab === "ALL") return allItems;
    if (activeTab === "PROJECTS") return allItems.filter(item => item.type === "project");
    if (activeTab === "ASSETS") return allItems.filter(item => item.type === "asset");
    return [];
  }, [allItems, activeTab]);

  return (
    // Заменили bg-[#0a0f1c] на светлый bg-zinc-50
    <section id="presentation-catalog" className="w-full py-24 bg-zinc-50 relative min-h-screen border-t border-gray-200">
      
      {/* Легкое голубое свечение для связи с брендом */}
      <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-brand-blue/5 blur-[150px] rounded-full pointer-events-none" />

      <div className="container mx-auto px-4 relative z-10 max-w-[1600px]">
        
        {/* Заголовок */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-4xl md:text-5xl font-extrabold text-gray-900 mb-6 tracking-tight"
          >
            {t("title")}
          </motion.h2>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-gray-600 text-lg md:text-xl"
          >
            {t("subtitle")}
          </motion.p>
        </div>

        {/* Табы переключения */}
        <div className="flex flex-wrap justify-center gap-3 mb-12">
          <TabButton 
            active={activeTab === "ALL"} 
            onClick={() => setActiveTab("ALL")} 
            label={t("tab_all")} 
            icon={LayoutGrid} 
          />
          <TabButton 
            active={activeTab === "PROJECTS"} 
            onClick={() => setActiveTab("PROJECTS")} 
            label={t("tab_projects")} 
            icon={Layers} 
          />
          <TabButton 
            active={activeTab === "ASSETS"} 
            onClick={() => setActiveTab("ASSETS")} 
            label={t("tab_assets")} 
            icon={Briefcase} 
          />
        </div>

        {/* Сетка товаров */}
        {isLoading ? (
          <div className="flex justify-center items-center py-32">
            <div className="w-12 h-12 border-4 border-brand-blue border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : (
          <motion.div layout className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 min-h-[400px] content-start pb-20">
            <AnimatePresence mode="popLayout">
              {displayedItems.length > 0 ? (
                displayedItems.map((item) => (
                  <motion.div 
                    key={`${item.type}-${item.data.id}`} 
                    layout 
                    initial={{ opacity: 0, scale: 0.9 }} 
                    animate={{ opacity: 1, scale: 1 }} 
                    exit={{ opacity: 0, scale: 0.9 }} 
                    transition={{ duration: 0.3, type: "spring", stiffness: 100 }}
                  >
                    {item.type === "project" ? (
                      <ProjectCard project={item.data as Project} />
                    ) : (
                      <AssetCard asset={item.data as Asset} />
                    )}
                  </motion.div>
                ))
              ) : (
                <motion.div 
                  initial={{ opacity: 0 }} 
                  animate={{ opacity: 1 }} 
                  className="col-span-full flex flex-col items-center justify-center py-20 text-center"
                >
                  <div className="w-20 h-20 bg-white border border-gray-200 rounded-full flex items-center justify-center mb-6 shadow-sm">
                    <Sparkles className="w-10 h-10 text-gray-400" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-3">{t("empty")}</h3>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        )}

      </div>
    </section>
  );
}

// Мини-компонент для табов в светлой теме
function TabButton({ active, onClick, label, icon: Icon }: { active: boolean, onClick: () => void, label: string, icon: any }) {
  return (
    <button
      onClick={onClick}
      className={`px-6 py-3.5 rounded-2xl font-bold text-sm md:text-base flex items-center gap-2.5 transition-all duration-300 cursor-pointer ${
        active 
          ? "bg-brand-blue text-white shadow-md border-transparent" 
          : "bg-white text-gray-600 hover:bg-gray-50 hover:text-gray-900 border border-gray-200 shadow-sm"
      }`}
    >
      <Icon className="w-5 h-5" />
      {label}
    </button>
  );
}