import Axios, { AxiosRequestConfig, InternalAxiosRequestConfig } from 'axios';
import { API_URL } from '@/config';
import { useNotificationStore } from '@/stores/notifications';
import storage from '@/utils/storage';

async function authRequestInterceptor(config: InternalAxiosRequestConfig) {
  // Get the token from storage
  try {
    const token = storage.getToken();
    if (token) {
      config.headers['auth_token'] = `${token}`;
    }
  } catch (error) {
    console.error('Failed to get token:', error);
  }

  // Set CORS headersA
  config.headers.Accept = 'application/json';
  return config;
}

export const axios = Axios.create({
  baseURL: API_URL,
});

// Add the request interceptor to include authentication and CORS headers
axios.interceptors.request.use(authRequestInterceptor);

// Handle responses and errors
axios.interceptors.response.use(
  (response) => {
    return response.data;
  },
  (error) => {
    const message = error.response?.data?.message || error.message;
    useNotificationStore.getState().addNotification({
      type: 'error',
      title: 'Error',
      message,
    });
    return Promise.reject(error);
  }
);
