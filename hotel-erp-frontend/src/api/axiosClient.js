import axios from 'axios';
import { useAdminAuthStore } from '../store/adminAuthStore';
import { API_BASE_URL } from './config';

const axiosClient = axios.create({
  baseURL: API_BASE_URL, 
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

// ✅ Tự động đá văng nếu Token hết hạn (chỉ trên trang admin)
axiosClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // Chỉ redirect về login nếu đang ở trang admin (không redirect ở trang khách hàng công khai)
      const currentPath = window.location.pathname;
      const isAdminRoute = currentPath.startsWith('/admin');
      
      if (isAdminRoute) {
        useAdminAuthStore.getState().clearAuth();
        localStorage.removeItem('token');
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default axiosClient;