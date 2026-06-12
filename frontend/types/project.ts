// frontend/types/project.ts

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
  updated_at?: string;
  is_token: boolean;
}

// --- НОВЫЕ СТРУКТУРЫ ДАННЫХ ДЛЯ АССЕТОВ ---

export interface AssetCategory {
  id: string;
  slug: string;
  name: LocalizedString;
  image: string | null;
  is_hidden: boolean;
}

export interface AssetTag {
  id: string;
  slug: string;
  name: LocalizedString;
  color: string;
  show_on_card: boolean;
}

export interface AssetMetricValue {
  metric_name: LocalizedString;
  icon: string;
  show_on_card: boolean;
  value: LocalizedString;
}

export interface Asset {
  id: string;
  title: LocalizedString | string;
  short_description: LocalizedString | string; // Добавили короткое описание лота
  description: LocalizedString | string;
  price: number | string;
  image: LocalizedString | string | null;
  status: 'DRAFT' | 'ACTIVE' | 'SOLD';
  is_unique: boolean;
  created_at: string;
  updated_at?: string;
  is_new: boolean;
  is_hidden: boolean;
  
  // Добавленные связные сущности из бэкенда
  category?: AssetCategory | null;
  tags?: AssetTag[];
  metrics?: AssetMetricValue[];
}