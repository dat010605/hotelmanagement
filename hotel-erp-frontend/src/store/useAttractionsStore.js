import { create } from 'zustand';

export const useAttractionsStore = create((set) => ({
  attractions: [
    {
      id: 1,
      title: "Chợ Bến Thành",
      desc: "Biểu tượng lịch sử lâu đời, nơi hội tụ tinh hoa ẩm thực Sài Gòn và là điểm mua sắm sầm uất nhất trung tâm.",
      img: "https://images.unsplash.com/photo-1583417319070-4a69db38a482?w=800",
      mapUrl: "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3919.485123456789!2d106.6967!3d10.7719!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x31752f3f1234567f%3A0x1234567890abcdef!2zQ2jhu6MgQuG6v24gVGjDoG5o!5e0!3m2!1svi!2svn!4v1712480000000"
    },
    {
      id: 2,
      title: "Dinh Độc Lập",
      desc: "Di tích lịch sử đặc biệt cấp quốc gia, nơi ghi dấu thời khắc thống nhất đất nước với kiến trúc thập niên 60 cực đẹp.",
      img: "https://images.unsplash.com/photo-1555949258-eb67b1ef0ceb?w=800",
      mapUrl: "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3919.44795325883!2d106.69344157573435!3d10.777485359483321!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x31752f38f9ed3d7d%3A0x6b485d204780516!2sIndependence%20Palace!5e0!3m2!1svi!2svn!4v1712481000000"
    },
    {
      id: 3,
      title: "Landmark 81",
      desc: "Tòa nhà cao nhất Việt Nam, biểu tượng cho sự thịnh vượng và hiện đại của TP.HCM với view ngắm toàn cảnh cực đỉnh.",
      img: "https://images.unsplash.com/photo-1571506165871-ee72a35bb9d4?w=800",
      mapUrl: "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3919.2014!2d106.7218!3d10.7948!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x317527c3de5779db%3A0x801666992f4e3c!2sLandmark%2081!5e0!3m2!1svi!2svn!4v1712482000000"
    },
    {
      id: 4,
      title: "Bưu Điện Thành Phố",
      desc: "Công trình kiến trúc Pháp cổ điển ngay trung tâm, điểm check-in không thể bỏ qua với vẻ đẹp vượt thời gian.",
      img: "https://images.unsplash.com/photo-1599708155013-176313f8d32d?w=800",
      mapUrl: "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3919.4439!2d106.6999!3d10.7798!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x31752f385573447d%3A0xbc4047970d49826d!2sSaigon%20Central%20Post%20Office!5e0!3m2!1svi!2svn!4v1712483000000"
    },
    {
      id: 5,
      title: "Phố Đi Bộ Nguyễn Huệ",
      desc: "Thiên đường vui chơi về đêm với các màn trình diễn nhạc nước và không gian đi bộ hiện đại nhất thành phố.",
      img: "https://images.unsplash.com/photo-1528127269322-539801943592?w=800",
      mapUrl: "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3919.4602!2d106.7025!3d10.7756!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x31752f40a6e38253%3A0x6b44983050119f!2zUGjhu5EgxJFpIGLhu5kgTmd1eeG7hW4gSHXhu4c!5e0!3m2!1svi!2svn!4v1712484000000"
    }
  ],
  setAttractions: (newAttractions) => set({ attractions: newAttractions }),
  addAttraction: (attraction) => set((state) => ({ attractions: [...state.attractions, attraction] })),
  updateAttraction: (id, updatedData) => set((state) => ({
    attractions: state.attractions.map(attr => attr.id === id ? { ...attr, ...updatedData } : attr)
  })),
  deleteAttraction: (id) => set((state) => ({
    attractions: state.attractions.filter(attr => attr.id !== id)
  }))
}));
