"use client";

import { useTranslations } from "next-intl";
import { Project } from "../../types/project";
import { ProjectCard } from "../ui/project-card";

// Временные Mock-данные до подключения DRF
const MOCK_PROJECTS: Project[] = [
  {
    id: "1",
    title: "Bimark Shop - E-commerce IT",
    description: "Действующий IT-продукт с ежемесячной выручкой. Покупка доли дает право на % от чистой прибыли платформы.",
    category: "IT Startup",
    status: "LIVE",
    raised: 45000,
    target: 100000,
    pricePerShare: 50,
  },
  {
    id: "2",
    title: "Crypto Trading YouTube Channel",
    description: "Крупный канал с аудиторией 500k+. Монетизация за счет спонсорских интеграций и партнерских ссылок.",
    category: "Media",
    status: "LIVE",
    raised: 120000,
    target: 150000,
    pricePerShare: 100,
  },
  {
    id: "3",
    title: "AI Image Generator App",
    description: "Мобильное приложение на стадии бета-тестирования. Инвестиции привлекаются на маркетинг.",
    category: "Mobile App",
    status: "PRESALE",
    raised: 5000,
    target: 50000,
    pricePerShare: 25,
  }
];

export function ProjectsGrid() {
  const t = useTranslations("Projects");

  return (
    // Делаем фон белым, чтобы визуально отделить от Hero секции
    <section className="w-full py-24 bg-white border-t border-gray-100">
      <div className="container mx-auto px-4">
        
        {/* Заголовок секции */}
        <div className="mb-12 flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="max-w-2xl">
            <h2 className="text-3xl md:text-4xl font-extrabold text-brand-black mb-4 tracking-tight">
              {t("sectionTitle")}
            </h2>
            <p className="text-lg text-gray-500">
              {t("sectionSubtitle")}
            </p>
          </div>
          
          {/* Кнопка "Смотреть все" или фильтры (задел на будущее) */}
          <button className="text-brand-blue font-semibold hover:text-[#007cbd] transition-colors flex items-center gap-1">
            Смотреть все проекты
            <span aria-hidden="true">&rarr;</span>
          </button>
        </div>

        {/* Сетка CSS Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {MOCK_PROJECTS.map((project) => (
            <ProjectCard key={project.id} project={project} />
          ))}
        </div>

      </div>
    </section>
  );
}