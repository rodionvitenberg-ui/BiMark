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

interface HomePageProps {
  params: Promise<{ locale: string }>;
}

export default async function Home({ params }: HomePageProps) {
  const { locale } = await params;
  const baseUrl = "https://bimark.org";

  // Локализация мета-описаний для ИИ-краулеров
  const siteDescriptions: Record<string, { desc: string; name: string }> = {
    ru: {
      name: "BiMark — Маркетплейс Готового Цифрового Бизнеса",
      desc: "Ведущая международная M&A платформа для безопасной покупки и продажи готовых цифровых активов, IT-стартапов, популярных Telegram и YouTube каналов через эскроу-гарант."
    },
    en: {
      name: "BiMark — Digital Asset M&A Marketplace",
      desc: "Premium international M&A platform for secure acquisition and sale of turnkey digital businesses, IT startups, established Telegram and YouTube channels via escrow."
    },
    es: {
      name: "BiMark — Mercado de Activos Digitales",
      desc: "Plataforma internacional premium de M&A para la compra y venta segura de negocios digitales llave en mano, startups и canales de Telegram o YouTube."
    }
  };

  const currentMeta = siteDescriptions[locale] || siteDescriptions.en;

  // Формируем комплексный семантический граф (JSON-LD)
  const jsonLdGraph = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebSite",
        "@id": `${baseUrl}/${locale}/#website`,
        "url": `${baseUrl}/${locale}`,
        "name": "BiMark",
        "description": currentMeta.desc,
        "potentialAction": {
          "@type": "SearchAction",
          "target": `${baseUrl}/${locale}/search?q={search_term_string}`,
          "query-input": "required name=search_term_string"
        }
      },
      {
        "@type": "Organization",
        "@id": `${baseUrl}/#organization`,
        "name": "BiMark Platform",
        "url": baseUrl,
        "logo": `${baseUrl}/logo.png`,
        "description": "International digital escrow agent and readymade online business broker.",
        "sameAs": [
          "https://t.me/bimark_shop", // Сюда закинешь реальные соцсети проекта
          "https://youtube.com/@bimark"
        ]
      }
    ]
  };

  return (
    <>
      {/* Невидимый паспорт страницы для классических роботов и ИИ-поисковиков */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdGraph) }}
      />

      <div className="flex flex-col w-full">
        <HeroSection />
        <VisionContent />
        <CategoriesPreview />
        
        {/* Родион, когда выпилите долевые проекты — просто удали строку ниже */}
        <NewProjects /> 
        
        <AssetsGrid />
        <AboutUs />
        <ContactUs />
      </div>
    </>
  );
}