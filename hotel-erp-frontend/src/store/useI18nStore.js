import { create } from 'zustand';

const dictionary = {
  vi: {
    login: "Đăng nhập",
    register: "Đăng ký",
    offers: "Ưu đãi",
    home: "Trang chủ",
    welcome: "Chào mừng đến với Web Booking",
    subtitle: "Trải nghiệm kỳ nghỉ tuyệt vời cùng chúng tôi với các phòng nghỉ sang trọng và dịch vụ đẳng cấp.",
    attractionsTitle: "Khám Phá Địa Điểm Nổi Tiếng",
    bookNow: "Đặt phòng ngay",
    viewDetails: "Xem chi tiết",
    footerText: "© 2026 Web Booking. Nơi lưu giữ những khoảnh khắc tuyệt vời."
  },
  en: {
    login: "Login",
    register: "Register",
    offers: "Offers",
    home: "Home",
    welcome: "Welcome to Web Booking",
    subtitle: "Experience a wonderful stay with us with luxury rooms and premium services.",
    attractionsTitle: "Explore Famous Attractions",
    bookNow: "Book Now",
    viewDetails: "View Details",
    footerText: "© 2026 Web Booking. Where great moments are kept."
  }
};

export const useI18nStore = create((set, get) => ({
  language: 'vi', // Mặc định tiếng Việt
  setLanguage: (lang) => set({ language: lang }),
  t: (key) => {
    const { language } = get();
    return dictionary[language][key] || key;
  }
}));
