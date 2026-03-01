import createMiddleware from 'next-intl/middleware';
import {routing} from './i18n/routing';

export default createMiddleware(routing);

export const config = {
  // Матчим все пути, кроме статики, API и системных файлов Next.js
  matcher: ['/', '/(ru|en|es)/:path*', '/((?!_next|_vercel|.*\\..*).*)']
};