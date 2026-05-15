import React, { useState, useEffect } from 'react';
import { Typography, Row, Col, Card, Tag, Button, Rate, Modal, Input, Divider, Popover, Spin, message } from 'antd';
import {
  EnvironmentOutlined, ArrowRightOutlined, SearchOutlined,
  ClockCircleOutlined, CarOutlined, StarFilled,
  CompassOutlined, CameraOutlined
} from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import FreeMap from '../components/FreeMap';

const { Title, Paragraph, Text } = Typography;

const FALLBACK_IMG = 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=600';

const LOCAL_GUIDES_DATA = [
  { id: 'g1', titleKey: 'attractionsPage.hoian_title', title: 'Phố cổ Hội An', categoryKey: 'attractionsPage.catHeritage', category: 'Di sản', descKey: 'attractionsPage.hoian_desc', desc: 'Khu phố cổ được bảo tồn tuyệt đẹp từ thế kỷ 15 đến 19.', fullContentKey: 'attractionsPage.hoian_full', img: 'https://images.unsplash.com/photo-1679033932050-831ace7a226f?w=800&q=80', distance: '5 km', durationKey: 'attractionsPage.hoian_duration', duration: 'Nửa ngày', rating: 4.9, tagsKey: 'attractionsPage.hoian_tags', tags: ['Lịch sử', 'Kiến trúc', 'Đèn lồng'], mapUrl: '', location: 'Đà Nẵng', lat: 15.8801, lng: 108.3380 },
  { id: 'g2', titleKey: 'attractionsPage.bana_title', title: 'Bà Nà Hills', categoryKey: 'attractionsPage.catEntertainment', category: 'Giải trí', descKey: 'attractionsPage.bana_desc', desc: 'Tổ hợp vui chơi giải trí trên đỉnh núi mờ sương.', fullContentKey: 'attractionsPage.bana_full', img: 'https://images.unsplash.com/photo-1663684591502-93887202a863?w=800&q=80', distance: '25 km', durationKey: 'attractionsPage.bana_duration', duration: '1 ngày', rating: 4.8, tagsKey: 'attractionsPage.bana_tags', tags: ['Cáp treo', 'Cầu Vàng', 'Công viên'], mapUrl: '', location: 'Đà Nẵng', lat: 15.9961, lng: 107.9880 },
  { id: 'g3', titleKey: 'attractionsPage.mykhe_title', title: 'Biển Mỹ Khê', categoryKey: 'attractionsPage.catNature', category: 'Thiên nhiên', descKey: 'attractionsPage.mykhe_desc', desc: 'Một trong những bãi biển quyến rũ nhất hành tinh.', fullContentKey: 'attractionsPage.mykhe_full', img: 'https://images.unsplash.com/photo-1723142282970-1fd415eec1ad?w=800&q=80', distance: '1 km', durationKey: 'attractionsPage.mykhe_duration', duration: 'Vài giờ', rating: 4.7, tagsKey: 'attractionsPage.mykhe_tags', tags: ['Biển xanh', 'Tắm nắng', 'Hải sản'], mapUrl: '', location: 'Đà Nẵng', lat: 16.0610, lng: 108.2483 },
  { id: 'g4', titleKey: 'attractionsPage.marble_title', title: 'Ngũ Hành Sơn', categoryKey: 'attractionsPage.catSpiritual', category: 'Tâm linh', descKey: 'attractionsPage.marble_desc', desc: 'Quần thể 5 ngọn núi đá vôi với hệ thống hang động huyền bí.', fullContentKey: 'attractionsPage.marble_full', img: 'https://images.unsplash.com/photo-1699195139838-1cc3516aece2?w=800&q=80', distance: '8 km', durationKey: 'attractionsPage.marble_duration', duration: 'Nửa ngày', rating: 4.6, tagsKey: 'attractionsPage.marble_tags', tags: ['Hang động', 'Chùa chiền', 'Điêu khắc đá'], mapUrl: '', location: 'Đà Nẵng', lat: 16.0028, lng: 108.2618 },
  { id: 'g_vt1', title: 'Công viên Tropicana', category: 'Điểm tham quan', desc: 'Công viên giải trí nước kết hợp các trò chơi cảm giác mạnh mang phong cách nhiệt đới tại Hồ Tràm, Vũng Tàu.', img: 'https://images.unsplash.com/photo-1773226315041-f49c8e90c9d3?w=600&q=80', distance: 'Gần Vũng Tàu', duration: '1 ngày', rating: 4.8, tags: ['Giải trí', 'Công viên nước'], mapUrl: '', location: 'Vũng Tàu', lat: 10.4682, lng: 107.4526 },
  { id: 'g_vt2', title: 'Bảo tàng Vũ khí cổ Robert Taylor', category: 'Điểm tham quan', desc: 'Bộ sưu tập vũ khí cổ khổng lồ từ khắp nơi trên thế giới được trưng bày trong không gian cổ kính.', img: 'https://images.unsplash.com/photo-1568754690049-5a2c02df0efa?w=600&q=80', distance: 'Trung tâm Vũng Tàu', duration: '2 giờ', rating: 4.7, tags: ['Bảo tàng', 'Lịch sử'], mapUrl: '', location: 'Vũng Tàu', lat: 10.3458, lng: 107.0765 },
  { id: 'g_vt3', title: 'Tượng Chúa Giêsu Kytô Vua', category: 'Điểm tham quan', desc: 'Tượng Chúa dang tay ngoạn mục nằm trên đỉnh Núi Nhỏ của thành phố biển Vũng Tàu.', img: 'https://images.unsplash.com/photo-1713845693881-b120cf5aacc8?w=800&q=80', distance: 'Núi Nhỏ', duration: 'Nửa ngày', rating: 4.9, tags: ['Biểu tượng', 'Kiến trúc', 'Ngắm cảnh'], mapUrl: '', location: 'Vũng Tàu', lat: 10.3275, lng: 107.0850 },
  { id: 'g_hn1', title: 'Hồ Hoàn Kiếm', category: 'Di sản', desc: 'Biểu tượng lịch sử thiêng liêng giữa lòng thủ đô Hà Nội ngàn năm văn hiến.', img: 'https://images.unsplash.com/photo-1581551457835-3e4604d7f05c?w=800&q=80', distance: 'Trung tâm Hà Nội', duration: 'Nửa ngày', rating: 4.9, tags: ['Biểu tượng', 'Lịch sử', 'Đi dạo'], mapUrl: '', location: 'Hà Nội', lat: 21.0285, lng: 105.8523 },
  { id: 'g_hcm1', title: 'Chợ Bến Thành', category: 'Di sản', desc: 'Biểu tượng lịch sử lâu đời, nơi hội tụ tinh hoa ẩm thực Sài Gòn và là điểm mua sắm sầm uất.', img: 'https://images.unsplash.com/photo-1680783307371-749c26e0f5c3?w=800&q=80', distance: 'Quận 1', duration: 'Vài giờ', rating: 4.6, tags: ['Mua sắm', 'Ẩm thực', 'Lịch sử'], mapUrl: '', location: 'Hồ Chí Minh', lat: 10.7725, lng: 106.6980 }
];

const SEARCH_SUGGESTIONS = {
  activities: [
    { title: 'Vé vào cổng Công viên Tropicana', subtitle: 'Điểm tham quan • Vũng Tàu', id: 'g_vt1', icon: <CameraOutlined /> },
    { title: 'Vé vào cửa Bảo tàng Vũ khí cổ Robert Taylor', subtitle: 'Điểm tham quan • Vũng Tàu', id: 'g_vt2', icon: <CameraOutlined /> },
    { title: 'Khám phá Tượng Chúa Giêsu Kytô Vua', subtitle: 'Chuyến tham quan • Vũng Tàu', id: 'g_vt3', icon: <CompassOutlined /> },
    { title: 'Tham quan Phố cổ Hội An', subtitle: 'Di sản • Đà Nẵng', id: 'g1', icon: <EnvironmentOutlined /> },
  ],
  destinations: [
    { title: 'Vũng Tàu', subtitle: 'Việt Nam', icon: <EnvironmentOutlined /> },
    { title: 'Hồ Chí Minh', subtitle: 'Việt Nam', icon: <EnvironmentOutlined /> },
    { title: 'Đà Nẵng', subtitle: 'Việt Nam', icon: <EnvironmentOutlined /> },
    { title: 'Hà Nội', subtitle: 'Việt Nam', icon: <EnvironmentOutlined /> }
  ]
};

const CATEGORY_KEYS = [
  'Tất cả',
  'Di sản',
  'Thiên nhiên',
  'Giải trí',
  'Tâm linh',
  'Điểm tham quan'
];

const AttractionCard = ({ item, onDetail }) => {
  const [hovered, setHovered] = useState(false);
  const title = item.title;
  const desc = item.desc;
  const category = item.category;

  return (
    <Card
      hoverable
      onClick={() => onDetail(item)}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        borderRadius: 16, overflow: "hidden", height: "100%",
        boxShadow: hovered ? "0 12px 40px rgba(0,0,0,0.12)" : "0 2px 12px rgba(0,0,0,0.06)",
        transition: "all 0.4s", border: "1px solid #f0f0f0", cursor: "pointer",
      }}
      cover={
        <div style={{ overflow: "hidden", height: 220, position: "relative" }}>
          <img
            alt={title}
            src={item.img}
            onError={(e) => { e.target.src = FALLBACK_IMG; }}
            style={{
              width: "100%", height: "100%", objectFit: "cover",
              transition: "transform 0.6s", transform: hovered ? "scale(1.08)" : "scale(1)",
            }}
          />
          <div style={{
            position: "absolute", bottom: 0, left: 0, right: 0,
            background: "linear-gradient(transparent, rgba(0,0,0,0.6))",
            padding: "20px 16px 12px",
          }}>
            <Tag style={{
              background: "rgba(201,169,97,0.9)", border: "none",
              color: "#1a1a1a", fontWeight: 600, borderRadius: 12,
            }}>
              <CompassOutlined /> {category}
            </Tag>
          </div>
        </div>
      }
      bodyStyle={{ padding: 20, display: "flex", flexDirection: "column", flex: 1 }}
    >
      <Title level={4} style={{ marginBottom: 8 }}>
        <EnvironmentOutlined style={{ color: "#c9a961", marginRight: 8 }} />
        {title}
      </Title>

      <div style={{ display: "flex", gap: 16, marginBottom: 12, color: "#8c8c8c", fontSize: 13 }}>
        <span><CarOutlined /> {item.distance}</span>
        <span><ClockCircleOutlined /> {item.duration}</span>
      </div>

      <Paragraph style={{ color: "#595959", flex: 1, fontSize: "0.9rem", lineHeight: 1.7 }}>
        {desc}
      </Paragraph>

      <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 16 }}>
        {item.tags?.map(tag => (
          <Tag key={tag} style={{ borderRadius: 12, border: "1px solid #d4b87a", color: "#8a7340", background: "#fdf8ed" }}>
            {tag}
          </Tag>
        ))}
      </div>

      <Divider style={{ margin: "0 0 12px" }} />

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <Rate disabled defaultValue={item.rating} allowHalf style={{ fontSize: 14 }} />
          <Text type="secondary" style={{ marginLeft: 8 }}>{item.rating}</Text>
        </div>
        {item.lat && item.lng && (
          <Button
            type="text"
            onClick={(e) => { e.stopPropagation(); onDetail({ ...item, showMapOnly: true }); }}
            icon={<EnvironmentOutlined />}
            style={{ color: '#c9a961', fontWeight: 600 }}
          >
            Bản đồ
          </Button>
        )}
      </div>
    </Card>
  );
};

const calculateDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371; // Bán kính trái đất (km)
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
  return R * c; 
};

const CustomerAttractionsPage = () => {
  const { t } = useTranslation();
  const [detailModal, setDetailModal] = useState(null);
  const [activeCategoryKey, setActiveCategoryKey] = useState("Tất cả");
  const [search, setSearch] = useState("");
  const [searchOpen, setSearchOpen] = useState(false);
  const [locating, setLocating] = useState(false);
  const [locationFilter, setLocationFilter] = useState("");
  const [userLocation, setUserLocation] = useState(null);

  const filtered = LOCAL_GUIDES_DATA.filter(item => {
    const matchCategory = activeCategoryKey === "Tất cả" || item.category === activeCategoryKey;
    const matchSearch = !search || item.title.toLowerCase().includes(search.toLowerCase());
    
    let matchLocation = true;
    if (userLocation) {
      // Chế độ "Gần tôi" - bán kính 100km
      if (item.lat && item.lng) {
        const dist = calculateDistance(userLocation.lat, userLocation.lng, item.lat, item.lng);
        matchLocation = dist <= 100;
      } else {
        matchLocation = false;
      }
    } else if (locationFilter) {
      matchLocation = item.location === locationFilter;
    }
    
    return matchCategory && matchSearch && matchLocation;
  });

  const handleNearMeClick = () => {
    setLocating(true);
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const lat = position.coords.latitude;
          const lng = position.coords.longitude;
          
          try {
            // Lấy tên địa chỉ thực tế từ OpenStreetMap Nominatim (miễn phí)
            const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`);
            const data = await response.json();
            
            const cityName = data.address.city || data.address.state || data.address.county || 'Khu vực của bạn';
            
            setUserLocation({ lat, lng });
            setLocationFilter(`Gần ${cityName}`);
            message.success(`Đã xác định vị trí: ${cityName}`);
          } catch (error) {
            // Nếu lỗi mạng, vẫn lấy được tọa độ nhưng không có tên thành phố
            setUserLocation({ lat, lng });
            setLocationFilter('Gần bạn (<100km)');
            message.success('Đã xác định tọa độ của bạn!');
          } finally {
            setLocating(false);
            setSearchOpen(false);
          }
        },
        (error) => {
          setLocating(false);
          message.error("Không thể truy cập vị trí. Hãy kiểm tra quyền Location trên trình duyệt.");
        }
      );
    } else {
      setLocating(false);
      message.error("Trình duyệt không hỗ trợ Geolocation.");
    }
  };

  const selectSuggestion = (locationStr) => {
    setUserLocation(null);
    setLocationFilter(locationStr);
    setSearch("");
    setSearchOpen(false);
  };

  const searchPopoverContent = (
    <div style={{ width: "100%", maxWidth: 700, padding: 16 }}>
      <div 
        style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 16px", background: "#f5f5f5", borderRadius: 8, cursor: "pointer", marginBottom: 20 }}
        onClick={handleNearMeClick}
      >
        <div style={{ background: "#e6f7ff", padding: 8, borderRadius: "50%", color: "#1890ff" }}>
          {locating ? <Spin size="small" /> : <CompassOutlined style={{ fontSize: 20 }} />}
        </div>
        <Text strong style={{ fontSize: 16 }}>Gần tôi</Text>
      </div>

      <Row gutter={32}>
        <Col span={12}>
          <Text strong style={{ display: "block", marginBottom: 12, color: "#595959" }}>Hoạt động hàng đầu</Text>
          {SEARCH_SUGGESTIONS.activities.map((act, idx) => (
            <div 
              key={idx} 
              onClick={() => {
                const guide = LOCAL_GUIDES_DATA.find(g => g.id === act.id);
                if (guide) {
                  setDetailModal(guide);
                  setSearchOpen(false);
                }
              }}
              style={{ display: "flex", alignItems: "flex-start", gap: 12, marginBottom: 16, cursor: "pointer" }}
            >
              <div style={{ background: "#f0f0f0", padding: 8, borderRadius: 8, color: "#595959" }}>{act.icon}</div>
              <div>
                <Text strong style={{ display: "block", fontSize: 14 }}>{act.title}</Text>
                <Text type="secondary" style={{ fontSize: 12 }}>{act.subtitle}</Text>
              </div>
            </div>
          ))}
        </Col>
        <Col span={12}>
          <Text strong style={{ display: "block", marginBottom: 12, color: "#595959" }}>Điểm đến nổi tiếng</Text>
          {SEARCH_SUGGESTIONS.destinations.map((dest, idx) => (
            <div 
              key={idx} 
              onClick={() => selectSuggestion(dest.title)}
              style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16, cursor: "pointer" }}
            >
              <div style={{ background: "#f0f0f0", padding: 8, borderRadius: 8, color: "#595959" }}>{dest.icon}</div>
              <div>
                <Text strong style={{ display: "block", fontSize: 14 }}>{dest.title}</Text>
                <Text type="secondary" style={{ fontSize: 12 }}>{dest.subtitle}</Text>
              </div>
            </div>
          ))}
        </Col>
      </Row>
    </div>
  );

  return (
    <div style={{ paddingBottom: 60 }}>
      <div style={{
        position: "relative",
        height: "450px",
        borderRadius: 16,
        marginBottom: 48,
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        padding: "0 40px",
        backgroundImage: "url(https://images.unsplash.com/photo-1559592413-7cec4d0cae2b?w=1600&q=90)",
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}>
        <div style={{
          position: "absolute", inset: 0,
          background: "linear-gradient(to right, rgba(0,0,0,0.8) 0%, rgba(0,0,0,0.3) 100%)",
        }} />
        
        <div style={{ position: "relative", zIndex: 1, maxWidth: 800 }}>
          <Title level={1} style={{
            color: "#fff", margin: 0,
            fontSize: "clamp(2rem, 4vw, 3.5rem)", fontWeight: 700,
            lineHeight: 1.2
          }}>
            Khám phá các cuộc phiêu lưu đang chờ quý khách
          </Title>
          <Paragraph style={{
            color: "rgba(255,255,255,0.9)", fontSize: "1.1rem",
            marginTop: 16, letterSpacing: "0.5px",
          }}>
            Mang đến cho quý khách những trải nghiệm thú vị nhất từ khắp nơi trên thế giới
          </Paragraph>

          <div style={{ marginTop: 32, display: "flex", gap: 12 }}>
            <Popover 
              content={searchPopoverContent} 
              trigger="click" 
              placement="bottomLeft"
              open={searchOpen}
              onOpenChange={setSearchOpen}
              overlayInnerStyle={{ borderRadius: 16, padding: 0 }}
            >
              <Input
                size="large"
                prefix={<SearchOutlined style={{ color: "#8c8c8c", fontSize: 20 }} />}
                placeholder="Tìm kiếm địa điểm..."
                value={locationFilter || search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setLocationFilter("");
                  setUserLocation(null);
                }}
                style={{ 
                  width: "100%", maxWidth: 500, borderRadius: 30, height: 50, fontSize: 16,
                  boxShadow: "0 4px 12px rgba(0,0,0,0.1)"
                }}
              />
            </Popover>
            <Button type="primary" size="large" style={{ borderRadius: 30, height: 50, padding: "0 32px", fontSize: 16, fontWeight: 600 }}>
              Tìm kiếm
            </Button>
          </div>
        </div>
      </div>

      {locationFilter && (
        <div style={{ marginBottom: 24, textAlign: 'center' }}>
          <Tag closable onClose={() => { setLocationFilter(""); setUserLocation(null); }} style={{ padding: "8px 16px", fontSize: 16, borderRadius: 20, background: '#e6f7ff', color: '#1890ff', border: '1px solid #91d5ff' }}>
            <EnvironmentOutlined style={{ marginRight: 6 }} />
            Khu vực: {locationFilter}
          </Tag>
        </div>
      )}

      <div style={{
        display: "flex", flexWrap: "wrap", gap: 12, marginBottom: 32,
        justifyContent: "center", alignItems: "center",
      }}>
        {CATEGORY_KEYS.map(catKey => (
          <Button
            key={catKey}
            type={activeCategoryKey === catKey ? "primary" : "default"}
            onClick={() => setActiveCategoryKey(catKey)}
            style={{
              borderRadius: 20,
              ...(activeCategoryKey === catKey ? {
                background: "#c9a961", borderColor: "#c9a961",
              } : {
                borderColor: "#d4b87a", color: "#8a7340",
              }),
            }}
          >
            {catKey}
          </Button>
        ))}
      </div>

      <Row gutter={[24, 24]}>
        {filtered.map(item => (
          <Col xs={24} sm={12} lg={8} key={item.id}>
            <AttractionCard item={item} onDetail={setDetailModal} />
          </Col>
        ))}
      </Row>

      {filtered.length === 0 && (
        <div style={{ textAlign: "center", padding: 60, color: "#8c8c8c" }}>
          <CompassOutlined style={{ fontSize: 48, marginBottom: 16 }} />
          <Title level={4} type="secondary">{t("attractionsPage.noResults")}</Title>
        </div>
      )}

      <Modal
        open={!!detailModal}
        onCancel={() => setDetailModal(null)}
        footer={null}
        width={720}
        centered
        destroyOnClose
        bodyStyle={{ padding: 0 }}
      >
        {detailModal && (
          <div>
            <div style={{ position: "relative", overflow: "hidden" }}>
              <img
                alt={detailModal.title}
                src={detailModal.img}
                onError={(e) => { e.target.src = FALLBACK_IMG; }}
                style={{ width: "100%", height: 300, objectFit: "cover", display: "block" }}
              />
              <div style={{
                position: "absolute", bottom: 0, left: 0, right: 0,
                background: "linear-gradient(transparent, rgba(0,0,0,0.8))",
                padding: "40px 32px 24px",
              }}>
                <Tag style={{ background: "rgba(201,169,97,0.9)", border: "none", color: "#1a1a1a", fontWeight: 600, borderRadius: 12, marginBottom: 8 }}>
                  <CompassOutlined /> {detailModal.category}
                </Tag>
                <Title level={2} style={{ color: "#fff", margin: 0, fontFamily: "'Playfair Display', serif" }}>
                  {detailModal.title}
                </Title>
              </div>
            </div>
            <div style={{ padding: "24px 32px 32px" }}>
              <div style={{ display: "flex", gap: 24, marginBottom: 20, flexWrap: "wrap" }}>
                <div><CarOutlined style={{ color: "#c9a961", marginRight: 6 }} /><Text type="secondary">{detailModal.distance}</Text></div>
                <div><ClockCircleOutlined style={{ color: "#c9a961", marginRight: 6 }} /><Text type="secondary">{detailModal.duration}</Text></div>
                <div><StarFilled style={{ color: "#c9a961", marginRight: 6 }} /><Rate disabled defaultValue={detailModal.rating} allowHalf style={{ fontSize: 14 }} /></div>
              </div>

              <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 20 }}>
                {detailModal.tags?.map(tag => (
                  <Tag key={tag} style={{ borderRadius: 12, border: "1px solid #d4b87a", color: "#8a7340", background: "#fdf8ed" }}>{tag}</Tag>
                ))}
              </div>

              <Divider />

              <Paragraph style={{ fontSize: "0.95rem", lineHeight: 2, whiteSpace: "pre-line", color: "#444" }}>
                {detailModal.desc}
              </Paragraph>

              {detailModal.lat && detailModal.lng && (
                <>
                  <Divider />
                  <Title level={5} style={{ marginBottom: 16 }}>📍 Bản đồ địa điểm</Title>
                  <FreeMap lat={detailModal.lat} lng={detailModal.lng} title={detailModal.title} />
                </>
              )}
            </div>
          </div>
        )}
      </Modal>

    </div>
  );
};

export default CustomerAttractionsPage;
