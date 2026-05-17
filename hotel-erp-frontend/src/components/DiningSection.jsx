import React, { useState } from 'react';
import { Typography, Row, Col, Tag, Button, Rate, Modal, Divider } from 'antd';
import { ClockCircleOutlined, ArrowRightOutlined, EnvironmentOutlined, PhoneOutlined, StarFilled } from '@ant-design/icons';

const { Title, Paragraph, Text } = Typography;
const FALLBACK_IMG = 'https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=600';

const DINING_DATA = [
  {
    id: 1, category: 'restaurant',
    title: 'Nhà Hàng Hoàng Gia',
    subtitle: 'Royal Buffet – Fine Dining & Hải Sản',
    desc: 'Không gian sang trọng bậc nhất phục vụ bữa sáng buffet quốc tế và bữa tối hải sản tươi sống theo phong cách Á – Âu đặc sắc.',
    fullContent: `Nhà Hàng Hoàng Gia là biểu tượng ẩm thực của The Royal Citadel – nơi mỗi bữa ăn là một trải nghiệm nghệ thuật.

🍽️ THỰC ĐƠN SIGNATURE:
• Lobster Thermidor – Tôm hùm nướng phô mai Gruyère trứ danh
• Wagyu A5 Teppanyaki – Bò Wagyu Nhật Bản chế biến trước mặt thực khách
• Phở Royal – Phở bò truyền thống với nước dùng ninh 48 giờ từ xương ống
• Seafood Tower – Tháp hải sản 3 tầng: hàu Pháp, tôm hùm Alaska, cua hoàng đế

🥂 RƯỢU VANG:
Hầm rượu chứa hơn 300 chai vang từ Bordeaux, Tuscany và Napa Valley.

⏰ GIỜ PHỤC VỤ:
• Bữa sáng buffet: 06:00 – 10:00
• Bữa trưa set menu: 11:30 – 14:00
• Bữa tối fine dining: 18:00 – 22:30`,
    img: 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=800',
    rating: 4.9, hours: '06:00 – 22:30', capacity: '120 khách',
    tags: ['Fine Dining', 'Hải Sản', 'Buffet Sáng'],
    highlight: true, phone: '0236 999 0001',
  },
  {
    id: 2, category: 'bar',
    title: 'Ocean View Lounge',
    subtitle: 'Sky Bar & Cocktail Lounge',
    desc: 'Quầy bar tầng thượng với tầm nhìn 180° ra biển Mỹ Khê. Thưởng thức cocktail signature trong giai điệu Acoustic mỗi tối từ 20h.',
    fullContent: `Ocean View Lounge nằm ở tầng cao nhất của The Royal Citadel, mang đến trải nghiệm thưởng thức đồ uống tuyệt vời nhất Đà Nẵng.

🍸 COCKTAIL SIGNATURE:
• Citadel Sunset – Rum aged, passion fruit, hoa butterfly pea (đổi màu kỳ ảo)
• Royal Sapphire – Gin Hendricks, blue curaçao, elderflower tonic
• Midnight Ocean – Whisky Macallan 12, espresso, dark chocolate foam
• Vietnamese Dream – Rượu cần Tây Nguyên pha cùng lychee & gừng tươi

🎵 CHƯƠNG TRÌNH ĐẶC BIỆT:
• Thứ 5 – Chủ nhật: Acoustic Live (20:00 – 23:00)
• Thứ 6: Ladies' Night – Giảm 50% cocktail cho quý cô
• Cuối tuần: DJ Set từ 22:00

⏰ GIỜ MỞ CỬA: 16:00 – 01:00`,
    img: 'https://images.unsplash.com/photo-1470337458703-46ad1756a187?w=800',
    rating: 4.8, hours: '16:00 – 01:00', capacity: '80 khách',
    tags: ['Cocktails', 'View Biển', 'Live Music'],
    highlight: true, phone: '0236 999 0002',
  },
  {
    id: 3, category: 'tea',
    title: 'Zen Tea House',
    subtitle: 'Trà Chiều & Bánh Ngọt Cao Cấp',
    desc: 'Không gian yên tĩnh kiểu Nhật phục vụ trà chiều Anh Quốc, matcha nguyên chất Uji và bộ sưu tập bánh ngọt handmade tinh tế.',
    fullContent: `Zen Tea House là ốc đảo thanh tĩnh giữa lòng resort, lấy cảm hứng từ trà đạo Nhật Bản và Afternoon Tea truyền thống Anh Quốc.

🍵 TRÀ & ĐỒ UỐNG:
• Bộ sưu tập 40+ loại trà từ Nhật Bản, Đài Loan, Sri Lanka
• Matcha Ceremonial Grade từ Uji, Kyoto – pha theo nghi thức trà đạo
• English Afternoon Tea Set – Trà chiều 3 tầng cùng scone & clotted cream
• Specialty Coffee từ hạt Arabica Đà Lạt rang mộc

🍰 BÁNH NGỌT HANDMADE:
• Macaron vị hoa hồng & mâm xôi – làm tại chỗ mỗi sáng
• Mille-feuille caramel bơ mặn kiểu Pháp
• Bánh Mochi nhân đậu đỏ Hokkaido
• Tart chanh yuzu với meringue Ý

⏰ GIỜ PHỤC VỤ: 09:00 – 21:00 (Trà chiều: 14:00 – 17:00)`,
    img: 'https://images.unsplash.com/photo-1556679343-c7306c1976bc?w=800',
    rating: 4.7, hours: '09:00 – 21:00', capacity: '40 khách',
    tags: ['Trà Chiều', 'Matcha', 'Patisserie'],
    highlight: false, phone: '0236 999 0003',
  },
  {
    id: 4, category: 'restaurant',
    title: 'Phở Citadel & Món Việt',
    subtitle: 'Authentic Vietnamese Cuisine',
    desc: 'Nhà hàng Việt Nam chính thống với không gian đậm chất phố cổ, chuyên phục vụ phở, bún bò Huế, mì Quảng và các món đặc sản miền Trung.',
    fullContent: `Phở Citadel & Món Việt tôn vinh tinh hoa ẩm thực Việt trong không gian tái hiện vẻ đẹp phố cổ Hội An.

🍜 MÓN ĐẶC SẮC:
• Phở Bò Citadel – Nước dùng ninh 48h từ xương ống, thịt bò Úc thượng hạng
• Bún Bò Huế Hoàng Gia – Công thức gia truyền, chả cua lụa đặc biệt
• Mì Quảng Tôm Thịt – Sợi mì tươi, nước lèo đậm đà, bánh tráng giòn
• Cơm Hến Xứ Huế – Món truyền thống cung đình

⏰ GIỜ PHỤC VỤ: 06:30 – 22:00`,
    img: 'https://images.unsplash.com/photo-1503764654157-72d979d9af2f?w=800',
    rating: 4.8, hours: '06:30 – 22:00', capacity: '60 khách',
    tags: ['Phở', 'Món Huế', 'Đặc Sản'],
    highlight: false, phone: '0236 999 0004',
  },
  {
    id: 5, category: 'bar',
    title: 'The Whisky Library',
    subtitle: 'Premium Spirits & Cigar Lounge',
    desc: 'Không gian gentlemen với bộ sưu tập hơn 200 loại whisky single malt từ Scotland, Nhật Bản và phòng cigar riêng biệt.',
    fullContent: `The Whisky Library dành cho những vị khách sành điệu yêu thích rượu mạnh và cigar thượng hạng.

🥃 BỘ SƯU TẬP:
• 200+ chai Single Malt Scotch (Macallan, Glenfiddich, Lagavulin...)
• Japanese Whisky: Yamazaki 18, Hibiki 21, Nikka From The Barrel
• Bourbon & Rye: Blanton's, Woodford Reserve, Bulleit
• Cognac & Brandy: Hennessy XO, Rémy Martin Louis XIII

🚬 CIGAR LOUNGE:
Phòng cigar riêng biệt, thông gió hiện đại, phục vụ Cuban Cigars chính hãng.

⏰ GIỜ MỞ CỬA: 17:00 – 00:00`,
    img: 'https://images.unsplash.com/photo-1572116469696-31de0f17cc34?w=800',
    rating: 4.9, hours: '17:00 – 00:00', capacity: '30 khách',
    tags: ['Whisky', 'Cigar', 'Premium'],
    highlight: false, phone: '0236 999 0005',
  },
];

const FILTERS = [
  { key: 'all', label: 'Tất cả' },
  { key: 'restaurant', label: '🍽️ Nhà hàng' },
  { key: 'bar', label: '🍸 Quán Bar' },
  { key: 'tea', label: '🍵 Trà & Cà phê' },
];

// ── Inject CSS một lần ──
const injectDiningCSS = () => {
  if (document.getElementById('dining-section-css')) return;
  const s = document.createElement('style');
  s.id = 'dining-section-css';
  s.textContent = `
    @keyframes diningFadeUp {
      from { opacity: 0; transform: translateY(24px); }
      to   { opacity: 1; transform: translateY(0); }
    }
    .dining-card { animation: diningFadeUp 0.6s ease-out both; }
    .dining-card:nth-child(2) { animation-delay: 0.1s; }
    .dining-card:nth-child(3) { animation-delay: 0.2s; }
    .dining-card:nth-child(4) { animation-delay: 0.3s; }
    .dining-card:nth-child(5) { animation-delay: 0.4s; }
    .dining-filter-btn {
      padding: 10px 28px; border-radius: 50px; border: 1.5px solid #d9d9d9;
      background: transparent; color: #595959; font-size: 15px; font-weight: 500;
      cursor: pointer; transition: all 0.35s cubic-bezier(0.4, 0, 0.2, 1);
      font-family: 'Inter', sans-serif; letter-spacing: 0.5px;
    }
    .dining-filter-btn:hover { border-color: #c9a961; color: #c9a961; }
    .dining-filter-btn.active {
      background: linear-gradient(135deg, #c9a961, #b8944f);
      border-color: #c9a961; color: #fff; box-shadow: 0 4px 16px rgba(201,169,97,0.35);
    }
    .dining-img-wrap {
      overflow: hidden; position: relative; height: 280px;
    }
    .dining-img-wrap img {
      width: 100%; height: 100%; object-fit: cover;
      transition: transform 0.7s cubic-bezier(0.25, 0.46, 0.45, 0.94);
    }
    .dining-card-root:hover .dining-img-wrap img { transform: scale(1.08); }
    .dining-card-root {
      border-radius: 20px; overflow: hidden; cursor: pointer;
      background: #fff; border: 1px solid #f0f0f0;
      box-shadow: 0 2px 16px rgba(0,0,0,0.05);
      transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
      height: 100%; display: flex; flex-direction: column;
    }
    .dining-card-root:hover {
      box-shadow: 0 16px 48px rgba(0,0,0,0.12);
      transform: translateY(-6px); border-color: #c9a961;
    }
    .dining-card-root.highlight { border: 2px solid #c9a961; }
    .dining-overlay {
      position: absolute; bottom: 0; left: 0; right: 0;
      background: linear-gradient(transparent, rgba(0,0,0,0.7));
      padding: 20px; display: flex; align-items: flex-end; justify-content: space-between;
    }
    .dining-body { padding: 24px; flex: 1; display: flex; flex-direction: column; }
    .dining-cta {
      display: inline-flex; align-items: center; gap: 8px;
      padding: 10px 24px; border-radius: 8px; border: 1.5px solid #c9a961;
      background: transparent; color: #c9a961; font-weight: 600; font-size: 14px;
      cursor: pointer; transition: all 0.3s; font-family: 'Inter', sans-serif;
    }
    .dining-cta:hover { background: #c9a961; color: #fff; }
  `;
  document.head.appendChild(s);
};

const DiningCard = ({ item, onClick }) => (
  <div className={`dining-card-root ${item.highlight ? 'highlight' : ''}`} onClick={() => onClick(item)}>
    <div className="dining-img-wrap">
      <img src={item.img} alt={item.title} onError={(e) => { e.target.src = FALLBACK_IMG; }} />
      <div className="dining-overlay">
        <div>
          <div style={{ display: 'flex', gap: 6 }}>
            {item.tags.map(t => (
              <Tag key={t} style={{ background: 'rgba(255,255,255,0.15)', border: 'none', color: '#fff', backdropFilter: 'blur(4px)', fontSize: 12 }}>{t}</Tag>
            ))}
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          <StarFilled style={{ color: '#faad14', fontSize: 16 }} />
          <Text style={{ color: '#fff', fontWeight: 700, fontSize: 16 }}>{item.rating}</Text>
        </div>
      </div>
    </div>
    <div className="dining-body">
      <Title level={4} style={{ margin: '0 0 4px', fontFamily: "'Playfair Display', serif" }}>{item.title}</Title>
      <Text type="secondary" style={{ fontSize: 13, fontStyle: 'italic', letterSpacing: 0.5 }}>{item.subtitle}</Text>
      <Paragraph style={{ margin: '14px 0', color: '#595959', flex: 1, lineHeight: 1.7, fontSize: 14 }}>{item.desc}</Paragraph>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#8c8c8c', fontSize: 13 }}>
          <ClockCircleOutlined style={{ color: '#c9a961' }} />
          <span>{item.hours}</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#8c8c8c', fontSize: 13 }}>
          <EnvironmentOutlined style={{ color: '#c9a961' }} />
          <span>{item.capacity}</span>
        </div>
      </div>
      <button className="dining-cta">Xem Menu & Đặt Bàn <ArrowRightOutlined /></button>
    </div>
  </div>
);

const DiningSection = () => {
  const [filter, setFilter] = useState('all');
  const [detailItem, setDetailItem] = useState(null);

  React.useEffect(() => { injectDiningCSS(); }, []);

  const filtered = filter === 'all' ? DINING_DATA : DINING_DATA.filter(d => d.category === filter);

  return (
    <section style={{ padding: '80px 0' }}>
      {/* Header */}
      <div style={{ textAlign: 'center', marginBottom: 48 }}>
        <Text style={{ color: '#c9a961', fontSize: 14, letterSpacing: 4, textTransform: 'uppercase', fontWeight: 600 }}>
          Culinary Experience
        </Text>
        <Title level={2} style={{ marginTop: 8, marginBottom: 12, fontFamily: "'Playfair Display', serif", fontSize: 36 }}>
          Khám Phá Ẩm Thực Hoàng Gia
        </Title>
        <Paragraph style={{ maxWidth: 600, margin: '0 auto', color: '#8c8c8c', fontSize: 16, lineHeight: 1.8 }}>
          Hành trình vị giác đỉnh cao với 5 điểm ẩm thực độc đáo, từ fine dining quốc tế đến trà đạo truyền thống
        </Paragraph>
        <div style={{ width: 60, height: 3, background: '#c9a961', margin: '20px auto 0', borderRadius: 2 }} />
      </div>

      {/* Filter */}
      <div style={{ display: 'flex', justifyContent: 'center', gap: 12, marginBottom: 48, flexWrap: 'wrap' }}>
        {FILTERS.map(f => (
          <button
            key={f.key}
            className={`dining-filter-btn ${filter === f.key ? 'active' : ''}`}
            onClick={() => setFilter(f.key)}
          >{f.label}</button>
        ))}
      </div>

      {/* Grid */}
      <Row gutter={[28, 28]}>
        {filtered.map(item => (
          <Col xs={24} sm={12} lg={8} key={item.id} className="dining-card">
            <DiningCard item={item} onClick={setDetailItem} />
          </Col>
        ))}
      </Row>

      {/* Detail Modal */}
      <Modal
        open={!!detailItem}
        onCancel={() => setDetailItem(null)}
        footer={null}
        width={680}
        centered
        styles={{ body: { padding: 0 } }}
      >
        {detailItem && (
          <div>
            <div style={{ position: 'relative' }}>
              <img src={detailItem.img} alt={detailItem.title} onError={(e) => { e.target.src = FALLBACK_IMG; }}
                style={{ width: '100%', height: 300, objectFit: 'cover' }} />
              <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, background: 'linear-gradient(transparent, rgba(0,0,0,0.8))', padding: '40px 28px 20px' }}>
                <Title level={3} style={{ color: '#fff', margin: 0, fontFamily: "'Playfair Display', serif" }}>{detailItem.title}</Title>
                <Text style={{ color: '#c9a961', fontStyle: 'italic' }}>{detailItem.subtitle}</Text>
              </div>
            </div>
            <div style={{ padding: '24px 28px 28px' }}>
              <div style={{ display: 'flex', gap: 24, marginBottom: 20, flexWrap: 'wrap' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#595959' }}>
                  <ClockCircleOutlined style={{ color: '#c9a961', fontSize: 16 }} />
                  <Text strong>{detailItem.hours}</Text>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#595959' }}>
                  <EnvironmentOutlined style={{ color: '#c9a961', fontSize: 16 }} />
                  <Text>{detailItem.capacity}</Text>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#595959' }}>
                  <PhoneOutlined style={{ color: '#c9a961', fontSize: 16 }} />
                  <Text>{detailItem.phone}</Text>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                  <Rate disabled allowHalf defaultValue={detailItem.rating} style={{ fontSize: 16 }} />
                  <Text strong style={{ marginLeft: 6 }}>{detailItem.rating}</Text>
                </div>
              </div>
              <div style={{ display: 'flex', gap: 6, marginBottom: 16 }}>
                {detailItem.tags.map(t => <Tag key={t} color="gold">{t}</Tag>)}
              </div>
              <Divider style={{ margin: '16px 0' }} />
              <Paragraph style={{ whiteSpace: 'pre-line', lineHeight: 1.9, fontSize: 14, color: '#434343' }}>
                {detailItem.fullContent}
              </Paragraph>
              <div style={{ display: 'flex', gap: 12, marginTop: 24 }}>
                <Button type="primary" size="large" style={{ background: '#c9a961', borderColor: '#c9a961', borderRadius: 8, fontWeight: 600, flex: 1 }}>
                  📞 Đặt Bàn Ngay
                </Button>
                <Button size="large" style={{ borderColor: '#c9a961', color: '#c9a961', borderRadius: 8, fontWeight: 600, flex: 1 }}>
                  📋 Xem Thực Đơn
                </Button>
              </div>
            </div>
          </div>
        )}
      </Modal>
    </section>
  );
};

export default DiningSection;
