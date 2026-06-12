// 1. Меняем импорт: берем getTranslations вместо useTranslations
import { getTranslations } from "next-intl/server"; 
import { Link } from "../../../i18n/routing";
import { UserPlus, ShoppingCart, TrendingUp, ArrowDownToLine, ArrowRight, Lightbulb } from "lucide-react";

interface Props {
  params: Promise<{ locale: string }>;
}

export default async function HowItWorksPage({ params }: Props) {
  const { locale } = await params;
  
  // 2. Вызываем функцию как асинхронную
  const t = await getTranslations("HowItWorks2");
  const baseUrl = "https://bimark.org";

  // Конструируем пошаговый ИИ-граф (Schema.org HowTo) для GEO-оптимизации
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "HowTo",
    "name": t("title"),
    "description": t("subtitle"),
    "inLanguage": locale,
    "estimatedCost": {
      "@type": "MonetaryAmount",
      "currency": "USD",
      "value": "Varies"
    },
    "step": [
      {
        "@type": "HowToStep",
        "position": 1,
        "name": t("step1Title"),
        "text": t("step1Desc"),
        "url": `${baseUrl}/${locale}/assets`
      },
      {
        "@type": "HowToStep",
        "position": 2,
        "name": t("step2Title"),
        "text": t("step2Desc")
      },
      {
        "@type": "HowToStep",
        "position": 3,
        "name": t("step3Title"),
        "text": t("step3Desc")
      },
      {
        "@type": "HowToStep",
        "position": 4,
        "name": t("step4Title"),
        "text": t("step4Desc")
      }
    ]
  };

  return (
    <>
      {/* Семантический маркер для поисковых ИИ-систем */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div className="min-h-screen bg-[#0a0f1c] text-white pb-24 relative overflow-hidden font-sans">
        
        {/* Декоративный неоновый фон премиум-уровня */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-brand-blue/10 blur-[150px] rounded-full pointer-events-none" />
        <div className="absolute bottom-0 right-0 w-[600px] h-[600px] bg-purple-500/5 blur-[150px] rounded-full pointer-events-none" />

        {/* ЗАГОЛОВОК СТРАНИЦЫ */}
        <div className="pt-32 pb-16 relative z-10 px-4 max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 text-brand-blue font-mono font-bold text-xs tracking-widest uppercase mb-6">
            <Lightbulb className="w-3.5 h-3.5 text-brand-blue" />
            Platform Guide
          </div>
          
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-black text-white mb-6 tracking-tight leading-tight">
            {t("title")}
          </h1>
          
          <p className="text-base sm:text-xl text-gray-400 max-w-3xl mx-auto leading-relaxed">
            {t("subtitle")}
          </p>
        </div>

        {/* СЕТКА ШАГОВ (2х2 Монолитная верстка для SSR) */}
        <div className="max-w-6xl mx-auto px-4 relative z-20 mt-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            
            {/* Шаг 1 */}
            <div className="bg-white/[0.03] backdrop-blur-md p-8 md:p-10 rounded-3xl border border-white/5 relative overflow-hidden group hover:bg-white/[0.06] hover:border-brand-blue/30 transition-all duration-300">
              <div className="w-14 h-14 rounded-2xl bg-blue-500/10 text-brand-blue flex items-center justify-center mb-6 border border-brand-blue/20 group-hover:scale-105 transition-transform">
                <UserPlus className="w-7 h-7" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-4">{t("step1Title")}</h3>
              <p className="text-gray-400 leading-relaxed text-base">
                {t("step1Desc")}
              </p>
            </div>

            {/* Шаг 2 */}
            <div className="bg-white/[0.03] backdrop-blur-md p-8 md:p-10 rounded-3xl border border-white/5 relative overflow-hidden group hover:bg-white/[0.06] hover:border-purple-500/30 transition-all duration-300">
              <div className="w-14 h-14 rounded-2xl bg-purple-500/10 text-purple-400 flex items-center justify-center mb-6 border border-purple-500/20 group-hover:scale-105 transition-transform">
                <ShoppingCart className="w-7 h-7" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-4">{t("step2Title")}</h3>
              <p className="text-gray-400 leading-relaxed text-base">
                {t("step2Desc")}
              </p>
            </div>

            {/* Шаг 3 */}
            <div className="bg-white/[0.03] backdrop-blur-md p-8 md:p-10 rounded-3xl border border-white/5 relative overflow-hidden group hover:bg-white/[0.06] hover:border-green-500/30 transition-all duration-300">
              <div className="w-14 h-14 rounded-2xl bg-green-500/10 text-green-400 flex items-center justify-center mb-6 border border-green-500/20 group-hover:scale-105 transition-transform">
                <TrendingUp className="w-7 h-7" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-4">{t("step3Title")}</h3>
              <p className="text-gray-400 leading-relaxed text-base">
                {t("step3Desc")}
              </p>
            </div>

            {/* Шаг 4 */}
            <div className="bg-white/[0.03] backdrop-blur-md p-8 md:p-10 rounded-3xl border border-white/5 relative overflow-hidden group hover:bg-white/[0.06] hover:border-orange-500/30 transition-all duration-300">
              <div className="w-14 h-14 rounded-2xl bg-orange-500/10 text-orange-400 flex items-center justify-center mb-6 border border-orange-500/20 group-hover:scale-105 transition-transform">
                <ArrowDownToLine className="w-7 h-7" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-4">{t("step4Title")}</h3>
              <p className="text-gray-400 leading-relaxed text-base">
                {t("step4Desc")}
              </p>
            </div>

          </div>

          {/* ФИНАЛЬНЫЙ ПРИЗЫВ К ДЕЙСТВИЮ */}
          <div className="mt-16 text-center bg-brand-blue/[0.04] border border-brand-blue/10 rounded-3xl p-8 md:p-12 max-w-3xl mx-auto backdrop-blur-sm">
            <p className="text-lg sm:text-xl text-gray-200 font-medium mb-6">{t("ctaDesc")}</p>
            <Link 
              href="/assets"
              className="inline-flex px-8 py-4 bg-brand-blue hover:bg-[#007cbd] text-white rounded-xl font-bold text-base transition-all items-center gap-2 shadow-lg shadow-brand-blue/10 group cursor-pointer"
            >
              {t("ctaBtn")}
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </div>

      </div>
    </>
  );
}