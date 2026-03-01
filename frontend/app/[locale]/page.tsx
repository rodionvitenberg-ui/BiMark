import { useTranslations } from "next-intl";
import { Hero } from "../../components/modules/hero";
import { ProjectsGrid } from "../../components/modules/projects-grid";

export default function Home() {
  return (
    <div className="flex flex-col w-full">
      <Hero />
      <ProjectsGrid />
    </div>
  );
}