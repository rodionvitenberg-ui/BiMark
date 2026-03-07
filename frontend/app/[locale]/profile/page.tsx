"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { ProfileSettings } from "@/components/modules/profile-settings";
import { useUser } from "@/hooks/use-auth";

export default function ProfilePage() {
  const t = useTranslations("Profile");
  const router = useRouter();
  const { data: user, isLoading } = useUser();

  // Защита роута (Route Guard)
  useEffect(() => {
    // Если запрос завершился и юзера нет (ответил 401)
    if (!isLoading && !user) {
      router.push("/login");
    }
  }, [user, isLoading, router]);

  // Пока проверяем авторизацию, ничего не рендерим, чтобы избежать мерцания
  if (isLoading || !user) {
    return <div className="min-h-screen bg-zinc-50 dark:bg-[#0a0f1c]"></div>;
  }

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-[#0a0f1c] pt-24 pb-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto mb-8">
        <h1 className="text-3xl font-bold text-zinc-900 dark:text-white tracking-tight">
          {t("title")}
        </h1>
      </div>
      <ProfileSettings />
    </div>
  );
}