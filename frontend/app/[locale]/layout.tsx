import type { Metadata } from "next";
import { Manrope, Golos_Text } from "next/font/google";
import { NextIntlClientProvider } from "next-intl";
import { getMessages } from "next-intl/server";
import { notFound } from "next/navigation";
import { routing } from "../../i18n/routing";
import { QueryProvider } from "../../components/providers/query-provider";
import GoogleProvider from "@/components/providers/google-provider";
import { Header } from "../../components/modules/header";
import "./globals.css";
import { Footer } from "../../components/modules/footer";
import { CookieConsent } from "../../components/ui/cookie-consent";

const manrope = Manrope({ 
  subsets: ["latin", "cyrillic"],
  variable: "--font-manrope", // Создаем CSS-переменную для заголовков
  display: 'swap',
});

const golos = Golos_Text({ 
  subsets: ["latin", "cyrillic"],
  variable: "--font-golos", // Создаем CSS-переменную для основного текста
  display: 'swap',
});

export const metadata: Metadata = {
  title: "Инвестиционная платформа",
  description: "Покупка долей и инвестиции в проекты",
};

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
      {/* ИСПРАВЛЕНО: Подключили переменные шрифтов и добавили font-sans как базовый */}
      <body className={`${golos.variable} ${manrope.variable} font-sans min-h-[100dvh] flex flex-col antialiased bg-brand-light`}>
        <NextIntlClientProvider messages={messages}>
          <QueryProvider>
            <GoogleProvider>
            <Header />
            <main className="flex-1 flex flex-col w-full pt-16">
              {children}
            </main>
            <Footer />
            <CookieConsent />
            </GoogleProvider>
          </QueryProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}