import { MetadataRoute } from 'next';
import { apiClient } from '@/lib/api/client';
import { Asset } from '@/types/project';

interface ArticleItem {
  slug: string;
  updated_at: string;
  created_at: string;
}

const baseUrl = 'https://bimark.org';
const locales = ['ru', 'en', 'es'];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // 1. Статические маршруты платформы
  const staticRoutes = [
    '',
    '/presentation',
    '/category',
    '/assets',
    '/how-it-works',
    '/vision',
    '/blog', // Добавили главный хаб статей
  ];

  const sitemapData: MetadataRoute.Sitemap = [];

  // Генерация статических страниц для каждой локали
  staticRoutes.forEach((route) => {
    locales.forEach((locale) => {
      sitemapData.push({
        url: `${baseUrl}/${locale}${route}`,
        lastModified: new Date(),
        changeFrequency: 'weekly',
        priority: route === '' ? 1.0 : 0.8,
        alternates: {
          languages: {
            'ru': `${baseUrl}/ru${route}`,
            'en': `${baseUrl}/en${route}`,
            'es': `${baseUrl}/es${route}`,
          }
        }
      });
    });
  });

  try {

    // 2. Динамические маршруты: Уникальные Активы (Assets)
    const assetsRes = await apiClient.get('/assets/');
    const assets: Asset[] = assetsRes.data.results || assetsRes.data || [];

    assets.forEach((asset) => {
      locales.forEach((locale) => {
        sitemapData.push({
          url: `${baseUrl}/${locale}/assets/${asset.id}`,
          lastModified: new Date(asset.updated_at || asset.created_at || new Date()),
          changeFrequency: 'daily',
          priority: 0.9,
          alternates: {
            languages: {
              'ru': `${baseUrl}/ru/assets/${asset.id}`,
              'en': `${baseUrl}/en/assets/${asset.id}`,
              'es': `${baseUrl}/es/assets/${asset.id}`,
            }
          }
        });
      });
    });

    // 3. Динамические маршруты: Статьи Блога (Для GEO / Смысловых хабов)
    const articlesRes = await apiClient.get('/cms/articles/public/');
    const articles: ArticleItem[] = articlesRes.data.results || articlesRes.data || [];

    articles.forEach((article) => {
      locales.forEach((locale) => {
        sitemapData.push({
          url: `${baseUrl}/${locale}/blog/${article.slug}`,
          lastModified: new Date(article.updated_at || article.created_at || new Date()),
          changeFrequency: 'weekly',
          priority: 0.7,
          alternates: {
            languages: {
              'ru': `${baseUrl}/ru/blog/${article.slug}`,
              'en': `${baseUrl}/en/blog/${article.slug}`,
              'es': `${baseUrl}/es/blog/${article.slug}`,
            }
          }
        });
      });
    });

  } catch (error) {
    console.error('❌ Ошибка генерации динамического Sitemap:', error);
  }

  return sitemapData;
}