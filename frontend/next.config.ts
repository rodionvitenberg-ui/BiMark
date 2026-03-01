import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

// Указываем путь к нашему файлу конфигурации запросов
const withNextIntl = createNextIntlPlugin("./i18n/request.ts");

const nextConfig: NextConfig = {
  /* здесь в будущем будут настройки кэша, изображений и т.д. */
};

// Оборачиваем базовый конфиг в плагин мультиязычности
export default withNextIntl(nextConfig);