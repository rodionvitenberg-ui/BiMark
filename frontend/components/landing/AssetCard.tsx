"use client";

import { useTranslations, useLocale } from "next-intl";
import { Gem, Activity } from "lucide-react";
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

  // Универсальный хелпер безопасного извлечения мультиязычных строк из объектов JSON-API
  const getLocalizedValue = (field: any, fallbackStr = ""): string => {
    if (typeof field === 'object' && field !== null) {
      return field[locale] || field.en || field.ru || fallbackStr;
    }
    return field || fallbackStr;
  };

  const title = getLocalizedValue(asset.title, "Без названия");
  const shortDescription = getLocalizedValue(asset.short_description, "");

  const formatCurrency = (value: number | string) => 
    new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(Number(value));

  const assetUrl = `/assets/${asset.id}`; 
  const imageSrc = getLocalizedValue(asset.image) || "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=2564&auto=format&fit=crop";

  return (
    <Card className="group flex flex-col h-full bg-[#131b2e] hover:bg-[#17223b] hover:shadow-[0_0_30px_rgba(0,123,255,0.15)] transition-all duration-300 border border-white/10 rounded-2xl overflow-hidden gap-0">
      
      <CardHeader className="p-5 pb-3">
        <Link href={assetUrl} className="block">
          <CardTitle className="text-2xl font-bold text-white line-clamp-1 group-hover:text-brand-blue transition-colors">
            {title}
          </CardTitle>
        </Link>
        {/* ИСПРАВЛЕНО: Заменили длинное описание с очисткой тегов на аккуратное короткое описание */}
        <CardDescription className="line-clamp-2 text-md text-gray-400 leading-relaxed mt-2 min-h-[48px]">
          {shortDescription}
        </CardDescription>
      </CardHeader>

      <CardContent className="p-5 pt-0 flex-1 flex flex-col">
        
        {/* Контейнер картинки */}
        <Link href={assetUrl} className="block w-full h-44 relative rounded-xl overflow-hidden shrink-0 mb-5 bg-[#0a0f1c]/50 border border-white/5">
          <img 
            src={imageSrc} 
            alt={title} 
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out" 
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#131b2e]/40 to-transparent" />
        </Link>

        {/* НОВАЯ ДВУХКОЛОНОЧНАЯ АРХИТЕКТУРА ДИНАМИЧЕСКИХ ДАННЫХ */}
        <div className="flex justify-between items-start gap-4 mt-auto">
          
          {/* ЛЕВАЯ КОЛОНКА: Статус уникальности + Ключевая метрика Due Diligence */}
          <div className="flex flex-col gap-2.5 flex-1 min-w-0">
            <div className="flex items-center text-sm text-gray-400 font-medium">
              <Gem className={`w-4 h-4 mr-2 shrink-0 ${asset.is_unique ? 'text-brand-blue' : 'text-gray-500'}`} />
              <span className="truncate">
                {asset.is_unique 
                  ? <span className="text-brand-blue font-bold">{t("uniqueAsset", { fallback: "Уникальный актив" })}</span> 
                  : <span className="text-gray-300 font-bold">{t("wholeAsset", { fallback: "Актив целиком" })}</span>}
              </span>
            </div>
            
            {/* Рендерим первую характеристику DD в левую колонку под статус (если они забиты на бэкенде) */}
            {asset.metrics && asset.metrics.length > 0 && (
              <div className="flex items-center text-sm font-medium text-gray-300 min-w-0">
                <Activity className="w-4 h-4 mr-2 text-brand-blue shrink-0 animate-pulse" />
                <div className="truncate text-xs">
                  <span className="text-gray-400 mr-1">{getLocalizedValue(asset.metrics[0].metric_name)}:</span>
                  <span className="font-extrabold text-white">{getLocalizedValue(asset.metrics[0].value)}</span>
                </div>
              </div>
            )}
          </div>

          {/* ПРАВАЯ КОЛОНКА: Блок тегов + Стек дополнительных характеристик */}
          <div className="flex flex-col items-end gap-2.5 shrink-0 max-w-[50%]">
            
            {/* Вывод динамических тегов из админки (Правее, под изображением) */}
            {asset.tags && asset.tags.length > 0 && (
              <div className="flex flex-wrap gap-1 justify-end">
                {asset.tags.map((tag, idx) => (
                  <span 
                    key={tag.id || idx} 
                    className="text-[10px] font-black px-2 py-0.5 rounded-md border uppercase tracking-wider transition-all"
                    style={{ 
                      backgroundColor: `${tag.color}15`, 
                      borderColor: `${tag.color}40`, 
                      color: tag.color 
                    }}
                  >
                    {getLocalizedValue(tag.name)}
                  </span>
                ))}
              </div>
            )}

            {/* Второе и последующие поля характеристик (Отображаются каскадом строго под тегами) */}
            {asset.metrics && asset.metrics.length > 1 && (
              <div className="flex flex-col gap-1.5 items-end w-full">
                {asset.metrics.slice(1, 3).map((metric, idx) => (
                  <div key={idx} className="text-right text-xs font-medium truncate max-w-full text-gray-300">
                    <span className="text-gray-400 mr-1">{getLocalizedValue(metric.metric_name)}:</span>
                    <span className="font-black text-brand-blue">{getLocalizedValue(metric.value)}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>
        
      </CardContent>

      {/* Футер карточки с прайсом */}
      <CardFooter className="p-5 pt-4 flex items-center justify-between mt-auto border-t border-white/5 bg-[#0a0f1c]/20">
        <div className="flex flex-col">
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