import { create } from 'zustand';

export const useAttractionsStore = create((set) => ({
  attractions: [
    {
      id: 1,
      title: "Chợ Bến Thành",
      desc: "Biểu tượng lịch sử lâu đời từ thời Pháp thuộc, nơi hội tụ tinh hoa ẩm thực Sài Gòn và là điểm mua sắm sầm uất nhất trung tâm. Tại đây, bạn có thể tìm thấy mọi thứ từ các món ăn đường phố đặc trưng, vải vóc, quần áo cho đến những món đồ thủ công mỹ nghệ tinh xảo. Đây không chỉ là nơi giao thương mà còn là chứng nhân lịch sử chứng kiến bao thăng trầm của thành phố.",
      img: "/attractions/ben_thanh_market.png",
      mapUrl: "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3919.485123456789!2d106.6967!3d10.7719!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x31752f3f1234567f%3A0x1234567890abcdef!2zQ2jhu6MgQuG6v24gVGjDoG5o!5e0!3m2!1svi!2svn!4v1712480000000",
      lat: 10.7725, lng: 106.6980
    },
    {
      id: 2,
      title: "Dinh Độc Lập",
      desc: "Di tích lịch sử đặc biệt cấp quốc gia, nơi ghi dấu thời khắc thống nhất đất nước vào ngày 30/4/1975. Công trình mang đậm dấu ấn kiến trúc phương Đông kết hợp hiện đại của thập niên 60 do kiến trúc sư Ngô Viết Thụ thiết kế. Không gian rộng lớn với nhiều phòng trưng bày, hầm ngầm bí mật và thảm cỏ xanh mướt là điểm đến không thể bỏ qua.",
      img: "/attractions/independence_palace.png",
      mapUrl: "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3919.44795325883!2d106.69344157573435!3d10.777485359483321!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x31752f38f9ed3d7d%3A0x6b485d204780516!2sIndependence%20Palace!5e0!3m2!1svi!2svn!4v1712481000000",
      lat: 10.7770, lng: 106.6953
    },
    {
      id: 3,
      title: "Landmark 81",
      desc: "Tòa nhà cao nhất Việt Nam, biểu tượng cho sự thịnh vượng và vươn tầm quốc tế của TP.HCM. Tòa tháp cao 81 tầng với khu trung tâm thương mại Vincom sầm uất, các nhà hàng sang trọng, sân trượt băng và đài quan sát Skyview ở các tầng cao nhất mang đến tầm nhìn toàn cảnh ngoạn mục của dòng sông Sài Gòn và thành phố lung linh về đêm.",
      img: "/attractions/landmark_81.png",
      mapUrl: "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3919.2014!2d106.7218!3d10.7948!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x317527c3de5779db%3A0x801666992f4e3c!2sLandmark%2081!5e0!3m2!1svi!2svn!4v1712482000000",
      lat: 10.7946, lng: 106.7218
    },
    {
      id: 4,
      title: "Bưu Điện Thành Phố",
      desc: "Công trình kiến trúc Pháp cổ điển ngay trung tâm, được thiết kế bởi Gustave Eiffel. Mái vòm cao lộng lẫy, những bốt điện thoại bằng gỗ cổ kính, và hai bản đồ lịch sử cỡ lớn vẽ trên tường mang lại vẻ đẹp vượt thời gian. Đây là một trong những bưu điện cổ và đẹp nhất Đông Nam Á, thu hút hàng ngàn du khách ghé thăm mỗi ngày.",
      img: "/attractions/post_office.png",
      mapUrl: "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3919.4439!2d106.6999!3d10.7798!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x31752f385573447d%3A0xbc4047970d49826d!2sSaigon%20Central%20Post%20Office!5e0!3m2!1svi!2svn!4v1712483000000",
      lat: 10.7798, lng: 106.6999
    },
    {
      id: 5,
      title: "Phố Đi Bộ Nguyễn Huệ",
      desc: "Thiên đường vui chơi về đêm với không gian đi bộ hiện đại nhất thành phố. Con đường lát đá granite sạch sẽ kéo dài từ trụ sở UBND Thành phố đến bến Bạch Đằng. Nơi đây thường xuyên tổ chức các màn trình diễn âm nhạc đường phố, có nhiều quán cafe view đẹp (điển hình như chung cư 42 Nguyễn Huệ) và đài phun nước lung linh sắc màu.",
      img: "/attractions/nguyen_hue_street.png",
      mapUrl: "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3919.4602!2d106.7025!3d10.7756!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x31752f40a6e38253%3A0x6b44983050119f!2zUGjhu5EgxJFpIGLhu5kgTmd1eeG7hW4gSHXhu4c!5e0!3m2!1svi!2svn!4v1712484000000",
      lat: 10.7745, lng: 106.7032
    },
    { id: 'g_vt1', title: 'Công viên Tropicana', desc: 'Công viên giải trí nước kết hợp các trò chơi cảm giác mạnh mang phong cách nhiệt đới tại Hồ Tràm, Vũng Tàu.', img: 'https://images.unsplash.com/photo-1571431604928-85472ff2e4ec?w=600', lat: 10.4682, lng: 107.4526 },
    { id: 'g_vt2', title: 'Bảo tàng Vũ khí cổ Robert Taylor', desc: 'Bộ sưu tập vũ khí cổ khổng lồ từ khắp nơi trên thế giới được trưng bày trong không gian cổ kính.', img: 'https://images.unsplash.com/photo-1555949258-eb67b1ef0ceb?w=600', lat: 10.3458, lng: 107.0765 },
    { id: 'g_vt3', title: 'Tượng Chúa Giêsu Kytô Vua', desc: 'Tượng Chúa dang tay ngoạn mục nằm trên đỉnh Núi Nhỏ của thành phố biển Vũng Tàu.', img: 'https://images.unsplash.com/photo-1583417319070-4a69db38a482?w=600', lat: 10.3275, lng: 107.0850 },
    { id: 'g_hn1', title: 'Hồ Hoàn Kiếm', desc: 'Biểu tượng lịch sử thiêng liêng giữa lòng thủ đô Hà Nội ngàn năm văn hiến.', img: 'https://images.unsplash.com/photo-1599708155013-176313f8d32d?w=600', lat: 21.0285, lng: 105.8523 }
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
