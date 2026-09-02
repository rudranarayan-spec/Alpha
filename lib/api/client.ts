/* eslint-disable import/no-named-as-default-member */
import { API_CONFIG } from "@/config/api.config";
import axios, { AxiosError, InternalAxiosRequestConfig } from "axios";
import { apiLogger } from "./logger";

let authTokenGetter: (() => Promise<string | null>) | null = null;

export const setAuthTokenGetter = (getter: () => Promise<string | null>) => {
  authTokenGetter = getter;
};

const api = axios.create({
  baseURL: API_CONFIG.BASE_URL, // Ensure this is "http://192.168.29.213:8080/api/v1"
  timeout: API_CONFIG.TIMEOUT,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
});

api.interceptors.request.use(
  async (config: InternalAxiosRequestConfig) => {
    const token = authTokenGetter ? await authTokenGetter() : null;

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    apiLogger.request(config.method, config.url);
    return config;
  },
  (error) => Promise.reject(error),
);

api.interceptors.response.use(
  (response) => {
    apiLogger.success(
      response.config.method,
      response.config.url,
      response.status,
    );

    return response;
  },
  async (error: AxiosError<any>) => {
    apiLogger.error(
      error.config?.method,
      error.config?.url,
      error.response?.status,
      error.response?.data?.message || error.message,
    );

    return Promise.reject(error);
  },
);

export default api;
