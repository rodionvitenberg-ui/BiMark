"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { getAuthSchemas, LoginFormValues } from "@/lib/validations/auth";
import { useRouter } from "next/navigation";
import { apiClient } from "@/lib/api/client";
import { useGoogleLogin, TokenResponse } from "@react-oauth/google";
import Link from "next/link";
import { useToast } from "@/components/ui/toast"; // <-- Импорт тостера

export default function LoginForm() {
  const t = useTranslations("Auth");
  const tToast = useTranslations("Toast"); // <-- Словарь для тостеров
  const router = useRouter();
  const { toast } = useToast();
  
  const [isLoading, setIsLoading] = useState(false);

  // Передаем tToast в схемы!
  const schemas = getAuthSchemas(tToast);

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(schemas.loginSchema),
    defaultValues: { email: "", password: "" },
  });

  // Ловец ошибок валидации (пустые поля, кривой email)
  const onValidationError = (errors: any) => {
    Object.values(errors).forEach((error: any) => {
      if (error?.message) {
        toast({
          title: tToast("errorTitle"),
          description: error.message,
          variant: "destructive",
        });
      }
    });
  };

  const onSubmit = async (data: LoginFormValues) => {
    setIsLoading(true);
    try {
      await apiClient.post("/auth/login/", {
        email: data.email,
        password: data.password,
      });
      router.push("/dashboard");
      router.refresh();
    } catch (err: any) {
      // Ошибка сервера (неверный логин/пароль)
      toast({
        title: tToast("errorTitle"),
        description: tToast("invalidCredentials"),
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = useGoogleLogin({
    onSuccess: async (tokenResponse: TokenResponse) => {
      try {
        await apiClient.post("/auth/google/", {
          access_token: tokenResponse.access_token,
        });
        router.push("/dashboard");
        router.refresh();
      } catch (error) {
        toast({
          title: tToast("serverErrorTitle"),
          description: "Ошибка авторизации через Google",
          variant: "destructive",
        });
      }
    },
    onError: () => {
      toast({
        title: tToast("errorTitle"),
        description: "Google авторизация отменена",
        variant: "warning",
      });
    },
  });

  return (
    <div className="w-full max-w-md mx-auto">
      <div className="mb-8 text-center">
        <h2 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100 mb-2">
          {t("loginTitle")}
        </h2>
        <p className="text-zinc-600 dark:text-zinc-400">
          {t("loginSubtitle")}
        </p>
      </div>

      <form onSubmit={form.handleSubmit(onSubmit, onValidationError)} className="space-y-4">
        <div className="space-y-1">
          <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
            {t("emailLabel")}
          </label>
          <input
            {...form.register("email")}
            type="email"
            placeholder={t("emailPlaceholder")}
            className="w-full px-4 py-3 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-transparent focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
          />
        </div>

        <div className="space-y-1">
          <div className="flex items-center justify-between mb-1">
            <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
              {t("passwordLabel")}
            </label>
            <Link href="/reset-password" className="text-sm text-blue-600 hover:text-blue-500 dark:text-blue-400">
              Забыли пароль?
            </Link>
          </div>
          <input
            {...form.register("password")}
            type="password"
            placeholder={t("passwordPlaceholder")}
            className="w-full px-4 py-3 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-transparent focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
          />
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full py-3 px-4 bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 font-medium rounded-xl hover:bg-zinc-800 dark:hover:bg-zinc-200 transition-colors disabled:opacity-50 mt-4"
        >
          {isLoading ? "..." : t("login")}
        </button>

        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-zinc-300 dark:border-zinc-700"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-white dark:bg-[#0a0f1c] text-zinc-500">
              {t("orContinueWith")}
            </span>
          </div>
        </div>

        <button
          type="button"
          onClick={() => handleGoogleLogin()}
          className="w-full flex items-center justify-center gap-2 py-3 px-4 border border-zinc-300 dark:border-zinc-700 rounded-xl hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors font-medium text-zinc-700 dark:text-zinc-300"
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24">
            <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
            <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
            <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
            <path fill="currentColor" d="M12 5.38c1.56 0 2.96.54 4.06 1.58l3.05-3.05C17.46 2.18 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
          </svg>
          Google
        </button>
      </form>

      <div className="mt-6 text-center text-sm text-zinc-600 dark:text-zinc-400">
        {t("noAccount")}{" "}
        <Link href="/register" className="font-medium text-brand-blue hover:text-blue-500">
          {t("registerLink")}
        </Link>
      </div>
    </div>
  );
}