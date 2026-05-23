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

// ── Data tĩnh (title/desc/tag dùng key i18n khi có, còn lại là tiếng Việt không dịch) ──
const LOCAL_GUIDES_DATA = [
  { id: 'g1', titleKey: 'attractionsPage.hoian_title', categoryKey: 'explore.catHeritage', descKey: 'attractionsPage.hoian_desc', fullContentKey: 'attractionsPage.hoian_full', img: 'https://images.unsplash.com/photo-1679033932050-831ace7a226f?w=800&q=80', distance: '5 km', durationKey: 'attractionsPage.hoian_duration', rating: 4.9, tagsKey: 'attractionsPage.hoian_tags', mapUrl: '', location: 'Đà Nẵng', lat: 15.8801, lng: 108.3380 },
  { id: 'g2', titleKey: 'attractionsPage.bana_title', categoryKey: 'explore.catEntertainment', descKey: 'attractionsPage.bana_desc', fullContentKey: 'attractionsPage.bana_full', img: 'https://images.unsplash.com/photo-1663684591502-93887202a863?w=800&q=80', distance: '25 km', durationKey: 'attractionsPage.bana_duration', rating: 4.8, tagsKey: 'attractionsPage.bana_tags', mapUrl: '', location: 'Đà Nẵng', lat: 15.9961, lng: 107.9880 },
  { id: 'g3', titleKey: 'attractionsPage.mykhe_title', categoryKey: 'explore.catNature', descKey: 'attractionsPage.mykhe_desc', fullContentKey: 'attractionsPage.mykhe_full', img: 'https://images.unsplash.com/photo-1723142282970-1fd415eec1ad?w=800&q=80', distance: '1 km', durationKey: 'attractionsPage.mykhe_duration', rating: 4.7, tagsKey: 'attractionsPage.mykhe_tags', mapUrl: '', location: 'Đà Nẵng', lat: 16.0610, lng: 108.2483 },
  { id: 'g4', titleKey: 'attractionsPage.marble_title', categoryKey: 'explore.catSpiritual', descKey: 'attractionsPage.marble_desc', fullContentKey: 'attractionsPage.marble_full', img: 'https://images.unsplash.com/photo-1699195139838-1cc3516aece2?w=800&q=80', distance: '8 km', durationKey: 'attractionsPage.marble_duration', rating: 4.6, tagsKey: 'attractionsPage.marble_tags', mapUrl: '', location: 'Đà Nẵng', lat: 16.0028, lng: 108.2618 },
  { id: 'g_vt1', titleKey: null, title_vi: 'Công viên Tropicana', title_en: 'Tropicana Park', categoryKey: 'explore.catAttraction', descKey: null, desc_vi: 'Công viên giải trí nước kết hợp các trò chơi cảm giác mạnh mang phong cách nhiệt đới tại Hồ Tràm, Vũng Tàu.', desc_en: 'A tropical water park with thrilling rides at Ho Tram, Vung Tau.', img: 'https://images.unsplash.com/photo-1773226315041-f49c8e90c9d3?w=600&q=80', distance: 'Gần Vũng Tàu', duration_vi: '1 ngày', duration_en: '1 day', rating: 4.8, tags_vi: ['Giải trí', 'Công viên nước'], tags_en: ['Entertainment', 'Water Park'], mapUrl: '', location: 'Vũng Tàu', lat: 10.4682, lng: 107.4526 },
  { id: 'g_vt2', titleKey: null, title_vi: 'Bảo tàng Vũ khí cổ Robert Taylor', title_en: 'Robert Taylor Arms Museum', categoryKey: 'explore.catAttraction', descKey: null, desc_vi: 'Bộ sưu tập vũ khí cổ khổng lồ từ khắp nơi trên thế giới được trưng bày trong không gian cổ kính.', desc_en: 'A massive ancient weapons collection from around the world in a historic setting.', img: 'https://images.unsplash.com/photo-1568754690049-5a2c02df0efa?w=600&q=80', distance: 'Trung tâm Vũng Tàu', duration_vi: '2 giờ', duration_en: '2 hours', rating: 4.7, tags_vi: ['Bảo tàng', 'Lịch sử'], tags_en: ['Museum', 'History'], mapUrl: '', location: 'Vũng Tàu', lat: 10.3458, lng: 107.0765 },
  { id: 'g_vt3', titleKey: null, title_vi: 'Tượng Chúa Giêsu Kytô Vua', title_en: 'Christ the King Statue', categoryKey: 'explore.catSpiritual', descKey: null, desc_vi: 'Tượng Chúa dang tay ngoạn mục nằm trên đỉnh Núi Nhỏ của thành phố biển Vũng Tàu.', desc_en: 'A spectacular statue of Christ with outstretched arms atop Nui Nho in Vung Tau.', img: 'https://images.unsplash.com/photo-1713845693881-b120cf5aacc8?w=800&q=80', distance: 'Núi Nhỏ', duration_vi: 'Nửa ngày', duration_en: 'Half day', rating: 4.9, tags_vi: ['Biểu tượng', 'Kiến trúc', 'Ngắm cảnh'], tags_en: ['Landmark', 'Architecture', 'Scenic'], mapUrl: '', location: 'Vũng Tàu', lat: 10.3275, lng: 107.0850 },
  { id: 'g_hn1', titleKey: null, title_vi: 'Hồ Hoàn Kiếm', title_en: 'Hoan Kiem Lake', categoryKey: 'explore.catHeritage', descKey: null, desc_vi: 'Biểu tượng lịch sử thiêng liêng giữa lòng thủ đô Hà Nội ngàn năm văn hiến.', desc_en: 'A sacred historical landmark in the heart of Hanoi\'s ancient capital.', img: 'https://images.unsplash.com/photo-1581551457835-3e4604d7f05c?w=800&q=80', distance: 'Trung tâm Hà Nội', duration_vi: 'Nửa ngày', duration_en: 'Half day', rating: 4.9, tags_vi: ['Biểu tượng', 'Lịch sử', 'Đi dạo'], tags_en: ['Landmark', 'History', 'Walking'], mapUrl: '', location: 'Hà Nội', lat: 21.0285, lng: 105.8523 },
  { id: 'g_hcm1', titleKey: null, title_vi: 'Chợ Bến Thành', title_en: 'Ben Thanh Market', categoryKey: 'explore.catHeritage', descKey: null, desc_vi: 'Biểu tượng lịch sử lâu đời, nơi hội tụ tinh hoa ẩm thực Sài Gòn và là điểm mua sắm sầm uất.', desc_en: 'A historical icon and bustling market, hub of Saigon street food and shopping.', img: 'https://images.unsplash.com/photo-1680783307371-749c26e0f5c3?w=800&q=80', distance: 'Quận 1', duration_vi: 'Vài giờ', duration_en: 'A few hours', rating: 4.6, tags_vi: ['Mua sắm', 'Ẩm thực', 'Lịch sử'], tags_en: ['Shopping', 'Cuisine', 'History'], mapUrl: '', location: 'Hồ Chí Minh', lat: 10.7725, lng: 106.6980 }
];

// ── Categories dùng key i18n ──────────────────────────────────────────────────
const CATEGORY_TRANS_KEYS = [
  { key: 'explore.catAll',         filterVal: 'all'        },
  { key: 'explore.catHeritage',    filterVal: 'explore.catHeritage'    },
  { key: 'explore.catNature',      filterVal: 'explore.catNature'      },
  { key: 'explore.catEntertainment', filterVal: 'explore.catEntertainment' },
  { key: 'explore.catSpiritual',   filterVal: 'explore.catSpiritual'   },
  { key: 'explore.catAttraction',  filterVal: 'explore.catAttraction'  },
];

const calculateDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a =
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
};

// ── AttractionCard — nhận props đã được resolve bằng t() từ parent ───────────
const AttractionCard = ({ item, onDetail, resolvedTitle, resolvedDesc, resolvedCategory, resolvedTags, resolvedDuration, t }) => {
  const [hovered, setHovered] = useState(false);

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
            alt={resolvedTitle}
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
              <CompassOutlined /> {resolvedCategory}
            </Tag>
          </div>
        </div>
      }
      bodyStyle={{ padding: 20, display: "flex", flexDirection: "column", flex: 1 }}
    >
      <Title level={4} style={{ marginBottom: 8 }}>
        <EnvironmentOutlined style={{ color: "#c9a961", marginRight: 8 }} />
        {resolvedTitle}
      </Title>

      <div style={{ display: "flex", gap: 16, marginBottom: 12, color: "#8c8c8c", fontSize: 13 }}>
        <span><CarOutlined /> {item.distance}</span>
        <span><ClockCircleOutlined /> {resolvedDuration}</span>
      </div>

      <Paragraph style={{ color: "#595959", flex: 1, fontSize: "0.9rem", lineHeight: 1.7 }}>
        {resolvedDesc}
      </Paragraph>

      <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 16 }}>
        {resolvedTags?.map(tag => (
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
            {t('attractionsPage.map')}
          </Button>
        )}
      </div>
    </Card>
  );
};

// ── Main Page ─────────────────────────────────────────────────────────────────
const CustomerAttractionsPage = () => {
  const { t, i18n } = useTranslation();
  const lang = i18n.language?.startsWith('vi') ? 'vi' : 'en';

  const [detailModal, setDetailModal] = useState(null);
  const [activeCategoryKey, setActiveCategoryKey] = useState('explore.catAll');
  const [search, setSearch] = useState('');
  const [searchOpen, setSearchOpen] = useState(false);
  const [locating, setLocating] = useState(false);
  const [locationFilter, setLocationFilter] = useState('');
  const [userLocation, setUserLocation] = useState(null);

  // ── Resolve item text theo ngôn ngữ hiện tại ────────────────────────────────
  const resolveItem = (item) => {
    const title   = item.titleKey   ? t(item.titleKey)   : (lang === 'vi' ? item.title_vi   : item.title_en)   || item.title_vi;
    const desc    = item.descKey    ? t(item.descKey)    : (lang === 'vi' ? item.desc_vi    : item.desc_en)    || item.desc_vi;
    const category = item.categoryKey ? t(item.categoryKey) : (lang === 'vi' ? item.category : item.category);
    const tags    = item.tagsKey    ? t(item.tagsKey, { returnObjects: true }) : (lang === 'vi' ? item.tags_vi : item.tags_en) || item.tags_vi || [];
    const duration = item.durationKey ? t(item.durationKey) : (lang === 'vi' ? item.duration_vi : item.duration_en) || item.duration_vi;
    const fullContent = item.fullContentKey ? t(item.fullContentKey) : (lang === 'vi' ? item.desc_vi : item.desc_en) || '';
    return { ...item, resolvedTitle: title, resolvedDesc: desc, resolvedCategory: category, resolvedTags: Array.isArray(tags) ? tags : [], resolvedDuration: duration, resolvedFullContent: fullContent };
  };

  const resolvedData = LOCAL_GUIDES_DATA.map(resolveItem);

  // ── Filter ─────────────────────────────────────────────────────────────────
  const filtered = resolvedData.filter(item => {
    const matchCategory = activeCategoryKey === 'explore.catAll' || item.categoryKey === activeCategoryKey;
    const matchSearch   = !search || item.resolvedTitle.toLowerCase().includes(search.toLowerCase());

    let matchLocation = true;
    if (userLocation) {
      if (item.lat && item.lng) {
        const dist = calculateDistance(userLocation.lat, userLocation.lng, item.lat, item.lng);
        matchLocation = dist <= 100;
      } else { matchLocation = false; }
    } else if (locationFilter) {
      matchLocation = item.location === locationFilter;
    }
    return matchCategory && matchSearch && matchLocation;
  });

  // ── Geolocation ─────────────────────────────────────────────────────────────
  const handleNearMeClick = () => {
    setLocating(true);
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const lat = position.coords.latitude;
          const lng = position.coords.longitude;
          try {
            const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`);
            const data = await response.json();
            const cityName = data.address.city || data.address.state || data.address.county || t('explore.area');
            setUserLocation({ lat, lng });
            setLocationFilter(t('explore.nearPrefix', { city: cityName }));
            message.success(t('explore.locationSuccess', { city: cityName }));
          } catch {
            setUserLocation({ lat, lng });
            setLocationFilter(t('explore.nearRadius'));
            message.success(t('explore.locationCoords'));
          } finally {
            setLocating(false);
            setSearchOpen(false);
          }
        },
        () => {
          setLocating(false);
          message.error(t('explore.locationError'));
        }
      );
    } else {
      setLocating(false);
      message.error(t('explore.geolocationUnsupported'));
    }
  };

  const selectSuggestion = (locationStr) => {
    setUserLocation(null);
    setLocationFilter(locationStr);
    setSearch('');
    setSearchOpen(false);
  };

  // ── Search suggestions (tiêu đề địa điểm không dịch vì là tên riêng) ───────
  const SEARCH_SUGGESTIONS = {
    activities: [
      { title: lang === 'vi' ? 'Vé vào cổng Công viên Tropicana' : 'Tropicana Park Ticket', subtitle: lang === 'vi' ? 'Điểm tham quan • Vũng Tàu' : 'Attraction • Vung Tau', id: 'g_vt1', icon: <CameraOutlined /> },
      { title: lang === 'vi' ? 'Vé vào cửa Bảo tàng Vũ khí cổ Robert Taylor' : 'Robert Taylor Arms Museum Ticket', subtitle: lang === 'vi' ? 'Điểm tham quan • Vũng Tàu' : 'Attraction • Vung Tau', id: 'g_vt2', icon: <CameraOutlined /> },
      { title: lang === 'vi' ? 'Khám phá Tượng Chúa Giêsu Kytô Vua' : 'Visit Christ the King Statue', subtitle: lang === 'vi' ? 'Chuyến tham quan • Vũng Tàu' : 'Tour • Vung Tau', id: 'g_vt3', icon: <CompassOutlined /> },
      { title: lang === 'vi' ? 'Tham quan Phố cổ Hội An' : 'Hoi An Ancient Town Tour', subtitle: lang === 'vi' ? 'Di sản • Đà Nẵng' : 'Heritage • Da Nang', id: 'g1', icon: <EnvironmentOutlined /> },
    ],
    destinations: [
      { title: 'Vũng Tàu',     subtitle: 'Việt Nam', filterVal: 'Vũng Tàu' },
      { title: 'Hồ Chí Minh', subtitle: 'Việt Nam', filterVal: 'Hồ Chí Minh' },
      { title: 'Đà Nẵng',     subtitle: 'Việt Nam', filterVal: 'Đà Nẵng' },
      { title: 'Hà Nội',      subtitle: 'Việt Nam', filterVal: 'Hà Nội' },
    ]
  };

  // ── Popover content ──────────────────────────────────────────────────────────
  const searchPopoverContent = (
    <div style={{ width: "100%", maxWidth: 700, padding: 16 }}>
      <div
        style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 16px", background: "#f5f5f5", borderRadius: 8, cursor: "pointer", marginBottom: 20 }}
        onClick={handleNearMeClick}
      >
        <div style={{ background: "#e6f7ff", padding: 8, borderRadius: "50%", color: "#1890ff" }}>
          {locating ? <Spin size="small" /> : <CompassOutlined style={{ fontSize: 20 }} />}
        </div>
        <Text strong style={{ fontSize: 16 }}>{t('explore.nearMe')}</Text>
      </div>

      <Row gutter={32}>
        <Col span={12}>
          <Text strong style={{ display: "block", marginBottom: 12, color: "#595959" }}>{t('explore.topActivities')}</Text>
          {SEARCH_SUGGESTIONS.activities.map((act, idx) => (
            <div
              key={idx}
              onClick={() => {
                const guide = resolvedData.find(g => g.id === act.id);
                if (guide) { setDetailModal(guide); setSearchOpen(false); }
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
          <Text strong style={{ display: "block", marginBottom: 12, color: "#595959" }}>{t('explore.popularDest')}</Text>
          {SEARCH_SUGGESTIONS.destinations.map((dest, idx) => (
            <div
              key={idx}
              onClick={() => selectSuggestion(dest.filterVal)}
              style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16, cursor: "pointer" }}
            >
              <div style={{ background: "#f0f0f0", padding: 8, borderRadius: 8, color: "#595959" }}><EnvironmentOutlined /></div>
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
      {/* ── Hero Banner ──────────────────────────────────────────────────────── */}
      <div style={{
        position: "relative", height: "450px", borderRadius: 16, marginBottom: 48,
        overflow: "hidden", display: "flex", flexDirection: "column",
        justifyContent: "center", padding: "0 40px",
        backgroundImage: "url(https://images.unsplash.com/photo-1559592413-7cec4d0cae2b?w=1600&q=90)",
        backgroundSize: "cover", backgroundPosition: "center",
      }}>
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to right, rgba(0,0,0,0.8) 0%, rgba(0,0,0,0.3) 100%)" }} />

        <div style={{ position: "relative", zIndex: 1, maxWidth: 800 }}>
          <Title level={1} style={{
            color: "#fff", margin: 0,
            fontSize: "clamp(2rem, 4vw, 3.5rem)", fontWeight: 700, lineHeight: 1.2
          }}>
            {t('explore.heroTitle')}
          </Title>
          <Paragraph style={{
            color: "rgba(255,255,255,0.9)", fontSize: "1.1rem",
            marginTop: 16, letterSpacing: "0.5px",
          }}>
            {t('explore.heroSubtitle')}
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
                placeholder={t('explore.searchPlaceholder')}
                value={locationFilter || search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setLocationFilter('');
                  setUserLocation(null);
                }}
                style={{ width: "100%", maxWidth: 500, borderRadius: 30, height: 50, fontSize: 16, boxShadow: "0 4px 12px rgba(0,0,0,0.1)" }}
              />
            </Popover>
            <Button type="primary" size="large" style={{ borderRadius: 30, height: 50, padding: "0 32px", fontSize: 16, fontWeight: 600 }}>
              {t('explore.searchBtn')}
            </Button>
          </div>
        </div>
      </div>

      {/* ── Active location filter tag ────────────────────────────────────────── */}
      {locationFilter && (
        <div style={{ marginBottom: 24, textAlign: 'center' }}>
          <Tag closable onClose={() => { setLocationFilter(''); setUserLocation(null); }} style={{ padding: "8px 16px", fontSize: 16, borderRadius: 20, background: '#e6f7ff', color: '#1890ff', border: '1px solid #91d5ff' }}>
            <EnvironmentOutlined style={{ marginRight: 6 }} />
            {t('explore.area')}: {locationFilter}
          </Tag>
        </div>
      )}

      {/* ── Category Buttons ─────────────────────────────────────────────────── */}
      <div style={{ display: "flex", flexWrap: "wrap", gap: 12, marginBottom: 32, justifyContent: "center", alignItems: "center" }}>
        {CATEGORY_TRANS_KEYS.map(cat => (
          <Button
            key={cat.key}
            type={activeCategoryKey === cat.filterVal ? "primary" : "default"}
            onClick={() => setActiveCategoryKey(cat.filterVal)}
            style={{
              borderRadius: 20,
              ...(activeCategoryKey === cat.filterVal ? {
                background: "#c9a961", borderColor: "#c9a961",
              } : {
                borderColor: "#d4b87a", color: "#8a7340",
              }),
            }}
          >
            {t(cat.key)}
          </Button>
        ))}
      </div>

      {/* ── Cards Grid ───────────────────────────────────────────────────────── */}
      <Row gutter={[24, 24]}>
        {filtered.map(item => (
          <Col xs={24} sm={12} lg={8} key={item.id}>
            <AttractionCard
              item={item}
              onDetail={setDetailModal}
              resolvedTitle={item.resolvedTitle}
              resolvedDesc={item.resolvedDesc}
              resolvedCategory={item.resolvedCategory}
              resolvedTags={item.resolvedTags}
              resolvedDuration={item.resolvedDuration}
              t={t}
            />
          </Col>
        ))}
      </Row>

      {filtered.length === 0 && (
        <div style={{ textAlign: "center", padding: 60, color: "#8c8c8c" }}>
          <CompassOutlined style={{ fontSize: 48, marginBottom: 16 }} />
          <Title level={4} type="secondary">{t('explore.noResults')}</Title>
        </div>
      )}

      {/* ── Detail Modal ──────────────────────────────────────────────────────── */}
      <Modal
        open={!!detailModal}
        onCancel={() => setDetailModal(null)}
        footer={null}
        width={720}
        centered
        destroyOnClose
        bodyStyle={{ padding: 0 }}
      >
        {detailModal && (() => {
          const resolved = resolveItem(detailModal);
          return (
            <div>
              <div style={{ position: "relative", overflow: "hidden" }}>
                <img
                  alt={resolved.resolvedTitle}
                  src={detailModal.img}
                  onError={(e) => { e.target.src = FALLBACK_IMG; }}
                  style={{ width: "100%", height: 300, objectFit: "cover", display: "block" }}
                />
                <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, background: "linear-gradient(transparent, rgba(0,0,0,0.8))", padding: "40px 32px 24px" }}>
                  <Tag style={{ background: "rgba(201,169,97,0.9)", border: "none", color: "#1a1a1a", fontWeight: 600, borderRadius: 12, marginBottom: 8 }}>
                    <CompassOutlined /> {resolved.resolvedCategory}
                  </Tag>
                  <Title level={2} style={{ color: "#fff", margin: 0, fontFamily: "'Playfair Display', serif" }}>
                    {resolved.resolvedTitle}
                  </Title>
                </div>
              </div>
              <div style={{ padding: "24px 32px 32px" }}>
                <div style={{ display: "flex", gap: 24, marginBottom: 20, flexWrap: "wrap" }}>
                  <div><CarOutlined style={{ color: "#c9a961", marginRight: 6 }} /><Text type="secondary">{detailModal.distance}</Text></div>
                  <div><ClockCircleOutlined style={{ color: "#c9a961", marginRight: 6 }} /><Text type="secondary">{resolved.resolvedDuration}</Text></div>
                  <div><StarFilled style={{ color: "#c9a961", marginRight: 6 }} /><Rate disabled defaultValue={detailModal.rating} allowHalf style={{ fontSize: 14 }} /></div>
                </div>

                <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 20 }}>
                  {resolved.resolvedTags?.map(tag => (
                    <Tag key={tag} style={{ borderRadius: 12, border: "1px solid #d4b87a", color: "#8a7340", background: "#fdf8ed" }}>{tag}</Tag>
                  ))}
                </div>

                <Divider />

                <Paragraph style={{ fontSize: "0.95rem", lineHeight: 2, whiteSpace: "pre-line", color: "#444" }}>
                  {resolved.resolvedFullContent || resolved.resolvedDesc}
                </Paragraph>

                {detailModal.lat && detailModal.lng && (
                  <>
                    <Divider />
                    <Title level={5} style={{ marginBottom: 16 }}>{t('explore.mapLocation')}</Title>
                    <FreeMap lat={detailModal.lat} lng={detailModal.lng} title={resolved.resolvedTitle} />
                  </>
                )}
              </div>
            </div>
          );
        })()}
      </Modal>
    </div>
  );
};

export default CustomerAttractionsPage;
