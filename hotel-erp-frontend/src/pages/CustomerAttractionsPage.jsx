import React, { useState } from 'react';
import { Typography, Row, Col, Card, Tag, Button, Rate, Modal, Input, Divider } from 'antd';
import {
  EnvironmentOutlined, ArrowRightOutlined, SearchOutlined,
  ClockCircleOutlined, CarOutlined, StarFilled,
  CompassOutlined, CameraOutlined
} from '@ant-design/icons';
import { useAttractionsStore } from '../store/useAttractionsStore';

const { Title, Paragraph, Text } = Typography;

const FALLBACK_IMG = 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=600';

// ── Dữ liệu mẫu bổ sung ──────────────────────────────────────────────────
const LOCAL_GUIDES = [
  {
    id: 'g1',
    title: 'Phố Cổ Hội An',
    category: 'Di sản văn hóa',
    desc: 'Khám phá phố cổ UNESCO với hàng trăm ngôi nhà cổ, chùa Cầu lịch sử và đèn lồng lung linh về đêm. Nơi giao thoa văn hóa Việt – Hoa – Nhật.',
    fullContent: `Phố Cổ Hội An – Di sản Văn hóa Thế giới được UNESCO công nhận, là một trong những điểm đến hấp dẫn nhất Đông Nam Á.

🏛️ ĐIỂM THAM QUAN NỔI BẬT:
• Chùa Cầu (Cầu Nhật Bản) – Biểu tượng lịch sử hơn 400 năm tuổi
• Hội quán Phúc Kiến – Kiến trúc Trung Hoa lộng lẫy với sân vườn tĩnh lặng
• Phố đèn lồng – Lung linh sắc màu mỗi đêm rằm hàng tháng
• Làng rau Trà Quế – Trải nghiệm nông nghiệp xanh và nấu ăn truyền thống

🍜 ẨM THỰC ĐẶC SẢN:
• Cao lầu – Mì đặc trưng chỉ có ở Hội An
• Mì Quảng – Hương vị miền Trung đậm đà
• Bánh mì Phượng – Nổi tiếng thế giới, xếp hàng mỗi ngày
• Cơm gà Hội An – Thơm ngon, bình dị

💡 TIPS: Nên đến vào buổi chiều tối để tận hưởng không gian đèn lồng. Mua vé tham quan tại Trung tâm Văn hóa.`,
    img: 'https://images.unsplash.com/photo-1559592413-7cec4d0cae2b?w=600',
    distance: '5 km',
    duration: '15 phút lái xe',
    rating: 4.9,
    tags: ['UNESCO', 'Lịch sử', 'Ẩm thực'],
    mapUrl: 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d15348.88!2d108.327!3d15.877!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x31420d8e5e3f8b5b%3A0x7d7c3d5f7e7d0b0a!2zSG9pIEFu!5e0!3m2!1svi!2s!4v1',
  },
  {
    id: 'g2',
    title: 'Bà Nà Hills & Cầu Vàng',
    category: 'Giải trí',
    desc: 'Khu du lịch trên đỉnh núi với Cầu Vàng nổi tiếng thế giới, làng Pháp cổ điển, công viên giải trí Fantasy Park và hệ thống cáp treo kỷ lục.',
    fullContent: `Bà Nà Hills – Khu du lịch nghỉ dưỡng trên đỉnh núi Chúa, nổi tiếng với Cầu Vàng (Golden Bridge) biểu tượng.

🌉 ĐIỂM NHẤN:
• Cầu Vàng – Cây cầu được hai bàn tay khổng lồ nâng đỡ, Top 100 địa danh đẹp nhất thế giới
• Làng Pháp – Kiến trúc châu Âu cổ điển, như lạc vào Paris thu nhỏ
• Fantasy Park – Công viên giải trí trong nhà lớn nhất Việt Nam
• Vườn hoa Le Jardin D'Amour – 9 khu vườn tình yêu lãng mạn

🚡 CÁP TREO:
• Hệ thống cáp treo đạt 2 kỷ lục Guinness (dài nhất & chênh lệch độ cao lớn nhất)
• Thời gian di chuyển: ~20 phút một chiều

⏰ GIỜ MỞ CỬA: 07:00 – 22:00
💰 GIÁ VÉ: Từ 900,000₫/người lớn (bao gồm cáp treo + tham quan)`,
    img: 'https://images.unsplash.com/photo-1592898741994-2189e4f5e354?w=600',
    distance: '25 km',
    duration: '40 phút lái xe',
    rating: 4.8,
    tags: ['Cầu Vàng', 'Cáp treo', 'Công viên'],
    mapUrl: '',
  },
  {
    id: 'g3',
    title: 'Bãi biển Mỹ Khê',
    category: 'Thiên nhiên',
    desc: 'Một trong 6 bãi biển quyến rũ nhất hành tinh theo Forbes. Cát trắng mịn, nước biển trong xanh, lý tưởng cho lướt sóng và tắm nắng.',
    fullContent: `Bãi biển Mỹ Khê – Được tạp chí Forbes bình chọn là một trong 6 bãi biển quyến rũ nhất hành tinh.

🏖️ ĐẶC ĐIỂM:
• Bờ biển dài hơn 900m với cát trắng mịn tự nhiên
• Nước biển trong xanh, sóng vừa phải – lý tưởng cho bơi lội và lướt sóng
• Chỉ cách The Royal Citadel 5 phút đi bộ

🏄 HOẠT ĐỘNG:
• Lướt sóng (Surfing) – Mùa sóng tốt nhất: tháng 9-12
• Chèo SUP (Stand Up Paddle)
• Dù lượn (Parasailing)
• Tắm nắng & ngắm hoàng hôn

🌅 THỜI ĐIỂM ĐẸP NHẤT: Bình minh (05:30) và hoàng hôn (17:00-18:00)`,
    img: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=600',
    distance: '1 km',
    duration: '5 phút đi bộ',
    rating: 4.7,
    tags: ['Biển', 'Lướt sóng', 'Hoàng hôn'],
    mapUrl: '',
  },
  {
    id: 'g4',
    title: 'Ngũ Hành Sơn',
    category: 'Tâm linh',
    desc: 'Năm ngọn núi đá vôi linh thiêng với hệ thống hang động, chùa chiền cổ kính và tầm nhìn panorama tuyệt đẹp ra thành phố và biển.',
    fullContent: `Ngũ Hành Sơn (Marble Mountains) – Quần thể 5 ngọn núi đá vôi tượng trưng cho Kim, Mộc, Thủy, Hỏa, Thổ.

⛰️ ĐIỂM THAM QUAN:
• Động Huyền Không – Hang động lớn nhất với ánh sáng tự nhiên tuyệt đẹp
• Chùa Non Nước – Ngôi chùa cổ hàng trăm năm tuổi
• Tháp Xá Lợi – View panorama 360° nhìn ra biển và thành phố
• Làng đá mỹ nghệ Non Nước – Nơi chế tác tượng đá tinh xảo

🎒 LƯU Ý:
• Mang giày thoải mái (nhiều bậc thang)
• Thời gian tham quan: 2-3 giờ
• Nên đi buổi sáng sớm để tránh nắng

⏰ GIỜ MỞ CỬA: 07:00 – 17:30
💰 GIÁ VÉ: 40,000₫/người`,
    img: 'https://images.unsplash.com/photo-1583417319070-4a69db38a482?w=600',
    distance: '8 km',
    duration: '20 phút lái xe',
    rating: 4.6,
    tags: ['Chùa', 'Hang động', 'Panorama'],
    mapUrl: '',
  },
  {
    id: 'g5',
    title: 'Sơn Trà & Bán đảo',
    category: 'Thiên nhiên',
    desc: 'Khu bảo tồn thiên nhiên với chùa Linh Ứng, tượng Phật Quan Âm cao nhất Việt Nam, rừng nguyên sinh và bãi biển hoang sơ.',
    fullContent: `Bán đảo Sơn Trà – "Lá phổi xanh" của Đà Nẵng, khu bảo tồn thiên nhiên đa dạng sinh học.

🌿 ĐIỂM NHẤN:
• Chùa Linh Ứng – Tượng Phật Quan Âm cao 67m, lớn nhất Việt Nam
• Voọc chà vá chân nâu – Loài linh trưởng quý hiếm, "nữ hoàng" của các loài linh trưởng
• Bãi Bụt – Bãi biển hoang sơ tuyệt đẹp
• Đỉnh Bàn Cờ – View ngắm toàn cảnh Đà Nẵng từ trên cao

🏍️ DI CHUYỂN:
• Xe máy hoặc ô tô (đường đèo uốn lượn đẹp)
• Thuê xe tại The Royal Citadel

⏰ THỜI GIAN LÝ TƯỞNG: Sáng sớm (5:00-7:00) hoặc chiều muộn (15:00-17:00)`,
    img: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=600',
    distance: '12 km',
    duration: '25 phút lái xe',
    rating: 4.8,
    tags: ['Chùa', 'Rừng', 'Voọc'],
    mapUrl: '',
  },
  {
    id: 'g6',
    title: 'Chợ Hàn & Ẩm thực đường phố',
    category: 'Ẩm thực',
    desc: 'Chợ truyền thống sầm uất với hải sản tươi sống, đặc sản miền Trung, quà lưu niệm và trải nghiệm ẩm thực đường phố đích thực.',
    fullContent: `Chợ Hàn – Ngôi chợ lâu đời và sầm uất nhất Đà Nẵng, thiên đường ẩm thực đường phố.

🍜 ẨM THỰC PHẢI THỬ:
• Bún chả cá Đà Nẵng – Hương vị đặc trưng chỉ có ở đây
• Bánh tráng cuốn thịt heo – Đặc sản số 1 miền Trung
• Hải sản tươi sống – Tôm, cua, ghẹ, ốc... nướng tại chỗ
• Chè bắp Hội An – Ngọt thanh, mát lạnh

🛍️ MUA SẮM:
• Tầng 1: Thực phẩm, hải sản khô, gia vị
• Tầng 2: Vải, quần áo, quà lưu niệm
• Đặc biệt: Nước mắm Nam Ô, mực khô, trà Bà Nà

⏰ GIỜ MỞ CỬA: 06:00 – 19:00 (Đông nhất: 7:00-10:00 & 15:00-18:00)
💡 TIPS: Nên trả giá (~70% giá niêm yết cho đồ lưu niệm)`,
    img: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=600',
    distance: '3 km',
    duration: '10 phút lái xe',
    rating: 4.5,
    tags: ['Hải sản', 'Mua sắm', 'Đặc sản'],
    mapUrl: '',
  },
];

const CATEGORIES = ['Tất cả', 'Thiên nhiên', 'Di sản văn hóa', 'Ẩm thực', 'Giải trí', 'Tâm linh'];

const AttractionCard = ({ item, onMap, onDetail }) => {
  const [hovered, setHovered] = useState(false);

  return (
    <Card
      hoverable
      onClick={() => onDetail(item)}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        borderRadius: 16, overflow: 'hidden', height: '100%',
        boxShadow: hovered ? '0 12px 40px rgba(0,0,0,0.12)' : '0 2px 12px rgba(0,0,0,0.06)',
        transition: 'all 0.4s', border: '1px solid #f0f0f0', cursor: 'pointer',
      }}
      cover={
        <div style={{ overflow: 'hidden', height: 220, position: 'relative' }}>
          <img
            alt={item.title}
            src={item.img}
            onError={(e) => { e.target.src = FALLBACK_IMG; }}
            style={{
              width: '100%', height: '100%', objectFit: 'cover',
              transition: 'transform 0.6s', transform: hovered ? 'scale(1.08)' : 'scale(1)',
            }}
          />
          <div style={{
            position: 'absolute', bottom: 0, left: 0, right: 0,
            background: 'linear-gradient(transparent, rgba(0,0,0,0.6))',
            padding: '20px 16px 12px',
          }}>
            <Tag style={{
              background: 'rgba(201,169,97,0.9)', border: 'none',
              color: '#1a1a1a', fontWeight: 600, borderRadius: 12,
            }}>
              <CompassOutlined /> {item.category}
            </Tag>
          </div>
        </div>
      }
      bodyStyle={{ padding: 20, display: 'flex', flexDirection: 'column', flex: 1 }}
    >
      <Title level={4} style={{ marginBottom: 8 }}>
        <EnvironmentOutlined style={{ color: '#c9a961', marginRight: 8 }} />
        {item.title}
      </Title>

      <div style={{ display: 'flex', gap: 16, marginBottom: 12, color: '#8c8c8c', fontSize: 13 }}>
        <span><CarOutlined /> {item.distance}</span>
        <span><ClockCircleOutlined /> {item.duration}</span>
      </div>

      <Paragraph style={{ color: '#595959', flex: 1, fontSize: '0.9rem', lineHeight: 1.7 }}>
        {item.desc}
      </Paragraph>

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 16 }}>
        {item.tags.map(tag => (
          <Tag key={tag} style={{ borderRadius: 12, border: '1px solid #d4b87a', color: '#8a7340', background: '#fdf8ed' }}>
            {tag}
          </Tag>
        ))}
      </div>

      <Divider style={{ margin: '0 0 12px' }} />

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <Rate disabled defaultValue={item.rating} allowHalf style={{ fontSize: 14 }} />
          <Text type="secondary" style={{ marginLeft: 8 }}>{item.rating}</Text>
        </div>
        {item.mapUrl && (
          <Button
            type="text"
            onClick={(e) => { e.stopPropagation(); onMap(item); }}
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

const CustomerAttractionsPage = () => {
  const [selectedMap, setSelectedMap] = useState(null);
  const [detailModal, setDetailModal] = useState(null);
  const [activeCategory, setActiveCategory] = useState('Tất cả');
  const [search, setSearch] = useState('');

  const filtered = LOCAL_GUIDES.filter(item => {
    const matchCategory = activeCategory === 'Tất cả' || item.category === activeCategory;
    const matchSearch = !search || item.title.toLowerCase().includes(search.toLowerCase());
    return matchCategory && matchSearch;
  });

  return (
    <div style={{ paddingBottom: 60 }}>
      {/* Page Header */}
      <div style={{
        textAlign: 'center', padding: '60px 20px 40px',
        background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)',
        borderRadius: 16, marginBottom: 48, position: 'relative', overflow: 'hidden',
      }}>
        <div style={{
          position: 'absolute', inset: 0,
          background: 'radial-gradient(circle at 70% 30%, rgba(201,169,97,0.12) 0%, transparent 60%)',
        }} />
        <Title level={1} style={{
          color: '#fff', margin: 0, fontFamily: "'Playfair Display', serif",
          fontSize: 'clamp(2rem, 4vw, 3rem)', fontWeight: 400, position: 'relative',
        }}>
          <CameraOutlined style={{ marginRight: 12 }} />
          Khám Phá & Cẩm Nang Địa Phương
        </Title>
        <div style={{ width: 60, height: 1, background: '#c9a961', margin: '16px auto' }} />
        <Paragraph style={{
          color: 'rgba(255,255,255,0.7)', fontSize: '1rem', maxWidth: 600,
          margin: '0 auto', position: 'relative', letterSpacing: '1px',
        }}>
          Những điểm đến không thể bỏ lỡ quanh The Royal Citadel
        </Paragraph>
      </div>

      {/* Filters */}
      <div style={{
        display: 'flex', flexWrap: 'wrap', gap: 12, marginBottom: 32,
        justifyContent: 'center', alignItems: 'center',
      }}>
        {CATEGORIES.map(cat => (
          <Button
            key={cat}
            type={activeCategory === cat ? 'primary' : 'default'}
            onClick={() => setActiveCategory(cat)}
            style={{
              borderRadius: 20,
              ...(activeCategory === cat ? {
                background: '#c9a961', borderColor: '#c9a961',
              } : {
                borderColor: '#d4b87a', color: '#8a7340',
              }),
            }}
          >
            {cat}
          </Button>
        ))}
        <Input
          prefix={<SearchOutlined />}
          placeholder="Tìm kiếm..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{ width: 200, borderRadius: 20 }}
        />
      </div>

      {/* Grid */}
      <Row gutter={[24, 24]}>
        {filtered.map(item => (
          <Col xs={24} sm={12} lg={8} key={item.id}>
            <AttractionCard item={item} onMap={setSelectedMap} onDetail={setDetailModal} />
          </Col>
        ))}
      </Row>

      {filtered.length === 0 && (
        <div style={{ textAlign: 'center', padding: 60, color: '#8c8c8c' }}>
          <CompassOutlined style={{ fontSize: 48, marginBottom: 16 }} />
          <Title level={4} type="secondary">Không tìm thấy kết quả</Title>
        </div>
      )}

      {/* ── Detail Modal ──────────────────────────────────────────────── */}
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
            <div style={{ position: 'relative', overflow: 'hidden' }}>
              <img
                alt={detailModal.title}
                src={detailModal.img}
                onError={(e) => { e.target.src = FALLBACK_IMG; }}
                style={{ width: '100%', height: 300, objectFit: 'cover', display: 'block' }}
              />
              <div style={{
                position: 'absolute', bottom: 0, left: 0, right: 0,
                background: 'linear-gradient(transparent, rgba(0,0,0,0.8))',
                padding: '40px 32px 24px',
              }}>
                <Tag style={{ background: 'rgba(201,169,97,0.9)', border: 'none', color: '#1a1a1a', fontWeight: 600, borderRadius: 12, marginBottom: 8 }}>
                  <CompassOutlined /> {detailModal.category}
                </Tag>
                <Title level={2} style={{ color: '#fff', margin: 0, fontFamily: "'Playfair Display', serif" }}>
                  {detailModal.title}
                </Title>
              </div>
            </div>
            <div style={{ padding: '24px 32px 32px' }}>
              <div style={{ display: 'flex', gap: 24, marginBottom: 20, flexWrap: 'wrap' }}>
                <div><CarOutlined style={{ color: '#c9a961', marginRight: 6 }} /><Text type="secondary">{detailModal.distance}</Text></div>
                <div><ClockCircleOutlined style={{ color: '#c9a961', marginRight: 6 }} /><Text type="secondary">{detailModal.duration}</Text></div>
                <div><StarFilled style={{ color: '#c9a961', marginRight: 6 }} /><Rate disabled defaultValue={detailModal.rating} allowHalf style={{ fontSize: 14 }} /></div>
              </div>

              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 20 }}>
                {detailModal.tags.map(tag => (
                  <Tag key={tag} style={{ borderRadius: 12, border: '1px solid #d4b87a', color: '#8a7340', background: '#fdf8ed' }}>{tag}</Tag>
                ))}
              </div>

              <Divider />

              <Paragraph style={{ fontSize: '0.95rem', lineHeight: 2, whiteSpace: 'pre-line', color: '#444' }}>
                {detailModal.fullContent || detailModal.desc}
              </Paragraph>

              {detailModal.mapUrl && (
                <>
                  <Divider />
                  <Title level={5}>📍 Bản đồ</Title>
                  <div style={{ width: '100%', height: 300, borderRadius: 8, overflow: 'hidden' }}>
                    <iframe
                      title={detailModal.title}
                      src={detailModal.mapUrl}
                      width="100%"
                      height="100%"
                      style={{ border: 0 }}
                      allowFullScreen
                      loading="lazy"
                    />
                  </div>
                </>
              )}
            </div>
          </div>
        )}
      </Modal>

      {/* Map Modal (kept for standalone map button) */}
      <Modal
        title={selectedMap ? `Bản đồ - ${selectedMap.title}` : 'Bản đồ'}
        open={!!selectedMap}
        onCancel={() => setSelectedMap(null)}
        footer={null}
        width={800}
        centered
        destroyOnClose
      >
        {selectedMap?.mapUrl ? (
          <div style={{ width: '100%', height: 450, borderRadius: 8, overflow: 'hidden' }}>
            <iframe
              title={selectedMap.title}
              src={selectedMap.mapUrl}
              width="100%"
              height="100%"
              style={{ border: 0 }}
              allowFullScreen
              loading="lazy"
            />
          </div>
        ) : (
          <p>Không có dữ liệu bản đồ cho địa điểm này.</p>
        )}
      </Modal>
    </div>
  );
};

export default CustomerAttractionsPage;
