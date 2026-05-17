import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const useAttractionsStore = create(
  persist(
    (set) => ({
      attractions: [
        {
          id: 1,
          title: "Chợ Bến Thành",
          desc: "Biểu tượng lịch sử lâu đời từ thời Pháp thuộc, nơi hội tụ tinh hoa ẩm thực Sài Gòn và là điểm mua sắm sầm uất nhất trung tâm. Tại đây, bạn có thể tìm thấy mọi thứ từ các món ăn đường phố đặc trưng, vải vóc, quần áo cho đến những món đồ thủ công mỹ nghệ tinh xảo.",
          img: "/attractions/ben_thanh_market.png",
          mapUrl: "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3919.485123456789!2d106.6967!3d10.7719!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x31752f3f1234567f%3A0x1234567890abcdef!2zQ2jhu6MgQuG6v24gVGjDoG5o!5e0!3m2!1svi!2svn!4v1712480000000",
          lat: 10.7725, lng: 106.6980, category: 'Di sản'
        },
        {
          id: 2,
          title: "Dinh Độc Lập",
          desc: "Di tích lịch sử đặc biệt cấp quốc gia, nơi ghi dấu thời khắc thống nhất đất nước vào ngày 30/4/1975. Công trình mang đậm dấu ấn kiến trúc phương Đông kết hợp hiện đại.",
          img: "/attractions/independence_palace.png",
          mapUrl: "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3919.44795325883!2d106.69344157573435!3d10.777485359483321!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x31752f38f9ed3d7d%3A0x6b485d204780516!2sIndependence%20Palace!5e0!3m2!1svi!2svn!4v1712481000000",
          lat: 10.7770, lng: 106.6953, category: 'Di sản'
        },
        {
          id: 3,
          title: "Landmark 81",
          desc: "Tòa nhà cao nhất Việt Nam, biểu tượng cho sự thịnh vượng và vươn tầm quốc tế của TP.HCM. Tòa tháp cao 81 tầng với khu trung tâm thương mại Vincom sầm uất.",
          img: "/attractions/landmark_81.png",
          mapUrl: "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3919.2014!2d106.7218!3d10.7948!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x317527c3de5779db%3A0x801666992f4e3c!2sLandmark%2081!5e0!3m2!1svi!2svn!4v1712482000000",
          lat: 10.7946, lng: 106.7218, category: 'Giải trí'
        }
      ],
      setAttractions: (newAttractions) => set({ attractions: newAttractions }),
      addAttraction: (attraction) => set((state) => ({ attractions: [...state.attractions, attraction] })),
      updateAttraction: (id, updatedData) => set((state) => ({
        attractions: state.attractions.map(attr => attr.id === id ? { ...attr, ...updatedData } : attr)
      })),
      deleteAttraction: (id) => set((state) => ({
        attractions: state.attractions.filter(attr => attr.id !== id)
      })),
    }),
    {
      name: 'hotel-attractions-storage', // Tên key trong localStorage
    }
  )
);
