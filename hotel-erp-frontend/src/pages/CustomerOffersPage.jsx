import React, { useState, useEffect, useMemo } from 'react';
import { Typography, Row, Col, Card, Tag, Button, Spin, Divider, Badge, message } from 'antd';
import { FireOutlined, GiftOutlined, TagOutlined, RightOutlined, StarFilled } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import axiosClient from '../api/axiosClient';

const { Title, Text, Paragraph } = Typography;

// --- Dữ liệu Mock ---
const BEST_COMBOS = [
  {
    id: 1,
    title: 'Combo Trọn Gói: 3 Ngày 2 Đêm + Spa',
    desc: 'Bao gồm 2 đêm nghỉ tại phòng Suite cao cấp, miễn phí 1 liệu trình Spa 60 phút và bữa sáng buffet cho 2 người.',
    price: '4,500,000 VNĐ',
    originalPrice: '6,000,000 VNĐ',
    img: 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?w=600',
    badge: 'HOT'
  },
  {
    id: 2,
    title: 'Kỳ Nghỉ Lãng Mạn Cho Cặp Đôi',
    desc: 'Trang trí phòng hoa hồng miễn phí, tặng 1 chai rượu vang và bữa tối lãng mạn dưới ánh nến tại nhà hàng ven biển.',
    price: '3,200,000 VNĐ',
    originalPrice: '4,800,000 VNĐ',
    img: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=600',
    badge: 'COUPLE'
  },
  {
    id: 3,
    title: 'Combo Gia Đình Vui Vẻ',
    desc: 'Nghỉ dưỡng tại Family Villa. Tặng vé khu vui chơi trẻ em và miễn phí giường phụ cho bé dưới 12 tuổi.',
    price: '5,500,000 VNĐ',
    originalPrice: '7,000,000 VNĐ',
    img: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=600',
    badge: 'FAMILY'
  }
];

const VOUCHERS = [
  {
    code: 'DELUXE20',
    discount: 'Giảm 20%',
    title: 'Ưu đãi hạng phòng Deluxe',
    desc: 'Chỉ áp dụng khi đặt các phòng thuộc hạng Deluxe. Không cộng dồn với khuyến mãi khác.',
    color: 'magenta'
  },
  {
    code: 'FAMILY500',
    discount: 'Giảm 500.000đ',
    title: 'Giảm giá Villa Gia Đình',
    desc: 'Áp dụng cho hạng phòng Family Villa hoặc Family Suite khi đặt từ 2 đêm trở lên.',
    color: 'geekblue'
  },
  {
    code: 'VIPSUITE',
    discount: 'Tặng Bữa Tối',
    title: 'Đặc quyền VIP Suite',
    desc: 'Khách đặt phòng VIP Suite sẽ được tặng 1 bữa tối cao cấp dành cho 2 người.',
    color: 'gold'
  },
  {
    code: 'STAYMORE',
    discount: 'Giảm 15%',
    title: 'Ở lâu giảm sâu',
    desc: 'Áp dụng cho mọi loại phòng khi đặt từ 4 đêm trở lên.',
    color: 'green'
  }
];

// Helper lấy hình ảnh phòng dựa trên tên loại phòng
const getRoomImage = (room, typeInfo) => {
  const typeName = (typeInfo.name || typeInfo.Name || '').toLowerCase().trim();
  const rId = room.roomTypeId || room.RoomTypeId;
  const imageByTypeName = {
    'standard':   'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=800',
    'tiêu chuẩn': 'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=800',
    'deluxe':     'https://images.unsplash.com/photo-1566665797739-1674de7a421a?w=800',
    'suite':      'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=800',
    'family':     'https://images.unsplash.com/photo-1578683010236-d716f9a3f461?w=800',
    'gia đình':   'https://images.unsplash.com/photo-1578683010236-d716f9a3f461?w=800',
    'executive':  'https://images.unsplash.com/photo-1596394516093-501ba68a0ba6?w=800',
    'villa':      'https://images.unsplash.com/photo-1512918728675-ed5a9ecdebfd?w=800',
    'vip':        'https://images.unsplash.com/photo-1505577058444-a3dab90d4253?w=800',
    'president':  'https://images.unsplash.com/photo-1618221118493-9cfa1a1c00da?w=800',
    'tổng thống': 'https://images.unsplash.com/photo-1618221118493-9cfa1a1c00da?w=800',
    'honeymoon':  'https://images.unsplash.com/photo-1595576508898-0ad5c879a061?w=800',
    'trăng mật':  'https://images.unsplash.com/photo-1595576508898-0ad5c879a061?w=800',
    'bungalow':   'https://images.unsplash.com/photo-1499793983690-e29da59ef1c2?w=800',
  };
  const matchedKey = Object.keys(imageByTypeName).find(k => typeName.includes(k));
  const fallbackByTypeId = {
    1: 'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=800',
    2: 'https://images.unsplash.com/photo-1566665797739-1674de7a421a?w=800',
    3: 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=800',
    4: 'https://images.unsplash.com/photo-1578683010236-d716f9a3f461?w=800',
    5: 'https://images.unsplash.com/photo-1596394516093-501ba68a0ba6?w=800',
    6: 'https://images.unsplash.com/photo-1505577058444-a3dab90d4253?w=800',
    7: 'https://images.unsplash.com/photo-1618221118493-9cfa1a1c00da?w=800',
    8: 'https://images.unsplash.com/photo-1512918728675-ed5a9ecdebfd?w=800',
  };
  return room.roomImages?.length > 0
    ? room.roomImages[0].imageUrl
    : room.RoomImages?.length > 0
      ? room.RoomImages[0].imageUrl
      : (matchedKey
          ? imageByTypeName[matchedKey]
          : (fallbackByTypeId[rId] || 'https://images.unsplash.com/photo-1611892440504-42a792e24d32?w=800'));
};

const CustomerOffersPage = () => {
  const navigate = useNavigate();
  const [rooms, setRooms] = useState([]);
  const [roomTypes, setRoomTypes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [copiedCode, setCopiedCode] = useState(null);

  const handleCopyCode = async (code) => {
    try {
      await navigator.clipboard.writeText(code);
      setCopiedCode(code);
      message.success(`Đã copy mã "${code}" vào clipboard!`);
      setTimeout(() => setCopiedCode(null), 2000);
    } catch {
      message.error('Không thể copy, vui lòng copy thủ công.');
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [roomsRes, typesRes] = await Promise.all([
          axiosClient.get('/Rooms'),
          axiosClient.get('/RoomTypes')
        ]);
        setRooms(roomsRes.data);
        setRoomTypes(typesRes.data);
      } catch (error) {
        console.error("Lỗi tải dữ liệu:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // Lấy ra 4 phòng nổi bật nhất (giả lập là những phòng có rating cao)
  const popularRooms = useMemo(() => {
    if (rooms.length === 0 || roomTypes.length === 0) return [];
    
    return rooms.slice(0, 4).map((room, index) => {
      const typeInfo = roomTypes.find(t => t.id === (room.roomTypeId || room.RoomTypeId)) || {};
      return {
        ...room,
        roomTypeName: typeInfo.name || typeInfo.Name || 'Phòng tiêu chuẩn',
        basePrice: typeInfo.basePrice || typeInfo.BasePrice || 500000,
        imgUrl: getRoomImage(room, typeInfo),
        bookedCount: 150 + Math.floor(Math.random() * 300), // Số người đã đặt giả lập
        rating: 4.8 + (Math.random() * 0.2) // Rating giả lập 4.8 -> 5.0
      };
    });
  }, [rooms, roomTypes]);

  return (
    <div style={{ padding: '40px 24px', maxWidth: 1200, margin: '0 auto' }}>
      
      {/* ── HEADER BANNERR ────────────────────────────────────────────────── */}
      <div style={{
        background: 'linear-gradient(135deg, #ff7a45 0%, #fa541c 100%)',
        borderRadius: '16px',
        padding: '40px',
        color: '#fff',
        textAlign: 'center',
        marginBottom: '60px',
        boxShadow: '0 8px 24px rgba(250, 84, 28, 0.3)'
      }}>
        <Title level={1} style={{ color: '#fff', margin: 0, fontWeight: 800 }}>
          <GiftOutlined /> Ưu Đãi & Phòng Hot
        </Title>
        <Paragraph style={{ color: '#ffd8bf', fontSize: '1.2rem', marginTop: 16 }}>
          Khám phá những căn phòng được săn đón nhiều nhất và các combo nghỉ dưỡng siêu tiết kiệm!
        </Paragraph>
      </div>

      {/* ── POPULAR ROOMS SECTION ─────────────────────────────────────────── */}
      <div style={{ marginBottom: '60px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
          <Title level={2} style={{ margin: 0 }}>
            <FireOutlined style={{ color: '#fa541c' }} /> Phòng Được Đặt Nhiều Nhất
          </Title>
          <Button type="link" onClick={() => navigate('/rooms')}>Xem tất cả phòng <RightOutlined /></Button>
        </div>
        
        {loading ? (
          <div style={{ textAlign: 'center', padding: '40px' }}><Spin size="large" /></div>
        ) : (
          <Row gutter={[24, 24]}>
            {popularRooms.map(room => (
              <Col xs={24} sm={12} md={12} lg={6} key={room.id}>
                <Badge.Ribbon text="Best Seller" color="red">
                  <Card
                    hoverable
                    cover={<img alt={room.roomNumber} src={room.imgUrl} onError={(e) => { e.target.src = 'https://images.unsplash.com/photo-1611892440504-42a792e24d32?w=800'; }} style={{ height: 200, objectFit: 'cover' }} />}
                    style={{ borderRadius: '12px', overflow: 'hidden', height: '100%', display: 'flex', flexDirection: 'column' }}
                    bodyStyle={{ flex: 1, display: 'flex', flexDirection: 'column' }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8, gap: 8 }}>
                      <Tag color="blue" style={{ whiteSpace: 'normal', height: 'auto', padding: '2px 8px', flex: 1 }}>{room.roomTypeName}</Tag>
                      <Text strong style={{ color: '#faad14', flexShrink: 0, marginTop: 2 }}><StarFilled /> {room.rating.toFixed(1)}</Text>
                    </div>
                    <Title level={4} style={{ marginBottom: 4 }}>Phòng {room.roomNumber}</Title>
                    <Text type="secondary" style={{ fontSize: 13, display: 'block', marginBottom: 16 }}>
                      🔥 Đã có {room.bookedCount} lượt đặt tháng này
                    </Text>
                    
                    <div style={{ marginTop: 'auto', paddingTop: 16, borderTop: '1px solid #f0f0f0' }}>
                      <Text type="danger" strong style={{ fontSize: '1.2rem' }}>
                        {room.basePrice.toLocaleString('vi-VN')} đ/đêm
                      </Text>
                      <Button type="primary" block style={{ marginTop: 12, borderRadius: 6 }} onClick={() => navigate('/rooms')}>
                        Đặt Ngay
                      </Button>
                    </div>
                  </Card>
                </Badge.Ribbon>
              </Col>
            ))}
          </Row>
        )}
      </div>

      {/* ── BEST COMBOS SECTION ───────────────────────────────────────────── */}
      <div style={{ marginBottom: '60px' }}>
        <Title level={2} style={{ marginBottom: 24 }}>
          <GiftOutlined style={{ color: '#1890ff' }} /> Các Combo Tốt Nhất Hôm Nay
        </Title>
        <Row gutter={[24, 24]}>
          {BEST_COMBOS.map(combo => (
            <Col xs={24} md={8} key={combo.id}>
              <Card
                hoverable
                cover={<img alt={combo.title} src={combo.img} onError={(e) => { e.target.src = 'https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=600'; }} style={{ height: 220, objectFit: 'cover' }} />}
                style={{ borderRadius: '12px', overflow: 'hidden', height: '100%' }}
                bodyStyle={{ padding: 24 }}
              >
                <Tag color="volcano" style={{ position: 'absolute', top: 16, right: 16, fontSize: 14, padding: '4px 8px', fontWeight: 'bold' }}>
                  {combo.badge}
                </Tag>
                <Title level={4}>{combo.title}</Title>
                <Paragraph type="secondary" style={{ minHeight: 66 }}>{combo.desc}</Paragraph>
                <div style={{ display: 'flex', alignItems: 'flex-end', gap: 12, marginBottom: 16 }}>
                  <Title level={3} style={{ color: '#f5222d', margin: 0 }}>{combo.price}</Title>
                  <Text delete type="secondary">{combo.originalPrice}</Text>
                </div>
                <Button type="primary" block size="large" style={{ borderRadius: 8 }}>
                  Nhận Ưu Đãi Này
                </Button>
              </Card>
            </Col>
          ))}
        </Row>
      </div>

      {/* ── VOUCHERS SECTION ──────────────────────────────────────────────── */}
      <div>
        <Title level={2} style={{ marginBottom: 24 }}>
          <TagOutlined style={{ color: '#52c41a' }} /> Voucher Dành Riêng Cho Từng Hạng Phòng
        </Title>
        <Row gutter={[16, 16]}>
          {VOUCHERS.map(voucher => (
            <Col xs={24} sm={12} md={6} key={voucher.code}>
              <Card 
                style={{ 
                  borderRadius: '12px', 
                  borderLeft: `6px solid ${voucher.color}`,
                  background: '#fafafa',
                  height: '100%'
                }}
              >
                <Title level={5} style={{ margin: 0 }}>{voucher.title}</Title>
                <div style={{ margin: '12px 0' }}>
                  <Text strong style={{ fontSize: '1.5rem', color: voucher.color }}>{voucher.discount}</Text>
                </div>
                <Paragraph type="secondary" style={{ fontSize: 13 }}>
                  {voucher.desc}
                </Paragraph>
                <Divider style={{ margin: '12px 0' }} />
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Text strong>Mã: <Tag color={voucher.color} style={{ fontSize: 14, padding: '2px 8px' }}>{voucher.code}</Tag></Text>
                  <Button type="text" onClick={() => handleCopyCode(voucher.code)}
                    style={{ color: copiedCode === voucher.code ? '#52c41a' : '#1890ff', padding: 0, fontWeight: 600 }}
                  >{copiedCode === voucher.code ? 'Đã Copy!' : 'Copy'}</Button>
                </div>
              </Card>
            </Col>
          ))}
        </Row>
      </div>

    </div>
  );
};

export default CustomerOffersPage;
