"use client";

import { useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, X } from "lucide-react";
import { useTranslations } from "next-intl";

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function SearchModal({ isOpen, onClose }: SearchModalProps) {
  const t = useTranslations("Header");
  const inputRef = useRef<HTMLInputElement>(null);

  // Закрытие по клавише Esc
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    if (isOpen) {
      window.addEventListener("keydown", handleKeyDown);
      // Небольшая задержка для фокуса после анимации
      setTimeout(() => inputRef.current?.focus(), 100); 
    }
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Затемнение фона */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100]"
            onClick={onClose}
          />
          
          {/* Сама модалка */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -10 }}
            transition={{ duration: 0.2 }}
            className="fixed top-[15%] left-1/2 -translate-x-1/2 w-full max-w-2xl bg-white dark:bg-[#111827] rounded-2xl shadow-2xl z-[101] overflow-hidden border border-gray-200 dark:border-gray-800"
          >
            <div className="flex items-center px-6 py-4 border-b border-gray-100 dark:border-gray-800">
              <Search className="w-5 h-5 text-gray-400" />
              <input
                ref={inputRef}
                type="text"
                placeholder={t("searchPlaceholder")}
                className="flex-1 bg-transparent border-none outline-none px-4 text-lg text-brand-black dark:text-white placeholder:text-gray-400"
              />
              <button 
                onClick={onClose} 
                className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors text-gray-500"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            {/* Блок с быстрыми ссылками / подсказками */}
            <div className="p-6 bg-gray-50 dark:bg-[#0a0f1c]/50">
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
                {t("popularSearches")}
              </p>
              <div className="flex flex-wrap gap-2">
                <button className="px-4 py-2 bg-white dark:bg-[#111827] rounded-xl text-sm font-medium border border-gray-200 dark:border-gray-800 hover:border-brand-blue dark:hover:border-brand-blue transition-colors">
                  {t("realEstate")}
                </button>
                <button className="px-4 py-2 bg-white dark:bg-[#111827] rounded-xl text-sm font-medium border border-gray-200 dark:border-gray-800 hover:border-brand-blue dark:hover:border-brand-blue transition-colors">
                  {t("startups")}
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}