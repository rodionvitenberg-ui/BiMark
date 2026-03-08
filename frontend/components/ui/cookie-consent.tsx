"use client";

import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { motion, AnimatePresence } from "framer-motion";
import { Cookie } from "lucide-react";

export function CookieConsent() {
  const t = useTranslations("Cookies");
  const [show, setShow] = useState(false);

  useEffect(() => {
    // Проверяем, принимал ли уже юзер куки
    const consent = localStorage.getItem("cookie_consent");
    
    if (!consent) {
      // Даем пользователю полторы секунды оглядеться, прежде чем показывать плашку
      const timer = setTimeout(() => setShow(true), 1500);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleConsent = (action: "accept" | "reject") => {
    // Записываем выбор в локальное хранилище браузера
    localStorage.setItem("cookie_consent", action);
    setShow(false);
  };

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ y: 100, opacity: 0, scale: 0.95 }}
          animate={{ y: 0, opacity: 1, scale: 1 }}
          exit={{ y: 100, opacity: 0, scale: 0.95 }}
          transition={{ type: "spring", stiffness: 200, damping: 20 }}
          className="fixed bottom-6 left-4 md:left-6 z-[100] w-[calc(100%-2rem)] md:w-full max-w-sm bg-white rounded-2xl shadow-2xl border border-gray-100 p-6"
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-full bg-brand-blue/10 flex items-center justify-center text-brand-blue shrink-0">
              <Cookie className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-bold text-brand-black">{t("title")}</h3>
          </div>
          
          <p className="text-sm text-gray-500 mb-6 leading-relaxed">
            {t("description")}
          </p>
          
          <div className="flex gap-3">
            <button
              onClick={() => handleConsent("reject")}
              className="flex-1 py-2.5 px-4 bg-gray-100 text-brand-black text-sm font-semibold rounded-xl hover:bg-gray-200 transition-colors"
            >
              {t("reject")}
            </button>
            <button
              onClick={() => handleConsent("accept")}
              className="flex-1 py-2.5 px-4 bg-brand-blue text-white text-sm font-semibold rounded-xl hover:bg-[#007cbd] transition-colors shadow-lg shadow-brand-blue/20"
            >
              {t("accept")}
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}