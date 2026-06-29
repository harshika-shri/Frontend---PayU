import axios from 'axios';
import Cookies from 'js-cookie';

// Default to port 8000 for local FastAPI development
const baseURL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

export const apiClient = axios.create({
  baseURL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor to add auth token
apiClient.interceptors.request.use(
  (config) => {
    const token = Cookies.get('access_token');
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor to handle token refresh logic
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    
    // If the error status is 401 and there is no originalRequest._retry flag,
    // it means the token has expired and we need to refresh it
    if (error.response?.status === 401 && !originalRequest._retry && !originalRequest.url?.includes('/auth/login') && !originalRequest.url?.includes('/auth/forgot-password') && !originalRequest.url?.includes('/auth/reset-password')) {
      originalRequest._retry = true;
      const refreshToken = Cookies.get('refresh_token');
      
      if (refreshToken) {
        try {
          const response = await axios.post(`${baseURL}/auth/refresh`, {
            refresh_token: refreshToken
          });
          
          if (response.status === 200) {
            Cookies.set('access_token', response.data.access_token, { secure: window.location.protocol === 'https:', sameSite: 'lax' });
            if (response.data.refresh_token) {
              Cookies.set('refresh_token', response.data.refresh_token, { secure: window.location.protocol === 'https:', sameSite: 'lax' });
            }
            apiClient.defaults.headers.common['Authorization'] = `Bearer ${response.data.access_token}`;
            return apiClient(originalRequest);
          }
        } catch (refreshError) {
          // Refresh failed, user needs to login again
          Cookies.remove('access_token');
          Cookies.remove('refresh_token');
          window.location.href = '/login';
          return Promise.reject(refreshError);
        }
      }
    }
    return Promise.reject(error);
  }
);
