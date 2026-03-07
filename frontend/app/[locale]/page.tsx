import { useTranslations } from "next-intl";
import { Hero } from "../../components/modules/hero";
import { ProjectsGrid } from "../../components/modules/projects-grid";
import { HowItWorks } from "../../components/modules/how-it-works";
import { CategoriesPreview } from "../../components/modules/categories-preview";
import { AboutUs } from "../../components/modules/about-us";
import { ContactUs } from "../../components/modules/contact-us";

export default function Home() {
  return (
    <div className="flex flex-col w-full">
      <Hero />
      <HowItWorks />
      <CategoriesPreview />
      <ProjectsGrid />
      <AboutUs />
      <ContactUs />
    </div>
  );
}