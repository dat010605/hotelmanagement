import axios from 'axios';
import { useAdminAuthStore } from '../store/adminAuthStore';

const axiosClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:5057/api', 
  headers: {
    'Content-Type': 'application/json',
  },
});

// ✅ Tự động tìm và nhét Token vào mọi API
axiosClient.interceptors.request.use((config) => {
  const token = useAdminAuthStore.getState().token || localStorage.getItem('token');
  
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// ✅ Tự động đá văng nếu Token hết hạn
axiosClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      useAdminAuthStore.getState().clearAuth();
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default axiosClient;