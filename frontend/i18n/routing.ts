import {defineRouting} from 'next-intl/routing';
import {createNavigation} from 'next-intl/navigation';

export const routing = defineRouting({
  locales: ['ru', 'en', 'es'],
  defaultLocale: 'ru'
});

// Экспортируем типизированные обертки для навигации, 
// чтобы использовать их вместо стандартных next/link и next/navigation
export const {Link, redirect, usePathname, useRouter} = createNavigation(routing);