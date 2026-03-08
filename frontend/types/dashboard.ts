import { Project } from "./project";

export interface Wallet {
  id: string;
  balance: string | number;
}

export type TransactionType = "DEPOSIT" | "WITHDRAW" | "PURCHASE" | "REFERRAL_BONUS";
export type TransactionStatus = "PENDING" | "COMPLETED" | "FAILED";

export interface Transaction {
  id: string;
  // Обрати внимание: если бэкенд отдает поле как 'type', а не 'transaction_type', 
  // то в интерфейсе должно быть type, и в компоненте тоже нужно заменить tx.transaction_type на tx.type
  transaction_type: "DEPOSIT" | "WITHDRAWAL" | "PURCHASE" | "REFERRAL"; 
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