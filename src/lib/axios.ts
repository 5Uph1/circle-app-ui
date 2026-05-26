import axios from "axios";
import { store } from "@/store/store";
import { logout } from "@/store/authSlice";
import { API_URL } from "@/config/api";

export const axiosInstance = axios.create({
  baseURL: API_URL,
});

axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      store.dispatch(logout());
    }
    return Promise.reject(error);
  },
);
