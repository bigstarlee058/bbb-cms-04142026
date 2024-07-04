import Axios, { AxiosRequestConfig } from 'axios';
import { API_URL } from '@/config';
import { useNotificationStore } from '@/stores/notifications';
import { getToken } from '@/utils/firebase';
import storage from '@/utils/storage';

async function authRequestInterceptor(config: AxiosRequestConfig) {
  // const token = storage.getToken();
  // if (token) {
  //   const accessToken = JSON.parse(token).stsTokenManager.accessToken;
  //   config.headers.FIREBASE_AUTH_TOKEN = `${accessToken}`;
  // }
  const token = await getToken();
  config.headers.FIREBASE_AUTH_TOKEN = `${token}`;
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
