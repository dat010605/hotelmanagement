import { create } from 'zustand';
import i18n from '../i18n';

/**
 * Store Zustand cho i18n – giờ hoạt động như cầu nối (bridge) giữa
 * Zustand state và i18next engine thật sự.
 * 
 * - `language`: reactive state cho UI re-render khi đổi ngôn ngữ
 * - `setLanguage(lang)`: gọi i18n.changeLanguage() + cập nhật Zustand state
 * - `t(key)`: proxy tới i18n.t() của i18next (hỗ trợ nested key: "header.home")
 * 
 * ⚠️ Ưu tiên dùng hook useTranslation() trực tiếp từ react-i18next
 *    cho các component mới. Store này giữ lại để tương thích ngược.
 */
export const useI18nStore = create((set) => ({
  language: i18n.language || 'vi',

  setLanguage: (lang) => {
    i18n.changeLanguage(lang);  // i18next engine thay đổi ngôn ngữ
    set({ language: lang });    // Zustand state cập nhật → UI re-render
  },

  t: (key) => i18n.t(key),     // Proxy tới i18next translate function
}));
