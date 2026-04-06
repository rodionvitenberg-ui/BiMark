"use client";

import { useTranslations } from "next-intl";
import { motion, AnimatePresence } from "framer-motion";
import { XCircle, AlertCircle } from "lucide-react";

interface WithdrawModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (e: React.FormEvent) => void;
  amount: string | number;
  setAmount: (val: string) => void;
  address: string;
  setAddress: (val: string) => void;
  isLoading: boolean;
  error?: string | null;
}

export function WithdrawModal({ isOpen, onClose, onSubmit, amount, setAmount, address, setAddress, isLoading, error }: WithdrawModalProps) {
  const t = useTranslations("Modals");

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-brand-black/40 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="bg-white rounded-3xl p-6 md:p-8 w-full max-w-md shadow-2xl relative"
          >
            <button onClick={onClose} className="absolute top-6 right-6 text-gray-400 hover:text-brand-black transition-colors">
              <XCircle className="w-6 h-6" />
            </button>
            
            <h3 className="text-2xl font-bold mb-6 text-brand-black">{t("withdrawTitle")}</h3>
            
            <form onSubmit={onSubmit}>
              <div className="mb-4">
                <label className="block text-sm font-bold text-gray-700 mb-2">{t("withdrawAmount")}</label>
                <input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  disabled={isLoading}
                  className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-brand-blue outline-none text-lg font-semibold"
                  placeholder="100"
                  min="1"
                  step="0.01"
                />
              </div>

              <div className="mb-6">
                <label className="block text-sm font-bold text-gray-700 mb-2">{t("withdrawAddress")}</label>
                <input
                  type="text"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  disabled={isLoading}
                  className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-brand-blue outline-none font-mono text-sm"
                  placeholder="T..."
                />
              </div>

              {error && (
                <div className="mb-6 p-3 bg-red-50 text-red-600 text-sm rounded-lg flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              <div className="flex gap-3">
                <button type="button" onClick={onClose} className="flex-1 py-3 px-4 bg-gray-100 font-semibold rounded-xl hover:bg-gray-200 transition-colors">
                  {t("cancel")}
                </button>
                <button type="submit" disabled={isLoading || !amount || Number(amount) <= 0 || !address} className="flex-1 py-3 px-4 bg-brand-blue text-white font-semibold rounded-xl hover:bg-[#007cbd] transition-colors disabled:opacity-50">
                  {isLoading ? t("processing") : t("submitWithdraw")}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}