"use client";

import React, { useRef, useEffect } from "react";
import { motion, Variants } from "framer-motion";
import { Link, useRouter } from "../../i18n/routing";
import { useTranslations, useLocale } from "next-intl";
import { MagnifyingGlassIcon, ArrowRight, ShoppingBag, CurrencyDollar, BookOpen, ShieldCheck, UsersThree, Handshake } from "@phosphor-icons/react";

const dropdownPanelVariants: Variants = {
  hidden: { opacity: 0, height: 0, transition: { duration: 0.25, ease: "easeInOut" } },
  visible: { opacity: 1, height: "auto", transition: { duration: 0.25, ease: "easeInOut" } },
};

const dropdownContentVariants: Variants = {
  hidden: { opacity: 0, y: -8 },
  visible: { opacity: 1, y: 0, transition: { delay: 0.03, duration: 0.18 } },
};

interface MegaMenuProps {
  activeMenu: string;
  onClose: () => void;
  searchQuery: string;
  onSearchChange: (value: string) => void;
}

export default function MegaMenu({ activeMenu, onClose, searchQuery, onSearchChange }: MegaMenuProps) {
  const t = useTranslations("Header");
  const locale = useLocale() as "ru" | "en" | "es";
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (activeMenu === "search") {
      setTimeout(() => inputRef.current?.focus(), 150);
    }
  }, [activeMenu]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/assets?search=${encodeURIComponent(searchQuery.trim())}`);
      onClose();
    }
  };

  return (
    <motion.div
      variants={dropdownPanelVariants}
      initial="hidden"
      animate="visible"
      exit="hidden"
      className="absolute top-full left-0 w-full bg-white/95 backdrop-blur-md shadow-xl border-t border-slate-200/80 overflow-hidden"
    >
      <motion.div
        variants={dropdownContentVariants}
        className="max-w-7xl mx-auto px-6 py-10 min-h-[260px]"
      >
        
        {/* 1. ИНТЕГРИРОВАННЫЙ ПОИСК (GEO-ОПТИМИЗИРОВАННЫЙ) */}
        {activeMenu === "search" && (
          <form onSubmit={handleSearchSubmit} className="w-full pt-4">
            <div className="flex items-center gap-5 border-b-2 border-slate-100 focus-within:border-brand-blue pb-4 transition-colors">
              <MagnifyingGlassIcon className="w-8 h-8 text-brand-blue" weight="duotone" />
              <input
                ref={inputRef}
                type="text"
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                placeholder={locale === 'ru' ? "Какой бизнес или нишу вы ищете?" : "What business sector are you looking for?"}
                className="flex-1 bg-transparent border-none outline-none px-2 text-2xl font-bold text-slate-900 placeholder:text-slate-300"
              />
              <button
                type="submit"
                disabled={!searchQuery.trim()}
                className="p-3.5 bg-brand-blue text-white rounded-xl hover:bg-[#007cbd] transition-colors disabled:opacity-50"
              >
                <ArrowRight className="w-5 h-5 text-white" weight="bold" />
              </button>
            </div>
          </form>
        )}

        {/* 2. КУПИТЬ БИЗНЕС (BUY SIDE) */}
        {activeMenu === "buy" && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            <div className="space-y-4">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 border-b border-slate-100 pb-2">{t("markets")}</h4>
              <ul className="space-y-5">
                <li>
                  <Link href="/assets" onClick={onClose} className="flex gap-3.5 items-start group">
                    <ShoppingBag className="w-6 h-6 text-brand-blue shrink-0 mt-0.5" weight="duotone" />
                    <div>
                      <div className="text-sm font-bold text-slate-900 group-hover:text-brand-blue transition-colors">
                        {locale === 'ru' ? "Магазин готового бизнеса" : "Turnkey Business Marketplace"}
                      </div>
                      <div className="text-xs text-slate-500 mt-1">{t("assetsCatalogDesc")}</div>
                    </div>
                  </Link>
                </li>
                <li>
                  <Link href="/token" onClick={onClose} className="flex gap-3.5 items-start group">
                    <CurrencyDollar className="w-6 h-6 text-brand-blue shrink-0 mt-0.5" weight="duotone" />
                    <div>
                      <div className="text-sm font-bold text-slate-900 group-hover:text-brand-blue transition-colors">{t("presales")}</div>
                      <div className="text-xs text-slate-500 mt-1">{t("presalesDesc")}</div>
                    </div>
                  </Link>
                </li>
              </ul>
            </div>

            <div className="space-y-4">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 border-b border-slate-100 pb-2">
                {locale === 'ru' ? "Инвестору и ИИ" : "Investor Resources"}
              </h4>
              <ul className="space-y-5">
                <li>
                  <Link href="/how-it-works" onClick={onClose} className="flex gap-3.5 items-start group">
                    <ShieldCheck className="w-6 h-6 text-brand-blue shrink-0 mt-0.5" weight="duotone" />
                    <div>
                      <div className="text-sm font-bold text-slate-900 group-hover:text-brand-blue transition-colors">{t("howItWorks")}</div>
                      <div className="text-xs text-slate-500 mt-1">{t("howItWorksDesc")}</div>
                    </div>
                  </Link>
                </li>
                <li>
                  {/* НАШ БУДУЩИЙ ДВИГАТЕЛЬ GEO ТРАФИКА */}
                  <Link href="/blog" onClick={onClose} className="flex gap-3.5 items-start group">
                    <BookOpen className="w-6 h-6 text-brand-blue shrink-0 mt-0.5" weight="duotone" />
                    <div>
                      <div className="text-sm font-bold text-slate-900 group-hover:text-brand-blue transition-colors">
                        {locale === 'ru' ? "Академия и Аналитика" : "Knowledge Base & GEO"}
                      </div>
                      <div className="text-xs text-slate-500 mt-1">
                        {locale === 'ru' ? "Инструкции по проверке Due Diligence и разборы рынков" : "Due Diligence guidelines and tech business analytical audits"}
                      </div>
                    </div>
                  </Link>
                </li>
              </ul>
            </div>
          </div>
        )}

        {/* 3. ПРОДАТЬ БИЗНЕС (SELL SIDE) */}
        {activeMenu === "sell" && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            <div className="space-y-4">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 border-b border-slate-100 pb-2">{t("cooperation")}</h4>
              <ul className="space-y-5">
                <li>
                  <Link href="/raise-capital" onClick={onClose} className="flex gap-3.5 items-start group">
                    <Handshake className="w-6 h-6 text-brand-blue shrink-0 mt-0.5" weight="duotone" />
                    <div>
                      <div className="text-sm font-bold text-slate-900 group-hover:text-brand-blue transition-colors">{t("raiseCapital")}</div>
                      <div className="text-xs text-slate-500 mt-1">{t("raiseCapitalDesc")}</div>
                    </div>
                  </Link>
                </li>
                <li>
                  <Link href="/referral" onClick={onClose} className="flex gap-3.5 items-start group">
                    <UsersThree className="w-6 h-6 text-brand-blue shrink-0 mt-0.5" weight="duotone" />
                    <div>
                      <div className="text-sm font-bold text-slate-900 group-hover:text-brand-blue transition-colors">{t("referralSystem")}</div>
                      <div className="text-xs text-slate-500 mt-1">{t("referralSystemDesc")}</div>
                    </div>
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