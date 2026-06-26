import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:5000/api"
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("task_manager_productivity_dashboard_token") || localStorage.getItem("workpulse_token");

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("task_manager_productivity_dashboard_token");
      localStorage.removeItem("task_manager_productivity_dashboard_user");
      localStorage.removeItem("workpulse_token");
      localStorage.removeItem("workpulse_user");
    }

    return Promise.reject(error);
  }
);

export default api;
