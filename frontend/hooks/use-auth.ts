import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/api/client"; // Импортируем твой клиент
import { useRouter } from "next/navigation";

export interface User {
  id: string;
  email: string;
  balance: string;
}

// 1. Хук получения текущего пользователя
export const useUser = () => {
  return useQuery<User>({
    queryKey: ["user"],
    queryFn: async () => {
      // Так как baseURL у тебя уже включает /api, запрос идет на /api/auth/user/
      const { data } = await apiClient.get("/auth/user/");
      return data;
    },
    // Не повторяем запрос, если сервер ответил 401 (юзер не авторизован)
    retry: false, 
    // Кэшируем профиль на 5 минут
    staleTime: 5 * 60 * 1000, 
  });
};

// 2. Хук для логаута
export const useLogout = () => {
  const queryClient = useQueryClient();
  const router = useRouter();

  return useMutation({
    mutationFn: async () => {
      await apiClient.post("/auth/logout/");
    },
    onSuccess: () => {
      // Очищаем данные пользователя из кэша
      queryClient.removeQueries({ queryKey: ["user"] });
      // Возвращаем на главную
      router.push("/");
      router.refresh();
    },
  });
};