import axios from 'axios';
import Cookies from 'js-cookie';
import { env } from '../config/env';

const authBaseURL = env.apiUrl;

export const commandCenterClient = axios.create({
  baseURL: env.commandCenterUrl,
  headers: { 'Content-Type': 'application/json' },
});

commandCenterClient.interceptors.request.use(
  (config) => {
    const token = Cookies.get('access_token');
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error),
);

commandCenterClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (
      error.response?.status === 401 &&
      !originalRequest._retry &&
      !originalRequest.url?.includes('/auth/login')
    ) {
      originalRequest._retry = true;
      const refreshToken = Cookies.get('refresh_token');

      if (refreshToken) {
        try {
          const response = await axios.post(`${authBaseURL}/auth/refresh`, {
            refresh_token: refreshToken,
          });

          if (response.status === 200) {
            Cookies.set('access_token', response.data.access_token, {
              secure: window.location.protocol === 'https:',
              sameSite: 'lax',
            });
            if (response.data.refresh_token) {
              Cookies.set('refresh_token', response.data.refresh_token, {
                secure: window.location.protocol === 'https:',
                sameSite: 'lax',
              });
            }
            commandCenterClient.defaults.headers.common.Authorization =
              `Bearer ${response.data.access_token}`;
            return commandCenterClient(originalRequest);
          }
        } catch (refreshError) {
          Cookies.remove('access_token');
          Cookies.remove('refresh_token');
          window.location.href = '/login';
          return Promise.reject(refreshError);
        }
      }
    }

    return Promise.reject(error);
  },
);
