import type { Metadata } from "next";
import { Manrope, Golos_Text } from "next/font/google";
import { NextIntlClientProvider } from "next-intl";
import { getMessages, getTranslations } from "next-intl/server"; // Добавили getTranslations
import { notFound } from "next/navigation";
import { routing } from "../../i18n/routing";
import { QueryProvider } from "../../components/providers/query-provider";
import GoogleProvider from "@/components/providers/google-provider";
import { Header } from "../../components/modules/header";
import "./globals.css";
import { Footer } from "../../components/modules/footer";
import { CookieConsent } from "../../components/ui/cookie-consent";
import { ToastProvider } from '@/components/ui/toast';

const manrope = Manrope({ 
  subsets: ["latin", "cyrillic"],
  variable: "--font-manrope",
  display: 'swap',
});

const golos = Golos_Text({ 
  subsets: ["latin", "cyrillic"],
  variable: "--font-golos",
  display: 'swap',
});

// ДИНАМИЧЕСКАЯ ГЕНЕРАЦИЯ МЕТАДАННЫХ
export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  
  // Загружаем переводы для неймспейса "Metadata"
  const t = await getTranslations({ locale, namespace: 'Metadata' });

  return {
    title: t('title'),
    description: t('description'),
  };
}

export default async function RootLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  if (!routing.locales.includes(locale as any)) {
    notFound();
  }

  const messages = await getMessages();

  return (
    <html lang={locale} suppressHydrationWarning>
      <body className={`${golos.variable} ${manrope.variable} font-sans min-h-[100dvh] flex flex-col antialiased bg-brand-light`}>
        <NextIntlClientProvider messages={messages}>
          <QueryProvider>
            <GoogleProvider>
              <ToastProvider>
                <Header />
                <main className="flex-1 flex flex-col w-full pt-16">
                  {children}
                </main>
                <Footer />
              </ToastProvider>
              <CookieConsent />
            </GoogleProvider>
          </QueryProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}