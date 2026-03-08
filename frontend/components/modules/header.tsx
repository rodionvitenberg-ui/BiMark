"use client";

import { useState, useRef, useEffect } from "react";
import { useTranslations } from "next-intl";
import { useParams } from "next/navigation";
import Image from "next/image";
import { usePathname, useRouter, routing } from "../../i18n/routing";
import { Globe, Wallet, User, LogOut, ChevronDown, ShoppingCart } from "lucide-react"; // Добавили ShoppingCart
import { Link } from "../../i18n/routing";
import { useUser, useLogout } from "@/hooks/use-auth";
import { AnimatePresence, motion } from "framer-motion";
import MegaMenu from "./mega-menu";
import { useCart } from "@/hooks/use-cart"; // Подключили Zustand стор

// Вспомогательная функция для отображения названия языка
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
  const router = useRouter();
  const pathname = usePathname();
  const params = useParams();
  
  const currentLocale = params.locale as string;
  const [activeMenu, setActiveMenu] = useState<string>("");
  
  // Состояние для текста интегрированного поиска
  const [searchQuery, setSearchQuery] = useState("");
  
  // Состояния для дропдаунов
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isLangOpen, setIsLangOpen] = useState(false);
  
  // Состояния корзины
  const [isMounted, setIsMounted] = useState(false);
  const cartItemsCount = useCart((state) => state.items.reduce((total, item) => total + item.shares_amount, 0));

  const profileRef = useRef<HTMLDivElement>(null);
  const langRef = useRef<HTMLDivElement>(null);

  const { data: user, isLoading } = useUser();
  const logoutMutation = useLogout();

  const isLight = activeMenu !== "";

  // Предотвращаем Hydration Mismatch: рендерим данные localStorage только на клиенте
  useEffect(() => {
    setIsMounted(true);
  }, []);

  // "Умное" закрытие мегаменю при уводе курсора с шапки
  const handleHeaderMouseLeave = () => {
    // Если открыт поиск и там введен текст — блокируем автоматическое закрытие
    if (activeMenu === "search" && searchQuery.trim() !== "") {
      return; 
    }
    setActiveMenu("");
  };

  // Закрытие по клавише ESC (включая принудительное закрытие поиска)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setActiveMenu("");
      }
    };
    if (activeMenu !== "") {
      window.addEventListener("keydown", handleKeyDown);
    }
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [activeMenu]);

  // Закрытие мини-дропдаунов (Профиль, Языки) при клике вне их области
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

  // НОВЫЙ ХУК: Закрываем профиль и языки при открытии мегаменю
  useEffect(() => {
    if (activeMenu !== "") {
      setIsProfileOpen(false);
      setIsLangOpen(false);
    }
  }, [activeMenu]);

  return (
    <header 
      onMouseLeave={handleHeaderMouseLeave}
      className={`fixed top-0 left-0 w-full z-50 transition-colors duration-300 ${
        isLight 
          ? "bg-white text-brand-black border-b border-gray-200 shadow-sm" 
          : "bg-[#0a0f1c] text-white border-b border-transparent"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 h-18 flex items-center justify-between">
        
        {/* ЛЕВАЯ ЧАСТЬ: Логотип и Навигация (с Поиском) */}
        <div className="flex items-center gap-8">
          
          <Link href="/" className="flex items-center" onClick={() => setActiveMenu("")}>
            {/* Используем подмену src вместо CSS-фильтра */}
            <Image 
              src={isLight ? "/logo-dark.png" : "/logo.png"}
              alt="Platform Logo" 
              width={140}
              height={40}
              className="transition-opacity duration-300"
              priority 
            />
          </Link>

          <nav className="hidden md:flex items-center gap-6">
            {/* КНОПКА ПОИСКА: Сдвинута влево, только иконка, открывает мегаменю */}
            {/* <button 
              onMouseEnter={() => setActiveMenu("search")}
              className={`flex items-center justify-center transition-colors cursor-pointer ${
                isLight ? "text-brand-black hover:text-brand-blue" : "text-gray-300 hover:text-white"
              } ${activeMenu === "search" ? "text-brand-blue dark:text-brand-blue" : ""}`}
              aria-label={t("search")}
            >
              <Search className="w-7 h-7" />
            </button> */}

            <button 
              onMouseEnter={() => setActiveMenu("investors")}
              className={`text-md font-medium transition-colors cursor-pointer ${
                isLight ? "text-brand-black hover:text-brand-blue" : "text-gray-300 hover:text-white"
              } ${activeMenu === "investors" ? "text-brand-blue" : ""}`}
            >
              {t("investors")}
            </button>

            <button 
              onMouseEnter={() => setActiveMenu("businesses")}
              className={`text-md font-medium transition-colors cursor-pointer ${
                isLight ? "text-brand-black hover:text-brand-blue" : "text-gray-300 hover:text-white"
              } ${activeMenu === "businesses" ? "text-brand-blue" : ""}`}
            >
              {t("partners")}
            </button>
          </nav>
        </div>

        {/* ПРАВАЯ ЧАСТЬ: Локализация и Профиль */}
        <div className="flex items-center gap-4 ml-auto">

          <div className="relative" ref={langRef}>
            <button 
              onClick={() => {setIsLangOpen(!isLangOpen); setActiveMenu("");}}
              className={`z-60 flex items-center gap-1.5 transition-colors hover:opacity-80 ${isLight ? "text-brand-black" : "text-white"}`}
            >
              <Globe className={`w-7 h-7 ${isLight ? "text-gray-500" : "text-gray-300"}`} />
              <span className="text-md font-medium uppercase">{currentLocale}</span>
            </button>

            <AnimatePresence>
              {isLangOpen && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  transition={{ duration: 0.2 }}
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

          {/* ИНТЕГРАЦИЯ КОРЗИНЫ: Аккуратная вставка без изменения соседей */}
          <Link 
            href="/checkout" 
            className={`relative flex items-center justify-center transition-colors hover:opacity-80 ${isLight ? "text-brand-black hover:text-brand-blue" : "text-white hover:text-gray-300"}`}
            aria-label="Cart"
          >
            {/* Размер иконки подогнан под твои w-7 h-7 у Globe и Wallet */}
            <ShoppingCart className="w-7 h-7" />
            {isMounted && cartItemsCount > 0 && (
              <motion.span 
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="absolute -top-1.5 -right-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-brand-blue text-[11px] font-bold text-white shadow-sm"
              >
                {cartItemsCount}
              </motion.span>
            )}
          </Link>

          <div className={`w-px h-6 hidden md:block transition-colors ${isLight ? "bg-gray-300" : "bg-gray-600/50"}`}></div>

          <div className="flex items-center gap-4">
            {isLoading ? (
              <div className="h-9 w-24 bg-gray-200 dark:bg-gray-800 animate-pulse rounded-lg"></div>
            ) : user ? (
              <div className="flex items-center gap-4">
                <div className={`hidden sm:flex items-center gap-2 text-sm font-medium px-3 py-1.5 rounded-lg transition-colors ${isLight ? "bg-gray-100 text-brand-black" : "bg-gray-800 text-white"}`}>
                  <Wallet className="w-7 h-7 text-green-500" />
                  <span>${user.balance}</span>
                </div>
                
                <div className="relative" ref={profileRef}>
                  <button 
                    onClick={() => {setIsProfileOpen(!isLangOpen); setActiveMenu("");}}
                    className={`flex items-center gap-2 text-md font-medium transition-colors ${
                      isLight ? "hover:text-brand-blue" : "hover:text-gray-300"
                    }`}
                  >
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold transition-colors ${
                      isLight ? "bg-brand-blue text-white" : "bg-white text-brand-black"
                    }`}>
                      {user.email.charAt(0).toUpperCase()}
                    </div>
                    <span className="hidden sm:inline">{user.email.split("@")[0]}</span>
                    <ChevronDown className={`w-4 h-4 transition-transform ${isProfileOpen ? "rotate-180" : ""}`} />
                  </button>

                  <AnimatePresence>
                    {isProfileOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 10 }}
                        transition={{ duration: 0.2 }}
                        className="absolute right-0 mt-4 w-48 bg-white dark:bg-[#111827] rounded-xl shadow-lg border border-gray-200 dark:border-gray-800 py-2 overflow-hidden"
                      >
                        <Link 
                          href="/dashboard" 
                          onClick={() => setIsProfileOpen(false)}
                          className="flex items-center gap-2 px-4 py-2 text-md text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
                        >
                          <User className="w-4 h-4" />
                          {t("dashboard")}
                        </Link>
                        <Link 
                          href="/profile" 
                          onClick={() => setIsProfileOpen(false)}
                          className="flex items-center gap-2 px-4 py-2 text-md text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
                        >
                          <User className="w-4 h-4" />
                          {t("profile")}
                        </Link>
                        <button 
                          onClick={() => {
                            setIsProfileOpen(false);
                            logoutMutation.mutate();
                          }}
                          disabled={logoutMutation.isPending}
                          className="w-full flex items-center gap-2 px-4 py-2 text-md text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors text-left mt-1 border-t border-gray-100 dark:border-gray-800 pt-2"
                        >
                          <LogOut className="w-4 h-4" />
                          {t("logout")}
                        </button>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            ) : (
              <>
                <Link href="/login" className={`text-md font-medium transition-colors ${
                  isLight ? "text-brand-black hover:text-brand-blue" : "text-white hover:text-gray-300"
                }`}>
                  {t("login")}
                </Link>
                <Link href="/register" className="bg-brand-blue text-white text-md font-semibold px-5 py-2 rounded-md hover:bg-[#007cbd] transition-colors">
                  {t("register")}
                </Link>
              </>
            )}
          </div>
        </div>
      </div>

      {/* МЕГАМЕНЮ С АНИМАЦИЕЙ ФРЕЙМЕРА */}
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