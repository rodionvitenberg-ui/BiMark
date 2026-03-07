"use client";

import React, { useRef, useEffect } from "react";
import { motion, Variants } from "framer-motion";
import { Link, useRouter } from "../../i18n/routing";
import { useTranslations } from "next-intl";
import { Search, ArrowRight } from "lucide-react";

const dropdownPanelVariants: Variants = {
  hidden: { opacity: 0, height: 0, transition: { duration: 0.3, ease: "easeInOut" } },
  visible: { opacity: 1, height: "auto", transition: { duration: 0.3, ease: "easeInOut" } },
};

const dropdownContentVariants: Variants = {
  hidden: { opacity: 0, y: -10 },
  visible: { opacity: 1, y: 0, transition: { delay: 0.05, duration: 0.2 } },
};

interface MegaMenuProps {
  activeMenu: string;
  onClose: () => void;
  searchQuery: string;
  onSearchChange: (value: string) => void;
}

export default function MegaMenu({ activeMenu, onClose, searchQuery, onSearchChange }: MegaMenuProps) {
  const t = useTranslations("Header");
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);

  // Автофокус на поле ввода при открытии меню поиска
  useEffect(() => {
    if (activeMenu === "search") {
      setTimeout(() => inputRef.current?.focus(), 150);
    }
  }, [activeMenu]);

  // Обработчик отправки формы (по Enter или клику на стрелку)
  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
      onClose();
    }
  };

  return (
    <motion.div
      variants={dropdownPanelVariants}
      initial="hidden"
      animate="visible"
      exit="hidden"
      className="absolute top-full left-0 w-full bg-white shadow-xl border-t border-gray-100 overflow-hidden"
    >
      <motion.div
        variants={dropdownContentVariants}
        // ВАЖНО: Добавлен класс min-h-[280px], который гарантирует, 
        // что высота белого фона будет одинаковой для всех трех вкладок
        className="max-w-7xl mx-auto px-4 py-8 min-h-[280px]"
      >
        
        {/* КОНТЕНТ ДЛЯ ПОИСКА */}
        {activeMenu === "search" && (
          <form onSubmit={handleSearchSubmit} className="w-full pt-2">
            <div className="flex items-center gap-4 border-b-2 border-gray-100 focus-within:border-brand-blue pb-4 transition-colors">
              <Search className="w-8 h-8 text-brand-blue" />
              <input
                ref={inputRef}
                type="text"
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                placeholder={t("integratedSearchPlaceholder")}
                className="flex-1 bg-transparent border-none outline-none px-2 text-3xl font-bold text-gray-900 placeholder:text-gray-300"
              />
              <button
                type="submit"
                disabled={!searchQuery.trim()}
                className="p-3 bg-brand-blue text-white rounded-xl hover:bg-[#007cbd] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ArrowRight className="w-6 h-6" />
              </button>
            </div>
          </form>
        )}

        {/* КОНТЕНТ ДЛЯ ИНВЕСТОРОВ */}
        {activeMenu === "investors" && (
          <div className="flex gap-16">
            <div className="w-[300px] space-y-4">
              <h4 className="text-sm font-semibold text-gray-900 border-b pb-2">{t("markets")}</h4>
              <ul className="space-y-4">
                <li>
                  <Link href="/category" onClick={onClose} className="block group">
                    <div className="text-sm font-bold text-gray-900 group-hover:text-brand-blue transition-colors">{t("assetsCatalog")}</div>
                    <div className="text-xs text-gray-500 mt-1">{t("assetsCatalogDesc")}</div>
                  </Link>
                </li>
                <li>
                  <Link href="#" onClick={onClose} className="block group">
                    <div className="text-sm font-bold text-gray-900 group-hover:text-brand-blue transition-colors">{t("presales")}</div>
                    <div className="text-xs text-gray-500 mt-1">{t("presalesDesc")}</div>
                  </Link>
                </li>
              </ul>
            </div>
            <div className="w-[300px] space-y-4">
              <h4 className="text-sm font-semibold text-gray-900 border-b pb-2">{t("information")}</h4>
              <ul className="space-y-4">
                <li>
                  <Link href="#" onClick={onClose} className="block group">
                    <div className="text-sm font-bold text-gray-900 group-hover:text-brand-blue transition-colors">{t("howItWorks")}</div>
                    <div className="text-xs text-gray-500 mt-1">{t("howItWorksDesc")}</div>
                  </Link>
                </li>
              </ul>
            </div>
          </div>
        )}

        {/* КОНТЕНТ ДЛЯ ПАРТНЕРОВ */}
        {activeMenu === "businesses" && (
          <div className="flex gap-16">
            <div className="w-[300px] space-y-4">
              <h4 className="text-sm font-semibold text-gray-900 border-b pb-2">{t("cooperation")}</h4>
              <ul className="space-y-4">
                <li>
                  <Link href="#" onClick={onClose} className="block group">
                    <div className="text-sm font-bold text-gray-900 group-hover:text-brand-blue transition-colors">{t("raiseCapital")}</div>
                    <div className="text-xs text-gray-500 mt-1">{t("raiseCapitalDesc")}</div>
                  </Link>
                </li>
                <li>
                  <Link href="#" onClick={onClose} className="block group">
                    <div className="text-sm font-bold text-gray-900 group-hover:text-brand-blue transition-colors">{t("referralSystem")}</div>
                    <div className="text-xs text-gray-500 mt-1">{t("referralSystemDesc")}</div>
                  </Link>
                </li>
              </ul>
            </div>
          </div>
        )}

      </motion.div>
    </motion.div>
  );
}