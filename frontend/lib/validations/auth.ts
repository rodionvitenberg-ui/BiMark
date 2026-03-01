import * as z from "zod";

// Экспортируем функцию, которая принимает `t` для перевода ошибок
export const getAuthSchemas = (t: any) => {
  
  // Шаг 1: Валидация Email
  const emailSchema = z.object({
    email: z.string().email({ message: t("errors.invalidEmail") }),
  });

  // Шаг 2: Валидация OTP кода
  const otpSchema = z.object({
    code: z.string().length(6, { message: t("errors.codeLength") }).regex(/^\d+$/, { message: t("errors.codeLength") }),
  });

  // Шаг 3: Валидация Паролей
  const passwordSchema = z.object({
    password: z.string().min(10, { message: t("errors.passwordLength") }),
    confirmPassword: z.string(),
  }).refine((data) => data.password === data.confirmPassword, {
    message: t("errors.passwordsDoNotMatch"),
    path: ["confirmPassword"], // Ошибка будет привязана к полю confirmPassword
  });

  // Шаг 4: Валидация Логина (добавь это внутрь функции getAuthSchemas)
  const loginSchema = z.object({
    email: z.string().email({ message: t("errors.invalidEmail") }),
    password: z.string().min(1, { message: t("errors.required") }),
  });

  return { emailSchema, otpSchema, passwordSchema, loginSchema }; // не забудь вернуть loginSchema
};

// Экспортируем типы для TypeScript, чтобы использовать их в формах
export type EmailFormValues = z.infer<ReturnType<typeof getAuthSchemas>["emailSchema"]>;
export type OtpFormValues = z.infer<ReturnType<typeof getAuthSchemas>["otpSchema"]>;
export type PasswordFormValues = z.infer<ReturnType<typeof getAuthSchemas>["passwordSchema"]>;
export type LoginFormValues = z.infer<ReturnType<typeof getAuthSchemas>["loginSchema"]>;