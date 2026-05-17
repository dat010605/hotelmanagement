import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

// ── Import các bộ từ điển ngôn ngữ ──────────────────────────────────────────
import vi from './locales/vi.json';
import en from './locales/en.json';
import zh from './locales/zh.json';
import es from './locales/es.json';
import fr from './locales/fr.json';
import de from './locales/de.json';

// ── Danh sách ngôn ngữ được hỗ trợ (export để dùng trong Language Switcher) ─
export const SUPPORTED_LANGUAGES = [
  { code: 'vi', label: 'Tiếng Việt',  flag: '🇻🇳', short: 'VI' },
  { code: 'en', label: 'English',     flag: '🇬🇧', short: 'EN' },
  { code: 'zh', label: '中文',         flag: '🇨🇳', short: 'ZH' },
  { code: 'es', label: 'Español',     flag: '🇪🇸', short: 'ES' },
  { code: 'fr', label: 'Français',    flag: '🇫🇷', short: 'FR' },
  { code: 'de', label: 'Deutsch',     flag: '🇩🇪', short: 'DE' },
];

// ── Lấy ngôn ngữ đã lưu từ localStorage (nếu có) ──────────────────────────
const savedLang = localStorage.getItem('i18n_language') || 'vi';

// ── Khởi tạo i18next ────────────────────────────────────────────────────────
i18n
  .use(initReactI18next) // Kết nối i18next với React
  .init({
    resources: {
      vi: { translation: vi },
      en: { translation: en },
      zh: { translation: zh },
      es: { translation: es },
      fr: { translation: fr },
      de: { translation: de },
    },
    lng: savedLang,           // Ngôn ngữ hiện tại (từ localStorage hoặc mặc định 'vi')
    fallbackLng: 'vi',        // Ngôn ngữ dự phòng nếu key không tìm thấy
    interpolation: {
      escapeValue: false,     // React đã tự escape XSS, không cần i18next làm lại
    },
  });

// ── Lắng nghe thay đổi ngôn ngữ để lưu vào localStorage ────────────────────
i18n.on('languageChanged', (lng) => {
  localStorage.setItem('i18n_language', lng);
});

export default i18n;
