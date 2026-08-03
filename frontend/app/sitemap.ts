import { MetadataRoute } from "next";
import { apiClient } from "@/lib/api/client";
import { Asset } from "@/types/project";

interface ArticleItem {
  slug: string;
  updated_at: string;
  created_at: string;
}

const baseUrl = (
  process.env.NEXT_PUBLIC_SITE_URL || "https://bimark.org"
).replace(/\/$/, "");
const locales = ["ru", "en", "es"];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticRoutes = [
    "",
    "/presentation",
    "/category",
    "/assets",
    "/how-it-works",
    "/vision",
    "/blog",
  ];

  const sitemapData: MetadataRoute.Sitemap = [];

  staticRoutes.forEach((route) => {
    locales.forEach((locale) => {
      sitemapData.push({
        url: `${baseUrl}/${locale}${route}`,
        lastModified: new Date(),
        changeFrequency: "weekly",
        priority: route === "" ? 1.0 : 0.8,
        alternates: {
          languages: {
            ru: `${baseUrl}/ru${route}`,
            en: `${baseUrl}/en${route}`,
            es: `${baseUrl}/es${route}`,
          },
        },
      });
    });
  });

  try {
    const assetsRes = await apiClient.get("/assets/");
    const assets: Asset[] = assetsRes.data.results || assetsRes.data || [];

    assets.forEach((asset) => {
      locales.forEach((locale) => {
        sitemapData.push({
          url: `${baseUrl}/${locale}/assets/${asset.id}`,
          lastModified: new Date(
            asset.updated_at || asset.created_at || new Date()
          ),
          changeFrequency: "daily",
          priority: 0.9,
          alternates: {
            languages: {
              ru: `${baseUrl}/ru/assets/${asset.id}`,
              en: `${baseUrl}/en/assets/${asset.id}`,
              es: `${baseUrl}/es/assets/${asset.id}`,
            },
          },
        });
      });
    });

    const articlesRes = await apiClient.get("/cms/articles/public/");
    const articles: ArticleItem[] =
      articlesRes.data.results || articlesRes.data || [];

    articles.forEach((article) => {
      locales.forEach((locale) => {
        sitemapData.push({
          url: `${baseUrl}/${locale}/blog/${article.slug}`,
          lastModified: new Date(
            article.updated_at || article.created_at || new Date()
          ),
          changeFrequency: "weekly",
          priority: 0.7,
          alternates: {
            languages: {
              ru: `${baseUrl}/ru/blog/${article.slug}`,
              en: `${baseUrl}/en/blog/${article.slug}`,
              es: `${baseUrl}/es/blog/${article.slug}`,
            },
          },
        });
      });
    });
  } catch (error) {
    console.error("❌ Ошибка генерации динамического Sitemap:", error);
  }

  return sitemapData;
}
