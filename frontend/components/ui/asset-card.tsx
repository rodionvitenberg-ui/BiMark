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
  const t = useTranslations("Projects"); // Используем те же переводы, чтобы не плодить лишнего
  const locale = useLocale() as "ru" | "en" | "es";

  // Локализация
  const title = asset.title[locale] || asset.title.en || "Без названия";
  const description = asset.description[locale] || asset.description.en || "";

  // Форматирование цены
  const formatCurrency = (value: number | string) => 
    new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(Number(value));

  // У ассетов в нашей базе нет slug, они идентифицируются по UUID
  const assetUrl = `/assets/${asset.id}`; 
  
  const currentImage = typeof asset.image === 'object' && asset.image !== null
    ? (asset.image[locale])
    : asset.image;

  const imageSrc = currentImage || "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=2564&auto=format&fit=crop";

  return (
    <Card className="group flex flex-col h-full bg-white hover:shadow-lg transition-all duration-300 border border-gray-100 overflow-hidden gap-0">
      
      {/* ШАПКА: Заголовок и Описание */}
      <CardHeader className="p-3 pb-2 pt-0">
        <Link href={assetUrl} className="block">
          <CardTitle className="text-2xl font-bold text-brand-black line-clamp-1 group-hover:text-brand-blue transition-colors">
            {title}
          </CardTitle>
        </Link>
        <CardDescription className="line-clamp-2 text-md text-gray-500 leading-relaxed">
          {description}
        </CardDescription>
      </CardHeader>

      {/* КОНТЕНТ: Картинка и Информация */}
      <CardContent className="p-2 pt-0 flex-1 flex flex-col">
        
        {/* Картинка (h-40) */}
        <Link href={assetUrl} className="block w-full h-40 relative rounded-xl overflow-hidden shrink-0 mb-2 bg-gray-100">
          <img 
            src={imageSrc} 
            alt={title} 
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
          />
        </Link>

        {/* Индикатор статуса (вместо HP бара долей) */}
        <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden mb-4">
          <div 
            className={`h-full ${asset.status === 'SOLD' ? 'bg-gray-400' : 'bg-brand-blue'}`} 
            style={{ width: "100%" }} 
          />
        </div>

        {/* Блок с информацией (Уникальность и Тип) */}
        <div className="flex flex-col gap-2.5 mt-auto">
          {/* Уникальность */}
          <div className="flex items-center text-sm text-gray-500 font-medium">
            <Gem className={`w-4 h-4 mr-2 shrink-0 ${asset.is_unique ? 'text-brand-blue' : 'text-gray-400'}`} />
            <span>
              {asset.is_unique 
                ? <span className="text-brand-blue font-bold">Уникальный актив</span> 
                : <span className="text-brand-black font-bold">Актив целиком</span>}
            </span>
          </div>
          
          {/* Тип (вместо категории) */}
          <div className="flex items-center text-sm text-gray-500 font-medium truncate">
            <Briefcase className="w-4 h-4 mr-2 text-gray-400 shrink-0" />
            <span className="truncate">Готовый бизнес</span>
          </div>
        </div>
        
      </CardContent>

      {/* ФУТЕР: Полная Цена и Кнопка */}
      <CardFooter className="p-3 pt-0 flex items-center justify-between mt-auto border-t border-gray-50/50 mt-0">
        <div className="flex flex-col">
          <span className="text-xl font-black text-brand-black leading-none">
            {formatCurrency(asset.price)}
          </span>
          <span className="text-[11px] text-gray-400 font-bold mt-1 uppercase tracking-wider">
            Полная стоимость
          </span>
        </div>
        
        <Link 
          href={assetUrl} 
          className="shrink-0 px-5 py-2.5 bg-brand-blue text-white text-sm font-bold rounded-xl hover:bg-[#007cbd] transition-colors"
        >
          {t("buyBtn")} 
        </Link>
      </CardFooter>

    </Card>
  );
}