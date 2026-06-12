import { notFound } from "next/navigation";
import { useMessages } from "next-intl";
import ReactMarkdown from "react-markdown";
import { stripTags } from "@/lib/utils";

interface ArticlePageProps {
  params: Promise<{ locale: string; slug: string }>;
}

async function getArticleData(slug: string, locale: string) {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
    const res = await fetch(`${baseUrl}/api/cms/articles/public/?locale=${locale}`, { cache: 'no-store' });
    if (!res.ok) return null;
    const articles = await res.json();
    return articles.find((a: any) => a.slug === slug) || null;
  } catch (e) {
    return null;
  }
}

export default async function ArticleDetailPage({ params }: ArticlePageProps) {
  const { locale, slug } = await params;
  const article = await getArticleData(slug, locale);

  if (!article) {
    notFound();
  }

  // Сборка семантического JSON-LD графа для ИИ (GEO)
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "TechArticle",
    "headline": article.title,
    "description": article.short_description,
    "image": article.preview_image || undefined, // Передаем картинку в ИИ-граф
    "datePublished": article.updated_at,
    "inLanguage": locale,
    "mainEntityOfPage": {
      "@type": "WebPage",
      "@id": `https://bimark.org/${locale}/blog/${article.slug}`
    },
    "publisher": {
      "@type": "Organization",
      "name": "BiMark Platform",
      "url": "https://bimark.org"
    }
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <article className="max-w-4xl mx-auto px-4 py-12 text-white font-sans">
        
        {/* КАРТИНКА-ОБЛОЖКА СТАТЬИ */}
        {article.preview_image && (
          <div className="w-full aspect-[21/9] rounded-3xl overflow-hidden mb-8 border border-gray-800 shadow-2xl">
            <img 
              src={article.preview_image} 
              alt={article.title} 
              className="w-full h-full object-cover"
            />
          </div>
        )}

        <header className="mb-8 border-b border-gray-800 pb-6">
          <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight mb-4 leading-tight">
            {article.title}
          </h1>
          <p className="text-gray-400 text-sm sm:text-base leading-relaxed italic">
            {article.short_description}
          </p>
        </header>

        {/* Тело статьи */}
        <div 
          className="prose prose-invert max-w-none text-gray-200 
            prose-headings:text-white prose-headings:font-bold
            prose-p:text-gray-300 prose-p:leading-relaxed
            prose-strong:text-brand-blue prose-strong:font-extrabold
            prose-ul:list-disc prose-ul:pl-5
            prose-ol:list-decimal prose-ol:pl-5"
          dangerouslySetInnerHTML={{ __html: article.content }}
        />
      </article>
    </>
  );
}