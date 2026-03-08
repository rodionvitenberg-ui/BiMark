import type { Metadata } from "next";
import { Inter } from "next/font/google";
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

const inter = Inter({ subsets: ["latin", "cyrillic"] });

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
      <body className={`${inter.className} min-h-[100dvh] flex flex-col`}>
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