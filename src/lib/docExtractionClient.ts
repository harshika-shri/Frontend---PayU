import axios from 'axios';
import Cookies from 'js-cookie';

const docExtractionBaseURL =
  import.meta.env.VITE_DOC_EXTRACTION_API_URL || 'http://localhost:8001';

const authBaseURL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

export const docExtractionClient = axios.create({
  baseURL: docExtractionBaseURL,
  headers: {
    'Content-Type': 'application/json',
  },
});

docExtractionClient.interceptors.request.use(
  (config) => {
    const token = Cookies.get('access_token');
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error),
);

docExtractionClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (
      error.response?.status === 401
      && !originalRequest._retry
      && !originalRequest.url?.includes('/auth/login')
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
            docExtractionClient.defaults.headers.common.Authorization =
              `Bearer ${response.data.access_token}`;
            return docExtractionClient(originalRequest);
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
