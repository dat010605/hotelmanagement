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
      name: 'hotel-reviews-storage'
    }
  )
);
