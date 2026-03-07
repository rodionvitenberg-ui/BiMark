import { Project } from "./project";

export interface Wallet {
  id: string;
  balance: string | number;
}

export type TransactionType = "DEPOSIT" | "WITHDRAW" | "PURCHASE" | "REFERRAL_BONUS";
export type TransactionStatus = "PENDING" | "COMPLETED" | "FAILED";

export interface Transaction {
  id: string;
  transaction_type: TransactionType;
  amount: string | number;
  status: TransactionStatus;
  created_at: string;
}

export interface Ownership {
  id: string;
  project: Project; // Вложенный проект из бэкенда
  shares_amount: number;
  average_buy_price: string | number;
  created_at: string;
}