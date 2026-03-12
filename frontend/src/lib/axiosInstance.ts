import axios, { AxiosInstance, AxiosResponse, AxiosError, AxiosRequestConfig } from 'axios';
import { apiBaseUrl } from './apiConfig';

// Augment AxiosRequestConfig to include a custom retry flag
declare module 'axios' {
  export interface AxiosRequestConfig {
    _retry?: boolean;
  }
}

const axiosInstance: AxiosInstance = axios.create({
  baseURL: apiBaseUrl,
  withCredentials: true,
});

// Response interceptor for auto token refresh
axiosInstance.interceptors.response.use(
  (response: AxiosResponse) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as AxiosRequestConfig;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        console.log('Token expired, refreshing...');

        await axiosInstance.post('/user/refresh-token');

        console.log('Token refreshed, retrying request');
        return axiosInstance(originalRequest);
      } catch (refreshError) {
        console.error('Token refresh failed, redirecting to login');
        window.location.href = '/account/login?role=user';
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default axiosInstance;
