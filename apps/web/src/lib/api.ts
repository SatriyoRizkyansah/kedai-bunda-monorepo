import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:8000/api",
  withCredentials: false,
});

// Interceptor untuk menambahkan token ke setiap request
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // Jika data adalah FormData, jangan set Content-Type (biarkan browser auto-set dengan boundary)
    if (config.data instanceof FormData) {
      delete config.headers["Content-Type"];
    } else {
      // Untuk request biasa, set JSON
      config.headers["Content-Type"] = "application/json";
      config.headers["Accept"] = "application/json";
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor untuk handle error response
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Jangan redirect dari login page
    const isLoginPage = window.location.pathname === "/login";

    if (error.response?.status === 401 && !isLoginPage) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

export default api;
