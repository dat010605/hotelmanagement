import React, { useState, useRef, useMemo, useEffect } from 'react';
import { Row, Col, Card, Typography, Button, Input, DatePicker, InputNumber, Rate, Avatar, Tag, Divider, Modal, Carousel, Popover, Badge, Spin } from 'antd';
import { EnvironmentOutlined, ArrowRightOutlined, SearchOutlined, CalendarOutlined, TeamOutlined, TagOutlined, ReadOutlined, UserOutlined, StarFilled, ClockCircleOutlined, LeftOutlined, RightOutlined, MinusOutlined, PlusOutlined, FireOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAttractionsStore } from '../store/useAttractionsStore';
import { useReviewStore } from '../store/useReviewStore';
import FreeMap from '../components/FreeMap';
import HeroSection from '../components/HeroSection';
import axiosClient from '../api/axiosClient';

const { Title, Paragraph, Text } = Typography;
const { RangePicker } = DatePicker;

const FALLBACK_IMG = 'https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=600';

// ── Dữ liệu tin tức mẫu (sẽ được i18n bên trong component) ────────────────────

// ── Dữ liệu đánh giá mẫu ─────────────────────────────────────────────────────

// ── Component Phần Tiêu Đề Section ───────────────────────────────────────────
const SectionHeader = ({ title, subtitle }) => (
  <div style={{ textAlign: 'center', marginBottom: '48px' }}>
    <Title level={2} style={{ marginBottom: 8 }}>{title}</Title>
    {subtitle && <p style={{ fontSize: 16, color: '#595959', marginBottom: 0 }}>{subtitle}</p>}
    <div style={{ width: '60px', height: '4px', background: '#1890ff', margin: '12px auto 0', borderRadius: '2px' }} />
  </div>
);

// ── Component Card tin tức ────────────────────────────────────────────────────
const NewsCard = ({ item, onReadMore }) => (
  <Card
    hoverable
    style={{ borderRadius: '12px', overflow: 'hidden', height: '100%', display: 'flex', flexDirection: 'column' }}
    cover={
      <div style={{ overflow: 'hidden', height: '200px' }}>
        <img
          alt={item.title}
          src={item.img}
          onError={(e) => { e.target.src = FALLBACK_IMG; }}
          style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.4s' }}
          onMouseOver={(e) => e.currentTarget.style.transform = 'scale(1.07)'}
          onMouseOut={(e) => e.currentTarget.style.transform = 'scale(1)'}
        />
      </div>
    }
    bodyStyle={{ flex: 1, display: 'flex', flexDirection: 'column', padding: '20px' }}
  >
    <div style={{ marginBottom: 10 }}>
      <Tag color={item.tagColor} style={{ borderRadius: 4, fontWeight: 600 }}>{item.tag}</Tag>
      <Text type="secondary" style={{ marginLeft: 8, fontSize: 13 }}>
        <ClockCircleOutlined /> {item.date}
      </Text>
    </div>
    <Title level={4} style={{ marginBottom: 10, lineHeight: 1.4 }}>{item.title}</Title>
    <p style={{ color: '#595959', flex: 1, marginBottom: 16 }}>{item.desc || ''}</p>
    <Button type="link" style={{ padding: 0, textAlign: 'left', fontWeight: 600 }} onClick={() => onReadMore && onReadMore(item)}>
      {item.readMore} <ArrowRightOutlined />
    </Button>
  </Card>
);

// ── Component Card đánh giá ───────────────────────────────────────────────────
const ReviewCard = ({ review }) => (
  <Card
    style={{
      borderRadius: '16px',
      height: '100%',
      border: '1px solid #f0f0f0',
      boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
      transition: 'box-shadow 0.3s',
    }}
    hoverable
    bodyStyle={{ padding: '24px' }}
  >
    {/* Quote icon */}
    <div style={{ fontSize: 40, color: '#1890ff', opacity: 0.15, lineHeight: 1, marginBottom: 8, fontFamily: 'Georgia, serif' }}>"</div>

    <Rate disabled allowHalf defaultValue={review.rating} style={{ fontSize: 14, marginBottom: 12 }} />

    <p style={{ color: '#333', fontSize: 15, lineHeight: 1.7, marginBottom: 20, fontStyle: 'italic' }}>
      "{review.content || ''}"
    </p>

    <Divider style={{ margin: '0 0 16px 0' }} />

    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
      <Avatar size={44} src={review.avatar} icon={<UserOutlined />} />
      <div>
        <Text strong style={{ display: 'block', fontSize: 15 }}>{review.name}</Text>
        <Text type="secondary" style={{ fontSize: 13 }}>
          <StarFilled style={{ color: '#faad14', marginRight: 4 }} />
          {review.room} · {review.date}
        </Text>
      </div>
    </div>
  </Card>
);

// ── Trang chủ chính ───────────────────────────────────────────────────────────
const CustomerHomePage = () => {
  const { attractions } = useAttractionsStore();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [selectedMap, setSelectedMap] = useState(null);
  const [selectedDetail, setSelectedDetail] = useState(null);
  const [selectedNews, setSelectedNews] = useState(null);
  const carouselRef = useRef(null);
  const allReviews = useReviewStore(state => state.reviews);
  const reviews = useMemo(() => allReviews.filter(r => !r.isHidden).slice(0, 4), [allReviews]);

  // Lấy danh sách hạng phòng
  const [roomTypes, setRoomTypes] = useState([]);
  const [loadingRooms, setLoadingRooms] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await axiosClient.get('/RoomTypes/availability');
        setRoomTypes(res.data || []);
      } catch (error) {
        console.error("Error loading room types:", error);
        // Fallback to basic endpoint
        try {
          const res = await axiosClient.get('/RoomTypes');
          setRoomTypes(res.data || []);
        } catch { /* ignore */ }
      } finally {
        setLoadingRooms(false);
      }
    };
    fetchData();
  }, []);

  const popularRoomTypes = useMemo(() => {
    if (roomTypes.length === 0) return [];
    const imageByName = {
      'standard': 'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=800',
      'tiêu chuẩn': 'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=800',
      'deluxe': 'https://images.unsplash.com/photo-1566665797739-1674de7a421a?w=800',
      'suite': 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=800',
      'hoàng gia': 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=800',
      'family': 'https://images.unsplash.com/photo-1578683010236-d716f9a3f461?w=800',
      'cao cấp': 'https://images.unsplash.com/photo-1596394516093-501ba68a0ba6?w=800',
      'premium': 'https://images.unsplash.com/photo-1596394516093-501ba68a0ba6?w=800',
      'villa': 'https://images.unsplash.com/photo-1512918728675-ed5a9ecdebfd?w=800',
      'vip': 'https://images.unsplash.com/photo-1505577058444-a3dab90d4253?w=800',
      'president': 'https://images.unsplash.com/photo-1618221118493-9cfa1a1c00da?w=800',
      'tổng thống': 'https://images.unsplash.com/photo-1618221118493-9cfa1a1c00da?w=800',
    };
    const fallbackById = {
      1: 'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=800',
      2: 'https://images.unsplash.com/photo-1566665797739-1674de7a421a?w=800',
      3: 'https://images.unsplash.com/photo-1596394516093-501ba68a0ba6?w=800',
      4: 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=800',
      5: 'https://images.unsplash.com/photo-1578683010236-d716f9a3f461?w=800',
      6: 'https://images.unsplash.com/photo-1505577058444-a3dab90d4253?w=800',
      7: 'https://images.unsplash.com/photo-1618221118493-9cfa1a1c00da?w=800',
      8: 'https://images.unsplash.com/photo-1512918728675-ed5a9ecdebfd?w=800',
    };
    return roomTypes.slice(0, 4).map(rt => {
      const name = (rt.name || '').toLowerCase();
      const key = Object.keys(imageByName).find(k => name.includes(k));
      // Ưu tiên: Cloudinary → tên hạng phòng → ID → fallback
      const img = (rt.images && rt.images.length > 0) ? rt.images[0]
        : (key ? imageByName[key] : (fallbackById[rt.id] || FALLBACK_IMG));
      return { ...rt, imgUrl: img, rating: 4.8 + Math.random() * 0.2 };
    });
  }, [roomTypes]);

  // State quản lý số phòng và khách
  const [roomGuests, setRoomGuests] = useState([{ id: 1, adults: 2, children: 0 }]);

  const handleAddRoom = () => {
    setRoomGuests([...roomGuests, { id: Date.now(), adults: 2, children: 0 }]);
  };

  const handleRemoveRoom = (id) => {
    if (roomGuests.length > 1) {
      setRoomGuests(roomGuests.filter(r => r.id !== id));
    }
  };

  const handleUpdateGuest = (id, type, delta) => {
    setRoomGuests(roomGuests.map(r => {
      if (r.id === id) {
        const newValue = r[type] + delta;
        if (type === 'adults' && newValue < 1) return r; // Ít nhất 1 người lớn
        if (type === 'children' && newValue < 0) return r; // Không được âm
        return { ...r, [type]: newValue };
      }
      return r;
    }));
  };

  const guestPopoverContent = (
    <div style={{ width: 280, padding: '4px' }}>
      {roomGuests.map((room, index) => (
        <div key={room.id} style={{ marginBottom: 20 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12, borderBottom: '1px solid #f0f0f0', paddingBottom: 6 }}>
            <Text strong style={{ color: '#595959' }}>Phòng {index + 1}</Text>
            {roomGuests.length > 1 && (
              <span 
                onClick={() => handleRemoveRoom(room.id)}
                style={{ color: '#9e6285', cursor: 'pointer', fontSize: 13 }}
              >
                Xóa phòng
              </span>
            )}
          </div>
          
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <Text style={{ color: '#595959', fontSize: 15 }}>Người lớn</Text>
            <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
              <Button 
                shape="square" 
                icon={<MinusOutlined style={{ color: '#9e6285' }} />} 
                onClick={() => handleUpdateGuest(room.id, 'adults', -1)} 
                style={{ borderColor: '#e8e8e8', width: 36, height: 36 }}
              />
              <Text style={{ width: 16, textAlign: 'center', fontSize: 15 }}>{room.adults}</Text>
              <Button 
                shape="square" 
                icon={<PlusOutlined style={{ color: '#9e6285' }} />} 
                onClick={() => handleUpdateGuest(room.id, 'adults', 1)} 
                style={{ borderColor: '#e8e8e8', width: 36, height: 36 }}
              />
            </div>
          </div>
          
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Text style={{ color: '#595959', fontSize: 15 }}>Trẻ em</Text>
            <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
              <Button 
                shape="square" 
                icon={<MinusOutlined style={{ color: '#9e6285' }} />} 
                onClick={() => handleUpdateGuest(room.id, 'children', -1)} 
                style={{ borderColor: '#e8e8e8', width: 36, height: 36 }}
              />
              <Text style={{ width: 16, textAlign: 'center', fontSize: 15 }}>{room.children}</Text>
              <Button 
                shape="square" 
                icon={<PlusOutlined style={{ color: '#9e6285' }} />} 
                onClick={() => handleUpdateGuest(room.id, 'children', 1)} 
                style={{ borderColor: '#e8e8e8', width: 36, height: 36 }}
              />
            </div>
          </div>
        </div>
      ))}
      <span 
        onClick={handleAddRoom}
        style={{ color: '#9e6285', cursor: 'pointer', fontSize: 13, display: 'inline-block', marginTop: 4 }}
      >
        + Thêm phòng
      </span>
    </div>
  );

  const totalAdults = roomGuests.reduce((sum, r) => sum + r.adults, 0);
  const totalChildren = roomGuests.reduce((sum, r) => sum + r.children, 0);
  const summaryText = `${totalAdults} Người lớn, ${totalChildren} Trẻ em`;

  const NEWS_DATA = [
    { 
      id: 1, tag: t('home.newsEvent'), tagColor: '#1890ff', title: t('home.newsTitle1'), desc: t('home.newsDesc1'), date: '20/04/2026', img: 'https://images.unsplash.com/photo-1544161515-4ab6ce6db874?w=600', readMore: t('common.readMore'),
      content: "Khách sạn The Royal Citadel vinh dự thông báo chuỗi sự kiện Mùa Hè 2026. Sự kiện sẽ diễn ra tại sảnh chính với hàng loạt hoạt động giải trí đặc sắc, tiệc buffet ngoài trời cao cấp và chương trình bốc thăm trúng thưởng vô cùng hấp dẫn dành cho tất cả quý khách lưu trú trong dịp này.\n\nĐặc biệt, chúng tôi sẽ chính thức giới thiệu các gói nghỉ dưỡng thượng lưu mới với mức giá ưu đãi chưa từng có, đi kèm với dịch vụ đặc quyền riêng biệt. Đừng bỏ lỡ cơ hội tham gia và trải nghiệm những khoảnh khắc đáng nhớ cùng gia đình và người thân."
    },
    { 
      id: 2, tag: t('home.newsOffer'), tagColor: '#52c41a', title: t('home.newsTitle2'), desc: t('home.newsDesc2'), date: '15/04/2026', img: 'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=600', readMore: t('common.readMore'),
      content: "Chương trình Ưu đãi Đón Hè Rực Rỡ mang đến cho bạn cơ hội nhận giảm giá lên đến 30% cho tất cả các loại phòng, áp dụng từ nay đến hết tháng 8/2026.\n\nGói ưu đãi đặc biệt này đã bao gồm bữa sáng tự chọn tiêu chuẩn quốc tế miễn phí, dịch vụ xe sang đón tiễn sân bay hai chiều và một phiếu trải nghiệm dịch vụ Spa trị giá 1.000.000 VNĐ. Hãy nhanh tay đặt phòng ngay hôm nay để không bỏ lỡ cơ hội hiếm có trải nghiệm dịch vụ đẳng cấp 5 sao thực thụ với mức chi phí tiết kiệm nhất."
    },
    { 
      id: 3, tag: t('home.newsAward'), tagColor: '#faad14', title: t('home.newsTitle3'), desc: t('home.newsDesc3'), date: '08/04/2026', img: 'https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=600', readMore: t('common.readMore'),
      content: "The Royal Citadel vô cùng tự hào khi vừa được vinh danh là 'Khách Sạn Sang Trọng Tốt Nhất Năm 2026' do hội đồng chuyên gia của tạp chí du lịch danh tiếng bình chọn.\n\nGiải thưởng danh giá này chính là minh chứng rõ nét nhất cho sự nỗ lực, cống hiến không ngừng nghỉ của toàn thể đội ngũ nhân viên chúng tôi. Cam kết mang đến trải nghiệm lưu trú hoàn hảo, dịch vụ tận tâm tinh tế và hệ thống cơ sở vật chất đẳng cấp thế giới luôn là kim chỉ nam để chúng tôi tiếp tục phục vụ quý khách tốt hơn nữa trong tương lai."
    },
  ];

  const handleSearch = () => navigate('/rooms');

  return (
    <div style={{ paddingBottom: '60px' }}>

      {/* ── HERO SECTION ──────────────────────────────────────────────────── */}
      <HeroSection />

      {/* Search Bar */}
      <div style={{ maxWidth: 900, margin: '-20px auto 80px', position: 'relative', zIndex: 10 }}>
        <Card
          style={{ borderRadius: '12px', boxShadow: '0 10px 30px rgba(0,0,0,0.15)' }}
          bodyStyle={{ padding: '16px 24px' }}
        >
          <Row gutter={[16, 16]} align="middle">
            <Col xs={24} md={9}>
              <Text strong style={{ display: 'block', marginBottom: '8px' }}><CalendarOutlined /> {t('home.checkInOut')}</Text>
              <RangePicker size="large" bordered={false} style={{ borderBottom: '1px solid #d9d9d9', width: '100%' }} placeholder={[t('home.checkIn'), t('home.checkOut')]} />
            </Col>
            <Col xs={12} md={6}>
              <Text strong style={{ display: 'block', marginBottom: '8px' }}><TeamOutlined /> Khách và Phòng</Text>
              <Popover placement="bottomLeft" content={guestPopoverContent} trigger="click" overlayStyle={{ zIndex: 1050 }}>
                <div style={{ 
                  borderBottom: '1px solid #d9d9d9', 
                  padding: '6px 0', 
                  cursor: 'pointer', 
                  height: '40px',
                  display: 'flex',
                  alignItems: 'center',
                  fontSize: '15px'
                }}>
                  <UserOutlined style={{ marginRight: 8, color: '#595959' }} />
                  {summaryText}
                </div>
              </Popover>
            </Col>
            <Col xs={12} md={5}>
              <Text strong style={{ display: 'block', marginBottom: '8px' }}><TagOutlined /> {t('home.promoCode')}</Text>
              <Input placeholder={t('home.promoPlaceholder')} size="large" bordered={false} style={{ borderBottom: '1px solid #d9d9d9', width: '100%' }} />
            </Col>
            <Col xs={24} md={4} style={{ textAlign: 'center' }}>
              <Button type="primary" size="large" icon={<SearchOutlined />} onClick={handleSearch} style={{ width: '100%', height: '50px', borderRadius: '8px', background: '#c9a961', borderColor: '#c9a961', fontWeight: 'bold', marginTop: '22px' }}>
                {t('home.searchBtn')}
              </Button>
            </Col>
          </Row>
        </Card>
      </div>

      {/* ── PHÒNG ĐƯỢC ĐẶT NHIỀU NHẤT ─────────────────────────────────────── */}
      <div style={{ maxWidth: 1200, margin: '0 auto 80px', padding: '0 24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 32 }}>
          <div>
            <Title level={2} style={{ margin: 0 }}>
              <FireOutlined style={{ color: '#fa541c', marginRight: 8 }} />
              {t('offersPage.popularTitle') || 'Phòng Được Đặt Nhiều Nhất'}
            </Title>
            <p style={{ color: '#595959', fontSize: 15, margin: '8px 0 0' }}>
              {t('offersPage.popularSubtitle') === 'offersPage.popularSubtitle' ? 'Những căn phòng được quý khách hàng yêu thích và săn đón nhiều nhất trong tháng này' : t('offersPage.popularSubtitle')}
            </p>
          </div>
          <Button type="primary" size="large" onClick={() => navigate('/rooms')} style={{ borderRadius: 8, background: '#c9a961', borderColor: '#c9a961' }}>
            {t('offersPage.viewAllRooms') || 'Xem Tất Cả'} <ArrowRightOutlined />
          </Button>
        </div>

        {loadingRooms ? (
          <div style={{ textAlign: 'center', padding: '60px 0' }}><Spin size="large" /></div>
        ) : (
          <Row gutter={[24, 24]}>
            {popularRoomTypes.map(rt => (
              <Col xs={24} sm={12} md={12} lg={6} key={rt.id}>
                <Badge.Ribbon text={t('offersPage.bestSeller') || 'Phổ biến'} color="gold">
                  <Card
                    hoverable
                    cover={<img alt={rt.name} src={rt.imgUrl} onError={(e) => { e.target.src = FALLBACK_IMG; }} style={{ height: 200, objectFit: 'cover' }} />}
                    style={{ borderRadius: '12px', overflow: 'hidden', height: '100%', display: 'flex', flexDirection: 'column', boxShadow: '0 4px 15px rgba(0,0,0,0.05)' }}
                    bodyStyle={{ flex: 1, display: 'flex', flexDirection: 'column', padding: 20 }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8, gap: 8 }}>
                      <Tag color="geekblue" style={{ whiteSpace: 'normal', height: 'auto', padding: '2px 8px', flex: 1 }}>{rt.name}</Tag>
                      <Text strong style={{ color: '#faad14', flexShrink: 0, marginTop: 2 }}><StarFilled /> {rt.rating.toFixed(1)}</Text>
                    </div>
                    <Title level={4} style={{ marginBottom: 4 }}>{rt.name}</Title>
                    <Text type="secondary" style={{ fontSize: 13, display: 'block', marginBottom: 16 }}>
                      {rt.availableRooms != null ? `✅ Còn ${rt.availableRooms} phòng trống` : (rt.description || `Hạng phòng sang trọng`)}
                    </Text>
                    
                    <div style={{ marginTop: 'auto', paddingTop: 16, borderTop: '1px solid #f0f0f0' }}>
                      <Text type="danger" strong style={{ fontSize: '1.2rem' }}>
                        {(rt.basePrice || 0).toLocaleString('vi-VN')} {t('offersPage.perNight') || 'đ / Đêm'}
                      </Text>
                      <Button type="primary" block style={{ marginTop: 12, borderRadius: 6, background: '#c9a961', borderColor: '#c9a961' }} onClick={() => navigate('/rooms')}>
                        {t('offersPage.bookNow') || 'Đặt Ngay'}
                      </Button>
                    </div>
                  </Card>
                </Badge.Ribbon>
              </Col>
            ))}
          </Row>
        )}
      </div>

      {/* ── ATTRACTIONS SECTION ───────────────────────────────────────────── */}
      <div style={{ marginTop: '80px', position: 'relative' }}>
        <SectionHeader
          title={t('attractionsTitle')}
          subtitle={t('home.attractionsSubtitle')}
        />
        
        <div style={{ position: 'relative' }}>
          <Button 
            shape="circle" 
            icon={<LeftOutlined />} 
            size="large"
            onClick={() => carouselRef.current.prev()}
            style={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)', zIndex: 10, boxShadow: '0 2px 8px rgba(0,0,0,0.2)', opacity: 0.8 }}
          />
          <Button 
            shape="circle" 
            icon={<RightOutlined />} 
            size="large"
            onClick={() => carouselRef.current.next()}
            style={{ position: 'absolute', right: 16, top: '50%', transform: 'translateY(-50%)', zIndex: 10, boxShadow: '0 2px 8px rgba(0,0,0,0.2)', opacity: 0.8 }}
          />
          <Carousel 
            ref={carouselRef} 
            dots={false} 
            slidesToShow={3} 
            slidesToScroll={1}
            responsive={[
              { breakpoint: 1024, settings: { slidesToShow: 2 } },
              { breakpoint: 600, settings: { slidesToShow: 1 } }
            ]}
          >
            {attractions.map((item) => (
              <div key={item.id} style={{ padding: '0 12px' }}>
                <Card
                  hoverable
                  style={{ borderRadius: '12px', overflow: 'hidden', display: 'flex', flexDirection: 'column', margin: '0 12px 16px' }}
                  cover={
                    <div style={{ overflow: 'hidden', height: '200px' }}>
                      <img
                        alt={item.title}
                        src={item.img}
                        onError={(e) => { e.target.src = FALLBACK_IMG; }}
                        style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.3s' }}
                        onMouseOver={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
                        onMouseOut={(e) => e.currentTarget.style.transform = 'scale(1)'}
                      />
                    </div>
                  }
                  bodyStyle={{ display: 'flex', flexDirection: 'column', height: '160px' }}
                >
                  <Title level={4} style={{ marginBottom: '12px' }}>
                    <EnvironmentOutlined style={{ color: '#1890ff', marginRight: '8px' }} />
                    {item.title}
                  </Title>
                  <p style={{ color: '#595959', flex: 1, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', margin: 0, marginBottom: '16px' }}>
                    {item.desc || ''}
                  </p>
                  <div style={{ display: 'flex', gap: '10px', marginTop: 'auto' }}>
                    <Button type="primary" ghost style={{ borderRadius: '6px' }} onClick={() => setSelectedDetail(item)}>
                      {t('viewDetails')} <ArrowRightOutlined />
                    </Button>
                    {item.lat && item.lng && (
                      <Button 
                        type="default" 
                        onClick={() => setSelectedMap(item)} 
                        icon={<EnvironmentOutlined />} 
                        style={{ borderRadius: '6px', color: '#52c41a', borderColor: '#52c41a' }}
                      >
                        {t('common.map')}
                      </Button>
                    )}
                  </div>
                </Card>
              </div>
            ))}
          </Carousel>
        </div>
        <div style={{ textAlign: 'center', marginTop: 32 }}>
          <Button 
            size="large" 
            type="default" 
            onClick={() => navigate('/attractions')} 
            style={{ borderRadius: '8px', padding: '0 32px', background: '#fff', color: '#333', borderColor: '#d9d9d9', fontWeight: 500 }}
          >
            Xem thêm
          </Button>
        </div>
      </div>

      {/* ── NEWS SECTION ──────────────────────────────────────────────────── */}
      <div style={{ marginTop: '80px' }}>
        <SectionHeader
          title={t('home.newsTitle')}
          subtitle={t('home.newsSubtitle')}
        />
        <Row gutter={[24, 24]}>
          {NEWS_DATA.map(item => (
            <Col xs={24} sm={12} md={8} key={item.id}>
              <NewsCard item={item} onReadMore={(item) => setSelectedNews(item)} />
            </Col>
          ))}
        </Row>

      </div>

      {/* ── REVIEWS SECTION ───────────────────────────────────────────────── */}
      <div style={{ marginTop: '80px' }}>
        <SectionHeader
          title={t('home.reviewsTitle')}
          subtitle={t('home.reviewsSubtitle')}
        />

        {/* Tổng điểm đánh giá */}
        <div style={{
          background: 'linear-gradient(135deg, #1890ff 0%, #0050b3 100%)',
          borderRadius: '16px',
          padding: '32px',
          marginBottom: '40px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 32,
          flexWrap: 'wrap',
          color: '#fff'
        }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '4rem', fontWeight: 900, lineHeight: 1 }}>4.8</div>
            <Rate disabled defaultValue={5} style={{ fontSize: 20, color: '#fadb14', marginTop: 4 }} />
            <div style={{ marginTop: 4, color: 'rgba(255,255,255,0.8)' }}>{t('home.avgRating')}</div>
          </div>
          <div style={{ width: 1, height: 80, background: 'rgba(255,255,255,0.3)' }} />
          {[
            { label: t('home.guestsStayed'), value: '2,400+' },
            { label: t('home.fiveStarReviews'), value: '92%' },
            { label: t('home.referFriends'), value: '98%' }
          ].map(stat => (
            <div key={stat.label} style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '2.2rem', fontWeight: 800, lineHeight: 1 }}>{stat.value}</div>
              <div style={{ color: 'rgba(255,255,255,0.8)', marginTop: 4 }}>{stat.label}</div>
            </div>
          ))}
        </div>

        <Row gutter={[24, 24]}>
          {reviews.map(review => (
            <Col xs={24} sm={12} md={12} lg={6} key={review.id}>
              <ReviewCard review={review} />
            </Col>
          ))}
        </Row>

        <div style={{ textAlign: 'center', marginTop: 24 }}>
          <Button size="large" type="primary" onClick={() => navigate('/reviews')} style={{ borderRadius: '8px' }}>
            {t('home.viewMoreReviews')}
          </Button>
        </div>
      </div>

      <Modal
        title={selectedMap ? `${t('common.mapDirections')} - ${selectedMap.title}` : t('common.mapDirections')}
        open={!!selectedMap}
        onCancel={() => setSelectedMap(null)}
        footer={null}
        width={800}
        centered
        destroyOnClose
      >
        {selectedMap && selectedMap.lat && selectedMap.lng ? (
          <FreeMap 
            lat={selectedMap.lat} 
            lng={selectedMap.lng} 
            title={selectedMap.title} 
          />
        ) : (
          <p>{t('common.noMapData')}</p>
        )}
      </Modal>

      <Modal
        title={selectedDetail?.title || t('viewDetails')}
        open={!!selectedDetail}
        onCancel={() => setSelectedDetail(null)}
        footer={null}
        width={700}
        centered
        destroyOnClose
      >
        {selectedDetail && (
          <div>
            <div style={{ width: '100%', height: '350px', borderRadius: '8px', overflow: 'hidden', marginBottom: '20px' }}>
              <img 
                src={selectedDetail.img} 
                alt={selectedDetail.title} 
                style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                onError={(e) => { e.target.src = FALLBACK_IMG; }}
              />
            </div>
            <Title level={3} style={{ color: '#1890ff', marginBottom: '16px' }}>
              <EnvironmentOutlined style={{ marginRight: '8px' }} />
              {selectedDetail.title}
            </Title>
            <p style={{ fontSize: '1.05rem', lineHeight: 1.8, color: '#333' }}>
              {selectedDetail.desc}
            </p>
          </div>
        )}
      </Modal>

      {/* ── NEWS MODAL ────────────────────────────────────────────────────── */}
      <Modal
        title={selectedNews?.title || 'Chi tiết tin tức'}
        open={!!selectedNews}
        onCancel={() => setSelectedNews(null)}
        footer={[
          <Button key="close" type="primary" onClick={() => setSelectedNews(null)} style={{ borderRadius: '8px' }}>
            Đóng
          </Button>
        ]}
        width={700}
        centered
        destroyOnClose
      >
        {selectedNews && (
          <div>
            <div style={{ width: '100%', height: '350px', borderRadius: '8px', overflow: 'hidden', marginBottom: '20px' }}>
              <img 
                src={selectedNews.img} 
                alt={selectedNews.title} 
                style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                onError={(e) => { e.target.src = FALLBACK_IMG; }}
              />
            </div>
            <div style={{ marginBottom: 16 }}>
              <Tag color={selectedNews.tagColor} style={{ fontSize: 14, padding: '4px 12px' }}>{selectedNews.tag}</Tag>
              <Text type="secondary" style={{ marginLeft: 8, fontSize: 14 }}>
                <ClockCircleOutlined style={{ marginRight: 4 }} /> {selectedNews.date}
              </Text>
            </div>
            <Title level={3} style={{ color: '#1f1f1f', marginBottom: '16px', lineHeight: 1.4 }}>
              {selectedNews.title}
            </Title>
            <Paragraph style={{ fontSize: '1.05rem', lineHeight: 1.8, whiteSpace: 'pre-line', color: '#444' }}>
              {selectedNews.content}
            </Paragraph>
          </div>
        )}
      </Modal>

    </div>
  );
};

export default CustomerHomePage;
