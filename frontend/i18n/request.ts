import { getRequestConfig } from 'next-intl/server';
import { routing } from './routing';
import { getServerApiUrl } from '../lib/server-api-url';

export default getRequestConfig(async ({ requestLocale }) => {
  let locale = await requestLocale;
  
  if (!locale || !routing.locales.includes(locale as any)) {
    locale = routing.defaultLocale;
  }
 
  let messages = {};
  
  try {
    // Server-side only: loopback to Gunicorn (API_URL / default :8001)
    const apiBase = getServerApiUrl();
    const res = await fetch(`${apiBase}/cms/translations/${locale}/`, {
      cache: 'no-store'
    });
    
    if (res.ok) {
      messages = await res.json();
    } else {
      throw new Error('API is not available');
    }
  } catch (error) {
    // Fallback to static JSON when Django CMS translations are down
    console.warn(`Fallback to cached translations for ${locale}`);
    messages = (await import(`../messages/${locale}.json`)).default;
  }

  return {
    locale,
    messages
  };
});
