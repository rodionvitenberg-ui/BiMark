"use client";

import { useTranslations, useLocale } from "next-intl";
import { Briefcase, Gem } from "lucide-react";
import { Asset } from "../../types/project";
import { Link } from "../../i18n/routing";

import { 
  Card, 
  CardContent, 
  CardFooter, 
  CardHeader, 
  CardTitle, 
  CardDescription 
} from "./card";

interface AssetCardProps {
  asset: Asset;
}

export function AssetCard({ asset }: AssetCardProps) {
  const t = useTranslations("Assets"); 
  const locale = useLocale() as "ru" | "en" | "es";

  const title = typeof asset.title === 'object' && asset.title !== null
    ? (asset.title[locale] || asset.title.en || "Без названия")
    : (asset.title || "Без названия");

  // 1. Получаем сырое описание (с HTML)
  const rawDescription = typeof asset.description === 'object' && asset.description !== null
    ? (asset.description[locale] || asset.description.en || "")
    : (asset.description || "");

  // 2. Очищаем от HTML-тегов для превью[cite: 7]
  const cleanDescription = rawDescription.replace(/<[^>]*>?/gm, '');

  const formatCurrency = (value: number | string) => 
    new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(Number(value));

  const assetUrl = `/assets/${asset.id}`; 
  
  const currentImage = typeof asset.image === 'object' && asset.image !== null
    ? (asset.image[locale])
    : asset.image;

  const imageSrc = currentImage || "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=2564&auto=format&fit=crop";

  return (
    // bg-[#131b2e] — синий хаб-оттенок, который идеально контрастирует с фоном #0a0f1c.
    // При hover карточка мягко подсвечивается изнутри и приобретает аккуратный неоновый синий shadow.
    <Card className="group flex flex-col h-full bg-[#131b2e] hover:bg-[#17223b] hover:shadow-[0_0_30px_rgba(0,123,255,0.15)] transition-all duration-300 border border-white/10 rounded-2xl overflow-hidden gap-0">
      
      <CardHeader className="p-5 pb-3">
        <Link href={assetUrl} className="block">
          {/* Сменили text-brand-black на text-white */}
          <CardTitle className="text-2xl font-bold text-white line-clamp-1 group-hover:text-brand-blue transition-colors">
            {title}
          </CardTitle>
        </Link>
        {/* Сменили text-gray-500 на text-gray-400 */}
        <CardDescription className="line-clamp-2 text-md text-gray-400 leading-relaxed mt-2">
          {cleanDescription}
        </CardDescription>
      </CardHeader>

      <CardContent className="p-5 pt-0 flex-1 flex flex-col">
        
        {/* Контейнер картинки со скруглением */}
        <Link href={assetUrl} className="block w-full h-44 relative rounded-xl overflow-hidden shrink-0 mb-5 bg-[#0a0f1c]/50 border border-white/5">
          <img 
            src={imageSrc} 
            alt={title} 
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out" 
          />
          {/* Легкий градиентный оверлей на картинке для глубины */}
          <div className="absolute inset-0 bg-gradient-to-t from-[#131b2e]/40 to-transparent" />
        </Link>

        {/* Характеристики ассета */}
        <div className="flex flex-col gap-3 mt-auto">
          <div className="flex items-center text-sm text-gray-400 font-medium">
            <Gem className={`w-4 h-4 mr-2.5 shrink-0 ${asset.is_unique ? 'text-brand-blue' : 'text-gray-500'}`} />
            <span>
              {asset.is_unique 
                ? <span className="text-brand-blue font-bold">{t("uniqueAsset", { fallback: "Уникальный актив" })}</span> 
                : <span className="text-gray-300 font-bold">{t("wholeAsset", { fallback: "Актив целиком" })}</span>}
            </span>
          </div>
          
          <div className="flex items-center text-sm text-gray-400 font-medium truncate">
            <Briefcase className="w-4 h-4 mr-2.5 text-gray-500 shrink-0" />
            <span className="truncate text-gray-300">{t("readyBusiness", { fallback: "Готовый бизнес" })}</span>
          </div>
        </div>
        
      </CardContent>

      {/* Футер карточки с прайсом */}
      <CardFooter className="p-5 pt-4 flex items-center justify-between mt-auto border-t border-white/5 bg-[#0a0f1c]/20">
        <div className="flex flex-col">
          {/* Сменили цвет цены на чистый белый */}
          <span className="text-2xl font-black text-white leading-none tracking-tight">
            {formatCurrency(asset.price)}
          </span>
          <span className="text-[10px] text-gray-500 font-bold mt-1.5 uppercase tracking-wider">
            {t("fullPrice", { fallback: "Полная стоимость" })}
          </span>
        </div>
        
        <Link 
          href={assetUrl} 
          className="shrink-0 px-6 py-3 bg-brand-blue text-white text-sm font-bold rounded-xl hover:bg-[#007cbd] transition-colors shadow-[0_4px_12px_rgba(0,123,255,0.2)]"
        >
          {t("buyBtn", { fallback: "Купить" })} 
        </Link>
      </CardFooter>

    </Card>
  );
}