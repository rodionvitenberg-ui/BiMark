import { Project, Asset } from "./project";

export interface Wallet {
  id: string;
  balance: string | number;
  company_wallet?: string;
}

export type TransactionType = "DEPOSIT" | "WITHDRAW" | "PURCHASE" | "PURCHASE_ASSET" | "REFERRAL_BONUS";
export type TransactionStatus = "PENDING" | "COMPLETED" | "FAILED";

export interface Transaction {
  id: string;
  transaction_type: "DEPOSIT" | "WITHDRAWAL" | "PURCHASE" | "PURCHASE_ASSET" | "REFERRAL"; 
  amount: number | string;
  status: "PENDING" | "COMPLETED" | "FAILED";
  created_at: string;
  description?: string;
}

export interface Ownership {
  id: string;
  project: Project; // Вложенный проект из бэкенда
  shares_amount: number;
  average_buy_price: string | number;
  created_at: string;
}

export interface AssetOwnership {
  id: string;
  asset: Asset; 
  purchase_price: string | number;
  purchased_at: string;
}