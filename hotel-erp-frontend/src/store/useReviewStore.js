import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const INITIAL_REVIEWS = [
  {
    id: 1,
    name: 'Nguyễn Thanh Hà',
    avatar: 'https://randomuser.me/api/portraits/women/44.jpg',
    rating: 5,
    room: 'Suite Deluxe',
    date: '20/04/2026',
    content: 'Tuyệt vời! Phòng rộng rãi, sạch sẽ và view nhìn ra biển rất đẹp. Nhân viên nhiệt tình, chuyên nghiệp. Chắc chắn sẽ quay lại lần sau.',
    isHidden: false
  },
  {
    id: 2,
    name: 'Trần Minh Quân',
    avatar: 'https://randomuser.me/api/portraits/men/32.jpg',
    rating: 5,
    room: 'Villa Gia Đình',
    date: '15/04/2026',
    content: 'Đưa cả gia đình đến đây nghỉ dưỡng 3 ngày, trẻ con rất thích hồ bơi. Bữa sáng buffet đa dạng và ngon. Giá trị xứng đáng với trải nghiệm nhận được!',
    isHidden: false
  },
  {
    id: 3,
    name: 'Lê Phương Linh',
    avatar: 'https://randomuser.me/api/portraits/women/68.jpg',
    rating: 4.5,
    room: 'Executive Room',
    date: '10/04/2026',
    content: 'Phòng sạch đẹp, thiết kế sang trọng. Lễ tân check-in rất nhanh và thân thiện. Chỉ có điều bữa tối hơi ít món, nhưng nhìn chung rất hài lòng!',
    isHidden: false
  },
  {
    id: 4,
    name: 'Phạm Đức Anh',
    avatar: 'https://randomuser.me/api/portraits/men/75.jpg',
    rating: 5,
    room: 'Honeymoon Suite',
    date: '05/04/2026',
    content: 'Kỳ trăng mật hoàn hảo! Khách sạn chuẩn bị hoa và nến trong phòng như đã yêu cầu. Không gian lãng mạn, dịch vụ butler 24/7. Cảm ơn đội ngũ rất nhiều!',
    isHidden: false
  },
  {
    id: 5,
    name: 'Hoàng Thu Trang',
    avatar: 'https://randomuser.me/api/portraits/women/52.jpg',
    rating: 4,
    room: 'Standard Room',
    date: '28/03/2026',
    content: 'Giá hợp lý, phòng thoáng mát. Vị trí khách sạn thuận tiện, gần trung tâm và các điểm tham quan. Sẽ giới thiệu cho bạn bè.',
    isHidden: false
  },
  {
    id: 6,
    name: 'Ngô Tấn Tài',
    avatar: 'https://randomuser.me/api/portraits/men/21.jpg',
    rating: 4.5,
    room: 'Suite Deluxe',
    date: '20/03/2026',
    content: 'Dịch vụ rất đáng đồng tiền bát gạo. Phòng tắm xông hơi xịn xò. Đồ ăn sáng hơi lặp lại nếu ở nhiều ngày.',
    isHidden: false
  },
  {
    id: 7,
    name: 'Đặng Ngọc Hương',
    avatar: 'https://randomuser.me/api/portraits/women/15.jpg',
    rating: 5,
    room: 'Ocean View Room',
    date: '18/03/2026',
    content: 'Quá xuất sắc! Nhìn từ ban công ra biển lúc hoàng hôn đẹp không tả được. Mọi thứ từ phòng ốc tới nhân viên đều điểm 10.',
    isHidden: false
  },
  {
    id: 8,
    name: 'Võ Minh Đạt',
    avatar: 'https://randomuser.me/api/portraits/men/11.jpg',
    rating: 5,
    room: 'Presidential Suite',
    date: '15/03/2026',
    content: 'Tôi đi công tác nhưng lại được tận hưởng dịch vụ quá sức tưởng tượng. Bữa sáng phục vụ tận phòng, nhanh chóng và rất ngon.',
    isHidden: false
  },
  {
    id: 9,
    name: 'Bùi Thị Hà',
    avatar: 'https://randomuser.me/api/portraits/women/8.jpg',
    rating: 4,
    room: 'Standard Room',
    date: '10/03/2026',
    content: 'Phòng sạch sẽ, gọn gàng, phù hợp với mức giá. Sẽ quay lại nếu có dịp.',
    isHidden: false
  },
  {
    id: 10,
    name: 'Hồ Quang Hiếu',
    avatar: 'https://randomuser.me/api/portraits/men/50.jpg',
    rating: 5,
    room: 'Executive Room',
    date: '05/03/2026',
    content: 'Hồ bơi đẹp, phòng gym hiện đại. Tôi rất ưng khu vực nhà hàng, view thành phố rất lãng mạn.',
    isHidden: false
  },
  {
    id: 11,
    name: 'Lý Tiểu Long',
    avatar: 'https://randomuser.me/api/portraits/men/55.jpg',
    rating: 4.5,
    room: 'Villa Gia Đình',
    date: '28/02/2026',
    content: 'Nhân viên lễ tân hỗ trợ nhiệt tình khi mình cần thuê xe. Không gian villa yên tĩnh, biệt lập.',
    isHidden: false
  },
  {
    id: 12,
    name: 'Trần Thị Mỹ Tâm',
    avatar: 'https://randomuser.me/api/portraits/women/35.jpg',
    rating: 5,
    room: 'Suite Deluxe',
    date: '25/02/2026',
    content: 'Cảm ơn khách sạn đã tặng bánh kem dịp sinh nhật của mình! Rất bất ngờ và hạnh phúc.',
    isHidden: false
  },
  {
    id: 13,
    name: 'Nguyễn Văn Toàn',
    avatar: 'https://randomuser.me/api/portraits/men/42.jpg',
    rating: 4.5,
    room: 'Standard Room',
    date: '20/02/2026',
    content: 'Tốt so với tầm giá. Cách âm phòng chưa thực sự xuất sắc nhưng chấp nhận được.',
    isHidden: false
  },
  {
    id: 14,
    name: 'Đinh Lan Ngọc',
    avatar: 'https://randomuser.me/api/portraits/women/24.jpg',
    rating: 5,
    room: 'Ocean View Room',
    date: '18/02/2026',
    content: 'Một trải nghiệm khó quên! Không gian sảnh lộng lẫy và đồ ăn thì không chê vào đâu được.',
    isHidden: false
  },
  {
    id: 15,
    name: 'Phan Công Tấn',
    avatar: 'https://randomuser.me/api/portraits/men/60.jpg',
    rating: 4,
    room: 'Honeymoon Suite',
    date: '15/02/2026',
    content: 'Khách sạn có dịch vụ spa rất tuyệt, tôi đã có những giây phút cực kỳ thư giãn.',
    isHidden: false
  },
  {
    id: 16,
    name: 'Lê Hoàng Phong',
    avatar: 'https://randomuser.me/api/portraits/men/65.jpg',
    rating: 5,
    room: 'Executive Room',
    date: '10/02/2026',
    content: 'Phong cách thiết kế hoàng gia đúng như tên gọi. Rất sang trọng.',
    isHidden: false
  },
  {
    id: 17,
    name: 'Vũ Thị Kim Oanh',
    avatar: 'https://randomuser.me/api/portraits/women/70.jpg',
    rating: 4.5,
    room: 'Villa Gia Đình',
    date: '08/02/2026',
    content: 'Khu vui chơi trẻ em rộng rãi và an toàn. Các bé nhà mình chơi rất vui.',
    isHidden: false
  },
  {
    id: 18,
    name: 'Đỗ Tiến Dũng',
    avatar: 'https://randomuser.me/api/portraits/men/82.jpg',
    rating: 5,
    room: 'Presidential Suite',
    date: '05/02/2026',
    content: 'Hoàn hảo. Mọi dịch vụ đều đẳng cấp 5 sao quốc tế.',
    isHidden: false
  },
  {
    id: 19,
    name: 'Châu Bùi',
    avatar: 'https://randomuser.me/api/portraits/women/48.jpg',
    rating: 4.5,
    room: 'Ocean View Room',
    date: '02/02/2026',
    content: 'Khung cảnh cực kỳ ăn ảnh. Rất nhiều góc đẹp để sống ảo.',
    isHidden: false
  },
  {
    id: 20,
    name: 'Nguyễn Quốc Tuấn',
    avatar: 'https://randomuser.me/api/portraits/men/22.jpg',
    rating: 5,
    room: 'Standard Room',
    date: '28/01/2026',
    content: 'Tôi rất thích quầy bar ở tầng thượng. Cocktail rất ngon và nhạc chill.',
    isHidden: false
  },
  {
    id: 21,
    name: 'Phạm Hương Giang',
    avatar: 'https://randomuser.me/api/portraits/women/11.jpg',
    rating: 5,
    room: 'Honeymoon Suite',
    date: '25/01/2026',
    content: 'Dịch vụ đưa đón sân bay bằng xe hạng sang rất chu đáo. Tài xế lịch sự.',
    isHidden: false
  },
  {
    id: 22,
    name: 'Lâm Nhật Tiến',
    avatar: 'https://randomuser.me/api/portraits/men/33.jpg',
    rating: 4,
    room: 'Suite Deluxe',
    date: '20/01/2026',
    content: 'Tuyệt vời. Đồ ăn ngon, view đẹp. Lễ tân luôn tươi cười.',
    isHidden: false
  },
  {
    id: 23,
    name: 'Tạ Minh Thư',
    avatar: 'https://randomuser.me/api/portraits/women/80.jpg',
    rating: 5,
    room: 'Executive Room',
    date: '15/01/2026',
    content: 'Khăn trải giường sạch tinh tươm. Mình rất kỹ tính nhưng cũng phải chấm 10 điểm.',
    isHidden: false
  },
  {
    id: 24,
    name: 'Lương Xuân Trường',
    avatar: 'https://randomuser.me/api/portraits/men/9.jpg',
    rating: 4.5,
    room: 'Villa Gia Đình',
    date: '10/01/2026',
    content: 'Hồ bơi nước ấm rất tuyệt vời trong thời tiết se lạnh.',
    isHidden: false
  },
  {
    id: 25,
    name: 'Bạch Trà My',
    avatar: 'https://randomuser.me/api/portraits/women/90.jpg',
    rating: 5,
    room: 'Ocean View Room',
    date: '05/01/2026',
    content: 'Mình ở lại thêm 2 ngày vì quá thích nơi này. Cảm ơn The Royal Citadel.',
    isHidden: false
  }
];

export const useReviewStore = create(
  persist(
    (set, get) => ({
      reviews: INITIAL_REVIEWS,
      
      // Khách hàng thêm đánh giá (mặc định chưa bị ẩn)
      addReview: (review) => set((state) => ({
        reviews: [{ ...review, isHidden: false, id: Date.now() }, ...state.reviews]
      })),

      // Admin đổi trạng thái ẩn/hiện
      toggleHideReview: (id) => set((state) => ({
        reviews: state.reviews.map(r => 
          r.id === id ? { ...r, isHidden: !r.isHidden } : r
        )
      })),

      // Xóa vĩnh viễn đánh giá
      deleteReview: (id) => set((state) => ({
        reviews: state.reviews.filter(r => r.id !== id)
      })),

      // Trả về chỉ các đánh giá được phép hiển thị
      getVisibleReviews: () => {
        return get().reviews.filter(r => !r.isHidden);
      }
    }),
    {
      name: 'hotel-reviews-storage-v2'
    }
  )
);
