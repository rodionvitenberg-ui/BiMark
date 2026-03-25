"use client";

import { useTranslations } from "next-intl";
import { motion } from "framer-motion";
import { XCircle, RefreshCcw, ArrowLeft } from "lucide-react";
import { Link } from "../../../../i18n/routing";

export default function PaymentFailedPage() {
  const t = useTranslations("Payment");

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-black flex items-center justify-center p-4 pt-20">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="max-w-md w-full bg-white dark:bg-[#111827] rounded-3xl shadow-2xl border border-gray-100 dark:border-gray-800 p-8 text-center"
      >
        <div className="w-20 h-20 bg-red-100 dark:bg-red-900/30 text-red-500 rounded-full flex items-center justify-center mx-auto mb-6">
          <XCircle className="w-10 h-10" />
        </div>
        
        <h1 className="text-3xl font-black text-gray-900 dark:text-white mb-4">
          {t("failedTitle")}
        </h1>
        
        <p className="text-gray-600 dark:text-gray-400 mb-8">
          {t("failedMessage")}
        </p>

        <div className="space-y-3">
          <Link 
            href="/checkout" 
            className="w-full py-4 rounded-xl font-bold text-lg bg-brand-blue text-white hover:bg-[#007cbd] shadow-lg shadow-brand-blue/20 transition-all flex justify-center items-center gap-2"
          >
            <RefreshCcw className="w-5 h-5" />
            {t("tryAgain")}
          </Link>
          
          <Link 
            href="/category" 
            className="w-full py-4 rounded-xl font-bold text-gray-600 dark:text-gray-300 bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 transition-all flex justify-center items-center gap-2"
          >
            <ArrowLeft className="w-5 h-5" />
            {t("backToCatalog")}
          </Link>
        </div>
      </motion.div>
    </div>
  );
}