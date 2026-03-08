import { getRequestConfig } from 'next-intl/server';
import { routing } from './routing';

export default getRequestConfig(async ({ requestLocale }) => {
  let locale = await requestLocale;
  
  if (!locale || !routing.locales.includes(locale as any)) {
    locale = routing.defaultLocale;
  }
 
  let messages = {};
  
  try {
    // 1. Пытаемся стянуть свежайшие переводы с нашего Django API.
    // Опция cache: 'no-store' - это магия, которая отключает кэш.
    // Замени URL на свой, если бэкенд крутится не на 8000 порту.
    const res = await fetch(`http://127.0.0.1:8000/api/cms/translations/${locale}/`, {
      cache: 'no-store'
    });
    
    if (res.ok) {
      messages = await res.json();
    } else {
      throw new Error('API is not available');
    }
  } catch (error) {
    // 2. Фолбэк: если API недоступен, берем из кэша импорта
    console.warn(`Fallback to cached translations for ${locale}`);
    messages = (await import(`../messages/${locale}.json`)).default;
  }

  return {
    locale,
    messages
  };
});