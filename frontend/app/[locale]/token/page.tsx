"use client";

import { useState } from "react";
import { useTranslations, useLocale } from "next-intl";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
// Удалили иконку Zap из импорта
import { Coins, CheckCircle2, TrendingUp, Shield, Users, ShoppingCart } from "lucide-react";
import { apiClient } from "../../../lib/api/client";
import { Project } from "../../../types/project";
import { useCart } from "../../../hooks/use-cart";
import { useRouter } from "../../../i18n/routing";

export default function TokenPresalePage() {
  const t = useTranslations("Token");
  const locale = useLocale() as "ru" | "en" | "es";
  const router = useRouter();
  const addItem = useCart((state) => state.addItem);

  const [sharesToBuy, setSharesToBuy] = useState<number>(1000);
  const [isAdded, setIsAdded] = useState(false);

  const TOKEN_SLUG = "bimark-token";

  const { data: project, isLoading } = useQuery<Project>({
    queryKey: ["project", TOKEN_SLUG],
    queryFn: async () => {
      const response = await apiClient.get(`/projects/${TOKEN_SLUG}/`);
      return response.data;
    },
    retry: false,
  });

  const handleAddToCart = () => {
    if (!project || sharesToBuy <= 0) return;

    addItem({
      item_type: 'share',                             // <-- Обязательно указываем тип
      item_id: project.id,                            // Было project_id
      title: "BiMark Token (BMK)",
      price: Number(project.price_per_share),         // Было price_per_share
      quantity: sharesToBuy,                          // Было shares_amount
      max_quantity: project.available_shares,         // Было available_shares
      image: project.image,
    });

    setIsAdded(true);
    setTimeout(() => {
      setIsAdded(false);
      router.push("/checkout");
    }, 1500);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0a0f1c]">
        <div className="w-12 h-12 border-4 border-brand-blue border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0a0f1c] text-white flex-col text-center px-4">
        <h1 className="text-3xl font-bold mb-4">{t("preparingTitle")}</h1>
        <p className="text-gray-400">{t("preparingDesc")}</p>
      </div>
    );
  }

  const soldTokens = project.total_shares - project.available_shares;
  const progressPercentage = (soldTokens / project.total_shares) * 100;

  return (
    // ГЛАВНЫЙ ФОН: Темно-синий на всю страницу
    <div className="min-h-screen bg-[#0a0f1c] text-white pb-24 relative overflow-hidden">
      
      {/* Декоративные фоновые блюр-круги растянуты на страницу */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[600px] bg-brand-blue/20 blur-[150px] rounded-full pointer-events-none" />
      <div className="absolute bottom-0 left-0 -translate-x-1/4 w-[600px] h-[600px] bg-purple-500/10 blur-[150px] rounded-full pointer-events-none" />

      {/* Верхний блок: Заголовок (Без отдельного фона, интегрирован в страницу) */}
      <div className="pt-32 pb-20 relative z-10 px-4 max-w-4xl mx-auto text-center">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-brand-blue/10 border border-brand-blue/20 text-brand-blue font-bold text-sm tracking-widest uppercase mb-6"
        >
          {/* Пульсирующий кружок вместо молнии */}
          <span className="relative flex h-2.5 w-2.5 mr-1">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-brand-blue opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-brand-blue"></span>
          </span>
          Bimark Ecosystem
        </motion.div>
        
        <motion.h1 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-5xl md:text-6xl font-black text-white mb-6 tracking-tight"
        >
          {t("pageTitle")}
        </motion.h1>
        
        <motion.p 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-xl text-gray-400 max-w-2xl mx-auto"
        >
          {t("pageSubtitle")}
        </motion.p>
      </div>

      {/* КОНТЕНТ (Карточки в стиле Glassmorphism) */}
      <div className="max-w-7xl mx-auto px-4 relative z-20">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
          
          {/* ЛЕВАЯ ЧАСТЬ: Информация и Токеномика */}
          <div className="lg:col-span-7 space-y-8">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              // Полупрозрачная белая подложка (эффект стекла)
              className="bg-white/5 backdrop-blur-md p-8 md:p-10 rounded-3xl shadow-xl border border-white/10 text-gray-300 w-full max-w-none leading-relaxed"
            >
               {/* Стили для рендера HTML из админки (заголовки будут белыми) */}
               <div className="[&>h1]:text-white [&>h2]:text-white [&>h3]:text-white [&>strong]:text-white space-y-4">
                 {typeof project.description === 'string' ? project.description : project.description[locale]}
               </div>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              <h3 className="text-2xl font-bold text-white mb-6 pl-2">{t("tokenomics")}</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="bg-white/5 backdrop-blur-md p-6 rounded-2xl border border-white/10 flex items-center gap-4 hover:bg-white/10 transition-colors">
                  <div className="w-12 h-12 rounded-full bg-brand-blue/20 text-brand-blue flex items-center justify-center shrink-0">
                    <Coins className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-400 font-medium">{t("emission")}</p>
                    <p className="font-extrabold text-xl text-white">{project.total_shares.toLocaleString()} BMK</p>
                  </div>
                </div>
                <div className="bg-white/5 backdrop-blur-md p-6 rounded-2xl border border-white/10 flex items-center gap-4 hover:bg-white/10 transition-colors">
                  <div className="w-12 h-12 rounded-full bg-green-500/20 text-green-400 flex items-center justify-center shrink-0">
                    <TrendingUp className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-400 font-medium">{t("network")}</p>
                    <p className="font-extrabold text-xl text-white">TRC-20 / ERC-20</p>
                  </div>
                </div>
                <div className="bg-white/5 backdrop-blur-md p-6 rounded-2xl border border-white/10 flex items-center gap-4 hover:bg-white/10 transition-colors">
                  <div className="w-12 h-12 rounded-full bg-purple-500/20 text-purple-400 flex items-center justify-center shrink-0">
                    <Shield className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-400 font-medium">{t("teamLock")}</p>
                    <p className="font-extrabold text-xl text-white">12 Months</p>
                  </div>
                </div>
                <div className="bg-white/5 backdrop-blur-md p-6 rounded-2xl border border-white/10 flex items-center gap-4 hover:bg-white/10 transition-colors">
                  <div className="w-12 h-12 rounded-full bg-orange-500/20 text-orange-400 flex items-center justify-center shrink-0">
                    <Users className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-400 font-medium">{t("refProgram")}</p>
                    <p className="font-extrabold text-xl text-white">Active</p>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>

          {/* ПРАВАЯ ЧАСТЬ: Виджет Покупки */}
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5 }}
            className="lg:col-span-5 bg-white/5 backdrop-blur-md rounded-3xl p-8 shadow-2xl border border-white/10 sticky top-32"
          >
            <div className="text-center mb-8">
              <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-green-500/10 border border-green-500/20 text-green-400 font-bold text-sm tracking-wide uppercase mb-4">
                <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                {t("activeRound")}
              </span>
              <div className="text-gray-400 font-medium mb-1">{t("price")}</div>
              <div className="text-5xl font-black text-white">${project.price_per_share}</div>
            </div>

            {/* Прогресс бар */}
            <div className="mb-10 p-5 bg-black/20 rounded-2xl border border-white/5">
              <div className="flex justify-between text-sm font-bold text-white mb-3">
                <span>{soldTokens.toLocaleString()} BMK</span>
                <span className="text-gray-500">{project.total_shares.toLocaleString()} BMK</span>
              </div>
              <div className="w-full bg-gray-800 rounded-full h-3 overflow-hidden relative mb-3">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: `${progressPercentage}%` }}
                  transition={{ duration: 1.5, ease: "easeOut" }}
                  className="absolute top-0 left-0 h-full bg-gradient-to-r from-brand-blue to-[#00d2ff] rounded-full shadow-[0_0_10px_rgba(0,124,189,0.8)]"
                />
              </div>
              <div className="text-center text-sm text-gray-400 font-medium">
                {t("raised")}: <span className="text-white font-bold">${(soldTokens * Number(project.price_per_share)).toLocaleString()}</span>
              </div>
            </div>

            {/* Форма покупки */}
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-bold text-gray-300 mb-2">{t("amountLabel")}</label>
                <div className="relative">
                  <input 
                    type="number"
                    min="10"
                    max={project.available_shares}
                    value={sharesToBuy}
                    onChange={(e) => setSharesToBuy(Number(e.target.value))}
                    className="w-full pl-6 pr-24 py-4 bg-black/20 border-2 border-white/10 rounded-xl text-2xl font-bold text-white focus:border-brand-blue focus:ring-0 outline-none transition-all shadow-inner"
                  />
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 flex gap-1.5">
                    <button onClick={() => setSharesToBuy(1000)} className="px-2.5 py-1.5 bg-white/10 rounded text-xs font-bold text-gray-300 hover:bg-white/20 transition-colors">{t("min")}</button>
                    <button onClick={() => setSharesToBuy(project.available_shares)} className="px-2.5 py-1.5 bg-brand-blue/20 text-brand-blue rounded text-xs font-bold hover:bg-brand-blue/30 transition-colors">{t("max")}</button>
                  </div>
                </div>
              </div>

              <div className="flex justify-between items-center py-5 border-t border-b border-white/10">
                <span className="font-bold text-gray-400">{t("toPay")}</span>
                <span className="text-3xl font-black text-white">
                  ${(sharesToBuy * Number(project.price_per_share)).toFixed(2)}
                </span>
              </div>

              {isAdded ? (
                <div className="w-full py-4 rounded-xl font-bold text-lg bg-green-500/20 border border-green-500/30 text-green-400 flex justify-center items-center gap-2 shadow-lg shadow-green-500/10">
                  <CheckCircle2 className="w-6 h-6" /> {t("addedToCart")}
                </div>
              ) : (
                <button 
                  onClick={handleAddToCart}
                  disabled={sharesToBuy <= 0 || sharesToBuy > project.available_shares}
                  className="w-full py-4 rounded-xl font-bold text-lg bg-brand-blue text-white hover:bg-[#007cbd] shadow-lg hover:shadow-brand-blue/30 transition-all flex justify-center items-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ShoppingCart className="w-5 h-5" />
                  {t("addToCart")}
                </button>
              )}
            </div>
          </motion.div>

        </div>
      </div>
    </div>
  );
}