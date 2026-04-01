"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { getAuthSchemas, EmailFormValues, OtpFormValues, PasswordFormValues } from "@/lib/validations/auth";
import { useRouter, useSearchParams } from "next/navigation";
import { apiClient } from "@/lib/api/client"; 
import { useGoogleLogin } from "@react-oauth/google"; 
import { useToast } from "@/components/ui/toast";

export default function RegistrationFlow() {
  const t = useTranslations("Auth");
  const tToast = useTranslations("Toast");
  const router = useRouter();
  const { toast } = useToast();
  
  const searchParams = useSearchParams();
  const refCode = searchParams.get("ref");
  
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [email, setEmail] = useState("");
  const [otpCode, setOtpCode] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const schemas = getAuthSchemas(tToast);

  const emailForm = useForm<EmailFormValues>({
    resolver: zodResolver(schemas.emailSchema),
    defaultValues: { email: "" },
  });

  const otpForm = useForm<OtpFormValues>({
    resolver: zodResolver(schemas.otpSchema),
    defaultValues: { code: "" },
  });

  const passwordForm = useForm<PasswordFormValues>({
    resolver: zodResolver(schemas.passwordSchema),
    defaultValues: { password: "", confirmPassword: "" },
  });

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

  const onEmailSubmit = async (data: EmailFormValues) => {
    setIsLoading(true);
    try {
      await apiClient.post("/users/register/request-otp/", { email: data.email });
      setEmail(data.email);
      setStep(2);
    } catch (err: any) {
      toast({
        title: tToast("serverErrorTitle"),
        description: err.response?.data?.email?.[0] || tToast("registrationFailed"),
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const onOtpSubmit = async (data: OtpFormValues) => {
    setOtpCode(data.code);
    setStep(3);
  };

  const onPasswordSubmit = async (data: PasswordFormValues) => {
    setIsLoading(true);
    try {
      const payload: any = {
        email,
        code: otpCode,
        password: data.password,
      };
      if (refCode) {
        payload.referral_code = refCode;
      }
      await apiClient.post("/users/register/confirm/", payload);
      
      toast({
        title: tToast("successTitle"),
        description: "Регистрация успешна!",
        variant: "success",
      });
      router.push("/dashboard");
      router.refresh();
    } catch (err: any) {
      toast({
        title: tToast("errorTitle"),
        description: err.response?.data?.detail || tToast("registrationFailed"),
        variant: "destructive",
      });
      setStep(2); 
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
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
  });

  return (
    <div className="w-full max-w-md mx-auto">
      <div className="mb-8 text-center">
        <h2 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100 mb-2">
          {t("registerTitle")}
        </h2>
        <p className="text-zinc-600 dark:text-zinc-400">
          {step === 1 ? t("step1Subtitle") : step === 2 ? t("step2Subtitle") : t("step3Subtitle")}
        </p>
      </div>

      {step === 1 && (
        <form onSubmit={emailForm.handleSubmit(onEmailSubmit, onValidationError)} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">
              {t("emailLabel")}
            </label>
            <input
              {...emailForm.register("email")}
              type="email"
              placeholder={t("emailPlaceholder")}
              className="w-full px-4 py-3 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-transparent focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
            />
          </div>
          
          {/* ОБНОВЛЕННАЯ КНОПКА: Продолжить */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 px-4 bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 font-medium rounded-xl hover:bg-zinc-800 dark:hover:bg-zinc-200 transition-all duration-300 hover:scale-[1.02] hover:shadow-lg disabled:opacity-50 cursor-pointer"
          >
            {isLoading ? "..." : t("continue")}
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
          
          {/* ОБНОВЛЕННАЯ КНОПКА GOOGLE */}
          <button
            type="button"
            onClick={() => handleGoogleLogin()}
            className="w-full flex items-center justify-center gap-3 py-3 px-4 border border-zinc-300 dark:border-zinc-700 rounded-xl bg-white dark:bg-zinc-900 hover:bg-zinc-50 dark:hover:bg-zinc-800 hover:scale-[1.02] hover:shadow-lg transition-all duration-300 cursor-pointer font-medium text-zinc-700 dark:text-zinc-300 shadow-sm"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
              <path fill="#EA4335" d="M12 5.38c1.56 0 2.96.54 4.06 1.58l3.05-3.05C17.46 2.18 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
            </svg>
            Google
          </button>
        </form>
      )}

      {step === 2 && (
        <form onSubmit={otpForm.handleSubmit(onOtpSubmit, onValidationError)} className="space-y-4">
          <p className="text-sm text-zinc-500 mb-4">{t("codeSentTo")} {email}</p>
          <div>
            <input
              {...otpForm.register("code")}
              type="text"
              placeholder={t("otpPlaceholder")}
              maxLength={6}
              className="w-full px-4 py-3 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-transparent focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all text-center tracking-widest text-lg font-mono"
            />
          </div>
          
          {/* ОБНОВЛЕННАЯ КНОПКА: Подтвердить */}
          <button
            type="submit"
            className="w-full py-3 px-4 bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 font-medium rounded-xl hover:bg-zinc-800 dark:hover:bg-zinc-200 transition-all duration-300 hover:scale-[1.02] hover:shadow-lg cursor-pointer"
          >
            {t("verify")}
          </button>
        </form>
      )}

      {step === 3 && (
        <form onSubmit={passwordForm.handleSubmit(onPasswordSubmit, onValidationError)} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">
              {t("passwordLabel")}
            </label>
            <input
              {...passwordForm.register("password")}
              type="password"
              placeholder={t("passwordPlaceholder")}
              className="w-full px-4 py-3 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-transparent focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">
              {t("confirmPasswordLabel")}
            </label>
            <input
              {...passwordForm.register("confirmPassword")}
              type="password"
              placeholder={t("confirmPasswordPlaceholder")}
              className="w-full px-4 py-3 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-transparent focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
            />
          </div>
          
          {/* ОБНОВЛЕННАЯ КНОПКА: Зарегистрироваться */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 px-4 bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 font-medium rounded-xl hover:bg-zinc-800 dark:hover:bg-zinc-200 transition-all duration-300 hover:scale-[1.02] hover:shadow-lg disabled:opacity-50 cursor-pointer"
          >
            {isLoading ? "..." : t("register")}
          </button>
        </form>
      )}

      <div className="mt-6 text-center">
        <button 
          onClick={() => router.push('/login')} 
          className="text-sm text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 font-medium transition-colors"
        >
          {t("alreadyHaveAccount")}
        </button>
      </div>
    </div>
  );
}