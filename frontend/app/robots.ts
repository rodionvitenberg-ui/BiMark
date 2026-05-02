import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      // Закрываем от индексации служебные страницы и личные кабинеты
      disallow: [
        '/*/profile/', 
        '/*/checkout/', 
        '/*/payment/', 
        '/api/'
      ],
    },
    sitemap: 'https://bimark.org/sitemap.xml',
  };
}