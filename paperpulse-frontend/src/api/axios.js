import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:5000",
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");

  // ❌ skip auth routes
  if (token && !config.url.includes("/api/auth")) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

export default api;