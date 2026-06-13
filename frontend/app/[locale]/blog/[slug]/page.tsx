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

  // Сборка семантического JSON-LD графа для ИИ (GEO)[cite: 11]
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "TechArticle",
    "headline": article.title,
    "description": article.short_description,
    "image": article.preview_image || undefined,
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

      {/* ИСПРАВЛЕНО: Текст адаптируется под тему (темный на светлом, светлый на темном) */}
      <article className="max-w-4xl mx-auto px-4 py-12 text-zinc-900 dark:text-zinc-100 font-sans">
        
        {/* КАРТИНКА-ОБЛОЖКА СТАТЬИ */}
        {article.preview_image && (
          <div className="w-full aspect-[21/9] rounded-3xl overflow-hidden mb-8 border border-zinc-200 dark:border-zinc-800 shadow-xl">
            <img 
              src={article.preview_image} 
              alt={article.title} 
              className="w-full h-full object-cover"
            />
          </div>
        )}

        {/* ИСПРАВЛЕНО: Бордеры и цвета текстов переведены на контрастные адаптивные классы */}
        <header className="mb-8 border-b border-zinc-200 dark:border-zinc-800 pb-6">
          <h1 className="text-3xl sm:text-5xl font-black text-zinc-900 dark:text-white tracking-tight mb-4 leading-tight">
            {article.title}
          </h1>
          <p className="text-zinc-500 dark:text-zinc-400 text-sm sm:text-base leading-relaxed italic">
            {article.short_description}
          </p>
        </header>

        {/* ИСПРАВЛЕНО: Типографика переведена с чистого prose-invert на адаптивный prose-zinc */}
        <div 
          className="prose prose-zinc dark:prose-invert max-w-none 
            prose-headings:text-zinc-900 dark:prose-headings:text-white prose-headings:font-bold
            prose-p:text-zinc-700 dark:prose-p:text-zinc-300 prose-p:leading-relaxed
            prose-strong:text-brand-blue prose-strong:font-extrabold
            prose-ul:list-disc prose-ul:pl-5
            prose-ol:list-decimal prose-ol:pl-5"
          dangerouslySetInnerHTML={{ __html: article.content }}
        />
      </article>
    </>
  );
}