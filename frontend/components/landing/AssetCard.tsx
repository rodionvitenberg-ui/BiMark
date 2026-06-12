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
    /* ИСПРАВЛЕНО: Фон изменен на bg-white, рамка на border-gray-100, тень при ховере на hover:shadow-lg */
    <Card className="group flex flex-col h-full bg-white hover:shadow-lg transition-all duration-300 border border-gray-100 rounded-2xl overflow-hidden gap-0">
      
      <CardHeader className="p-5 pb-3">
        <Link href={assetUrl} className="block">
          {/* ИСПРАВЛЕНО: Цвет текста заголовка изменен на text-brand-black */}
          <CardTitle className="text-2xl font-bold text-brand-black line-clamp-1 group-hover:text-brand-blue transition-colors">
            {title}
          </CardTitle>
        </Link>
        {/* ИСПРАВЛЕНО: Цвет краткого описания изменен на text-gray-500 */}
        <CardDescription className="line-clamp-2 text-md text-gray-500 leading-relaxed mt-2 min-h-[48px]">
          {shortDescription}
        </CardDescription>
      </CardHeader>

      <CardContent className="p-5 pt-0 flex-1 flex flex-col">
        
        {/* Контейнер картинки (ИСПРАВЛЕНО: Заменили темную подложку на bg-gray-100 и border-gray-50) */}
        <Link href={assetUrl} className="block w-full h-44 relative rounded-xl overflow-hidden shrink-0 mb-5 bg-gray-100 border border-gray-50">
          <img 
            src={imageSrc} 
            alt={title} 
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out" 
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/5 to-transparent" />
        </Link>

        {/* ДВУХКОЛОНОЧНАЯ АРХИТЕКТУРА ДИНАМИЧЕСКИХ ДАННЫХ */}
        <div className="flex justify-between items-start gap-4 mt-auto">
          
          {/* ЛЕВАЯ КОЛОНКА: Статус уникальности + Ключевая метрика Due Diligence */}
          <div className="flex flex-col gap-2.5 flex-1 min-w-0">
            {/* ИСПРАВЛЕНО: Цвет текста метаданных изменен на text-gray-500 */}
            <div className="flex items-center text-sm text-gray-500 font-medium">
              <Gem className={`w-4 h-4 mr-2 shrink-0 ${asset.is_unique ? 'text-brand-blue' : 'text-gray-400'}`} />
              <span className="truncate">
                {asset.is_unique 
                  ? <span className="text-brand-blue font-bold">{t("uniqueAsset", { fallback: "Уникальный актив" })}</span> 
                  : <span className="text-brand-black font-bold">{t("wholeAsset", { fallback: "Актив целиком" })}</span>}
              </span>
            </div>
            
            {/* Рендерим первую характеристику DD в левую колонку под статус */}
            {asset.metrics && asset.metrics.length > 0 && (
              /* ИСПРАВЛЕНО: Изменен цвет текста обертки метрики на text-gray-500 */
              <div className="flex items-center text-sm font-medium text-gray-500 min-w-0">
                <Activity className="w-4 h-4 mr-2 text-brand-blue shrink-0 animate-pulse" />
                <div className="truncate text-xs">
                  <span className="text-gray-400 mr-1">{getLocalizedValue(asset.metrics[0].metric_name)}:</span>
                  {/* ИСПРАВЛЕНО: Изменен цвет значения метрики на text-brand-black */}
                  <span className="font-extrabold text-brand-black">{getLocalizedValue(asset.metrics[0].value)}</span>
                </div>
              </div>
            )}
          </div>

          {/* ПРАВАЯ КОЛОНКА: Блок тегов + Стек дополнительных характеристик */}
          <div className="flex flex-col items-end gap-2.5 shrink-0 max-w-[50%]">
            
            {/* Вывод динамических тегов из админки (Прекрасно смотрятся на белом фоне за счет прозрачности цвета) */}
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

            {/* Второе и последующие поля характеристик */}
            {asset.metrics && asset.metrics.length > 1 && (
              <div className="flex flex-col gap-1.5 items-end w-full">
                {asset.metrics.slice(1, 3).map((metric, idx) => (
                  /* ИСПРАВЛЕНО: Изменен базовый цвет текста каскадных метрик на text-gray-500 */
                  <div key={idx} className="text-right text-xs font-medium truncate max-w-full text-gray-500">
                    <span className="text-gray-400 mr-1">{getLocalizedValue(metric.metric_name)}:</span>
                    <span className="font-black text-brand-blue">{getLocalizedValue(metric.value)}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>
        
      </CardContent>

      {/* Футер карточки с прайсом (ИСПРАВЛЕНО: Рамка border-gray-100, легкая подложка bg-gray-50/50) */}
      <CardFooter className="p-5 pt-4 flex items-center justify-between mt-auto border-t border-gray-100 bg-gray-50/50">
        <div className="flex flex-col">
          {/* ИСПРАВЛЕНО: Цвет текста цены изменен на text-brand-black */}
          <span className="text-2xl font-black text-brand-black leading-none tracking-tight">
            {formatCurrency(asset.price)}
          </span>
          {/* ИСПРАВЛЕНО: Параметры подписи под ценой приведены в точное соответствие с light-карточкой */}
          <span className="text-[11px] text-gray-400 font-bold mt-1 uppercase tracking-wider">
            {t("fullPrice", { fallback: "Полная стоимость" })}
          </span>
        </div>
        
        <Link 
          href={assetUrl} 
          className="shrink-0 px-6 py-3 bg-brand-blue text-white text-sm font-bold rounded-xl hover:bg-[#007cbd] transition-colors shadow-sm"
        >
          {t("buyBtn", { fallback: "Купить" })} 
        </Link>
      </CardFooter>

    </Card>
  );
}