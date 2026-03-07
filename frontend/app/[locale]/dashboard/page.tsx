"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslations, useLocale } from "next-intl";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { 
  Wallet as WalletIcon, 
  ArrowUpRight, 
  ArrowDownRight, 
  Clock, 
  CheckCircle2, 
  XCircle,
  Briefcase,
  AlertCircle
} from "lucide-react";

import { useUser } from "../../../hooks/use-auth";
import { apiClient } from "../../../lib/api/client";
import { Link } from "../../../i18n/routing";
import { Wallet, Transaction, Ownership } from "../../../types/dashboard";
import { motion, AnimatePresence } from "framer-motion";

export default function DashboardPage() {
  const t = useTranslations("Dashboard");
  const locale = useLocale() as "ru" | "en" | "es";
  const router = useRouter();

  // 1. Проверяем авторизацию
  const { data: user, isLoading: isUserLoading, isError: isUserError } = useUser();
  const queryClient = useQueryClient();

  // Редирект неавторизованных
  useEffect(() => {
    if (!isUserLoading && isUserError) {
      router.push("/login");
    }
  }, [isUserLoading, isUserError, router]);

  // 2. Запрашиваем баланс
  const { data: wallet } = useQuery<Wallet>({
    queryKey: ["wallet"],
    queryFn: async () => {
      const { data } = await apiClient.get("/wallet/");
      return data;
    },
    enabled: !!user, // Выполняем запрос только если юзер загружен
  });

  // 3. Запрашиваем портфель (купленные доли)
  const { data: portfolio } = useQuery<Ownership[]>({
    queryKey: ["portfolio"],
    queryFn: async () => {
      const { data } = await apiClient.get("/portfolio/");
      return data.results || data; // Защита от пагинации DRF
    },
    enabled: !!user,
  });

  // 4. Запрашиваем историю транзакций
  const { data: transactions } = useQuery<Transaction[]>({
    queryKey: ["transactions"],
    queryFn: async () => {
      const { data } = await apiClient.get("/wallet/transactions/");
      return data.results || data;
    },
    enabled: !!user,
  });

  const formatCurrency = (value: number | string) => 
    new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(Number(value));

  const formatDate = (dateString: string) => 
    new Intl.DateTimeFormat(locale, { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' }).format(new Date(dateString));
  
  // === СТЕЙТЫ ДЛЯ МОДАЛКИ ===
  const [isDepositOpen, setIsDepositOpen] = useState(false);
  const [depositAmount, setDepositAmount] = useState<number | "">(100);
  const [depositSuccess, setDepositSuccess] = useState(false);

  // === МУТАЦИЯ ДЛЯ ПОПОЛНЕНИЯ ===
  const depositMutation = useMutation({
    mutationFn: async (amount: number) => {
      // Отправляем POST запрос на бэкенд
      const response = await apiClient.post("/wallet/deposit/", { amount });
      return response.data;
    },
    onSuccess: () => {
      // Говорим React Query обновить не только кошелек, но и профиль юзера (для шапки)
      queryClient.invalidateQueries({ queryKey: ["wallet"] });
      queryClient.invalidateQueries({ queryKey: ["transactions"] });
      queryClient.invalidateQueries({ queryKey: ["user"] }); 
      
      setDepositSuccess(true);
      
      // Показываем сообщение об успехе 1.5 секунды, затем жестко обновляем страницу
    },
  });

  const handleDepositSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (typeof depositAmount === "number" && depositAmount > 0) {
      depositMutation.mutate(depositAmount);
    }
  };

  // Если проверяем сессию — показываем лоадер
  if (isUserLoading || !user) {
    return (
      <div className="flex-1 flex justify-center items-center py-32 bg-brand-light">
        <div className="w-10 h-10 border-4 border-brand-blue border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="flex-1 bg-brand-light pb-24 relative">
      {/* Шапка дашборда */}
      <div className="bg-white border-b border-gray-200 pt-8 pb-8">
        <div className="container mx-auto px-4">
          <h1 className="text-3xl font-extrabold text-brand-black">
            {t("welcome")}, {user.email.split('@')[0]} 👋
          </h1>
        </div>
      </div>

      <div className="container mx-auto px-4 mt-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* ЛЕВАЯ КОЛОНКА (Кошелек и Транзакции) */}
          <div className="lg:col-span-2 space-y-8">
            
            {/* Виджет Кошелька */}
            <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-sm border border-gray-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-brand-blue/10 flex items-center justify-center text-brand-blue">
                  <WalletIcon className="w-6 h-6" />
                </div>
                <div>
                  <div className="text-sm font-medium text-gray-500 mb-1">{t("walletBalance")}</div>
                  <div className="text-3xl font-extrabold text-brand-black">
                    {wallet ? formatCurrency(wallet.balance) : "$0.00"}
                  </div>
                </div>
              </div>
              <div className="flex gap-3 w-full sm:w-auto">
                <button 
                  onClick={() => setIsDepositOpen(true)} 
                  className="flex-1 sm:flex-none flex items-center justify-center gap-2 bg-brand-blue text-white px-5 py-2.5 rounded-lg font-semibold hover:bg-[#007cbd] transition-colors"
                >
                  <ArrowDownRight className="w-4 h-4" />
                  {t("deposit")}
                </button>
                <button className="flex-1 sm:flex-none flex items-center justify-center gap-2 bg-gray-100 text-brand-black px-5 py-2.5 rounded-lg font-semibold hover:bg-gray-200 transition-colors">
                  <ArrowUpRight className="w-4 h-4" />
                  {t("withdraw")}
                </button>
              </div>
            </div>

            {/* Таблица транзакций */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="px-6 py-5 border-b border-gray-100 font-bold text-lg text-brand-black">
                {t("transactions")}
              </div>
              
              {transactions && transactions.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-gray-50/50 text-gray-500 text-sm border-b border-gray-100">
                        <th className="px-6 py-3 font-medium">Тип</th>
                        <th className="px-6 py-3 font-medium">Сумма</th>
                        <th className="px-6 py-3 font-medium">Статус</th>
                        <th className="px-6 py-3 font-medium text-right">Дата</th>
                      </tr>
                    </thead>
                    <tbody className="text-sm">
                      {transactions.map((tx) => (
                        <tr key={tx.id} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                          <td className="px-6 py-4 font-medium text-brand-black flex items-center gap-2">
                            {tx.transaction_type === "DEPOSIT" || tx.transaction_type === "REFERRAL_BONUS" ? (
                              <ArrowDownRight className="w-4 h-4 text-green-500" />
                            ) : (
                              <ArrowUpRight className="w-4 h-4 text-red-500" />
                            )}
                            {tx.transaction_type}
                          </td>
                          <td className={`px-6 py-4 font-bold ${
                            tx.transaction_type === "DEPOSIT" || tx.transaction_type === "REFERRAL_BONUS" ? "text-green-600" : "text-brand-black"
                          }`}>
                            {tx.transaction_type === "DEPOSIT" || tx.transaction_type === "REFERRAL_BONUS" ? "+" : "-"}{formatCurrency(tx.amount)}
                          </td>
                          <td className="px-6 py-4">
                            {tx.status === "COMPLETED" && <span className="inline-flex items-center gap-1.5 text-green-600 bg-green-50 px-2 py-1 rounded-md text-xs font-semibold"><CheckCircle2 className="w-3.5 h-3.5" />{t("statusCompleted")}</span>}
                            {tx.status === "PENDING" && <span className="inline-flex items-center gap-1.5 text-orange-600 bg-orange-50 px-2 py-1 rounded-md text-xs font-semibold"><Clock className="w-3.5 h-3.5" />{t("statusPending")}</span>}
                            {tx.status === "FAILED" && <span className="inline-flex items-center gap-1.5 text-red-600 bg-red-50 px-2 py-1 rounded-md text-xs font-semibold"><XCircle className="w-3.5 h-3.5" />{t("statusFailed")}</span>}
                          </td>
                          <td className="px-6 py-4 text-right text-gray-500">
                            {formatDate(tx.created_at)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="p-10 text-center text-gray-500">
                  {t("emptyTransactions")}
                </div>
              )}
            </div>

          </div>

          {/* ПРАВАЯ КОЛОНКА (Портфель) */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden sticky top-24">
              <div className="px-6 py-5 border-b border-gray-100 font-bold text-lg text-brand-black flex items-center gap-2">
                <Briefcase className="w-5 h-5 text-brand-blue" />
                {t("portfolio")}
              </div>
              
              <div className="p-4 space-y-3">
                {portfolio && portfolio.length > 0 ? (
                  portfolio.map((item) => {
                    const title = item.project.title?.[locale] || item.project.title?.en || "Проект";
                    
                    return (
                      <Link key={item.id} href={`/project/${item.project.slug}`}>
                        <div className="p-4 rounded-xl border border-gray-100 hover:border-brand-blue/30 hover:bg-brand-blue/5 transition-all group">
                          <h4 className="font-bold text-brand-black mb-1 group-hover:text-brand-blue transition-colors line-clamp-1">
                            {title}
                          </h4>
                          <div className="flex justify-between items-center text-sm">
                            <span className="text-gray-500 font-medium">
                              {item.shares_amount} {t("shares")}
                            </span>
                            <span className="text-brand-black font-semibold">
                              {formatCurrency(item.average_buy_price)} <span className="text-gray-400 text-xs font-normal">/ {t("avgPrice")}</span>
                            </span>
                          </div>
                        </div>
                      </Link>
                    )
                  })
                ) : (
                  <div className="py-8 text-center text-gray-500 text-sm">
                    {t("emptyPortfolio")}
                    <div className="mt-4">
                      <Link href="/category" className="text-brand-blue font-semibold hover:underline">
                        Перейти в каталог
                      </Link>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* === МОДАЛЬНОЕ ОКНО ПОПОЛНЕНИЯ === */}
      <AnimatePresence>
        {isDepositOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              exit={{ opacity: 0 }} 
              onClick={() => !depositMutation.isPending && setIsDepositOpen(false)}
              className="absolute inset-0 bg-brand-black/40 backdrop-blur-sm"
            />
            
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }} 
              animate={{ opacity: 1, scale: 1, y: 0 }} 
              exit={{ opacity: 0, scale: 0.95, y: 20 }} 
              className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl border border-gray-100 p-6 sm:p-8 overflow-hidden"
            >
              {depositSuccess ? (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center justify-center py-8 text-center">
                  <div className="w-16 h-16 bg-green-100 text-green-500 rounded-full flex items-center justify-center mb-4">
                    <CheckCircle2 className="w-8 h-8" />
                  </div>
                  <h3 className="text-xl font-bold text-brand-black mb-2">{t("depositSuccess")}</h3>
                </motion.div>
              ) : (
                <form onSubmit={handleDepositSubmit}>
                  <h3 className="text-2xl font-bold text-brand-black mb-2">{t("depositTitle")}</h3>
                  <p className="text-sm text-gray-500 mb-6">{t("depositDesc")}</p>
                  
                  <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {t("amountLabel")}
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <span className="text-gray-500 font-bold text-lg">$</span>
                      </div>
                      <input
                        type="number"
                        min="1"
                        step="1"
                        required
                        value={depositAmount}
                        onChange={(e) => setDepositAmount(e.target.value ? Number(e.target.value) : "")}
                        disabled={depositMutation.isPending}
                        className="w-full pl-8 pr-4 py-4 rounded-xl border border-gray-300 focus:ring-2 focus:ring-brand-blue focus:border-brand-blue outline-none transition-all text-xl font-bold text-brand-black"
                        placeholder="0.00"
                      />
                    </div>
                  </div>

                  {depositMutation.isError && (
                    <div className="mb-6 p-3 bg-red-50 text-red-600 text-sm rounded-lg flex items-start gap-2">
                      <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
                      <span>Ошибка при пополнении. Проверьте сервер.</span>
                    </div>
                  )}

                  <div className="flex gap-3">
                    <button
                      type="button"
                      onClick={() => setIsDepositOpen(false)}
                      disabled={depositMutation.isPending}
                      className="flex-1 py-3 px-4 bg-gray-100 text-brand-black font-semibold rounded-xl hover:bg-gray-200 transition-colors disabled:opacity-50"
                    >
                      {t("cancel")}
                    </button>
                    <button
                      type="submit"
                      disabled={depositMutation.isPending || depositAmount === "" || depositAmount <= 0}
                      className="flex-1 py-3 px-4 bg-brand-blue text-white font-semibold rounded-xl hover:bg-[#007cbd] transition-colors disabled:opacity-50 flex justify-center items-center"
                    >
                      {depositMutation.isPending ? (
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      ) : (
                        t("confirmDeposit")
                      )}
                    </button>
                  </div>
                </form>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}