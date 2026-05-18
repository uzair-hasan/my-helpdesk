import axios from "axios";

const API_URL = "http://localhost:3001/api";

export const api = axios.create({
  baseURL: API_URL,
  withCredentials: true,
});

// Request Interceptor - attach token to every request

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response intercepter - handle token refresh on 401

api.interceptors.response.use(
  (response) => response, // success:pass through
  async (error) => {
    const originalRequest = error.config;

    // if 401 and we haven't already retired this request
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        // call refresh endpoint (cookie is sent automatically)
        const { data } = await api.post("/auth/refresh");

        // store new token
        localStorage.setItem("token", data.accessToken);
        localStorage.setItem("user", JSON.stringify(data.user));

        // Retry original request with nee token
        originalRequest.headers.Authorization = `Bearer ${data.accessToken}`;
        return api(originalRequest);
      } catch {
        // Refresh failed - clear auth and redirect to login
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        window.location.href = "/login";
        return Promise.reject(error);
      }
    }
    return Promise.reject(error);
  },
);
