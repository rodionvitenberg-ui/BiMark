import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function stripTags(html: string): string {
  if (!html) return '';
  
  return html
    .replace(/<\/?[^>]+(>|$)/g, '') // Удаляем HTML-теги
    .replace(/&nbsp;/g, ' ')        // Заменяем неразрывные пробелы
    .replace(/\s+/g, ' ')           // Схлопываем лишние пробелы
    .trim();
}