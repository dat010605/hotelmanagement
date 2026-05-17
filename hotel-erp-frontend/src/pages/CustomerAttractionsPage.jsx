import React, { useState, useEffect } from 'react';
import { Typography, Row, Col, Card, Tag, Button, Rate, Modal, Input, Divider, Popover, Spin, message } from 'antd';
import {
  EnvironmentOutlined, ArrowRightOutlined, SearchOutlined,
  ClockCircleOutlined, CarOutlined, StarFilled,
  CompassOutlined, CameraOutlined
} from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import FreeMap from '../components/FreeMap';
import { useAttractionsStore } from '../store/useAttractionsStore';

const { Title, Paragraph, Text } = Typography;

const FALLBACK_IMG = 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=600';

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
  const { attractions: storeAttractions } = useAttractionsStore();
  const [detailModal, setDetailModal] = useState(null);
  const [activeCategoryKey, setActiveCategoryKey] = useState("Tất cả");
  const [search, setSearch] = useState("");
  const [searchOpen, setSearchOpen] = useState(false);
  const [locating, setLocating] = useState(false);
  const [locationFilter, setLocationFilter] = useState("");
  const [userLocation, setUserLocation] = useState(null);

  const allAttractions = storeAttractions.map(a => ({
    ...a,
    category: a.category || 'Điểm tham quan',
    distance: a.distance || '',
    duration: a.duration || '',
    rating: a.rating || 4.5,
    tags: a.tags || [],
    location: a.location || '',
  }));

  const filtered = allAttractions.filter(item => {
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
    <div style={{ width: 300, padding: 16 }}>
      <div 
        style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 16px", background: "#f5f5f5", borderRadius: 8, cursor: "pointer" }}
        onClick={handleNearMeClick}
      >
        <div style={{ background: "#e6f7ff", padding: 8, borderRadius: "50%", color: "#1890ff" }}>
          {locating ? <Spin size="small" /> : <CompassOutlined style={{ fontSize: 20 }} />}
        </div>
        <Text strong style={{ fontSize: 16 }}>Gần tôi</Text>
      </div>
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
