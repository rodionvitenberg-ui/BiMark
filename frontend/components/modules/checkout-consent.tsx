"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { motion, AnimatePresence } from "framer-motion";
import { Check, X, FileText } from "lucide-react";

interface CheckoutConsentProps {
  onConsentChange: (agreed: boolean) => void;
}

export function CheckoutConsent({ onConsentChange }: CheckoutConsentProps) {
  const t = useTranslations("CheckoutConsent");
  const [agreed, setAgreed] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleToggle = () => {
    const newValue = !agreed;
    setAgreed(newValue);
    onConsentChange(newValue);
  };

  return (
    <>
      <div className="flex items-start gap-3 p-4 bg-gray-50 dark:bg-gray-800/50 rounded-2xl border border-gray-100 dark:border-gray-800 my-6">
        <button
          type="button"
          onClick={handleToggle}
          className={`mt-0.5 shrink-0 w-6 h-6 rounded-md border-2 flex items-center justify-center transition-colors ${
            agreed 
              ? "bg-brand-blue border-brand-blue" 
              : "bg-white dark:bg-gray-900 border-gray-300 dark:border-gray-600 hover:border-brand-blue"
          }`}
        >
          {agreed && <Check className="w-4 h-4 text-white" />}
        </button>
        <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
          {t("iAgreeTo", { fallback: "Я подтверждаю, что прочитал и принимаю условия " })}
          <button 
            type="button"
            onClick={() => setIsModalOpen(true)}
            className="text-brand-blue font-bold hover:underline"
          >
            {t("termsLink", { fallback: "Договора купли-продажи прав на прибыль" })}
          </button>.
        </p>
      </div>

      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              exit={{ opacity: 0 }} 
              onClick={() => setIsModalOpen(false)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />
            
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }} 
              animate={{ opacity: 1, scale: 1, y: 0 }} 
              exit={{ opacity: 0, scale: 0.95, y: 20 }} 
              className="relative w-full max-w-2xl max-h-[85vh] flex flex-col bg-white dark:bg-[#111827] rounded-3xl shadow-2xl border border-gray-100 dark:border-gray-800 overflow-hidden"
            >
              <div className="flex items-center justify-between p-6 border-b border-gray-100 dark:border-gray-800">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-50 dark:bg-blue-900/20 text-brand-blue flex items-center justify-center rounded-xl">
                    <FileText className="w-5 h-5" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white line-clamp-1">
                    {t("modalTitle", { fallback: "Договор купли-продажи" })}
                  </h3>
                </div>
                <button 
                  onClick={() => setIsModalOpen(false)}
                  className="p-2 text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors bg-gray-50 dark:bg-gray-800 rounded-full"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-6 overflow-y-auto custom-scrollbar text-sm text-gray-600 dark:text-gray-300 space-y-6">
                
                {/* Текст договора */}
                <h3 className="font-black text-center text-gray-900 dark:text-white mb-6">
                  {t("docTitle")}
                </h3>

                <div className="space-y-4">
                  <h4 className="font-bold text-gray-900 dark:text-white text-base">{t("section1Title")}</h4>
                  <p>{t("clause1_1")}</p>
                  <p>{t("clause1_2")}</p>
                  <p>{t("clause1_3")}</p>
                </div>

                <div className="space-y-4">
                  <h4 className="font-bold text-gray-900 dark:text-white text-base">{t("section2Title")}</h4>
                  <p>{t("clause2_1")}</p>
                  <p>{t("clause2_2")}</p>
                  <p>{t("clause2_3")}</p>
                  <p>{t("clause2_4")}</p>
                </div>

                <div className="space-y-4">
                  <h4 className="font-bold text-gray-900 dark:text-white text-base">{t("section3Title")}</h4>
                  <p>{t("clause3_1")}</p>
                  <p>{t("clause3_2")}</p>
                </div>

                <div className="space-y-4">
                  <h4 className="font-bold text-gray-900 dark:text-white text-base">{t("section4Title")}</h4>
                  <p>{t("clause4_1")}</p>
                  <p>{t("clause4_2")}</p>
                </div>

                <div className="space-y-4">
                  <h4 className="font-bold text-gray-900 dark:text-white text-base">{t("section5Title")}</h4>
                  <p>{t("clause5_1")}</p>
                  <p>{t("clause5_2")}</p>
                </div>

                <div className="space-y-4">
                  <h4 className="font-bold text-gray-900 dark:text-white text-base">{t("section6Title")}</h4>
                  <p>{t("clause6_1")}</p>
                  <p>{t("clause6_2")}</p>
                  <p>{t("clause6_3")}</p>
                </div>

                <div className="space-y-4">
                  <h4 className="font-bold text-gray-900 dark:text-white text-base">{t("section7Title")}</h4>
                  <p>{t("clause7_1")}</p>
                  <p>{t("clause7_2")}</p>
                </div>

              </div>
              
              <div className="p-6 border-t border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/30">
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="w-full py-3 bg-brand-blue text-white font-bold rounded-xl hover:bg-[#007cbd] transition-colors"
                >
                  {t("closeModalBtn", { fallback: "Закрыть и продолжить" })}
                </button>
              </div>

            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}