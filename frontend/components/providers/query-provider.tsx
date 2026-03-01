"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState } from "react";

export function QueryProvider({ children }: { children: React.ReactNode }) {
  // Инициализируем QueryClient внутри useState, чтобы он не пересоздавался 
  // при каждом рендере компонента, но и не шарился между пользователями на сервере.
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 60 * 1000, // Данные считаются свежими 1 минуту
            refetchOnWindowFocus: false, // Не дергаем API при переключении вкладок браузера (экономим ресурсы)
          },
        },
      })
  );

  return (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
}