import { notFound } from "next/navigation";
import AssetDetailClient from "./AssetDetailClient";
import { stripTags } from "@/lib/utils"; // Наша написанная утилита очистки регуляркой

interface Props {
  params: Promise<{ locale: string; id: string }>;
}

async function getAssetData(id: string): Promise<any> {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
    // Серверный fetch без кеша для точной проверки статусов SOLD в реальном времени
    const res = await fetch(`${baseUrl}/api/assets/${id}/`, { cache: "no-store" });
    if (!res.ok) return null;
    return await res.json();
  } catch (error) {
    console.error("Критическая ошибка SSR-запроса актива:", error);
    return null;
  }
}

export default async function AssetDetailPage({ params }: Props) {
  const { locale, id } = await params;
  const asset = await getAssetData(id);

  if (!asset) {
    notFound();
  }

  // Универсальная серверная функция безопасной локализации полей
  const getLocalized = (field: any, fallback = ""): string => {
    if (typeof field === "object" && field !== null) {
      return field[locale] || field.en || field.ru || fallback;
    }
    return field || fallback;
  };

  const assetTitle = getLocalized(asset.title, "Asset");
  const assetDescription = getLocalized(asset.description, "");
  const currentImage = asset.image ? getLocalized(asset.image) : "https://bimark.org/logo.png";
  const isSoldOut = asset.status === "SOLD";

  // СБОРКА СУПЕР-ГРАФА ДЛЯ НЕЙРОСЕТЕЙ (GEO ENRICHMENT)
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    "name": assetTitle,
    "image": currentImage,
    "description": stripTags(assetDescription).slice(0, 300),
    "category": asset.category ? getLocalized(asset.category.name) : "Digital Asset",
    "brand": {
      "@type": "Brand",
      "name": "BiMark"
    },
    // Ключевые слова из маркетинговых тегов админки
    "keywords": asset.tags?.map((t: any) => getLocalized(t.name)).join(", "),
    
    // КРИТИЧНО ДЛЯ ИИ: Превращаем Due Diligence аудит-таблицу в структурированные свойства Schema.org
    "additionalProperty": asset.metrics?.map((m: any) => ({
      "@type": "PropertyValue",
      "name": getLocalized(m.metric_name),
      "value": getLocalized(m.value)
    })),
    
    "offers": {
      "@type": "Offer",
      "url": `https://bimark.org/${locale}/assets/${asset.id}`,
      "priceCurrency": "USD",
      "price": asset.price,
      "availability": isSoldOut ? "https://schema.org/SoldOut" : "https://schema.org/InStock",
      "seller": {
        "@type": "Organization",
        "name": "BiMark Platform",
        "url": "https://bimark.org"
      }
    }
  };

  return (
    <>
      {/* Этот блок вшивается на сервере и мгновенно считывается ИИ-парсёрами без выполнения JS */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      
      {/* Передаем готовые данные в интерактивную клиентскую оболочку */}
      <AssetDetailClient initialAsset={asset} />
    </>
  );
}