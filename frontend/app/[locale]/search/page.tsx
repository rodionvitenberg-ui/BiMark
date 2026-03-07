"use client";

import { useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { useState, useEffect, Suspense } from "react";
import { Search as SearchIcon, Loader2 } from "lucide-react";
import { useRouter } from "@/i18n/routing"; // Убедись, что путь совпадает с твоим проектом

// Выносим основную логику в дочерний компонент
function SearchResultsContent() {
  const t = useTranslations("Search");
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const initialQuery = searchParams.get("q") || "";
  const [localQuery, setLocalQuery] = useState(initialQuery);
  const [isSearching, setIsSearching] = useState(false);

  // Синхронизация локального инпута с URL при навигации "Назад/Вперед"
  useEffect(() => {
    setLocalQuery(initialQuery);
    
    if (initialQuery.trim()) {
      setIsSearching(true);
      // ЗДЕСЬ БУДЕТ ЗАПРОС К БЭКЕНДУ (сейчас симулируем задержку)
      const timer = setTimeout(() => setIsSearching(false), 800);
      return () => clearTimeout(timer);
    }
  }, [initialQuery]);

  // Поиск непосредственно с этой страницы
  const handlePageSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (localQuery.trim() && localQuery !== initialQuery) {
      router.push(`/search?q=${encodeURIComponent(localQuery.trim())}`);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 w-full">
      
      {/* Крупная форма поиска на самой странице */}
      <form onSubmit={handlePageSearch} className="mb-12 relative max-w-3xl">
        <div className="relative flex items-center">
          <SearchIcon className="absolute left-4 w-6 h-6 text-gray-400" />
          <input
            type="text"
            value={localQuery}
            onChange={(e) => setLocalQuery(e.target.value)}
            placeholder={t("placeholder")}
            className="w-full pl-14 pr-32 py-5 bg-white dark:bg-zinc-900 rounded-2xl border border-gray-200 dark:border-zinc-800 shadow-sm text-lg font-medium text-brand-black dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-blue transition-shadow"
          />
          <button
            type="submit"
            className="absolute right-3 px-6 py-2.5 bg-brand-blue text-white font-medium rounded-xl hover:bg-[#007cbd] transition-colors"
          >
            {t("searchButton")}
          </button>
        </div>
      </form>

      {/* Результаты поиска */}
      {initialQuery ? (
        <div className="space-y-6">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            {t("resultsFor")} <span className="text-brand-blue">"{initialQuery}"</span>
          </h1>

          {isSearching ? (
            // Скелетоны загрузки
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-8">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-64 bg-gray-100 dark:bg-zinc-900 rounded-2xl animate-pulse"></div>
              ))}
            </div>
          ) : (
            // Здесь будет map по реальным результатам с бэкенда (ProjectCard и т.д.)
            <div className="py-12 text-center bg-white dark:bg-zinc-900 rounded-2xl border border-gray-100 dark:border-zinc-800">
              <SearchIcon className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <p className="text-lg text-gray-500 font-medium">{t("noResults")}</p>
            </div>
          )}
        </div>
      ) : (
        <div className="py-24 text-center">
          <p className="text-xl text-gray-400">{t("placeholder")}</p>
        </div>
      )}
    </div>
  );
}

// Главный компонент страницы с Suspense-оберткой
export default function SearchPage() {
  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-black pt-32 pb-24">
      <Suspense fallback={
        <div className="max-w-7xl mx-auto px-4 py-12 flex justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-brand-blue" />
        </div>
      }>
        <SearchResultsContent />
      </Suspense>
    </div>
  );
}