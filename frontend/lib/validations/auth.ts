import * as z from "zod";

export const getAuthSchemas = (t: any) => {
  const emailSchema = z.object({
    email: z.string().email({ message: t("invalidEmail") }),
  });

  const otpSchema = z.object({
    code: z.string().length(6, { message: t("invalidCode") }).regex(/^\d+$/, { message: t("invalidCode") }),
  });

  const passwordSchema = z.object({
    password: z.string()
      .min(8, { message: t("passwordTooWeak") })
      // НОВОЕ: Запрещаем кириллицу
      .regex(/^[^а-яА-ЯёЁ]*$/, { message: t("passwordCyrillic") }), 
    confirmPassword: z.string(),
  }).refine((data) => data.password === data.confirmPassword, {
    message: t("passwordsDoNotMatch"),
    path: ["confirmPassword"],
  });

  const loginSchema = z.object({
    email: z.string().email({ message: t("invalidEmail") }),
    password: z.string().min(1, { message: t("required") }),
  });

  return { emailSchema, otpSchema, passwordSchema, loginSchema };
};

export type EmailFormValues = z.infer<ReturnType<typeof getAuthSchemas>["emailSchema"]>;
export type OtpFormValues = z.infer<ReturnType<typeof getAuthSchemas>["otpSchema"]>;
export type PasswordFormValues = z.infer<ReturnType<typeof getAuthSchemas>["passwordSchema"]>;
export type LoginFormValues = z.infer<ReturnType<typeof getAuthSchemas>["loginSchema"]>;