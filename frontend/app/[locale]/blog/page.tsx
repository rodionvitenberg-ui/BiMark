import { Link } from "@/i18n/routing";
import { motion } from "framer-motion";
import { BookOpen, Calendar, ArrowRight } from "lucide-react";

interface Article {
  id: string;
  title: string;
  slug: string;
  short_description: string;
  preview_image: string | null;
  updated_at: string;
}

interface BlogPageProps {
  params: Promise<{ locale: string }>;
}

async function getArticles(locale: string): Promise<Article[]> {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
    const res = await fetch(`${baseUrl}/api/cms/articles/public/?locale=${locale}`, { 
      cache: 'no-store' 
    });
    if (!res.ok) return [];
    return await res.json();
  } catch (e) {
    console.error("Failed to fetch articles:", e);
    return [];
  }
}

export default async function BlogPage({ params }: BlogPageProps) {
  const { locale } = await params;
  const articles = await getArticles(locale);

  // Локализация статики шапки без привлечения тяжелых json-файлов
  const t = {
    ru: { title: "База знаний & Аналитика", subtitle: "Экспертные материалы по покупке, оценке и безопасной передаче цифровых активов" },
    en: { title: "Knowledge Base & Insights", subtitle: "Expert guides on buying, evaluating, and securing turnkey digital businesses" },
    es: { title: "Base de conocimientos", subtitle: "Guías de expertos sobre la compra, evaluación и seguridad de activos digitales" }
  }[locale] || { title: "Knowledge Base", subtitle: "Expert guides on digital businesses" };

  return (
    <div className="min-h-screen bg-[#0a0f1d] text-white py-16 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-7xl mx-auto">
        
        {/* ХЕДЕР СТРАНИЦЫ */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-brand-blue/10 border border-brand-blue/30 text-brand-blue text-xs font-mono uppercase tracking-wider mb-4">
            <BookOpen className="w-3.5 h-3.5" /> BiMark Insights
          </div>
          <h1 className="text-4xl sm:text-5xl font-black tracking-tight mb-4 bg-gradient-to-r from-white via-gray-200 to-gray-500 bg-clip-text text-transparent">
            {t.title}
          </h1>
          <p className="text-gray-400 text-sm sm:text-base leading-relaxed">
            {t.subtitle}
          </p>
        </div>

        {/* СЕТКА СТАТЕЙ */}
        {articles.length === 0 ? (
          <div className="text-center py-20 border border-dashed border-gray-800 rounded-3xl">
            <p className="text-gray-500 text-sm">
              {locale === 'ru' ? 'Статьи ещё не добавлены в админку.' : 'No insights published yet.'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {articles.map((article) => (
              <div 
                key={article.id}
                className="group bg-[#0f172a]/60 backdrop-blur-md border border-gray-800/80 rounded-3xl overflow-hidden flex flex-col hover:border-brand-blue/40 transition-all duration-300 shadow-xl"
              >
                {/* ПРЕВЬЮ ИЗОБРАЖЕНИЯ */}
                <div className="aspect-[16/9] w-full bg-[#1e293b] relative overflow-hidden border-b border-gray-900">
                  {article.preview_image ? (
                    <img 
                      src={article.preview_image} 
                      alt={article.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-700 bg-gradient-to-br from-[#0f172a] to-[#1e293b]">
                      <BookOpen className="w-12 h-12 opacity-20" />
                    </div>
                  )}
                </div>

                {/* КОНТЕНТ КАРТОЧКИ */}
                <div className="p-6 flex-1 flex flex-col justify-between">
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 text-xs text-gray-500 font-mono">
                      <Calendar className="w-3.5 h-3.5" />
                      {new Date(article.updated_at).toLocaleDateString(locale, { day: 'numeric', month: 'short', year: 'numeric' })}
                    </div>
                    <h3 className="text-xl font-bold text-white group-hover:text-brand-blue transition-colors line-clamp-2">
                      {article.title}
                    </h3>
                    <p className="text-gray-400 text-sm line-clamp-3 leading-relaxed">
                      {article.short_description}
                    </p>
                  </div>

                  <div className="pt-6 border-t border-gray-800/50 mt-6 flex justify-end">
                    <Link 
                      href={`/blog/${article.slug}`}
                      className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-brand-blue hover:text-white transition-colors"
                    >
                      {locale === 'ru' ? 'Читать далее' : 'Read Article'} <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}