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
  short_description?: LocalizedString;
  description: LocalizedString;
  category: Category | null;
  image: string | null;
  price_per_share: string | number;
  total_shares: number;
  available_shares: number;
  status: ProjectStatus;
  created_at: string;
  is_token: boolean;
}

export interface Asset {
  id: string;
  title: Record<string, string> | string;
  description: Record<string, string> | string;
  price: number | string;
  image: Record<string, string> | string | null;
  status: 'DRAFT' | 'ACTIVE' | 'SOLD';
  is_unique: boolean;
  created_at: string;
  updated_at?: string;
  is_new: boolean;
  is_hidden: boolean;
}