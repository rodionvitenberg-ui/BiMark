import axios from "axios";

// В идеале тянем из process.env.NEXT_PUBLIC_API_URL
const API_URL = "https://bimark.org/api"; 

export const apiClient = axios.create({
  baseURL: API_URL,
  withCredentials: true, // КРИТИЧНО ВАЖНО: заставляет браузер отправлять и принимать httpOnly куки
  headers: {
    "Content-Type": "application/json",
  },
});

// Флаг, показывающий, идет ли сейчас процесс обновления токена
let isRefreshing = false;
// Очередь запросов, которые упали с 401 и ждут, пока токен обновится
let failedQueue: Array<{ resolve: (value?: unknown) => void; reject: (reason?: any) => void }> = [];

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

apiClient.interceptors.response.use(
  (response) => response, // Если запрос успешен, просто возвращаем ответ
  async (error) => {
    const originalRequest = error.config;

    // Если сервер ответил 401 (Unauthorized) и мы еще не пытались повторить этот запрос
    if (error.response?.status === 401 && !originalRequest._retry) {
      
      // Игнорируем 401 ошибки от эндпоинтов логина или самого рефреша, чтобы избежать бесконечного цикла
      if (originalRequest.url?.includes("/auth/login/") || originalRequest.url?.includes("/auth/token/refresh/")) {
        return Promise.reject(error);
      }

      // Если другой запрос уже запустил рефреш, ставим этот запрос в очередь
      if (isRefreshing) {
        return new Promise(function (resolve, reject) {
          failedQueue.push({ resolve, reject });
        })
          .then(() => {
            return apiClient(originalRequest);
          })
          .catch((err) => {
            return Promise.reject(err);
          });
      }

      // Помечаем, что мы начали процесс обновления
      originalRequest._retry = true;
      isRefreshing = true;

      try {
        // Делаем запрос на обновление токена.
        // Браузер сам подставит refresh-токен из куки, так как withCredentials: true
        await apiClient.post("/auth/token/refresh/");
        
        // Если рефреш прошел успешно, разблокируем очередь
        processQueue(null);
        
        // Повторяем исходный запрос, который упал с 401
        return apiClient(originalRequest);
      } catch (err) {
        // Если рефреш-токен тоже протух (или его нет, как у гостя)
        processQueue(err, null);
        
        // Просто возвращаем ошибку компоненту. 
        // Компонент (например, Header) сам поймет, что юзер — гость.
        return Promise.reject(err);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);