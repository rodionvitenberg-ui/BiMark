import axios from "axios";

// В идеале это должно тянуться из process.env.NEXT_PUBLIC_API_URL
const API_URL = "http://localhost:8000/api"; 

export const apiClient = axios.create({
  baseURL: API_URL,
  withCredentials: true, // <-- КРИТИЧНО ВАЖНО для кук!
  headers: {
    "Content-Type": "application/json",
  },
});

// Интерсептор пока можно оставить пустым или удалить, 
// так как браузер сам будет прикреплять куки к каждому запросу
apiClient.interceptors.request.use((config) => {
  return config;
});