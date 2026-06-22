import axios from 'axios';

// In production (after `npm run build`), VITE_API_URL points to the CloudFront /api path.
// In development, falls back to the local backend server.
const api = axios.create({
  baseURL: import.meta.env.PROD
    ? 'https://editor.mandhanapharma.in/api'
    : 'http://localhost:5000/api',
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
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;
