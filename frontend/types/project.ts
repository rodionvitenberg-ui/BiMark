export type ProjectStatus = "DRAFT" | "PRESALE" | "ACTIVE" | "SOLD";

export interface LocalizedString {
  ru: string;
  en: string;
  es: string;
}

export interface Category {
  id: string;
  slug: string;
  name: LocalizedString;
  image: string | null;
}

export interface Project {
  id: string;
  slug: string;
  title: LocalizedString;
  description: LocalizedString;
  category: Category | null;
  image: string | null;
  price_per_share: string | number; // DRF DecimalField часто приходит как строка
  total_shares: number;
  available_shares: number;
  status: ProjectStatus;
  created_at: string;
}