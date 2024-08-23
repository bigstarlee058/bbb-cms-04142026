import Axios, { AxiosRequestConfig, InternalAxiosRequestConfig } from 'axios';
import { API_URL } from '@/config';
import { useNotificationStore } from '@/stores/notifications';
import { getToken } from '@/utils/firebase';
import storage from '@/utils/storage';

async function authRequestInterceptor(config: InternalAxiosRequestConfig) {
  // const token = storage.getToken();
  // if (token) {
  //   const accessToken = JSON.parse(token).stsTokenManager.accessToken;
  //   config.headers.FIREBASE_AUTH_TOKEN = `${accessToken}`;
  // }
  try {
    const token = await getToken();
    if (token) {
      config.headers.FIREBASE_AUTH_TOKEN = `${token}`;
    }
  } catch (error) {
    console.error('Failed to get token:', error);
  }
  config.headers.Accept = 'application/json';
  return config;
}

export const axios = Axios.create({
  baseURL: API_URL,
});

axios.interceptors.request.use(authRequestInterceptor);
axios.interceptors.response.use(
  (response) => {
    return response.data;
  },
  (error) => {
    const message = error.response?.data?.message || error.message;
    console.log(error);
    useNotificationStore.getState().addNotification({
      type: 'error',
      title: 'Error',
      message,
    });
    return Promise.reject(error);
  }
);
