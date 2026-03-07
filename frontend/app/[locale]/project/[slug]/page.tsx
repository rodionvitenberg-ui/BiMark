"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, CheckCircle2, AlertCircle, Minus, Plus, Wallet } from "lucide-react";
import { Link } from "../../../../i18n/routing";
import { apiClient } from "../../../../lib/api/client";
import { Project } from "../../../../types/project";
import { useUser } from "../../../../hooks/use-auth";

export default function ProjectDetail() {
  const t = useTranslations("Projects");
  const locale = useLocale() as "ru" | "en" | "es";
  const params = useParams();
  const slug = params.slug as string;
  const router = useRouter();
  const queryClient = useQueryClient();

  // Состояние пользователя
  const { data: user, isLoading: isUserLoading } = useUser();

  // Стейты виджета покупки
  const [sharesToBuy, setSharesToBuy] = useState(1);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Запрашиваем проект
  const { data: project, isLoading, isError } = useQuery<Project>({
    queryKey: ["project", slug],
    queryFn: async () => {
      const response = await apiClient.get(`/projects/${slug}/`);
      return response.data;
    },
    enabled: !!slug,
  });

  // Мутация для покупки
  const buyMutation = useMutation({
    mutationFn: async (amount: number) => {
      // Используем project.id (UUID), как того ждет бэкенд
      const response = await apiClient.post(`/projects/${project?.id}/buy/`, {
        shares_to_buy: amount,
      });
      return response.data;
    },
    onSuccess: () => {
      // Обновляем все связанные кэши, включая профиль юзера
      queryClient.invalidateQueries({ queryKey: ["project", slug] });
      queryClient.invalidateQueries({ queryKey: ["portfolio"] });
      queryClient.invalidateQueries({ queryKey: ["wallet"] });
      queryClient.invalidateQueries({ queryKey: ["user"] }); 
      
      setSuccessMsg(t("successPurchase"));
      setErrorMsg(null);
      setSharesToBuy(1);
    },

    onError: (error: any) => {
      setSuccessMsg(null);
      const errData = error.response?.data;
      
      // Обрабатываем специфичные ошибки от Django (из billing/exceptions.py)
      if (errData?.code === "INSUFFICIENT_FUNDS") {
        setErrorMsg(t("errInsufficientFunds"));
      } else if (errData?.code === "NOT_ENOUGH_SHARES") {
        setErrorMsg(t("errNotEnoughShares"));
      } else {
        setErrorMsg(errData?.detail || t("errDefault"));
      }
    },
  });

  if (isLoading || isUserLoading) {
    return (
      <div className="flex-1 flex justify-center items-center py-32 bg-brand-light">
        <div className="w-10 h-10 border-4 border-brand-blue border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (isError || !project) {
    return (
      <div className="flex-1 container mx-auto px-4 py-32 text-center bg-brand-light">
        <div className="inline-flex flex-col items-center justify-center p-8 bg-red-50 rounded-2xl">
          <AlertCircle className="w-12 h-12 text-red-500 mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Проект не найден</h1>
          <Link href="/" className="text-brand-blue hover:underline">Вернуться на главную</Link>
        </div>
      </div>
    );
  }

  const title = project.title?.[locale] || project.title?.en || project.title?.ru || "Без названия";
  const description = project.description?.[locale] || project.description?.en || project.description?.ru || "";
  const categoryName = project.category?.name?.[locale] || project.category?.name?.en || t("uncategorized");

  const formatCurrency = (value: number | string) => 
    new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(Number(value));

  const soldShares = project.total_shares - project.available_shares;
  const progressRaw = project.total_shares > 0 ? (soldShares / project.total_shares) * 100 : 0;
  const progress = Math.min(Math.max(progressRaw, 0), 100);

  // Математика стоимости
  const priceNum = Number(project.price_per_share);
  const totalCost = priceNum * sharesToBuy;
  const isAvailable = project.available_shares > 0 && (project.status === 'ACTIVE' || project.status === 'PRESALE');

  const handleIncrement = () => {
    if (sharesToBuy < project.available_shares) setSharesToBuy(prev => prev + 1);
  };

  const handleDecrement = () => {
    if (sharesToBuy > 1) setSharesToBuy(prev => prev - 1);
  };

  return (
    <div className="flex-1 bg-brand-light pb-24">
      <div className="bg-white border-b border-gray-200 pt-8 pb-8">
        <div className="container mx-auto px-4">
          <Link href="/" className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-brand-blue transition-colors mb-6">
            <ArrowLeft className="w-4 h-4" />
            Назад к списку
          </Link>
          
          <div className="flex items-center gap-3 mb-4">
            <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-md text-xs font-semibold">
              {categoryName}
            </span>
            {isAvailable && (
              <span className="px-3 py-1 bg-green-100 text-green-700 rounded-md text-xs font-semibold flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                {t("statusLive")}
              </span>
            )}
          </div>

          <h1 className="text-4xl md:text-5xl font-extrabold text-brand-black mb-4">{title}</h1>
        </div>
      </div>

      <div className="container mx-auto px-4 mt-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* ЛЕВАЯ КОЛОНКА: Описание */}
          <div className="lg:col-span-2 space-y-8">
            <div className="w-full aspect-video bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100">
              {project.image ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={project.image} alt={title} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full bg-gradient-to-tr from-brand-blue/10 to-gray-200 flex items-center justify-center text-gray-400">
                  Нет изображения
                </div>
              )}
            </div>

            <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100">
              <h2 className="text-2xl font-bold text-brand-black mb-4">О проекте</h2>
              <div className="prose prose-gray max-w-none text-gray-600 leading-relaxed whitespace-pre-line">
                {description}
              </div>
            </div>
          </div>

          {/* ПРАВАЯ КОЛОНКА: Виджет покупки */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 sticky top-24">
              
              <div className="mb-6">
                <div className="text-3xl font-extrabold text-brand-black mb-1">
                  {formatCurrency(project.price_per_share)}
                </div>
                <div className="text-sm text-gray-500 font-medium">{t("pricePerShare")}</div>
              </div>

              {/* Прогресс-бар наличия */}
              <div className="space-y-3 mb-8">
                <div className="flex justify-between items-end text-sm">
                  <span className="text-gray-500">{t("availableShares")}:</span>
                  <span className="font-bold text-brand-black">{project.available_shares} из {project.total_shares}</span>
                </div>
                <div className="w-full h-3 bg-gray-100 rounded-full overflow-hidden">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${progress}%` }}
                    transition={{ duration: 1, ease: "easeOut" }}
                    className="h-full bg-brand-blue rounded-full"
                  />
                </div>
              </div>

              {/* Блок управления покупкой */}
              <div className="border-t border-gray-100 pt-6">
                {!isAvailable ? (
                   <button disabled className="w-full py-4 rounded-xl font-bold text-lg bg-gray-100 text-gray-400 cursor-not-allowed">
                     {t("statusSold")}
                   </button>
                ) : !user ? (
                   // Если не авторизован - кнопка логина
                   <button 
                     onClick={() => router.push('/login')}
                     className="w-full py-4 rounded-xl font-bold text-lg bg-brand-black text-white hover:bg-gray-800 transition-colors"
                   >
                     {t("loginToBuy")}
                   </button>
                ) : (
                   // Если авторизован - выбор количества и покупка
                   <div className="space-y-4">
                     
                     <div className="flex items-center justify-between">
                       <span className="text-sm font-medium text-gray-600">{t("sharesSelected")}</span>
                       
                       <div className="flex items-center bg-gray-50 border border-gray-200 rounded-lg p-1">
                         <button 
                           onClick={handleDecrement}
                           disabled={sharesToBuy <= 1 || buyMutation.isPending}
                           className="w-8 h-8 flex items-center justify-center rounded-md hover:bg-white hover:shadow-sm disabled:opacity-50 transition-all"
                         >
                           <Minus className="w-4 h-4" />
                         </button>
                         <div className="w-12 text-center font-bold text-brand-black">
                           {sharesToBuy}
                         </div>
                         <button 
                           onClick={handleIncrement}
                           disabled={sharesToBuy >= project.available_shares || buyMutation.isPending}
                           className="w-8 h-8 flex items-center justify-center rounded-md hover:bg-white hover:shadow-sm disabled:opacity-50 transition-all"
                         >
                           <Plus className="w-4 h-4" />
                         </button>
                       </div>
                     </div>

                     <div className="flex justify-between items-center py-3 border-y border-gray-100">
                       <span className="font-semibold text-gray-900">{t("totalCost")}</span>
                       <span className="text-xl font-extrabold text-brand-blue">{formatCurrency(totalCost)}</span>
                     </div>

                     {/* Вывод Ошибок / Успеха */}
                     <AnimatePresence>
                        {errorMsg && (
                          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="p-3 bg-red-50 text-red-600 text-sm rounded-lg flex items-start gap-2">
                            <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
                            <span>{errorMsg}</span>
                          </motion.div>
                        )}
                        {successMsg && (
                          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="p-3 bg-green-50 text-green-700 text-sm rounded-lg flex items-start gap-2">
                            <CheckCircle2 className="w-4 h-4 mt-0.5 shrink-0" />
                            <div className="flex flex-col gap-1">
                              <span>{successMsg}</span>
                              <Link href="/dashboard" className="font-semibold underline text-green-800">{t("goToDashboard")}</Link>
                            </div>
                          </motion.div>
                        )}
                     </AnimatePresence>

                     <button 
                        onClick={() => buyMutation.mutate(sharesToBuy)}
                        disabled={buyMutation.isPending}
                        className="w-full py-4 rounded-xl font-bold text-lg bg-brand-blue text-white hover:bg-[#007cbd] shadow-lg shadow-brand-blue/20 transition-all disabled:opacity-70 flex justify-center items-center gap-2"
                      >
                        {buyMutation.isPending ? (
                          <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        ) : (
                          <>{t("buySharesBtn")} {sharesToBuy} шт.</>
                        )}
                      </button>

                   </div>
                )}
              </div>
              
              <p className="text-xs text-center text-gray-400 mt-4">
                Покупка доли означает согласие с <Link href="#" className="underline">условиями оферты</Link>.
              </p>

            </div>
          </div>

        </div>
      </div>
    </div>
  );
}