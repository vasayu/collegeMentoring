// src/lib/api.ts
import axios from "axios";

const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";

const api = axios.create({
  baseURL: API_BASE,
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true, // IMPORTANT: send cookies (httpOnly) with requests
});

// Response interceptor (optional) to unwrap ApiResponse shape: { status, data, message }
api.interceptors.response.use(
  (res) => {
    // If backend returns your ApiResponse wrapper: new ApiResponse(status, data, message)
    // adapt here. We'll return res.data.data if present, else res.data
    const payload = res.data;
    if (payload && payload.data !== undefined) return payload;
    return res.data;
  },
  (error) => {
    // propagate useful message
    const msg =
      error?.response?.data?.message ||
      error?.response?.data?.error ||
      error?.message ||
      "Network Error";
    return Promise.reject(new Error(msg));
  }
);

export default api;
