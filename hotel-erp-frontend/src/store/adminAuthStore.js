import { create } from 'zustand';

export const useAdminAuthStore = create((set) => ({
  token: localStorage.getItem('token') || null,
  user: JSON.parse(localStorage.getItem('user')) || null,
  permissions: JSON.parse(localStorage.getItem('permissions')) || [],

  // Hàm gọi khi đăng nhập thành công
  setAuth: (token, user, permissions) => {
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(user));
    localStorage.setItem('permissions', JSON.stringify(permissions));
    set({ token, user, permissions });
  },

  // Hàm gọi khi đăng xuất
  clearAuth: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('permissions');
    set({ token: null, user: null, permissions: [] });
  },
}));