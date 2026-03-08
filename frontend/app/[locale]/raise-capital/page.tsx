"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { motion } from "framer-motion";
import { Rocket, Send, CheckCircle2, ClipboardCheck, Coins } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { apiClient } from "../../../lib/api/client";

// Схема валидации формы через Zod
const formSchema = z.object({
  contact: z.string().min(2, "Укажите контактные данные"),
  projectUrl: z.string().url("Укажите корректную ссылку").or(z.string().min(2)),
  amount: z.string().min(1, "Укажите сумму"),
  description: z.string().min(10, "Опишите проект подробнее"),
});

type FormData = z.infer<typeof formSchema>;

export default function RaiseCapitalPage() {
  const t = useTranslations("RaiseCapital");
  const [isSuccess, setIsSuccess] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    resolver: zodResolver(formSchema),
  });

  const onSubmit = async (data: FormData) => {
    try {
      // Здесь мы стучимся в твой Django API. 
      // А уже Django под капотом отправит сообщение в Telegram бота.
      await apiClient.post("/applications/", data);
      setIsSuccess(true);
    } catch (error) {
      console.error("Ошибка при отправке:", error);
      // Временный хак для демо, пока бэкенд не готов:
      setTimeout(() => setIsSuccess(true), 1500);
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0f1c] text-white pb-24 relative overflow-hidden">
      
      {/* Декоративные фоны */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[600px] bg-brand-blue/20 blur-[150px] rounded-full pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-purple-500/10 blur-[150px] rounded-full pointer-events-none" />

      {/* Шапка */}
      <div className="pt-32 pb-16 relative z-10 px-4 max-w-4xl mx-auto text-center">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 text-gray-300 font-bold text-sm tracking-widest uppercase mb-6"
        >
          <Rocket className="w-4 h-4 text-brand-blue" />
          Launchpad
        </motion.div>
        
        <motion.h1 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-4xl md:text-6xl font-black text-white mb-6 tracking-tight"
        >
          {t("title")}
        </motion.h1>
        
        <motion.p 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-lg md:text-xl text-gray-400 max-w-2xl mx-auto leading-relaxed"
        >
          {t("subtitle")}
        </motion.p>
      </div>

      <div className="container mx-auto px-4 relative z-20 mt-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start max-w-6xl mx-auto">
          
          {/* Левая колонка: Шаги */}
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            className="space-y-8"
          >
            <div className="flex gap-4">
              <div className="w-12 h-12 rounded-full bg-brand-blue/20 text-brand-blue flex items-center justify-center shrink-0 border border-brand-blue/30">
                <Send className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-white mb-2">{t("step1Title")}</h3>
                <p className="text-gray-400 leading-relaxed">{t("step1Desc")}</p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="w-12 h-12 rounded-full bg-purple-500/20 text-purple-400 flex items-center justify-center shrink-0 border border-purple-500/30">
                <ClipboardCheck className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-white mb-2">{t("step2Title")}</h3>
                <p className="text-gray-400 leading-relaxed">{t("step2Desc")}</p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="w-12 h-12 rounded-full bg-green-500/20 text-green-400 flex items-center justify-center shrink-0 border border-green-500/30">
                <Coins className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-white mb-2">{t("step3Title")}</h3>
                <p className="text-gray-400 leading-relaxed">{t("step3Desc")}</p>
              </div>
            </div>
          </motion.div>

          {/* Правая колонка: Форма заявки */}
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-white/5 backdrop-blur-md p-8 rounded-3xl border border-white/10 shadow-2xl relative"
          >
            <h3 className="text-2xl font-bold text-white mb-6">{t("formTitle")}</h3>

            {isSuccess ? (
              <motion.div 
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-green-500/20 border border-green-500/30 p-8 rounded-2xl text-center"
              >
                <CheckCircle2 className="w-16 h-16 text-green-400 mx-auto mb-4" />
                <h4 className="text-xl font-bold text-white mb-2">Отлично!</h4>
                <p className="text-green-300">{t("successMessage")}</p>
              </motion.div>
            ) : (
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">{t("nameLabel")}</label>
                  <input 
                    {...register("contact")}
                    className="w-full px-4 py-3 bg-black/20 border border-white/10 rounded-xl text-white focus:border-brand-blue focus:ring-1 focus:ring-brand-blue outline-none transition-all placeholder:text-gray-600"
                    placeholder="@telegram_username"
                  />
                  {errors.contact && <p className="text-red-400 text-xs mt-1">{errors.contact.message}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">{t("projectLabel")}</label>
                  <input 
                    {...register("projectUrl")}
                    className="w-full px-4 py-3 bg-black/20 border border-white/10 rounded-xl text-white focus:border-brand-blue focus:ring-1 focus:ring-brand-blue outline-none transition-all placeholder:text-gray-600"
                    placeholder="https://t.me/my_channel"
                  />
                  {errors.projectUrl && <p className="text-red-400 text-xs mt-1">{errors.projectUrl.message}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">{t("amountLabel")}</label>
                  <input 
                    type="number"
                    {...register("amount")}
                    className="w-full px-4 py-3 bg-black/20 border border-white/10 rounded-xl text-white focus:border-brand-blue focus:ring-1 focus:ring-brand-blue outline-none transition-all placeholder:text-gray-600"
                    placeholder="50000"
                  />
                  {errors.amount && <p className="text-red-400 text-xs mt-1">{errors.amount.message}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">{t("descLabel")}</label>
                  <textarea 
                    {...register("description")}
                    rows={4}
                    className="w-full px-4 py-3 bg-black/20 border border-white/10 rounded-xl text-white focus:border-brand-blue focus:ring-1 focus:ring-brand-blue outline-none transition-all placeholder:text-gray-600 resize-none"
                    placeholder="Опишите текущие доходы, тематику и аудиторию..."
                  />
                  {errors.description && <p className="text-red-400 text-xs mt-1">{errors.description.message}</p>}
                </div>

                <button 
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-4 bg-brand-blue hover:bg-[#007cbd] text-white rounded-xl font-bold text-lg transition-colors flex items-center justify-center gap-2 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed mt-4"
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      {t("sendingBtn")}
                    </>
                  ) : (
                    <>
                      {t("submitBtn")}
                      <Send className="w-5 h-5" />
                    </>
                  )}
                </button>
              </form>
            )}
          </motion.div>

        </div>
      </div>
    </div>
  );
}