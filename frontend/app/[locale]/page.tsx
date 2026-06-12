import { useTranslations } from "next-intl";
import { Hero } from "../../components/modules/hero";
import { ProjectsGrid } from "../../components/modules/projects-grid";
import { AssetsGrid } from "../../components/modules/asset-grid";
import { HowItWorks } from "../../components/modules/how-it-works";
import { CategoriesPreview } from "../../components/modules/categories-preview";
import { AboutUs } from "../../components/modules/about-us";
import { ContactUs } from "../../components/modules/contact-us";
import TokenTeaser from "../../components/modules/token-teaser";
import NewProjects from "@/components/modules/new-projects";
import HeroSection from '../../components/landing/HeroSection';
import { VisionContent } from '../../components/landing/VisionContent';
import { PresentationCatalog } from '../../components/landing/AssetCatalog'; 

export default function Home() {
  return (
    <div className="flex flex-col w-full">
      <HeroSection />
      <VisionContent />
      <NewProjects />
      <AssetsGrid />
      <TokenTeaser />
      <AboutUs />
      <ContactUs />
    </div>
  );
}