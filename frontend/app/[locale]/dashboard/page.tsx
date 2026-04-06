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
  AlertCircle,
  Copy,
  Users,
  Gem // <-- Добавили иконку для активов
} from "lucide-react";

import { useUser } from "../../../hooks/use-auth";
import { apiClient } from "../../../lib/api/client";
import { Link } from "../../../i18n/routing";
// <-- Добавили AssetOwnership в импорт
import { Wallet, Transaction, Ownership, AssetOwnership } from "../../../types/dashboard"; 
import { motion, AnimatePresence } from "framer-motion";

export default function DashboardPage() {
  const t = useTranslations("Dashboard");
  const locale = useLocale() as "ru" | "en" | "es";
  const router = useRouter();
  const queryClient = useQueryClient();

  const { data: user, isLoading: isUserLoading, isError: isUserError } = useUser();

  useEffect(() => {
    if (!isUserLoading && isUserError) {
      router.push("/login");
    }
  }, [isUserLoading, isUserError, router]);

  const { data: wallet } = useQuery<Wallet>({
    queryKey: ["wallet"],
    queryFn: async () => {
      const { data } = await apiClient.get("/wallet/");
      return data;
    },
    enabled: !!user,
  });

  // Запрос долей (старый)
  const { data: portfolio } = useQuery<Ownership[]>({
    queryKey: ["portfolio"],
    queryFn: async () => {
      const { data } = await apiClient.get("/portfolio/");
      return data.results || data; 
    },
    enabled: !!user,
  });

  // НОВЫЙ ЗАПРОС: Запрос целых активов
  const { data: assetPortfolio } = useQuery<AssetOwnership[]>({
    queryKey: ["assetPortfolio"],
    queryFn: async () => {
      const { data } = await apiClient.get("/portfolio/assets/");
      return data.results || data; 
    },
    enabled: !!user,
  });

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
  
  // === СТЕЙТЫ ПОПОЛНЕНИЯ ===
  const [isDepositOpen, setIsDepositOpen] = useState(false);
  const [depositAmount, setDepositAmount] = useState<number | "">(100);
  const [depositSuccess, setDepositSuccess] = useState(false);
  const COMPANY_CRYPTO_WALLET = "TXYZ...Ваш_TRC20_Кошелек...1234";

  // === СТЕЙТЫ ВЫВОДА ===
  const [isWithdrawOpen, setIsWithdrawOpen] = useState(false);
  const [withdrawAmount, setWithdrawAmount] = useState<number | "">("");
  const [withdrawAddress, setWithdrawAddress] = useState("");
  const [withdrawSuccess, setWithdrawSuccess] = useState(false);
  const [withdrawError, setWithdrawError] = useState<string | null>(null);

  const [isCopied, setIsCopied] = useState(false);

  const referralLink = typeof window !== "undefined" && user 
    ? `${window.location.origin}/register?ref=${user.id}` 
    : "";

  const handleCopyReferral = () => {
    if (!referralLink) return;
    navigator.clipboard.writeText(referralLink);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  const depositMutation = useMutation({
    mutationFn: async (amount: number) => {
      const response = await apiClient.post("/wallet/deposit/", { amount });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["transactions"] });
      setDepositSuccess(true);
      setTimeout(() => {
        setIsDepositOpen(false);
        setDepositSuccess(false);
      }, 4000);
    },
  });

  const withdrawMutation = useMutation({
    mutationFn: async (payload: { amount: number, wallet_address: string }) => {
      const response = await apiClient.post("/wallet/withdraw/", payload);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["wallet"] });
      queryClient.invalidateQueries({ queryKey: ["transactions"] });
      queryClient.invalidateQueries({ queryKey: ["user"] }); 
      setWithdrawSuccess(true);
      setTimeout(() => {
        setIsWithdrawOpen(false);
        setWithdrawSuccess(false);
        setWithdrawAmount("");
        setWithdrawAddress("");
      }, 4000);
    },
    onError: (error: any) => {
      const msg = error.response?.data?.detail || "Ошибка при создании заявки.";
      setWithdrawError(msg);
      setTimeout(() => setWithdrawError(null), 5000);
    }
  });

  const handleDepositSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (typeof depositAmount === "number" && depositAmount > 0) {
      depositMutation.mutate(depositAmount);
    }
  };

  const handleWithdrawSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (typeof withdrawAmount === "number" && withdrawAmount > 0 && withdrawAddress.trim() !== "") {
      withdrawMutation.mutate({ amount: withdrawAmount, wallet_address: withdrawAddress });
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    alert("Адрес скопирован!"); 
  };

  if (isUserLoading || !user) {
    return (
      <div className="flex-1 flex justify-center items-center py-32 bg-brand-light">
        <div className="w-10 h-10 border-4 border-brand-blue border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="flex-1 bg-brand-light pb-24 relative">
      <div className="bg-white border-b border-gray-200 pt-8 pb-8">
        <div className="container mx-auto px-4">
          <h1 className="text-3xl font-extrabold text-brand-black">
            {t("welcome")}, {user.email.split('@')[0]} 👋
          </h1>
        </div>
      </div>

      <div className="container mx-auto px-4 mt-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
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
                <button 
                  onClick={() => setIsWithdrawOpen(true)}
                  className="flex-1 sm:flex-none flex items-center justify-center gap-2 bg-gray-100 text-brand-black px-5 py-2.5 rounded-lg font-semibold hover:bg-gray-200 transition-colors"
                >
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
                      {transactions.map((tx) => {
                        // Определяем, приход это или расход
                        const isIncome = tx.transaction_type === "DEPOSIT" || tx.transaction_type === "REFERRAL";
                        
                        return (
                          <tr key={tx.id} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                            <td className="px-6 py-4 font-medium text-brand-black flex items-center gap-2">
                              {isIncome ? (
                                <ArrowDownRight className="w-4 h-4 text-green-500 shrink-0" />
                              ) : (
                                <ArrowUpRight className="w-4 h-4 text-red-500 shrink-0" />
                              )}
                              <span className="truncate">
                                {tx.transaction_type === "PURCHASE_ASSET" ? "ASSET PURCHASE" : tx.transaction_type}
                              </span>
                            </td>
                            <td className={`px-6 py-4 font-bold ${isIncome ? "text-green-600" : "text-brand-black"}`}>
                              {isIncome ? "+" : "-"}{formatCurrency(tx.amount)}
                            </td>
                            <td className="px-6 py-4">
                              {tx.status === "COMPLETED" && <span className="inline-flex items-center gap-1.5 text-green-600 bg-green-50 px-2 py-1 rounded-md text-xs font-semibold"><CheckCircle2 className="w-3.5 h-3.5" />Успешно</span>}
                              {tx.status === "PENDING" && <span className="inline-flex items-center gap-1.5 text-orange-600 bg-orange-50 px-2 py-1 rounded-md text-xs font-semibold"><Clock className="w-3.5 h-3.5" />В обработке</span>}
                              {tx.status === "FAILED" && <span className="inline-flex items-center gap-1.5 text-red-600 bg-red-50 px-2 py-1 rounded-md text-xs font-semibold"><XCircle className="w-3.5 h-3.5" />Отклонено</span>}
                            </td>
                            <td className="px-6 py-4 text-right text-gray-500 whitespace-nowrap">
                              {formatDate(tx.created_at)}
                            </td>
                          </tr>
                        );
                      })}
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

          {/* ПРАВАЯ КОЛОНКА */}
          <div className="lg:col-span-1 space-y-8 sticky top-24 self-start">
            
            {/* Виджет 1: Портфель (Доли проектов) */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
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

            {/* НОВЫЙ Виджет 2: Купленные Активы (Целые проекты) */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="px-6 py-5 border-b border-gray-100 font-bold text-lg text-brand-black flex items-center gap-2">
                <Gem className="w-5 h-5 text-brand-blue" />
                {t("myAssets", { fallback: "Мои активы" })}
              </div>
              
              <div className="p-4 space-y-3">
                {assetPortfolio && assetPortfolio.length > 0 ? (
                  assetPortfolio.map((item) => {
                    // === ПРАВИЛЬНАЯ ПРОВЕРКА ДЛЯ TYPESCRIPT ===
                    const title = typeof item.asset.title === 'object' && item.asset.title !== null
                      ? (item.asset.title[locale] || item.asset.title.en || "Актив")
                      : (item.asset.title || "Актив");
                    
                    return (
                      <Link key={item.id} href={`/assets/${item.asset.id}`}>
                        <div className="p-4 rounded-xl border border-gray-100 hover:border-brand-blue/30 hover:bg-brand-blue/5 transition-all group">
                          <div className="flex justify-between items-start mb-1">
                            <h4 className="font-bold text-brand-black group-hover:text-brand-blue transition-colors line-clamp-1 flex-1">
                              {title}
                            </h4>
                            {item.asset.is_unique && (
                              <span className="shrink-0 ml-2 text-[10px] uppercase font-bold bg-brand-blue/10 text-brand-blue px-2 py-0.5 rounded">
                                Эксклюзив
                              </span>
                            )}
                          </div>
                          <div className="flex justify-between items-center text-sm">
                            <span className="text-gray-500 font-medium text-xs">
                              {formatDate(item.purchased_at)}
                            </span>
                            <span className="text-brand-black font-semibold">
                              {formatCurrency(item.purchase_price)}
                            </span>
                          </div>
                        </div>
                      </Link>
                    )
                  })
                ) : (
                  <div className="py-8 text-center text-gray-500 text-sm">
                    {t("emptyAssets", { fallback: "У вас пока нет купленных активов." })}
                    <div className="mt-4">
                      <Link href="/category" className="text-brand-blue font-semibold hover:underline">
                        Смотреть эксклюзивы
                      </Link>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Виджет 3: Реферальная программа */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="px-6 py-5 border-b border-gray-100 font-bold text-lg text-brand-black flex items-center gap-2">
                <Users className="w-5 h-5 text-brand-blue" />
                {t("referralTitle")}
              </div>
              
              <div className="p-6">
                <p className="text-sm text-gray-500 mb-5 leading-relaxed">
                  {t("referralDesc")}
                </p>
                
                <div className="flex items-center gap-2 p-2 pl-4 bg-gray-50 rounded-xl border border-gray-200">
                  <input 
                    type="text" 
                    readOnly 
                    value={referralLink} 
                    className="flex-1 bg-transparent text-sm text-gray-700 outline-none truncate font-mono"
                  />
                  <button 
                    onClick={handleCopyReferral}
                    className="p-2.5 bg-white border border-gray-200 rounded-lg text-gray-500 hover:text-brand-blue hover:border-brand-blue/30 transition-all shrink-0 shadow-sm flex items-center justify-center"
                    title={t("copy")}
                  >
                    {isCopied ? <CheckCircle2 className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            </div>

          </div>

        </div>
      </div>

      {/* === МОДАЛЬНОЕ ОКНО ПОПОЛНЕНИЯ (КРИПТА) === */}
      <AnimatePresence>
        {isDepositOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} 
              onClick={() => !depositMutation.isPending && setIsDepositOpen(false)}
              className="absolute inset-0 bg-brand-black/40 backdrop-blur-sm"
            />
            
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }} 
              className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl border border-gray-100 p-6 sm:p-8 overflow-hidden"
            >
              {depositSuccess ? (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center justify-center py-8 text-center">
                  <div className="w-16 h-16 bg-green-100 text-green-500 rounded-full flex items-center justify-center mb-4">
                    <Clock className="w-8 h-8" />
                  </div>
                  <h3 className="text-xl font-bold text-brand-black mb-2">Заявка создана!</h3>
                  <p className="text-gray-500 text-sm">Ваш баланс будет пополнен после подтверждения транзакции в сети.</p>
                </motion.div>
              ) : (
                <form onSubmit={handleDepositSubmit}>
                  <h3 className="text-2xl font-bold text-brand-black mb-2">Пополнение криптой</h3>
                  <p className="text-sm text-gray-500 mb-6">
                    Переведите точную сумму в <b>USDT (TRC-20)</b> на указанный кошелек. После перевода нажмите кнопку подтверждения.
                  </p>
                  
                  <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Сумма пополнения ($)</label>
                    <input
                      type="number"
                      min="1"
                      step="1"
                      required
                      value={depositAmount}
                      onChange={(e) => setDepositAmount(e.target.value ? Number(e.target.value) : "")}
                      disabled={depositMutation.isPending}
                      className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-brand-blue outline-none text-xl font-bold"
                      placeholder="0.00"
                    />
                  </div>

                  <div className="mb-6 p-4 bg-gray-50 rounded-xl border border-gray-200">
                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Адрес для перевода (USDT TRC20)</label>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-mono text-brand-black break-all">{COMPANY_CRYPTO_WALLET}</span>
                      <button type="button" onClick={() => copyToClipboard(COMPANY_CRYPTO_WALLET)} className="p-2 text-gray-400 hover:text-brand-blue transition-colors">
                        <Copy className="w-5 h-5" />
                      </button>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <button type="button" onClick={() => setIsDepositOpen(false)} className="flex-1 py-3 px-4 bg-gray-100 font-semibold rounded-xl hover:bg-gray-200 transition-colors">
                      Отмена
                    </button>
                    <button type="submit" disabled={depositMutation.isPending || depositAmount === "" || depositAmount <= 0} className="flex-1 py-3 px-4 bg-brand-blue text-white font-semibold rounded-xl hover:bg-[#007cbd] transition-colors disabled:opacity-50">
                      {depositMutation.isPending ? "Загрузка..." : "Я оплатил"}
                    </button>
                  </div>
                </form>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* === МОДАЛЬНОЕ ОКНО ВЫВОДА === */}
      <AnimatePresence>
        {isWithdrawOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} 
              onClick={() => !withdrawMutation.isPending && setIsWithdrawOpen(false)}
              className="absolute inset-0 bg-brand-black/40 backdrop-blur-sm"
            />
            
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }} 
              className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl border border-gray-100 p-6 sm:p-8 overflow-hidden"
            >
              {withdrawSuccess ? (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center justify-center py-8 text-center">
                  <div className="w-16 h-16 bg-blue-100 text-brand-blue rounded-full flex items-center justify-center mb-4">
                    <CheckCircle2 className="w-8 h-8" />
                  </div>
                  <h3 className="text-xl font-bold text-brand-black mb-2">Заявка на вывод создана!</h3>
                  <p className="text-gray-500 text-sm">Средства зарезервированы. Наш менеджер обработает перевод в течение 24 часов.</p>
                </motion.div>
              ) : (
                <form onSubmit={handleWithdrawSubmit}>
                  <h3 className="text-2xl font-bold text-brand-black mb-2">Вывод средств</h3>
                  <p className="text-sm text-gray-500 mb-6">Средства будут отправлены на ваш криптокошелек в USDT (TRC-20).</p>
                  
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Сумма вывода ($)</label>
                    <input
                      type="number"
                      min="1"
                      step="1"
                      required
                      value={withdrawAmount}
                      onChange={(e) => setWithdrawAmount(e.target.value ? Number(e.target.value) : "")}
                      disabled={withdrawMutation.isPending}
                      className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-brand-blue outline-none text-xl font-bold"
                      placeholder="0.00"
                    />
                    <p className="text-xs text-gray-500 mt-2">Доступно: {wallet ? formatCurrency(wallet.balance) : "$0.00"}</p>
                  </div>

                  <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Ваш кошелек (USDT TRC-20)</label>
                    <input
                      type="text"
                      required
                      value={withdrawAddress}
                      onChange={(e) => setWithdrawAddress(e.target.value)}
                      disabled={withdrawMutation.isPending}
                      className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-brand-blue outline-none font-mono text-sm"
                      placeholder="T..."
                    />
                  </div>

                  {withdrawError && (
                    <div className="mb-6 p-3 bg-red-50 text-red-600 text-sm rounded-lg flex items-start gap-2">
                      <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
                      <span>{withdrawError}</span>
                    </div>
                  )}

                  <div className="flex gap-3">
                    <button type="button" onClick={() => setIsWithdrawOpen(false)} className="flex-1 py-3 px-4 bg-gray-100 font-semibold rounded-xl hover:bg-gray-200 transition-colors">
                      Отмена
                    </button>
                    <button type="submit" disabled={withdrawMutation.isPending || withdrawAmount === "" || withdrawAmount <= 0 || !withdrawAddress} className="flex-1 py-3 px-4 bg-brand-blue text-white font-semibold rounded-xl hover:bg-[#007cbd] transition-colors disabled:opacity-50">
                      {withdrawMutation.isPending ? "Обработка..." : "Создать заявку"}
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