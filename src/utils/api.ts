import axios from 'axios';

// In production (after `npm run build`), VITE_API_URL points to the CloudFront /api path.
// In development, falls back to the local backend server.
const api = axios.create({
  // baseURL: 'https://uv0bsng6yh.execute-api.ap-south-1.amazonaws.com/dev/api',
  baseURL: import.meta.env.VITE_API_URL,
});

// Add a request interceptor to attach JWT token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Add a response interceptor to handle 401s
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default api;
