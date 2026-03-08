"use client";

import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { motion, AnimatePresence } from "framer-motion";
import { Trash2, ArrowLeft, CreditCard, Wallet, CheckCircle2, Loader2 } from "lucide-react";
import { useMutation } from "@tanstack/react-query";
import { Link, useRouter } from "../../../i18n/routing";
import { apiClient } from "../../../lib/api/client";
import { useCart } from "../../../hooks/use-cart";
import PaymentModal from "../../../components/modules/payment-modal";
import { useUser } from "../../../hooks/use-auth";

type PaymentMethod = "BALANCE" | "STRIPE";

export default function CheckoutPage() {
  const t = useTranslations("Checkout");
  const router = useRouter();
  
  // Zustand store
  const { items, removeItem, updateQuantity, getTotalPrice, clearCart } = useCart();
  
  // Локальные состояния
  const [isMounted, setIsMounted] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("BALANCE");
  const [isSuccess, setIsSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  
  // Состояния для Stripe
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [isStripeModalOpen, setIsStripeModalOpen] = useState(false);

  // Получаем юзера (чтобы проверить авторизацию)
  const { data: user, isLoading: isUserLoading } = useUser();

  // Защита от Hydration Mismatch
  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Мутация оформления заказа
  const checkoutMutation = useMutation({
    mutationFn: async () => {
      const payload = {
        payment_method: paymentMethod,
        items: items.map(item => ({
          project_id: item.project_id,
          shares_amount: item.shares_amount
        }))
      };
      const response = await apiClient.post("/catalog/checkout/", payload);
      return response.data;
    },
    onSuccess: (data) => {
      if (data.status === "pending_payment" && data.client_secret) {
        // Если выбрали Stripe — открываем модалку
        setClientSecret(data.client_secret);
        setIsStripeModalOpen(true);
      } else if (data.status === "success") {
        // Если выбрали Баланс — успешно
        handleSuccessFinalize();
      }
    },
    onError: (error: any) => {
      const msg = error.response?.data?.detail || error.message || "Произошла ошибка";
      setErrorMsg(msg);
      setTimeout(() => setErrorMsg(null), 5000);
    }
  });

  // Успешное завершение оплаты
  const handleSuccessFinalize = () => {
    setIsStripeModalOpen(false);
    clearCart();
    setIsSuccess(true);
    // Через 3 секунды уводим в дашборд
    setTimeout(() => {
      router.push("/dashboard");
    }, 3000);
  };

  if (!isMounted || isUserLoading) return null;

  // Если корзина пуста (и мы не находимся на экране успеха)
  if (items.length === 0 && !isSuccess) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-zinc-50 dark:bg-black px-4">
        <ShoppingCartIcon className="w-16 h-16 text-gray-300 mb-6" />
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">{t("emptyCart")}</h2>
        <Link href="/category" className="px-6 py-3 bg-brand-blue text-white rounded-xl font-medium hover:bg-[#007cbd] transition-colors">
          {t("backToCatalog")}
        </Link>
      </div>
    );
  }

  // Экран успешной оплаты
  if (isSuccess) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-zinc-50 dark:bg-black px-4">
        <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="mb-6 text-green-500">
          <CheckCircle2 className="w-20 h-20" />
        </motion.div>
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2 text-center">{t("successMessage")}</h2>
        <p className="text-gray-500 dark:text-gray-400">{t("redirecting")}</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-black pt-28 pb-20">
      <div className="max-w-7xl mx-auto px-4">
        
        <Link href="/category" className="inline-flex items-center gap-2 text-sm font-medium text-gray-500 hover:text-brand-blue transition-colors mb-8">
          <ArrowLeft className="w-4 h-4" />
          {t("backToCatalog")}
        </Link>

        <h1 className="text-4xl font-extrabold text-gray-900 dark:text-white mb-10">{t("title")}</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          
          {/* ЛЕВАЯ ЧАСТЬ: СПИСОК ТОВАРОВ */}
          <div className="lg:col-span-2 space-y-6">
            <AnimatePresence>
              {items.map((item) => (
                <motion.div 
                  key={item.project_id}
                  layout
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: -50 }}
                  className="flex flex-col sm:flex-row items-center gap-6 p-4 sm:p-6 bg-white dark:bg-[#111827] rounded-3xl shadow-sm border border-gray-100 dark:border-gray-800"
                >
                  <div className="w-full sm:w-32 h-24 bg-gray-100 dark:bg-gray-800 rounded-2xl overflow-hidden shrink-0">
                    {item.image && <img src={item.image} alt={item.title} className="w-full h-full object-cover" />}
                  </div>
                  
                  <div className="flex-1 flex flex-col w-full">
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">{item.title}</h3>
                    <div className="flex items-center gap-4 text-sm text-gray-500 mb-4">
                      <span>{t("price")}: ${item.price_per_share}</span>
                      <span>{t("available")}: {item.available_shares} {t("pcs")}</span>
                    </div>

                    <div className="flex items-center justify-between mt-auto">
                      <div className="flex items-center gap-4 bg-gray-50 dark:bg-gray-800/50 p-1.5 rounded-xl border border-gray-100 dark:border-gray-800">
                        <input 
                          type="number" 
                          min="1" 
                          max={item.available_shares}
                          value={item.shares_amount}
                          onChange={(e) => updateQuantity(item.project_id, parseInt(e.target.value) || 1)}
                          className="w-16 text-center bg-transparent border-none outline-none font-bold text-gray-900 dark:text-white"
                        />
                        <span className="pr-3 text-xs font-medium text-gray-500 uppercase">{t("pcs")}</span>
                      </div>
                      
                      <div className="flex items-center gap-6">
                        <span className="text-xl font-black text-gray-900 dark:text-white">
                          ${(item.price_per_share * item.shares_amount).toFixed(2)}
                        </span>
                        <button 
                          onClick={() => removeItem(item.project_id)}
                          className="text-gray-400 hover:text-red-500 transition-colors p-2"
                          title={t("remove")}
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          {/* ПРАВАЯ ЧАСТЬ: ИТОГИ И ОПЛАТА */}
          <div className="relative">
            <div className="sticky top-32 bg-white dark:bg-[#111827] rounded-3xl shadow-xl border border-gray-100 dark:border-gray-800 p-8">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6">{t("summary")}</h3>
              
              <div className="space-y-4 mb-8">
                {/* Убрали "Позиций в корзине", оставили только "К оплате" */}
                <div className="flex justify-between items-center pt-4 border-gray-100 dark:border-gray-800">
                  <span className="font-semibold text-gray-700 dark:text-gray-300">{t("totalAmount")}:</span>
                  <span className="text-3xl font-black text-brand-blue">${getTotalPrice().toFixed(2)}</span>
                </div>
              </div>

              {/* МЕТОДЫ ОПЛАТЫ */}
              <div className="mb-8 space-y-3">
                <p className="text-sm font-semibold text-gray-500 uppercase">{t("paymentMethod")}</p>
                
                <label className={`flex items-center gap-4 p-4 rounded-2xl border-2 cursor-pointer transition-colors ${paymentMethod === "BALANCE" ? "border-brand-blue bg-blue-50/50 dark:bg-brand-blue/10" : "border-gray-100 dark:border-gray-800 hover:border-gray-300"}`}>
                  <input type="radio" name="payment" value="BALANCE" checked={paymentMethod === "BALANCE"} onChange={() => setPaymentMethod("BALANCE")} className="hidden" />
                  <Wallet className={`w-6 h-6 ${paymentMethod === "BALANCE" ? "text-brand-blue" : "text-gray-400"}`} />
                  <div>
                    <p className="font-bold text-gray-900 dark:text-white">{t("payFromBalance")}</p>
                    {user && <p className="text-xs text-gray-500">{t("available")}: ${user.balance}</p>}
                  </div>
                </label>

                <label className={`flex items-center gap-4 p-4 rounded-2xl border-2 cursor-pointer transition-colors ${paymentMethod === "STRIPE" ? "border-brand-blue bg-blue-50/50 dark:bg-brand-blue/10" : "border-gray-100 dark:border-gray-800 hover:border-gray-300"}`}>
                  <input type="radio" name="payment" value="STRIPE" checked={paymentMethod === "STRIPE"} onChange={() => setPaymentMethod("STRIPE")} className="hidden" />
                  <CreditCard className={`w-6 h-6 ${paymentMethod === "STRIPE" ? "text-brand-blue" : "text-gray-400"}`} />
                  <p className="font-bold text-gray-900 dark:text-white">{t("payWithStripe")}</p>
                </label>
              </div>

              {errorMsg && (
                <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-sm font-medium rounded-xl border border-red-100 dark:border-red-900/50">
                  {errorMsg}
                </div>
              )}

              {!user ? (
                <div className="text-center p-4 bg-gray-50 dark:bg-gray-800 rounded-xl">
                  <p className="text-sm text-gray-500 mb-3">{t("loginRequired")}</p>
                  <Link href={`/login?redirect=/checkout`} className="inline-block w-full py-3 bg-gray-900 dark:bg-white text-white dark:text-gray-900 font-bold rounded-xl transition-colors">
                    {t("loginBtn")}
                  </Link>
                </div>
              ) : (
                <button
                  onClick={() => checkoutMutation.mutate()}
                  disabled={checkoutMutation.isPending}
                  className="w-full py-4 rounded-xl font-bold text-lg bg-brand-blue text-white hover:bg-[#007cbd] shadow-lg shadow-brand-blue/20 transition-all disabled:opacity-70 flex justify-center items-center"
                >
                  {checkoutMutation.isPending ? (
                    <Loader2 className="w-6 h-6 animate-spin" />
                  ) : (
                    t("confirmOrder")
                  )}
                </button>
              )}

            </div>
          </div>

        </div>
      </div>

      {/* МОДАЛКА STRIPE */}
      <PaymentModal 
        isOpen={isStripeModalOpen}
        onClose={() => setIsStripeModalOpen(false)}
        clientSecret={clientSecret}
        onPaymentSuccess={handleSuccessFinalize}
      />

    </div>
  );
}

// Заглушка для иконки пустой корзины
function ShoppingCartIcon(props: any) {
  return (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="8" cy="21" r="1"/><circle cx="19" cy="21" r="1"/><path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12"/>
    </svg>
  );
}