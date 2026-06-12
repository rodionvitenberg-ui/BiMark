"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import { useQuery } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, CheckCircle2, Minus, Plus, ShoppingCart, Gem, Activity } from "lucide-react";
import { Link } from "../../../../i18n/routing";
import { apiClient } from "../../../../lib/api/client";
import { Asset } from "../../../../types/project";
import { useCart } from "../../../../hooks/use-cart";

export default function AssetDetail() {
  const t = useTranslations("Assets");
  const locale = useLocale() as "ru" | "en" | "es";
  const params = useParams();
  const id = params.id as string;

  const addItem = useCart((state) => state.addItem);

  const [quantity, setQuantity] = useState(1);
  const [isAdded, setIsAdded] = useState(false);

  const { data: asset, isLoading, isError } = useQuery<Asset>({
    queryKey: ["asset", id],
    queryFn: async () => {
      const response = await apiClient.get(`/assets/${id}/`);
      return response.data;
    },
    staleTime: 60 * 1000, 
  });

  // Универсальный хелпер безопасного извлечения мультиязычных строк
  const getLocalizedValue = (field: any, fallbackStr = ""): string => {
    if (typeof field === 'object' && field !== null) {
      return field[locale] || field.en || field.ru || fallbackStr;
    }
    return field || fallbackStr;
  };

  const currentImage = asset?.image ? getLocalizedValue(asset.image) : null;

  const handleAddToCart = () => {
    if (!asset) return;

    const title = getLocalizedValue(asset.title, "Asset");

    addItem({
      item_type: 'asset',                   
      item_id: asset.id,                  
      title: title,
      price: Number(asset.price), 
      quantity: quantity,                
      max_quantity: asset.is_unique ? 1 : 99,
      image: currentImage,
      is_unique: asset.is_unique,
    });

    setIsAdded(true);
    setTimeout(() => setIsAdded(false), 3000);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-zinc-50 dark:bg-black pt-20">
        <div className="w-10 h-10 border-4 border-brand-blue border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (isError || !asset) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-zinc-50 dark:bg-black pt-20">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">{t("assetNotFound", { fallback: "Актив не найден" })}</h2>
          <Link href="/assets" className="text-brand-blue hover:underline">{t("returnToCatalog", { fallback: "Вернуться в каталог" })}</Link>
        </div>
      </div>
    );
  }

  const isSoldOut = asset.status === 'SOLD';
  
  const assetTitle = getLocalizedValue(asset.title, "Asset");
  const assetDescription = getLocalizedValue(asset.description, "");

  // ГЕНЕРАЦИЯ JSON-LD ДЛЯ GOOGLE
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    "name": assetTitle,
    "image": currentImage || "https://bimark.org/logo.png", 
    "description": assetDescription.replace(/<[^>]*>?/gm, ''), 
    "brand": {
      "@type": "Brand",
      "name": "BiMark"
    },
    "offers": {
      "@type": "Offer",
      "url": `https://bimark.org/${locale}/assets/${asset.id}`,
      "priceCurrency": "USD",
      "price": asset.price,
      "availability": isSoldOut ? "https://schema.org/SoldOut" : "https://schema.org/InStock",
      "seller": {
        "@type": "Organization",
        "name": "BiMark Platform"
      }
    }
  };

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-black pt-24 pb-20">
      
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div className="max-w-7xl mx-auto px-4">
        
        <Link href="/assets" className="inline-flex items-center gap-2 text-sm font-medium text-gray-500 hover:text-brand-blue transition-colors mb-8">
          <ArrowLeft className="w-4 h-4" />
          {t("backToCatalog", { fallback: "Назад к активам" })}
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          
          <div className="lg:col-span-2 space-y-8">
            {/* Контейнер изображения */}
            <div className="aspect-video w-full bg-gray-200 dark:bg-zinc-900 rounded-3xl overflow-hidden relative">
              {currentImage ? (
                <img src={currentImage} alt={assetTitle} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-400">{t("noImage", { fallback: "Нет изображения" })}</div>
              )}
            </div>

            {/* ИСПРАВЛЕНО: Новый блок индикаторов и метаданных ПОД изображением */}
            <div className="w-full">
              <div className="flex flex-wrap items-center gap-2.5 mb-6">
                
                {/* 1. ДИНАМИЧЕСКИЕ ТЕГИ (Всегда ЛЕВЕЕ всех остальных показателей) */}
                {asset.tags && asset.tags.length > 0 && asset.tags.map((tag, idx) => (
                  <span 
                    key={tag.id || idx}
                    className="inline-flex items-center px-3 py-1.5 rounded-full text-xs font-black uppercase tracking-wider border"
                    style={{ 
                      backgroundColor: `${tag.color}15`, 
                      borderColor: `${tag.color}40`, 
                      color: tag.color 
                    }}
                  >
                    {getLocalizedValue(tag.name)}
                  </span>
                ))}

                {/* 2. СТАТУС ВЛАДЕНИЯ (Эксклюзивный актив / Актив целиком) */}
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-100 dark:bg-blue-900/30 text-brand-blue text-xs font-bold uppercase tracking-wider border border-blue-200/20 dark:border-blue-800/30">
                  <Gem className="w-3.5 h-3.5" />
                  {asset.is_unique 
                    ? t("badgeExclusive", { fallback: "Эксклюзивный актив" }) 
                    : t("wholeAsset", { fallback: "Актив целиком" })
                  }
                </div>

                {/* 3. ХАРАКТЕРИСТИКИ DUE DILIGENCE (Всегда ИДУТ ПОСЛЕ всех прочих показателей) */}
                {asset.metrics && asset.metrics.length > 0 && asset.metrics.map((metric, idx) => (
                  <div 
                    key={idx} 
                    className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-zinc-100 dark:bg-zinc-800/60 text-gray-800 dark:text-gray-200 text-xs font-bold uppercase tracking-wider border border-gray-200 dark:border-zinc-700/80"
                  >
                    <span className="text-gray-400 dark:text-gray-500 font-medium">
                      {getLocalizedValue(metric.metric_name)}:
                    </span>
                    <span className="text-gray-900 dark:text-white font-black">
                      {getLocalizedValue(metric.value)}
                    </span>
                  </div>
                ))}

              </div>

              {/* Заголовок и Описание лота (Короткое описание сюда НЕ ВКЛЮЧАЕМ) */}
              <h1 className="text-4xl font-extrabold text-gray-900 dark:text-white mb-6">
                {assetTitle}
              </h1>
              
              <div 
                className="prose prose-lg dark:prose-invert max-w-none text-gray-600 dark:text-gray-300
                  [&_strong]:font-extrabold [&_strong]:text-gray-900 dark:[&_strong]:text-white
                  [&_ul]:list-disc [&_ul]:pl-6 [&_ul]:my-4
                  [&_ol]:list-decimal [&_ol]:pl-6 [&_ol]:my-4
                  [&_li]:mb-2"
                dangerouslySetInnerHTML={{ 
                  __html: assetDescription 
                }}
              />
            </div>
          </div>

          {/* Правая плашка оформления заказа (Правый сайдбар) */}
          <div className="relative">
            <div className="sticky top-32 bg-white dark:bg-[#111827] rounded-3xl shadow-xl border border-gray-100 dark:border-gray-800 p-8">
              
              <div className="flex justify-between items-end mb-8">
                <div>
                  <p className="text-sm font-medium text-gray-500 mb-1">{t("fullPriceLabel", { fallback: "Полная стоимость" })}</p>
                  <p className="text-4xl font-black text-gray-900 dark:text-white">${asset.price}</p>
                </div>
              </div>

              <div className="space-y-6">
                {!asset.is_unique && !isSoldOut && (
                  <div className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-800/50 rounded-2xl border border-gray-100 dark:border-gray-800">
                    <button 
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      disabled={quantity <= 1}
                      className="w-12 h-12 flex items-center justify-center bg-white dark:bg-gray-700 rounded-xl shadow-sm text-gray-600 dark:text-gray-300 hover:text-brand-blue disabled:opacity-50 transition-colors"
                    >
                      <Minus className="w-5 h-5" />
                    </button>
                    
                    <div className="flex flex-col items-center">
                      <span className="text-2xl font-bold text-gray-900 dark:text-white">{quantity}</span>
                      <span className="text-xs font-medium text-gray-500 uppercase">{t("pcs", { fallback: "шт" })}</span>
                    </div>

                    <button 
                      onClick={() => setQuantity(quantity + 1)}
                      className="w-12 h-12 flex items-center justify-center bg-white dark:bg-gray-700 rounded-xl shadow-sm text-gray-600 dark:text-gray-300 hover:text-brand-blue disabled:opacity-50 transition-colors"
                    >
                      <Plus className="w-5 h-5" />
                    </button>
                  </div>
                )}

                {!asset.is_unique && !isSoldOut && (
                  <div className="flex justify-between items-center py-4 border-t border-b border-gray-100 dark:border-gray-800">
                    <span className="font-semibold text-gray-700 dark:text-gray-300">{t("total", { fallback: "Итого" })}</span>
                    <span className="text-2xl font-black text-gray-900 dark:text-white">
                      ${(Number(asset.price) * quantity).toFixed(2)}
                    </span>
                  </div>
                )}

                {isSoldOut ? (
                  <div className="py-4 text-center font-bold text-red-500 bg-red-50 dark:bg-red-900/20 rounded-xl">
                    {t("statusSoldOut", { fallback: "Продано" })}
                  </div>
                ) : (
                   <div className="space-y-4">
                     <AnimatePresence>
                        {isAdded && (
                          <motion.div 
                            initial={{ opacity: 0, height: 0, y: -10 }}
                            animate={{ opacity: 1, height: "auto", y: 0 }}
                            exit={{ opacity: 0, height: 0, y: -10 }}
                            className="p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl flex items-start gap-3 text-green-700 dark:text-green-400"
                          >
                            <CheckCircle2 className="w-5 h-5 shrink-0 mt-0.5" />
                            <div className="flex flex-col gap-1">
                              <span className="font-medium">{t("addedToCartMsg", { fallback: "Добавлено в корзину" })}</span>
                              <Link href="/checkout" className="text-sm font-bold underline text-green-800 dark:text-green-300 text-left">
                                {t("goToCart", { fallback: "Перейти к оформлению" })}
                              </Link>
                            </div>
                          </motion.div>
                        )}
                     </AnimatePresence>

                     <button 
                        onClick={handleAddToCart}
                        className="w-full py-4 rounded-xl font-bold text-lg bg-brand-blue text-white hover:bg-[#007cbd] shadow-lg shadow-brand-blue/20 transition-all flex justify-center items-center gap-3"
                      >
                        <ShoppingCart className="w-5 h-5" />
                        {t("buyAssetBtn", { fallback: "Купить проект" })}
                      </button>
                   </div>
                )}
              </div>

              <p className="text-xs text-center text-gray-400 mt-4">
                {t("termsAgreement", { fallback: "Нажимая кнопку, вы соглашаетесь с" })} <Link href="/terms" className="underline">{t("termsLink", { fallback: "условиями использования" })}</Link>.
              </p>

            </div>
          </div>

        </div>
      </div>
    </div>
  );
}