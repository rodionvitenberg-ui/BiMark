"use client";

import { useState, useRef, useEffect } from "react";
import { useTranslations, useLocale } from "next-intl";
import { useParams } from "next/navigation";
import Image from "next/image";
import { usePathname, useRouter, routing } from "../../i18n/routing";
import { 
  Globe, Wallet, User, LogOut, ChevronDown, 
  ShoppingCart, Search, Menu, X, ChevronRight, BookOpen, Handshake 
} from "lucide-react"; 
import { Link } from "../../i18n/routing";
import { useUser, useLogout } from "@/hooks/use-auth";
import { AnimatePresence, motion } from "framer-motion";
import MegaMenu from "./mega-menu";
import { useCart } from "@/hooks/use-cart"; 

const getLanguageName = (code: string) => {
  switch (code) {
    case "ru": return "Русский";
    case "en": return "English";
    case "es": return "Español";
    default: return code.toUpperCase();
  }
};

export function Header() {
  const t = useTranslations("Header");
  const locale = useLocale() as "ru" | "en" | "es";
  const router = useRouter();
  const pathname = usePathname();
  const params = useParams();
  
  const currentLocale = params.locale as string;
  const [activeMenu, setActiveMenu] = useState<string>("");
  const [searchQuery, setSearchQuery] = useState("");
  
  // Состояния для дропдаунов и мобильного меню
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isLangOpen, setIsLangOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  // Состояния аккордеонов внутри мобильного меню
  const [mobileBuyOpen, setMobileBuyOpen] = useState(false);
  const [mobileSellOpen, setMobileSellOpen] = useState(false);
  
  const [isMounted, setIsMounted] = useState(false);
  const cartItemsCount = useCart((state) => state.items.reduce((total, item) => total + item.quantity, 0));

  const profileRef = useRef<HTMLDivElement>(null);
  const langRef = useRef<HTMLDivElement>(null);

  const { data: user, isLoading } = useUser();
  const logoutMutation = useLogout();

  const isLight = activeMenu !== "";

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Блокируем скролл основной страницы при открытом мобильном меню
  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => { document.body.style.overflow = ""; };
  }, [isMobileMenuOpen]);

  const handleHeaderMouseLeave = () => {
    if (activeMenu === "search" && searchQuery.trim() !== "") {
      return; 
    }
    setActiveMenu("");
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      if (profileRef.current && !profileRef.current.contains(target)) {
        setIsProfileOpen(false);
      }
      if (langRef.current && !langRef.current.contains(target)) {
        setIsLangOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <header 
      onMouseLeave={handleHeaderMouseLeave}
      className={`fixed top-0 left-0 w-full z-50 transition-all duration-300 ${
        isLight 
          ? "bg-white/95 backdrop-blur-md text-brand-black border-b border-gray-200/80 shadow-sm" 
          : "bg-[#0a0f1c]/90 backdrop-blur-md text-white border-b border-white/5"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 h-18 flex items-center justify-between relative z-50 bg-transparent">
        
        {/* ЛЕВАЯ ЧАСТЬ: Логотип и Десктопная Навигация */}
        <div className="flex items-center gap-3 md:gap-8 shrink-0">
          <Link href="/" className="flex items-center shrink-0" onClick={() => { setActiveMenu(""); setIsMobileMenuOpen(false); }}>
            <Image 
              src={isLight ? "/logo-dark.png" : "/logo.png"}
              alt="BiMark Logo" 
              width={140}
              height={40}
              className="transition-opacity duration-300 w-26 md:w-[140px] h-auto" 
              priority 
            />
          </Link>

          <nav className="hidden md:flex items-center gap-6">
            <button 
              onMouseEnter={() => setActiveMenu("buy")}
              className={`text-md font-bold transition-colors cursor-pointer outline-none ${
                isLight ? "text-brand-black hover:text-brand-blue" : "text-gray-300 hover:text-white"
              } ${activeMenu === "buy" ? "text-brand-blue" : ""}`}
            >
              {locale === 'ru' ? "Купить бизнес" : "Buy Business"}
            </button>

            <button 
              onMouseEnter={() => setActiveMenu("sell")}
              className={`text-md font-bold transition-colors cursor-pointer outline-none ${
                isLight ? "text-brand-black hover:text-brand-blue" : "text-gray-300 hover:text-white"
              } ${activeMenu === "sell" ? "text-brand-blue" : ""}`}
            >
              {locale === 'ru' ? "Продать бизнес" : "Sell Business"}
            </button>
          </nav>
        </div>

        {/* ПРАВАЯ ЧАСТЬ (ДЕСКТОП): Локализация, Поиск, Корзина и Профиль */}
        <div className="hidden md:flex items-center gap-5 ml-auto shrink-0">
          <button
            onClick={() => {
              setActiveMenu(activeMenu === "search" ? "" : "search");
              setIsLangOpen(false);
              setIsProfileOpen(false);
            }}
            className={`p-1 transition-colors outline-none hover:text-brand-blue ${
              activeMenu === "search" ? "text-brand-blue" : isLight ? "text-gray-500" : "text-gray-300"
            }`}
          >
            <Search className="w-5.5 h-5.5" />
          </button>

          <div className="relative" ref={langRef}>
            <button 
              onClick={() => { setIsLangOpen(!isLangOpen); setActiveMenu(""); }}
              className={`flex items-center gap-1.5 transition-colors hover:opacity-80 outline-none ${isLight ? "text-brand-black" : "text-white"}`}
            >
              <Globe className={`w-5.5 h-5.5 ${isLight ? "text-gray-500" : "text-gray-300"}`} />
              <span className="text-sm font-bold uppercase tracking-wider">{currentLocale}</span>
            </button>

            <AnimatePresence>
              {isLangOpen && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  transition={{ duration: 0.15 }}
                  className="absolute right-0 mt-4 w-36 bg-white dark:bg-[#111827] rounded-xl shadow-lg border border-gray-200 dark:border-gray-800 py-2 overflow-hidden"
                >
                  {routing.locales.map((loc) => (
                    <button
                      key={loc}
                      onClick={() => {
                        router.replace(pathname, { locale: loc });
                        setIsLangOpen(false);
                      }}
                      className={`w-full text-left px-4 py-2 text-md transition-colors hover:bg-gray-50 dark:hover:bg-gray-800/50 ${
                        currentLocale === loc ? "font-bold text-brand-blue" : "text-gray-700 dark:text-gray-300"
                      }`}
                    >
                      {getLanguageName(loc)}
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <Link 
            href="/checkout" 
            className={`relative flex items-center justify-center transition-colors hover:text-brand-blue ${isLight ? "text-brand-black" : "text-white"}`}
          >
            <ShoppingCart className="w-5.5 h-5.5" />
            {isMounted && cartItemsCount > 0 && (
              <motion.span 
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="absolute -top-1.5 -right-1.5 flex h-4.5 w-4.5 items-center justify-center rounded-full bg-brand-blue text-[9px] font-black text-white shadow-sm"
              >
                {cartItemsCount}
              </motion.span>
            )}
          </Link>

          <div className="w-px h-5 bg-gray-200 dark:bg-gray-800"></div>

          <div className="flex items-center gap-4">
            {isLoading ? (
              <div className="h-9 w-24 bg-gray-200 dark:bg-gray-800 animate-pulse rounded-lg"></div>
            ) : user ? (
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2 text-xs font-black px-3 py-1.5 rounded-lg border bg-slate-50 text-slate-800 border-slate-100 dark:bg-slate-900 dark:text-white dark:border-white/5">
                  <Wallet className="w-4 h-4 text-green-500 shrink-0" />
                  <span>${user.balance}</span>
                </div>
                
                <div className="relative" ref={profileRef}>
                  <button 
                    onClick={() => { setIsProfileOpen(!isProfileOpen); setActiveMenu(""); }}
                    className={`flex items-center gap-2 text-sm font-medium transition-colors outline-none ${isLight ? "hover:text-brand-blue text-slate-800" : "hover:text-gray-300 text-white"}`}
                  >
                    <div className="w-8 h-8 text-sm rounded-full flex items-center justify-center font-black bg-brand-blue text-white dark:bg-white dark:text-brand-black">
                      {user.email.charAt(0).toUpperCase()}
                    </div>
                    <span className="font-bold text-sm">{user.email.split("@")[0]}</span>
                    <ChevronDown className={`w-3.5 h-3.5 transition-transform ${isProfileOpen ? "rotate-180" : ""}`} />
                  </button>

                  <AnimatePresence>
                    {isProfileOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 10 }}
                        transition={{ duration: 0.15 }}
                        className="absolute right-0 mt-4 w-48 bg-white dark:bg-[#111827] rounded-xl shadow-lg border border-gray-200 dark:border-gray-800 py-2 overflow-hidden"
                      >
                        <Link href="/dashboard" onClick={() => setIsProfileOpen(false)} className="flex items-center gap-2 px-4 py-2 text-md text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                          <User className="w-4 h-4" /> {t("dashboard")}
                        </Link>
                        <Link href="/profile" onClick={() => setIsProfileOpen(false)} className="flex items-center gap-2 px-4 py-2 text-md text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                          <User className="w-4 h-4" /> {t("profile")}
                        </Link>
                        <button 
                          onClick={() => { setIsProfileOpen(false); logoutMutation.mutate(); }}
                          disabled={logoutMutation.isPending}
                          className="w-full flex items-center gap-2 px-4 py-2 text-md text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors text-left mt-1 border-t border-gray-100 dark:border-gray-800 pt-2 cursor-pointer"
                        >
                          <LogOut className="w-4 h-4" /> {t("logout")}
                        </button>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            ) : (
              <>
                <Link href="/login" className={`text-md font-bold whitespace-nowrap transition-colors ${isLight ? "text-brand-black hover:text-brand-blue" : "text-white hover:text-gray-300"}`}>
                  {t("login")}
                </Link>
                <Link href="/register" className="bg-brand-blue text-white text-md font-bold px-5 py-2 rounded-xl hover:bg-[#007cbd] transition-colors whitespace-nowrap shadow-sm">
                  {t("register")}
                </Link>
              </>
            )}
          </div>
        </div>

        {/* ========================================================================= */}
        {/* 📱 МОБИЛЬНЫЙ ИНТЕРФЕЙС ШАПКИ (Элементы управления справа) */}
        {/* ========================================================================= */}
        <div className="flex md:hidden items-center gap-4 shrink-0">
          {/* Поиск */}
          <button
            onClick={() => {
              setActiveMenu(activeMenu === "search" ? "" : "search");
              setIsMobileMenuOpen(false);
            }}
            className={`p-1 outline-none transition-colors ${activeMenu === "search" ? "text-brand-blue" : isLight ? "text-brand-black" : "text-gray-300"}`}
          >
            <Search className="w-6 h-6" />
          </button>

          {/* Корзина (Критически важна для конверсии) */}
          <Link href="/checkout" className={`relative p-1 ${isLight ? "text-brand-black" : "text-white"}`}>
            <ShoppingCart className="w-6 h-6" />
            {isMounted && cartItemsCount > 0 && (
              <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-brand-blue text-[9px] font-black text-white">
                {cartItemsCount}
              </span>
            )}
          </Link>

          {/* Бургер-переключатель */}
          <button
            onClick={() => {
              setIsMobileMenuOpen(!isMobileMenuOpen);
              setActiveMenu("");
            }}
            className={`p-1 outline-none transition-colors ${isLight ? "text-brand-black" : "text-white"}`}
          >
            {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

      </div>

      {/* ========================================================================= */}
      {/* 📱 МОБИЛЬНОЕ ВЫДВИЖНОЕ МЕНЮ (DRAWER) В СТИЛЕ ЛИНЕЙНОГО ДИЗАЙНА */}
      {/* ========================================================================= */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.25, ease: "easeInOut" }}
            className="fixed top-18 left-0 w-full h-[calc(100vh-4.5rem)] bg-[#0a0f1c] text-white z-40 flex flex-col justify-between overflow-y-auto border-t border-white/5"
          >
            <div className="p-6 space-y-8 flex-1">
              
              {/* Авт/Профиль пользователя на мобилке */}
              {user ? (
                <div className="bg-white/5 rounded-2xl p-4 border border-white/5 space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-brand-blue text-white flex items-center justify-center font-black text-sm">
                        {user.email.charAt(0).toUpperCase()}
                      </div>
                      <div className="flex flex-col">
                        <span className="font-bold text-sm text-white">{user.email.split("@")[0]}</span>
                        <span className="text-xs text-gray-400 truncate max-w-[160px]">{user.email}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5 bg-green-500/10 border border-green-500/20 px-2.5 py-1 rounded-xl text-xs font-black text-green-400">
                      <Wallet className="w-3.5 h-3.5" />
                      <span>${user.balance}</span>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-2 pt-2 border-t border-white/5">
                    <Link href="/dashboard" onClick={() => setIsMobileMenuOpen(false)} className="flex items-center justify-center gap-2 py-2.5 bg-white/5 rounded-xl text-xs font-bold text-gray-200 hover:bg-white/10 transition-all">
                      <User className="w-3.5 h-3.5" /> {t("dashboard")}
                    </Link>
                    <button onClick={() => { setIsMobileMenuOpen(false); logoutMutation.mutate(); }} className="flex items-center justify-center gap-2 py-2.5 bg-red-500/10 rounded-xl text-xs font-bold text-red-400 hover:bg-red-500/20 transition-all cursor-pointer">
                      <LogOut className="w-3.5 h-3.5" /> {t("logout")}
                    </button>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-3">
                  <Link href="/login" onClick={() => setIsMobileMenuOpen(false)} className="flex items-center justify-center py-3.5 border border-white/10 rounded-xl text-sm font-bold text-white bg-white/5">
                    {t("login")}
                  </Link>
                  <Link href="/register" onClick={() => setIsMobileMenuOpen(false)} className="flex items-center justify-center py-3.5 bg-brand-blue rounded-xl text-sm font-bold text-white">
                    {t("register")}
                  </Link>
                </div>
              )}

              {/* Навигационные группы (Аккордеоны) */}
              <div className="space-y-4">
                
                {/* Аккордеон: Купить бизнес */}
                <div className="border-b border-white/5 pb-2">
                  <button 
                    onClick={() => setMobileBuyOpen(!mobileBuyOpen)}
                    className="w-full flex items-center justify-between py-2 text-lg font-bold text-white outline-none"
                  >
                    <span>{locale === 'ru' ? "Купить бизнес" : "Buy Business"}</span>
                    <ChevronDown className={`w-5 h-5 text-gray-400 transition-transform duration-200 ${mobileBuyOpen ? "rotate-180" : ""}`} />
                  </button>
                  <AnimatePresence initial={false}>
                    {mobileBuyOpen && (
                      <motion.div 
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden pl-2 space-y-3 pt-2"
                      >
                        <Link href="/assets" onClick={() => setIsMobileMenuOpen(false)} className="flex items-center justify-between py-1.5 text-sm text-gray-400 font-medium">
                          <span>{locale === 'ru' ? "Магазин готового бизнеса" : "Business Marketplace"}</span>
                          <ChevronRight className="w-4 h-4 opacity-40" />
                        </Link>
                        <Link href="/token" onClick={() => setIsMobileMenuOpen(false)} className="flex items-center justify-between py-1.5 text-sm text-gray-400 font-medium">
                          <span>{t("presales")}</span>
                          <ChevronRight className="w-4 h-4 opacity-40" />
                        </Link>
                        <Link href="/how-it-works" onClick={() => setIsMobileMenuOpen(false)} className="flex items-center justify-between py-1.5 text-sm text-gray-400 font-medium">
                          <span>{t("howItWorks")}</span>
                          <ChevronRight className="w-4 h-4 opacity-40" />
                        </Link>
                        <Link href="/blog" onClick={() => setIsMobileMenuOpen(false)} className="flex items-center justify-between py-1.5 text-sm text-gray-400 font-medium">
                          <span>{locale === 'ru' ? "Академия и Аналитика" : "Knowledge Base"}</span>
                          <ChevronRight className="w-4 h-4 opacity-40" />
                        </Link>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* Аккордеон: Продать бизнес */}
                <div className="border-b border-white/5 pb-2">
                  <button 
                    onClick={() => setMobileSellOpen(!mobileSellOpen)}
                    className="w-full flex items-center justify-between py-2 text-lg font-bold text-white outline-none"
                  >
                    <span>{locale === 'ru' ? "Продать бизнес" : "Sell Business"}</span>
                    <ChevronDown className={`w-5 h-5 text-gray-400 transition-transform duration-200 ${mobileSellOpen ? "rotate-180" : ""}`} />
                  </button>
                  <AnimatePresence initial={false}>
                    {mobileSellOpen && (
                      <motion.div 
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden pl-2 space-y-3 pt-2"
                      >
                        <Link href="/raise-capital" onClick={() => setIsMobileMenuOpen(false)} className="flex items-center justify-between py-1.5 text-sm text-gray-400 font-medium">
                          <span>{t("raiseCapital")}</span>
                          <ChevronRight className="w-4 h-4 opacity-40" />
                        </Link>
                        <Link href="/referral" onClick={() => setIsMobileMenuOpen(false)} className="flex items-center justify-between py-1.5 text-sm text-gray-400 font-medium">
                          <span>{t("referralSystem")}</span>
                          <ChevronRight className="w-4 h-4 opacity-40" />
                        </Link>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

              </div>
            </div>

            {/* Локализация (Переключатель языков) в самом низу мобильного меню */}
            <div className="p-6 bg-[#0d1527] border-t border-white/5 space-y-3 shrink-0">
              <span className="text-[10px] font-black uppercase tracking-wider text-gray-500 flex items-center gap-1.5">
                <Globe className="w-3.5 h-3.5" /> {locale === 'ru' ? "Язык платформы" : "Language"}
              </span>
              <div className="grid grid-cols-3 gap-2">
                {routing.locales.map((loc) => (
                  <button
                    key={loc}
                    onClick={() => {
                      router.replace(pathname, { locale: loc });
                      setIsMobileMenuOpen(false);
                    }}
                    className={`py-2 text-xs font-bold rounded-xl border transition-all ${
                      currentLocale === loc 
                        ? "bg-brand-blue border-brand-blue text-white shadow-sm" 
                        : "bg-white/5 border-white/5 text-gray-400"
                    }`}
                  >
                    {getLanguageName(loc).split(" ")[0]}
                  </button>
                ))}
              </div>
            </div>

          </motion.div>
        )}
      </AnimatePresence>

      {/* Мега-меню для ПК */}
      <AnimatePresence mode="wait">
        {activeMenu !== "" && (
          <MegaMenu 
            activeMenu={activeMenu} 
            onClose={() => setActiveMenu("")}
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery} 
          />
        )}
      </AnimatePresence>
    </header>
  );
}