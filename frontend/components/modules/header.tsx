"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { useParams } from "next/navigation";
import Image from "next/image";
import { usePathname, useRouter, routing } from "../../i18n/routing";
import { Globe, Search } from "lucide-react";
import { Link } from "../../i18n/routing";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "../ui/navigation-menu";

export function Header() {
  // Меняем неймспейс на Header, чтобы брать ключи из соответствующего объекта JSON
  const t = useTranslations("Header");
  const router = useRouter();
  const pathname = usePathname();
  const params = useParams();
  
  const currentLocale = params.locale as string;
  const [activeMenu, setActiveMenu] = useState<string>("");

  const handleLanguageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const nextLocale = e.target.value;
    router.replace(pathname, { locale: nextLocale });
  };

  const isLight = activeMenu !== "";

  return (
    <header 
      className={`fixed top-0 left-0 w-full z-50 transition-colors duration-300 ${
        isLight 
          ? "bg-white text-brand-black border-b border-gray-200 shadow-sm" 
          : "bg-[#0a0f1c] text-white border-b border-transparent"
      }`}
    >
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        
        {/* ЛЕВАЯ ЧАСТЬ: Логотип и Навигация */}
        <div className="flex items-center gap-8">
          
          <Link href="/" className="flex items-center">
            <Image 
              src="/logo.png" 
              alt="Platform Logo" 
              width={140}
              height={40}
              className={`object-contain transition-opacity duration-300`}
              priority 
            />
          </Link>

          <NavigationMenu onValueChange={setActiveMenu} className="hidden md:flex">
            <NavigationMenuList className="gap-2">
              
              {/* Вкладка 1: Инвесторам */}
              <NavigationMenuItem value="investors">
                <NavigationMenuTrigger 
                  className={`bg-transparent hover:bg-transparent focus:bg-transparent data-[state=open]:bg-transparent data-[hover=true]:bg-transparent text-sm font-medium transition-colors ${
                    isLight ? "text-brand-black hover:text-brand-blue" : "text-gray-300 hover:text-white"
                  }`}
                >
                  {t("investors")}
                </NavigationMenuTrigger>
                <NavigationMenuContent>
                  <div className="w-[600px] p-6 flex gap-8">
                    <div className="flex-1 space-y-4">
                      <h4 className="text-sm font-semibold text-gray-900 border-b pb-2">{t("markets")}</h4>
                      <ul className="space-y-3">
                        <li>
                          <Link href="#" className="block group">
                            <div className="text-sm font-medium text-brand-black group-hover:text-brand-blue transition-colors">{t("assetsCatalog")}</div>
                            <div className="text-xs text-gray-500 mt-0.5">{t("assetsCatalogDesc")}</div>
                          </Link>
                        </li>
                        <li>
                          <Link href="#" className="block group">
                            <div className="text-sm font-medium text-brand-black group-hover:text-brand-blue transition-colors">{t("presales")}</div>
                            <div className="text-xs text-gray-500 mt-0.5">{t("presalesDesc")}</div>
                          </Link>
                        </li>
                      </ul>
                    </div>
                    <div className="flex-1 space-y-4">
                      <h4 className="text-sm font-semibold text-gray-900 border-b pb-2">{t("information")}</h4>
                      <ul className="space-y-3">
                        <li>
                          <Link href="#" className="block group">
                            <div className="text-sm font-medium text-brand-black group-hover:text-brand-blue transition-colors">{t("howItWorks")}</div>
                            <div className="text-xs text-gray-500 mt-0.5">{t("howItWorksDesc")}</div>
                          </Link>
                        </li>
                      </ul>
                    </div>
                  </div>
                </NavigationMenuContent>
              </NavigationMenuItem>

              {/* Вкладка 2: Бизнесу / Партнерам */}
              <NavigationMenuItem value="businesses">
                <NavigationMenuTrigger 
                  className={`bg-transparent hover:bg-transparent focus:bg-transparent data-[state=open]:bg-transparent data-[hover=true]:bg-transparent text-sm font-medium transition-colors ${
                    isLight ? "text-brand-black hover:text-brand-blue" : "text-gray-300 hover:text-white"
                  }`}
                >
                  {t("partners")}
                </NavigationMenuTrigger>
                <NavigationMenuContent>
                  <div className="w-[400px] p-6 flex gap-8">
                     <div className="flex-1 space-y-4">
                      <h4 className="text-sm font-semibold text-gray-900 border-b pb-2">{t("cooperation")}</h4>
                      <ul className="space-y-3">
                        <li>
                          <Link href="#" className="block group">
                            <div className="text-sm font-medium text-brand-black group-hover:text-brand-blue transition-colors">{t("raiseCapital")}</div>
                            <div className="text-xs text-gray-500 mt-0.5">{t("raiseCapitalDesc")}</div>
                          </Link>
                        </li>
                        <li>
                          <Link href="#" className="block group">
                            <div className="text-sm font-medium text-brand-black group-hover:text-brand-blue transition-colors">{t("referralSystem")}</div>
                            <div className="text-xs text-gray-500 mt-0.5">{t("referralSystemDesc")}</div>
                          </Link>
                        </li>
                      </ul>
                    </div>
                  </div>
                </NavigationMenuContent>
              </NavigationMenuItem>

            </NavigationMenuList>
          </NavigationMenu>
        </div>

        {/* ПРАВАЯ ЧАСТЬ */}
        <div className="flex items-center gap-6">
          <button className={`hidden md:flex items-center gap-2 text-sm px-4 py-1.5 rounded-full transition-colors ${
            isLight ? "bg-gray-100 text-gray-500 hover:bg-gray-200" : "bg-white/10 text-gray-300 hover:bg-white/20"
          }`}>
            <Search className="w-4 h-4" />
            <span>{t("search")}</span>
          </button>

          <div className="flex items-center gap-1">
            <Globe className={`w-4 h-4 ${isLight ? "text-gray-500" : "text-gray-300"}`} />
            <select 
              value={currentLocale} 
              onChange={handleLanguageChange}
              className={`bg-transparent text-sm font-medium outline-none cursor-pointer appearance-none ${
                isLight ? "text-brand-black" : "text-white"
              }`}
            >
              {routing.locales.map((loc) => (
                <option key={loc} value={loc} className="text-brand-black bg-white">
                  {loc.toUpperCase()}
                </option>
              ))}
            </select>
          </div>

          <div className={`w-px h-6 hidden md:block transition-colors ${isLight ? "bg-gray-300" : "bg-gray-600/50"}`}></div>

          <div className="flex items-center gap-4">
            <Link href="#" className={`text-sm font-medium transition-colors ${
              isLight ? "text-brand-black hover:text-brand-blue" : "text-white hover:text-gray-300"
            }`}>
              {t("login")}
            </Link>
            <Link href="#" className="bg-brand-blue text-white text-sm font-semibold px-5 py-2 rounded-md hover:bg-[#007cbd] transition-colors">
              {t("openAccount")}
            </Link>
          </div>
        </div>

      </div>
    </header>
  );
}