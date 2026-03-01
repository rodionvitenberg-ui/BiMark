"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { getAuthSchemas, LoginFormValues } from "@/lib/validations/auth";
import { useRouter } from "next/navigation";
import { apiClient } from "@/lib/api/client";
import { useGoogleLogin, TokenResponse } from "@react-oauth/google"; // <-- Добавлен импорт
import Link from "next/link";

export default function LoginForm() {
  const t = useTranslations("Auth");
  const router = useRouter();
  
  const [isLoading, setIsLoading] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  const schemas = getAuthSchemas(t);

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(schemas.loginSchema),
    defaultValues: { email: "", password: "" },
  });

  const onSubmit = async (data: LoginFormValues) => {
    setIsLoading(true);
    setServerError(null);
    try {
      await apiClient.post("/auth/login/", {
        email: data.email,
        password: data.password,
      });

      // Если код дошел сюда, значит статус 200 OK. 
      // Куки установлены (благодаря withCredentials: true в apiClient).
      router.push("/dashboard");
      router.refresh();
    } catch (err: any) {
      // Axios кладет тело ответа сервера в err.response.data
      const errorData = err.response?.data;
      setServerError(
        errorData?.non_field_errors?.[0] || 
        errorData?.detail || 
        "Неверный email или пароль"
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = useGoogleLogin({
    // <-- Добавлена типизация : TokenResponse (или можно использовать : any)
    onSuccess: async (tokenResponse: any) => { 
      setIsLoading(true);
      setServerError(null);
      try {
        await apiClient.post("/auth/google/", {
          access_token: tokenResponse.access_token,
        });

        router.push("/dashboard");
        router.refresh();
      } catch (err: any) {
        const errorData = err.response?.data;
        setServerError(
          errorData?.non_field_errors?.[0] || 
          "Ошибка авторизации через Google"
        );
      } finally {
        setIsLoading(false);
      }
    },
    onError: () => {
      setServerError("Не удалось подключиться к Google");
    },
  });

  return (
    <div className="w-full max-w-md mx-auto p-8 bg-white dark:bg-zinc-900 shadow-sm border border-zinc-200 dark:border-zinc-800 rounded-2xl">
      <h2 className="text-2xl font-semibold mb-6 text-zinc-900 dark:text-zinc-100 text-center">
        {t("loginTitle")}
      </h2>

      {serverError && (
        <div className="mb-4 p-3 text-sm text-red-600 bg-red-50 dark:bg-red-900/20 rounded-lg">
          {serverError}
        </div>
      )}

      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">
            {t("emailLabel")}
          </label>
          <input
            {...form.register("email")}
            type="email"
            placeholder={t("emailPlaceholder")}
            className="w-full px-4 py-3 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-transparent focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
          />
          {form.formState.errors.email && (
            <p className="mt-1 text-sm text-red-500">{form.formState.errors.email.message}</p>
          )}
        </div>

        <div>
          <div className="flex justify-between items-center mb-1">
            <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
              {t("passwordLabel")}
            </label>
            <Link href="/forgot-password" className="text-sm text-blue-600 dark:text-blue-400 hover:underline">
              {t("forgotPassword")}
            </Link>
          </div>
          <input
            {...form.register("password")}
            type="password"
            placeholder="••••••••••"
            className="w-full px-4 py-3 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-transparent focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
          />
          {form.formState.errors.password && (
            <p className="mt-1 text-sm text-red-500">{form.formState.errors.password.message}</p>
          )}
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full py-3 px-4 bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 font-medium rounded-xl hover:bg-zinc-800 dark:hover:bg-zinc-200 transition-colors disabled:opacity-50 mt-2"
        >
          {isLoading ? "..." : t("loginSubmit")}
        </button>

        <div className="relative flex items-center py-4">
          <div className="flex-grow border-t border-zinc-200 dark:border-zinc-800"></div>
          <span className="flex-shrink-0 mx-4 text-zinc-400 text-sm">или</span>
          <div className="flex-grow border-t border-zinc-200 dark:border-zinc-800"></div>
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
            <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
          </svg>
          {t("continueWithGoogle")}
        </button>
      </form>

      <div className="mt-6 text-center">
        <Link 
          href="/register" 
          className="text-sm text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors"
        >
          {t("dontHaveAccount")}
        </Link>
      </div>
    </div>
  );
}