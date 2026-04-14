"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import { useQuery } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, CheckCircle2, Minus, Plus, ShoppingCart } from "lucide-react";
import { Link } from "../../../../i18n/routing";
import { apiClient } from "../../../../lib/api/client";
import { Project } from "../../../../types/project";
import { useCart } from "../../../../hooks/use-cart";

export default function ProjectDetail() {
  const t = useTranslations("Projects");
  const locale = useLocale() as "ru" | "en" | "es";
  const params = useParams();
  const slug = params.slug as string;

  const addItem = useCart((state) => state.addItem);

  const [sharesToBuy, setSharesToBuy] = useState(1);
  const [isAdded, setIsAdded] = useState(false);

  const { data: project, isLoading, isError } = useQuery<Project>({
    queryKey: ["project", slug],
    queryFn: async () => {
      const response = await apiClient.get(`/projects/${slug}/`);
      return response.data;
    },
    staleTime: 60 * 1000, 
  });

  const currentImage = project?.image 
    ? (typeof project.image === 'object' && project.image !== null 
        ? (project.image[locale]) 
        : project.image)
    : null;

  const handleAddToCart = () => {
    if (!project) return;

    const title = typeof project.title === 'string' 
        ? project.title 
        : (project.title[locale] || project.title["en"] || "Project");

    addItem({
      item_type: 'share',                   // <-- Указываем тип!
      item_id: project.id,                  // Было project_id
      title: title,
      price: Number(project.price_per_share), // Было price_per_share
      quantity: sharesToBuy,                // Было shares_amount
      max_quantity: project.available_shares, // Было available_shares
      image: currentImage,
    });

    setIsAdded(true);
    setTimeout(() => setIsAdded(false), 3000);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-zinc-50 dark:bg-black pt-20">
        <div className="w-10 h-10 border-4 border-brand-blue border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (isError || !project) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-zinc-50 dark:bg-black pt-20">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">{t("projectNotFound")}</h2>
          <Link href="/category" className="text-brand-blue hover:underline">{t("returnToCatalog")}</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-black pt-24 pb-20">
      <div className="max-w-7xl mx-auto px-4">
        
        <Link href="/category" className="inline-flex items-center gap-2 text-sm font-medium text-gray-500 hover:text-brand-blue transition-colors mb-8">
          <ArrowLeft className="w-4 h-4" />
          {t("backToCatalog")}
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          
          <div className="lg:col-span-2 space-y-8">
            <div className="aspect-video w-full bg-gray-200 dark:bg-zinc-900 rounded-3xl overflow-hidden relative">
              {currentImage ? (
                <img src={currentImage} alt={typeof project.title === 'string' ? project.title : project.title[locale] || "Project"} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-400">{t("noImage")}</div>
              )}
            </div>

            <div>
              <div className="inline-block px-3 py-1 rounded-full bg-blue-100 dark:bg-blue-900/30 text-brand-blue text-xs font-bold uppercase tracking-wider mb-4">
                {project.category?.name[locale] || t("categoryFallback")}
              </div>
              <h1 className="text-4xl font-extrabold text-gray-900 dark:text-white mb-6">
                {typeof project.title === 'string' ? project.title : project.title[locale]}
              </h1>
              
              <div 
                className="prose prose-lg dark:prose-invert max-w-none text-gray-600 dark:text-gray-300"
                dangerouslySetInnerHTML={{ 
                  __html: typeof project.description === 'string' ? project.description : project.description[locale] 
                }}
              />
            </div>
          </div>

          <div className="relative">
            <div className="sticky top-32 bg-white dark:bg-[#111827] rounded-3xl shadow-xl border border-gray-100 dark:border-gray-800 p-8">
              
              <div className="flex justify-between items-end mb-6">
                <div>
                  <p className="text-sm font-medium text-gray-500 mb-1">{t("pricePerShare")}</p>
                  <p className="text-3xl font-black text-gray-900 dark:text-white">${project.price_per_share}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-gray-500 mb-1">{t("available")}</p>
                  <p className="text-xl font-bold text-brand-blue">{project.available_shares} / {project.total_shares}</p>
                </div>
              </div>

              <div className="w-full bg-gray-100 dark:bg-gray-800 rounded-full h-3 mb-8 overflow-hidden">
                <div 
                  className="bg-brand-blue h-full rounded-full transition-all duration-500"
                  style={{ width: `${((project.total_shares - project.available_shares) / project.total_shares) * 100}%` }}
                />
              </div>

              <div className="space-y-6">
                <div className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-800/50 rounded-2xl border border-gray-100 dark:border-gray-800">
                  <button 
                    onClick={() => setSharesToBuy(Math.max(1, sharesToBuy - 1))}
                    disabled={sharesToBuy <= 1}
                    className="w-12 h-12 flex items-center justify-center bg-white dark:bg-gray-700 rounded-xl shadow-sm text-gray-600 dark:text-gray-300 hover:text-brand-blue disabled:opacity-50 transition-colors"
                  >
                    <Minus className="w-5 h-5" />
                  </button>
                  
                  <div className="flex flex-col items-center">
                    <span className="text-2xl font-bold text-gray-900 dark:text-white">{sharesToBuy}</span>
                    <span className="text-xs font-medium text-gray-500 uppercase">{t("shares")}</span>
                  </div>

                  <button 
                    onClick={() => setSharesToBuy(Math.min(project.available_shares, sharesToBuy + 1))}
                    disabled={sharesToBuy >= project.available_shares}
                    className="w-12 h-12 flex items-center justify-center bg-white dark:bg-gray-700 rounded-xl shadow-sm text-gray-600 dark:text-gray-300 hover:text-brand-blue disabled:opacity-50 transition-colors"
                  >
                    <Plus className="w-5 h-5" />
                  </button>
                </div>

                <div className="flex justify-between items-center py-4 border-t border-b border-gray-100 dark:border-gray-800">
                  <span className="font-semibold text-gray-700 dark:text-gray-300">{t("total")}</span>
                  <span className="text-2xl font-black text-gray-900 dark:text-white">
                    ${(Number(project.price_per_share) * sharesToBuy).toFixed(2)}
                  </span>
                </div>

                {project.available_shares === 0 ? (
                  <div className="py-4 text-center font-bold text-red-500 bg-red-50 dark:bg-red-900/20 rounded-xl">
                    {t("allSharesSold")}
                  </div>
                ) : (
                   <div className="space-y-4">
                     
                     <AnimatePresence>
                        {isAdded && (
                          <motion.div 
                            initial={{ opacity: 0, height: 0, y: -10 }}
                            animate={{ opacity: 1, height: "auto", y: 0 }}
                            exit={{ opacity: 0, height: 0, y: -10 }}
                            className="p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl flex items-start gap-3 text-green-700 dark:text-green-400"
                          >
                            <CheckCircle2 className="w-5 h-5 shrink-0 mt-0.5" />
                            <div className="flex flex-col gap-1">
                              <span className="font-medium">{t("addedToCartMsg")}</span>
                              <Link href="/checkout" className="text-sm font-bold underline text-green-800 dark:text-green-300 text-left">
                                {t("goToCart")}
                              </Link>
                            </div>
                          </motion.div>
                        )}
                     </AnimatePresence>

                     <button 
                        onClick={handleAddToCart}
                        className="w-full py-4 rounded-xl font-bold text-lg bg-brand-blue text-white hover:bg-[#007cbd] shadow-lg shadow-brand-blue/20 transition-all flex justify-center items-center gap-3"
                      >
                        <ShoppingCart className="w-5 h-5" />
                        {t("addToCartBtn")}
                      </button>

                      {project.available_shares > 1 && (
                        <button 
                          onClick={() => setSharesToBuy(project.available_shares)}
                          className="w-full py-3 rounded-xl font-bold text-brand-blue bg-blue-50 hover:bg-blue-100 dark:bg-blue-900/20 dark:hover:bg-blue-900/40 border border-blue-200 dark:border-blue-800 transition-all"
                        >
                          {t("buyAllShares", { count: project.available_shares })}
                        </button>
                      )}

                   </div>
                )}
              </div>

              <p className="text-xs text-center text-gray-400 mt-4">
                {t("termsAgreement")} <Link href="/terms" className="underline">{t("termsLink")}</Link>.
              </p>

            </div>
          </div>

        </div>
      </div>
    </div>
  );
}