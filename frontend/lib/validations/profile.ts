// lib/validations/profile.ts
import * as z from "zod";

export const getProfileSchemas = (t: any) => {
  const passwordSchema = z.object({
    oldPassword: z.string().min(1, { message: t("errors.required") }),
    newPassword: z.string().min(10, { message: t("errors.passwordLength") }),
    confirmPassword: z.string(),
  }).refine((data) => data.newPassword === data.confirmPassword, {
    message: t("errors.passwordsDoNotMatch"),
    path: ["confirmPassword"],
  });

  return { passwordSchema };
};

export type PasswordChangeFormValues = z.infer<ReturnType<typeof getProfileSchemas>["passwordSchema"]>;