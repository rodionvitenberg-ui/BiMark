import { MetadataRoute } from 'next';
import { apiClient } from '@/lib/api/client'; // Проверь правильность пути импорта
import { Project, Asset } from '@/types/project';

const baseUrl = 'https://bimark.org';
const locales = ['ru', 'en', 'es'];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // 1. Статические маршруты
  const staticRoutes = [
    '',
    '/presentation',
    '/category',
    '/assets',
    '/project',
    '/how-it-works',
    '/vision',
    // Добавь сюда другие важные статические страницы
  ];

  const sitemapData: MetadataRoute.Sitemap = [];

  // Генерация для статических маршрутов с учетом локалей
  staticRoutes.forEach((route) => {
    locales.forEach((locale) => {
      sitemapData.push({
        url: `${baseUrl}/${locale}${route}`,
        lastModified: new Date(),
        changeFrequency: 'weekly',
        priority: route === '' ? 1 : 0.8,
      });
    });
  });

  try {
    // 2. Динамические маршруты: Проекты
    const projectsRes = await apiClient.get('/projects/');
    const projects: Project[] = projectsRes.data.results || projectsRes.data || [];

    projects.forEach((project) => {
      locales.forEach((locale) => {
        sitemapData.push({
          url: `${baseUrl}/${locale}/project/${project.slug}`,
          lastModified: new Date(project.updated_at || project.created_at || new Date()),
          changeFrequency: 'daily',
          priority: 0.9,
        });
      });
    });

    // 3. Динамические маршруты: Активы (Assets)
    const assetsRes = await apiClient.get('/assets/');
    const assets: Asset[] = assetsRes.data.results || assetsRes.data || [];

    assets.forEach((asset) => {
      locales.forEach((locale) => {
        sitemapData.push({
          url: `${baseUrl}/${locale}/assets/${asset.id}`,
          lastModified: new Date(asset.updated_at || asset.created_at || new Date()),
          changeFrequency: 'daily',
          priority: 0.9,
        });
      });
    });
  } catch (error) {
    console.error('Ошибка при генерации sitemap:', error);
    // В случае падения API, статичная часть sitemap все равно отдастся
  }

  return sitemapData;
}