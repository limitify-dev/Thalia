// axios/http.ts
import axios from "axios";
import NetInfo from "@react-native-community/netinfo";
import Toast from "react-native-toast-message";
import { cacheManager } from "../utils/cacheUtils";

export const baseUrl = "http://192.168.1.76:3000";

let tokenGetter: () => string | null = () => null;
export const setTokenGetter = (fn: typeof tokenGetter) => {
  tokenGetter = fn;
};

export const http = axios.create({
  baseURL: `${baseUrl}/api/v1`,
  headers: { "Content-Type": "application/json" },
});

http.interceptors.request.use(
  async (config: any) => {
    // Skip caching for non-GET requests
    if (config.method?.toLowerCase() !== "get") {
      return config;
    }

    // Check if we should use cache
    const useCache = (config as any).useCache !== false; // Default to true
    const cacheKey = (config as any).cacheKey;

    if (useCache && cacheKey) {
      const cachedData = await cacheManager.get(cacheKey);
      if (cachedData) {
        // Return cached data and cancel the request
        return {
          ...config,
          adapter: () =>
            Promise.resolve({
              data: cachedData,
              status: 200,
              statusText: "OK",
              headers: {},
              config,
            }),
        };
      }
    }

    // Inject token if available
    const token = tokenGetter?.();
    if (token) {
      config.headers = config.headers ?? {};
      config.headers.Authorization = `Bearer ${token}`;
    }

    // Connectivity check
    const netInfo = await NetInfo.fetch();
    if (!netInfo.isConnected) {
      Toast.show({
        type: "error",
        text1: "No internet connection",
        text2: "Please check your connection and try again.",
      });

      // Try to get cached data if offline
      if (cacheKey) {
        const cachedData = await cacheManager.get(cacheKey);
        if (cachedData) {
          return {
            ...config,
            adapter: () =>
              Promise.resolve({
                data: cachedData,
                status: 200,
                statusText: "OK",
                headers: {},
                config,
              }),
          };
        }
      }

      return Promise.reject(new Error("No internet connection"));
    }

    return config;
  },
  (error: any) => Promise.reject(error),
);

http.interceptors.response.use(
  (response: any) => {
    // Cache successful GET responses
    if (
      response.config.method?.toLowerCase() === "get" &&
      (response.config as any).cacheKey
    ) {
      cacheManager.set((response.config as any).cacheKey, response.data);
    }
    return response;
  },
  (error: any) => {
    // Skip generic toast for deliberate cancellations (offline)
    if (!axios.isCancel(error)) {
      // If there's no server response and not our offline cancel
      if (!error.response) {
        Toast.show({
          type: "error",
          text1: "Request failed",
          text2: "Please check your connection or try again later.",
        });
      }
    }
    return Promise.reject(error);
  },
);

export default http;
