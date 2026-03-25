import { create } from 'zustand';

// Hàm hỗ trợ parse JSON an toàn để không bị lỗi "undefined"
const getSafeJSON = (key, defaultValue) => {
  const item = localStorage.getItem(key);
  if (!item || item === "undefined" || item === "null") return defaultValue;
  try {
    return JSON.parse(item);
  } catch (error) {
    console.error(`Lỗi parse ${key}:`, error);
    return defaultValue;
  }
};

export const useAdminAuthStore = create((set) => ({
  // Lấy dữ liệu ban đầu từ LocalStorage một cách an toàn
  token: localStorage.getItem('token') || null,
  user: getSafeJSON('user', null),
  permissions: getSafeJSON('permissions', []),

  // Hàm gọi khi đăng nhập hoặc cập nhật profile thành công
  setAuth: (token, user, permissions) => {
    if (token) localStorage.setItem('token', token);
    if (user) localStorage.setItem('user', JSON.stringify(user));
    if (permissions) localStorage.setItem('permissions', JSON.stringify(permissions));
    
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