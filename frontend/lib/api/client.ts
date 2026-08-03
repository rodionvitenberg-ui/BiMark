import axios from "axios";
import { getBrowserApiUrl, getServerApiUrl } from "@/lib/server-api-url";

function resolveBaseUrl(): string {
  if (typeof window === "undefined") {
    return getServerApiUrl();
  }
  return getBrowserApiUrl();
}

export const apiClient = axios.create({
  baseURL: resolveBaseUrl(),
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
  // Avoid hung SSR when Django is down
  timeout: typeof window === "undefined" ? 10000 : 30000,
});

// Re-resolve baseURL per request in case env differs (browser vs server bundles)
apiClient.interceptors.request.use((config) => {
  config.baseURL = resolveBaseUrl();
  return config;
});

let isRefreshing = false;
let failedQueue: Array<{
  resolve: (value?: unknown) => void;
  reject: (reason?: unknown) => void;
}> = [];

const processQueue = (error: unknown, token: string | null = null) => {
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
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && originalRequest && !originalRequest._retry) {
      if (
        originalRequest.url?.includes("/auth/login/") ||
        originalRequest.url?.includes("/auth/token/refresh/")
      ) {
        return Promise.reject(error);
      }

      if (isRefreshing) {
        return new Promise(function (resolve, reject) {
          failedQueue.push({ resolve, reject });
        })
          .then(() => apiClient(originalRequest))
          .catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        await apiClient.post("/auth/token/refresh/");
        processQueue(null);
        return apiClient(originalRequest);
      } catch (err) {
        processQueue(err, null);
        return Promise.reject(err);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);
