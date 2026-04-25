import { create } from 'zustand';

// Store lưu profile tùy chỉnh của khách hàng (tên, avatar)
// Dữ liệu được lưu theo email nên không bị mất khi đăng xuất/đăng nhập lại
const STORAGE_KEY = 'customerProfileOverrides';

const loadOverrides = () => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
};

const saveOverrides = (overrides) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(overrides));
  } catch { /* ignore */ }
};

export const useCustomerProfileStore = create((set, get) => ({
  // Map: { [email]: { displayName, avatarUrl } }
  overrides: loadOverrides(),

  // Lấy profile override cho 1 email cụ thể
  getProfile: (email) => {
    if (!email) return {};
    return get().overrides[email] || {};
  },

  // Cập nhật tên hiển thị
  setDisplayName: (email, displayName) => {
    if (!email) return;
    const overrides = {
      ...get().overrides,
      [email]: { ...get().overrides[email], displayName }
    };
    saveOverrides(overrides);
    set({ overrides });
  },

  // Cập nhật avatar (base64 hoặc URL)
  setAvatarUrl: (email, avatarUrl) => {
    if (!email) return;
    const overrides = {
      ...get().overrides,
      [email]: { ...get().overrides[email], avatarUrl }
    };
    saveOverrides(overrides);
    set({ overrides });
  },
}));
