"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { getProfileSchemas, PasswordChangeFormValues } from "@/lib/validations/profile";
import { useUser } from "@/hooks/use-auth";
import { apiClient } from "@/lib/api/client"; // твой настроенный axios
import { Camera, Wallet, ShieldCheck } from "lucide-react";

export function ProfileSettings() {
  const t = useTranslations("Profile");
  const { data: user, isLoading } = useUser();
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [serverMessage, setServerMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const schemas = getProfileSchemas(t);

  const form = useForm<PasswordChangeFormValues>({
    resolver: zodResolver(schemas.passwordSchema),
    defaultValues: { oldPassword: "", newPassword: "", confirmPassword: "" },
  });

  const onSubmit = async (data: PasswordChangeFormValues) => {
    setIsSubmitting(true);
    setServerMessage(null);
    try {
      // Эндпоинт dj-rest-auth для смены пароля
      await apiClient.post("/auth/password/change/", {
        old_password: data.oldPassword,
        new_password1: data.newPassword,
        new_password2: data.confirmPassword,
      });

      setServerMessage({ type: "success", text: t("passwordChanged") });
      form.reset(); // Очищаем форму после успеха
    } catch (err: any) {
      const errorData = err.response?.data;
      setServerMessage({ 
        type: "error", 
        text: errorData?.old_password?.[0] || errorData?.detail || "Ошибка при смене пароля" 
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return <div className="animate-pulse h-96 bg-zinc-100 dark:bg-zinc-900 rounded-2xl w-full max-w-4xl mx-auto"></div>;
  }

  if (!user) return null; // Если юзера нет, страница (page.tsx) сделает редирект

  return (
    <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
      
      {/* ЛЕВАЯ КОЛОНКА: Инфо и Аватарка */}
      <div className="col-span-1 space-y-6">
        <div className="bg-white dark:bg-zinc-900 p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm text-center">
          {/* Заглушка аватарки */}
          <div className="relative w-24 h-24 mx-auto mb-4 group cursor-pointer">
            <div className="w-full h-full rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 flex items-center justify-center text-3xl font-bold uppercase transition-colors">
              {user.email.charAt(0)}
            </div>
            {/* Оверлей при наведении */}
            <div className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
              <Camera className="w-6 h-6 text-white" />
            </div>
          </div>
          
          <h3 className="font-semibold text-zinc-900 dark:text-zinc-100 truncate">{user.email}</h3>
          <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">ID: {user.id.split('-')[0]}...</p>
        </div>

        <div className="bg-white dark:bg-zinc-900 p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm">
          <h4 className="text-sm font-medium text-zinc-500 dark:text-zinc-400 mb-2 uppercase tracking-wider">{t("balanceLabel")}</h4>
          <div className="flex items-center gap-3">
            <div className="p-3 bg-green-100 dark:bg-green-900/30 text-green-600 rounded-xl">
              <Wallet className="w-6 h-6" />
            </div>
            <span className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">${user.balance}</span>
          </div>
        </div>
      </div>

      {/* ПРАВАЯ КОЛОНКА: Настройки (Смена пароля) */}
      <div className="col-span-1 md:col-span-2">
        <div className="bg-white dark:bg-zinc-900 p-8 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm">
          <div className="flex items-center gap-3 mb-6 pb-6 border-b border-zinc-100 dark:border-zinc-800">
            <ShieldCheck className="w-6 h-6 text-blue-500" />
            <h2 className="text-xl font-semibold text-zinc-900 dark:text-zinc-100">{t("changePassword")}</h2>
          </div>

          {serverMessage && (
            <div className={`mb-6 p-4 rounded-xl text-sm ${
              serverMessage.type === "success" 
                ? "bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-400" 
                : "bg-red-50 text-red-700 dark:bg-red-900/20 dark:text-red-400"
            }`}>
              {serverMessage.text}
            </div>
          )}

          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">{t("oldPassword")}</label>
              <input
                {...form.register("oldPassword")}
                type="password"
                className="w-full px-4 py-3 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-transparent focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
              />
              {form.formState.errors.oldPassword && <p className="mt-1 text-sm text-red-500">{form.formState.errors.oldPassword.message}</p>}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">{t("newPassword")}</label>
                <input
                  {...form.register("newPassword")}
                  type="password"
                  className="w-full px-4 py-3 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-transparent focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                />
                {form.formState.errors.newPassword && <p className="mt-1 text-sm text-red-500">{form.formState.errors.newPassword.message}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">{t("confirmPassword")}</label>
                <input
                  {...form.register("confirmPassword")}
                  type="password"
                  className="w-full px-4 py-3 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-transparent focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                />
                {form.formState.errors.confirmPassword && <p className="mt-1 text-sm text-red-500">{form.formState.errors.confirmPassword.message}</p>}
              </div>
            </div>

            <div className="pt-4">
              <button
                type="submit"
                disabled={isSubmitting}
                className="bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 font-medium px-6 py-3 rounded-xl hover:bg-zinc-800 dark:hover:bg-zinc-200 transition-colors disabled:opacity-50"
              >
                {isSubmitting ? "..." : t("saveChanges")}
              </button>
            </div>
          </form>
        </div>
      </div>
      
    </div>
  );
}