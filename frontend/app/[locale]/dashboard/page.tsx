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
  Copy,
  Users,
  Gem
} from "lucide-react";

import { useUser } from "../../../hooks/use-auth";
import { apiClient } from "../../../lib/api/client";
import { Link } from "../../../i18n/routing";
import { Wallet, Transaction, Ownership, AssetOwnership } from "../../../types/dashboard"; 
import { DepositModal } from "../../../components/modules/deposit-modal";
import { WithdrawModal } from "../../../components/modules/withdraw-modal";

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

  const { data: portfolio } = useQuery<Ownership[]>({
    queryKey: ["portfolio"],
    queryFn: async () => {
      const { data } = await apiClient.get("/portfolio/");
      return data.results || data; 
    },
    enabled: !!user,
  });

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
  
  const [isDepositOpen, setIsDepositOpen] = useState(false);
  const [depositAmount, setDepositAmount] = useState<number | "">(100);
  const [depositSuccess, setDepositSuccess] = useState(false);
  const [depositError, setDepositError] = useState<string | null>(null);

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
    onError: (error: any) => {
      // ИСПОЛЬЗУЕМ КЛЮЧ ИЗ СЛОВАРЯ ДЛЯ ФОЛБЭКА
      const msg = error.response?.data?.detail || t("depositErrorFallback");
      setDepositError(msg);
      setTimeout(() => setDepositError(null), 5000);
    }
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
      // ИСПОЛЬЗУЕМ КЛЮЧ ИЗ СЛОВАРЯ ДЛЯ ФОЛБЭКА
      const msg = error.response?.data?.detail || t("withdrawErrorFallback");
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
    // ИСПОЛЬЗУЕМ ПЕРЕВОД ДЛЯ АЛЕРТА
    alert(t("addressCopiedAlert")); 
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

      <div className="container mx-auto px-4 mt-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          <div className="lg:col-span-2 space-y-8">
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

            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="px-6 py-5 border-b border-gray-100 font-bold text-lg text-brand-black">
                {t("transactions")}
              </div>
              
              {transactions && transactions.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-gray-50/50 text-gray-500 text-sm border-b border-gray-100">
                        <th className="px-6 py-3 font-medium">{t("thType")}</th>
                        <th className="px-6 py-3 font-medium">{t("thAmount")}</th>
                        <th className="px-6 py-3 font-medium">{t("thStatus")}</th>
                        <th className="px-6 py-3 font-medium text-right">{t("thDate")}</th>
                      </tr>
                    </thead>
                    <tbody className="text-sm">
                      {transactions.map((tx) => {
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
                                {/* ИСПОЛЬЗУЕМ ДИНАМИЧЕСКИЙ КЛЮЧ */}
                                {t(`txType_${tx.transaction_type}` as any)}
                              </span>
                            </td>
                            <td className={`px-6 py-4 font-bold ${isIncome ? "text-green-600" : "text-brand-black"}`}>
                              {isIncome ? "+" : "-"}{formatCurrency(tx.amount)}
                            </td>
                            <td className="px-6 py-4">
                              {/* ПЕРЕВОДЫ СТАТУСОВ ИЗ СЛОВАРЯ */}
                              {tx.status === "COMPLETED" && <span className="inline-flex items-center gap-1.5 text-green-600 bg-green-50 px-2 py-1 rounded-md text-xs font-semibold"><CheckCircle2 className="w-3.5 h-3.5" />{t("statusCompleted")}</span>}
                              {tx.status === "PENDING" && <span className="inline-flex items-center gap-1.5 text-orange-600 bg-orange-50 px-2 py-1 rounded-md text-xs font-semibold"><Clock className="w-3.5 h-3.5" />{t("statusPending")}</span>}
                              {tx.status === "FAILED" && <span className="inline-flex items-center gap-1.5 text-red-600 bg-red-50 px-2 py-1 rounded-md text-xs font-semibold"><XCircle className="w-3.5 h-3.5" />{t("statusFailed")}</span>}
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

          <div className="lg:col-span-1 space-y-8 sticky top-24 self-start">
            
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="px-6 py-5 border-b border-gray-100 font-bold text-lg text-brand-black flex items-center gap-2">
                <Briefcase className="w-5 h-5 text-brand-blue" />
                {t("portfolio")}
              </div>
              
              <div className="p-4 space-y-3">
                {portfolio && portfolio.length > 0 ? (
                  portfolio.map((item) => {
                    const title = item.project.title?.[locale] || item.project.title?.en || t("defaultProject");
                    
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
                        {t("goToCatalog")}
                      </Link>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="px-6 py-5 border-b border-gray-100 font-bold text-lg text-brand-black flex items-center gap-2">
                <Gem className="w-5 h-5 text-brand-blue" />
                {t("myAssets")}
              </div>
              
              <div className="p-4 space-y-3">
                {assetPortfolio && assetPortfolio.length > 0 ? (
                  assetPortfolio.map((item) => {
                    const title = typeof item.asset.title === 'object' && item.asset.title !== null
                      ? (item.asset.title[locale] || item.asset.title.en || t("defaultAsset"))
                      : (item.asset.title || t("defaultAsset"));
                    
                    return (
                      <Link key={item.id} href={`/assets/${item.asset.id}`}>
                        <div className="p-4 rounded-xl border border-gray-100 hover:border-brand-blue/30 hover:bg-brand-blue/5 transition-all group">
                          <div className="flex justify-between items-start mb-1">
                            <h4 className="font-bold text-brand-black group-hover:text-brand-blue transition-colors line-clamp-1 flex-1">
                              {title}
                            </h4>
                            {item.asset.is_unique && (
                              <span className="shrink-0 ml-2 text-[10px] uppercase font-bold bg-brand-blue/10 text-brand-blue px-2 py-0.5 rounded">
                                {t("exclusive")}
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
                    {t("emptyAssets")}
                    <div className="mt-4">
                      <Link href="/category" className="text-brand-blue font-semibold hover:underline">
                        {t("viewExclusives")}
                      </Link>
                    </div>
                  </div>
                )}
              </div>
            </div>

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
      <DepositModal 
        isOpen={isDepositOpen}
        onClose={() => setIsDepositOpen(false)}
        onSubmit={handleDepositSubmit} 
        amount={depositAmount}
        setAmount={(val) => setDepositAmount(val === "" ? "" : Number(val))} 
        isLoading={depositMutation.isPending}
        error={depositError} 
      />

      <WithdrawModal 
        isOpen={isWithdrawOpen}
        onClose={() => setIsWithdrawOpen(false)}
        onSubmit={handleWithdrawSubmit} 
        amount={withdrawAmount}
        setAmount={(val) => setWithdrawAmount(val === "" ? "" : Number(val))} 
        address={withdrawAddress}
        setAddress={setWithdrawAddress}
        isLoading={withdrawMutation.isPending}
        error={withdrawError}
      />
    </div>
  );
}