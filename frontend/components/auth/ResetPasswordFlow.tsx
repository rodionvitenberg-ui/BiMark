"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { getAuthSchemas, EmailFormValues, OtpFormValues, PasswordFormValues } from "@/lib/validations/auth";
import { useRouter } from "next/navigation";
import { apiClient } from "@/lib/api/client"; 
import { useToast } from "@/components/ui/toast"; // <-- Импортируем твой тостер

export default function ResetPasswordFlow() {
  const t = useTranslations("ResetPassword");
  const tToast = useTranslations("Toast"); // Отдельно тянем тостерные тексты
  const router = useRouter();
  const { toast } = useToast(); // Инициализируем хук
  
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [email, setEmail] = useState("");
  const [otpCode, setOtpCode] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // Передаем tToast или общий t в зависимости от того, как устроен твой getAuthSchemas
  const schemas = getAuthSchemas(tToast); 

  const emailForm = useForm<EmailFormValues>({ resolver: zodResolver(schemas.emailSchema) });
  const otpForm = useForm<OtpFormValues>({ resolver: zodResolver(schemas.otpSchema) });
  const passwordForm = useForm<PasswordFormValues>({ resolver: zodResolver(schemas.passwordSchema) });

  // --- МАГИЯ ТОСТЕРОВ ДЛЯ ВАЛИДАЦИИ (ZOD) ---
  // Эта функция вызывается, если форма НЕ прошла валидацию на клиенте
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

  // --- ШАГ 1: ОТПРАВКА EMAIL ---
  const onEmailSubmit = async (data: EmailFormValues) => {
    setIsLoading(true);
    try {
      await apiClient.post("/users/password-reset/request/", { email: data.email });
      setEmail(data.email);
      setStep(2);
    } catch (err: any) {
      toast({
        title: tToast("serverErrorTitle"),
        description: err.response?.data?.detail || "Ошибка при отправке кода",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // --- ШАГ 2: ВВОД КОДА ---
  const onOtpSubmit = async (data: OtpFormValues) => {
    setOtpCode(data.code);
    setStep(3);
  };

  // --- ШАГ 3: СМЕНА ПАРОЛЯ ---
  const onPasswordSubmit = async (data: PasswordFormValues) => {
    setIsLoading(true);
    try {
      await apiClient.post("/users/password-reset/confirm/", { 
        email, 
        code: otpCode, 
        password: data.password 
      });
      
      toast({
        title: tToast("successTitle"),
        description: tToast("resetSuccess"),
        variant: "success",
      });
      
      router.push("/login?reset=success");
    } catch (err: any) {
      toast({
        title: tToast("errorTitle"),
        description: err.response?.data?.detail || "Ошибка при смене пароля. Возможно, код устарел.",
        variant: "destructive",
      });
      setStep(2); // Откидываем на ввод кода, если сервер его не принял
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto">
      <h2 className="text-2xl font-bold mb-6 text-zinc-900 dark:text-zinc-100">
        {step === 1 ? t("step1Title") : step === 2 ? t("step2Title") : t("step3Title")}
      </h2>
      
      {step === 1 && (
        <form onSubmit={emailForm.handleSubmit(onEmailSubmit, onValidationError)} className="space-y-4">
          <div>
            <input
              {...emailForm.register("email")}
              type="email"
              placeholder={t("emailPlaceholder")}
              className="w-full px-4 py-3 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-transparent focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>
          <button type="submit" disabled={isLoading} className="w-full py-3 px-4 bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 font-medium rounded-xl hover:bg-zinc-800 transition-colors disabled:opacity-50">
            {isLoading ? t("sending") : t("getCode")}
          </button>
        </form>
      )}

      {step === 2 && (
        <form onSubmit={otpForm.handleSubmit(onOtpSubmit, onValidationError)} className="space-y-4">
          <p className="text-sm text-zinc-500 mb-4">{t("codeSentTo")} {email}</p>
          <input
            {...otpForm.register("code")}
            type="text"
            placeholder={t("codePlaceholder")}
            maxLength={6}
            className="w-full px-4 py-3 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-transparent focus:ring-2 focus:ring-blue-500 outline-none text-center tracking-widest text-lg font-mono"
          />
          <button type="submit" className="w-full py-3 px-4 bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 font-medium rounded-xl hover:bg-zinc-800 transition-colors">
            {t("confirm")}
          </button>
        </form>
      )}

      {step === 3 && (
        <form onSubmit={passwordForm.handleSubmit(onPasswordSubmit, onValidationError)} className="space-y-4">
           <input
              {...passwordForm.register("password")}
              type="password"
              placeholder={t("newPassword")}
              className="w-full px-4 py-3 mb-4 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-transparent focus:ring-2 focus:ring-blue-500 outline-none"
            />
            <input
              {...passwordForm.register("confirmPassword")}
              type="password"
              placeholder={t("repeatPassword")}
              className="w-full px-4 py-3 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-transparent focus:ring-2 focus:ring-blue-500 outline-none"
            />
          <button type="submit" disabled={isLoading} className="w-full py-3 px-4 bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 font-medium rounded-xl hover:bg-zinc-800 transition-colors disabled:opacity-50">
            {isLoading ? t("saving") : t("saveAndEnter")}
          </button>
        </form>
      )}
      
      <div className="mt-6 text-center">
        <button onClick={() => router.push('/login')} className="text-sm text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100">
          {t("backToLogin")}
        </button>
      </div>
    </div>
  );
}