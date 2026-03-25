import { create } from 'zustand';
const savedUser = localStorage.getItem('user');
const savedPermissions = localStorage.getItem('permissions');

export const useAdminAuthStore = create((set) => ({
  token: localStorage.getItem('token') || null,
  user: savedUser && savedUser !== "undefined" ? JSON.parse(savedUser) : null,
  permissions: savedPermissions && savedPermissions !== "undefined" ? JSON.parse(savedPermissions) : [],
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