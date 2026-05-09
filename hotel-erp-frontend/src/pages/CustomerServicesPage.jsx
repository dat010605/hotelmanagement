import React, { useState } from 'react';
import { Typography, Row, Col, Card, Tag, Button, Rate, Divider, Modal } from 'antd';
import {
  CoffeeOutlined, HeartOutlined, ThunderboltOutlined,
  ScissorOutlined, CarOutlined, WifiOutlined,
  StarOutlined, ArrowRightOutlined, EnvironmentOutlined,
  ClockCircleOutlined, PhoneOutlined
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import DiningSection from '../components/DiningSection';

const { Title, Paragraph, Text } = Typography;

const FALLBACK_IMG = 'https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=600';

const SERVICES = [
  {
    id: 1,
    category: 'Ẩm thực',
    icon: <CoffeeOutlined style={{ fontSize: 32, color: '#c9a961' }} />,
    title: 'The Jade Garden Restaurant',
    subtitle: 'Fine Dining & International Cuisine',
    desc: 'Nhà hàng sang trọng phục vụ ẩm thực Á – Âu cao cấp, hải sản tươi sống và thực đơn rượu vang được tuyển chọn kỹ lưỡng bởi Sommelier.',
    fullContent: `The Jade Garden Restaurant là niềm tự hào ẩm thực của The Royal Citadel, nơi hội tụ tinh hoa ẩm thực Á – Âu trong không gian sang trọng bậc nhất.

🍽️ THỰC ĐƠN SIGNATURE:
• Lobster Thermidor – Tôm hùm nướng phô mai Gruyère trứ danh
• Wagyu A5 Steak – Bò Wagyu hạng A5 Nhật Bản, chín tái hoàn hảo  
• Phở Royal – Phở bò truyền thống với nước dùng ninh 48 giờ
• Seafood Tower – Tháp hải sản 3 tầng: hàu, tôm, cua hoàng đế

🍷 RỰU VANG:
Hầm rượu với hơn 300 loại vang từ Pháp, Ý, Chile được Sommelier tuyển chọn.

⏰ GIỜ PHỤC VỤ:
• Bữa sáng buffet: 06:00 – 10:00
• Bữa trưa: 11:30 – 14:00  
• Bữa tối fine dining: 18:00 – 23:00
• Bar & Lounge: 15:00 – 01:00`,
    img: 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=600',
    rating: 4.9,
    hours: '06:00 – 23:00',
    tags: ['Fine Dining', 'Seafood', 'Wine Bar'],
    highlight: true,
  },
  {
    id: 2,
    category: 'Sức khỏe',
    icon: <HeartOutlined style={{ fontSize: 32, color: '#c9a961' }} />,
    title: 'Royal Wellness Spa',
    subtitle: 'Rejuvenate Your Body & Soul',
    desc: 'Trung tâm spa rộng 2.000m² với hơn 20 liệu trình chăm sóc sức khỏe và làm đẹp bằng nguyên liệu thiên nhiên hữu cơ.',
    fullContent: `Royal Wellness Spa mang đến trải nghiệm thư giãn đỉnh cao với hơn 20 liệu trình được thiết kế riêng biệt.

💆 LIỆU TRÌNH SIGNATURE:
• Royal Gold Facial – Mặt nạ vàng 24K kết hợp collagen biển sâu (90 phút)
• Herbal Body Wrap – Ủ thảo dược truyền thống Việt Nam (120 phút)
• Hot Stone Therapy – Massage đá nóng núi lửa giải tỏa căng thẳng (60 phút)
• Couple Retreat – Gói spa dành cho cặp đôi trong phòng VIP riêng biệt

🧖 TIỆN ÍCH BAO GỒM:
• Phòng xông hơi khô & ướt (Sauna & Steam)
• Jacuzzi ngoài trời nhìn ra biển
• Phòng thiền định & yoga riêng
• Trà thảo dược complimentary

⏰ GIỜ HOẠT ĐỘNG: 08:00 – 22:00 (Đặt lịch trước 24h)`,
    img: 'https://images.unsplash.com/photo-1544161515-4ab6ce6db874?w=600',
    rating: 4.8,
    hours: '08:00 – 22:00',
    tags: ['Massage', 'Sauna', 'Facial'],
    highlight: true,
  },
  {
    id: 3,
    category: 'Thể thao',
    icon: <ThunderboltOutlined style={{ fontSize: 32, color: '#c9a961' }} />,
    title: 'Fitness & Aqua Center',
    subtitle: 'State-of-the-Art Equipment',
    desc: 'Phòng tập hiện đại với thiết bị Technogym, hồ bơi vô cực nhìn ra biển, và lớp yoga mỗi sáng cùng huấn luyện viên riêng.',
    fullContent: `Fitness & Aqua Center là thiên đường thể thao trong khuôn viên The Royal Citadel.

🏋️ PHÒNG TẬP GYM:
• Trang bị toàn bộ máy Technogym (Ý) cao cấp nhất
• Khu vực Free Weight, Cardio, và Functional Training riêng biệt
• Personal Trainer chuyên nghiệp hỗ trợ 1-1

🏊 HỒ BƠI:
• Infinity Pool 50m nhìn ra biển Mỹ Khê
• Hồ bơi trẻ em an toàn với khu vui chơi nước
• Pool Bar phục vụ cocktail & snack

🧘 LỚP HỌC:
• Yoga bình minh (06:00 mỗi sáng)
• Aqua Aerobics (09:00 & 16:00)
• Pilates & Stretching (buổi chiều)

⏰ GIỜ HOẠT ĐỘNG: 05:30 – 21:00`,
    img: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=600',
    rating: 4.7,
    hours: '05:30 – 21:00',
    tags: ['Gym', 'Infinity Pool', 'Yoga'],
  },
  {
    id: 4,
    category: 'Làm đẹp',
    icon: <ScissorOutlined style={{ fontSize: 32, color: '#c9a961' }} />,
    title: 'Citadel Beauty Lounge',
    subtitle: 'Premium Grooming Experience',
    desc: 'Salon làm đẹp với chuyên gia quốc tế, dịch vụ cắt tóc, chăm sóc da và nail art cao cấp dành cho quý khách.',
    fullContent: `Citadel Beauty Lounge – Nơi vẻ đẹp được nâng tầm đẳng cấp quốc tế.

💇 DỊCH VỤ TÓC:
• Cắt tạo kiểu bởi stylist quốc tế
• Nhuộm & highlight cao cấp (Wella, L'Oréal Professionnel)
• Gội đầu thư giãn với tinh dầu thiên nhiên

💅 NAIL ART:
• Sơn gel, dipping powder nghệ thuật
• Chăm sóc tay chân spa deluxe
• Thiết kế nail art theo yêu cầu

🧴 CHĂM SÓC DA:
• Facial cơ bản & nâng cao
• Trị liệu da chuyên sâu (Dermalogica, SK-II)

⏰ GIỜ HOẠT ĐỘNG: 09:00 – 20:00 (Walk-in hoặc đặt lịch)`,
    img: 'https://images.unsplash.com/photo-1560066984-138dadb4c035?w=600',
    rating: 4.6,
    hours: '09:00 – 20:00',
    tags: ['Hair', 'Nails', 'Skincare'],
  },
  {
    id: 5,
    category: 'Di chuyển',
    icon: <CarOutlined style={{ fontSize: 32, color: '#c9a961' }} />,
    title: 'Limousine & Transfers',
    subtitle: 'Luxury Transportation',
    desc: 'Dịch vụ đón/trả sân bay bằng xe Limousine hạng sang, tour tham quan bằng du thuyền riêng và thuê xe thể thao.',
    fullContent: `Limousine & Transfers – Di chuyển đẳng cấp xứng tầm The Royal Citadel.

🚗 ĐÓN/TRẢ SÂN BAY:
• Mercedes S-Class / BMW 7 Series
• Rolls-Royce Ghost (dịch vụ VIP)
• Đón tận cửa máy bay (CIP Service)

🚢 DU THUYỀN:
• Private Yacht Tour bán đảo Sơn Trà (2-4 giờ)
• Sunset Cruise & BBQ trên biển
• Fishing Trip cho nhóm nhỏ

🏎️ THUÊ XE THỂ THAO:
• Porsche 911 Cabriolet
• Mercedes AMG GT
• BMW Z4 Roadster

📞 ĐẶT XE: 24/7 tại Concierge hoặc gọi nội bộ số 0`,
    img: 'https://images.unsplash.com/photo-1449965408869-ebd3fee7e57e?w=600',
    rating: 4.9,
    hours: '24/7',
    tags: ['Airport', 'Yacht', 'Sports Car'],
  },
  {
    id: 6,
    category: 'Tiện ích',
    icon: <WifiOutlined style={{ fontSize: 32, color: '#c9a961' }} />,
    title: 'Business & Events Center',
    subtitle: 'World-Class Meeting Facilities',
    desc: 'Trung tâm hội nghị với 5 phòng họp từ 10-500 người, trang bị công nghệ AV tiên tiến, dịch vụ tiệc cưới sang trọng.',
    fullContent: `Business & Events Center – Không gian hoàn hảo cho mọi sự kiện.

🏢 PHÒNG HỌP:
• Grand Ballroom (500 khách) – Tiệc cưới & Gala Dinner
• Boardroom VIP (20 khách) – Họp kín cấp cao
• 3 phòng họp trung (50-100 khách) – Hội thảo & Workshop

📺 CÔNG NGHỆ:
• Màn hình LED 4K khổ lớn
• Hệ thống âm thanh Bose Professional
• Video conference Polycom / Zoom Room
• Wifi tốc độ cao riêng biệt

🎊 SỰ KIỆN:
• Tiệc cưới sang trọng (indoor & outdoor)
• Gala Dinner & Award Ceremony
• Team Building & Corporate Event

📞 LIÊN HỆ: events@royalcitadel.vn`,
    img: 'https://images.unsplash.com/photo-1511578314322-379afb476865?w=600',
    rating: 4.8,
    hours: '07:00 – 23:00',
    tags: ['Meeting', 'Wedding', 'Events'],
  },
];

const ServiceCard = ({ service, onClick }) => {
  const [hovered, setHovered] = useState(false);
  
  return (
    <Card
      hoverable
      onClick={() => onClick(service)}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        borderRadius: '16px',
        overflow: 'hidden',
        height: '100%',
        border: service.highlight ? '2px solid #c9a961' : '1px solid #f0f0f0',
        boxShadow: hovered ? '0 12px 40px rgba(0,0,0,0.12)' : '0 2px 12px rgba(0,0,0,0.06)',
        transition: 'all 0.4s ease',
        cursor: 'pointer',
      }}
      cover={
        <div style={{ overflow: 'hidden', height: '220px', position: 'relative' }}>
          <img
            alt={service.title}
            src={service.img}
            onError={(e) => { e.target.src = FALLBACK_IMG; }}
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              transition: 'transform 0.6s ease',
              transform: hovered ? 'scale(1.08)' : 'scale(1)',
            }}
          />
          <div style={{
            position: 'absolute', top: 16, left: 16,
            background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(8px)',
            padding: '6px 14px', borderRadius: '20px',
            color: '#c9a961', fontSize: '0.75rem', fontWeight: 600,
            letterSpacing: '1px', textTransform: 'uppercase',
          }}>
            {service.category}
          </div>
          {service.highlight && (
            <div style={{
              position: 'absolute', top: 16, right: 16,
              background: 'linear-gradient(135deg, #c9a961, #e8d5a3)',
              padding: '4px 12px', borderRadius: '12px',
              color: '#1a1a1a', fontSize: '0.7rem', fontWeight: 700,
            }}>
              <StarOutlined /> SIGNATURE
            </div>
          )}
        </div>
      }
      bodyStyle={{ padding: '24px', display: 'flex', flexDirection: 'column', flex: 1 }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
        {service.icon}
        <div>
          <Title level={4} style={{ margin: 0, fontSize: '1.1rem' }}>{service.title}</Title>
          <Text type="secondary" style={{ fontSize: '0.8rem', fontStyle: 'italic' }}>{service.subtitle}</Text>
        </div>
      </div>

      <Paragraph style={{ color: '#595959', flex: 1, fontSize: '0.9rem', lineHeight: 1.7 }}>
        {service.desc}
      </Paragraph>

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 16 }}>
        {service.tags.map(tag => (
          <Tag key={tag} style={{ borderRadius: 12, border: '1px solid #d4b87a', color: '#8a7340', background: '#fdf8ed' }}>
            {tag}
          </Tag>
        ))}
      </div>

      <Divider style={{ margin: '0 0 12px' }} />

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <Rate disabled defaultValue={service.rating} allowHalf style={{ fontSize: 14 }} />
          <Text type="secondary" style={{ marginLeft: 8, fontSize: 13 }}>{service.rating}</Text>
        </div>
        <Text type="secondary" style={{ fontSize: 13 }}>⏰ {service.hours}</Text>
      </div>
    </Card>
  );
};

const CustomerServicesPage = () => {
  const navigate = useNavigate();
  const [detailModal, setDetailModal] = useState(null);

  return (
    <div style={{ paddingBottom: 60 }}>
      {/* Page Header */}
      <div style={{
        textAlign: 'center',
        padding: '60px 20px 40px',
        background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)',
        borderRadius: '16px',
        marginBottom: 48,
        position: 'relative',
        overflow: 'hidden',
      }}>
        <div style={{
          position: 'absolute', inset: 0,
          background: 'radial-gradient(circle at 30% 50%, rgba(201,169,97,0.15) 0%, transparent 60%)',
        }} />
        <Title level={1} style={{
          color: '#fff', margin: 0, fontFamily: "'Playfair Display', serif",
          fontSize: 'clamp(2rem, 4vw, 3rem)', fontWeight: 400, position: 'relative',
        }}>
          Dịch Vụ & Tiện Ích
        </Title>
        <div style={{ width: 60, height: 1, background: '#c9a961', margin: '16px auto' }} />
        <Paragraph style={{
          color: 'rgba(255,255,255,0.7)', fontSize: '1rem', maxWidth: 600,
          margin: '0 auto', position: 'relative', letterSpacing: '1px',
        }}>
          Trải nghiệm dịch vụ đẳng cấp 5 sao tại The Royal Citadel
        </Paragraph>
      </div>

      {/* Services Grid */}
      <Row gutter={[24, 24]}>
        {SERVICES.map(service => (
          <Col xs={24} sm={12} lg={8} key={service.id}>
            <ServiceCard service={service} onClick={setDetailModal} />
          </Col>
        ))}
      </Row>

      {/* ── DINING SECTION ── */}
      <DiningSection />

      {/* CTA */}
      <div style={{
        textAlign: 'center', marginTop: 64, padding: '48px 24px',
        background: 'linear-gradient(135deg, #0f3460, #1a1a2e)',
        borderRadius: 16,
      }}>
        <Title level={3} style={{ color: '#fff', fontFamily: "'Playfair Display', serif", fontWeight: 400 }}>
          Cần tư vấn dịch vụ?
        </Title>
        <Paragraph style={{ color: 'rgba(255,255,255,0.7)', marginBottom: 24 }}>
          Đội ngũ Concierge luôn sẵn sàng hỗ trợ bạn 24/7
        </Paragraph>
        <Button
          size="large"
          onClick={() => navigate('/contact')}
          style={{
            background: 'transparent', color: '#c9a961', border: '1.5px solid #c9a961',
            borderRadius: 2, letterSpacing: 2, fontWeight: 600, padding: '0 40px', height: 48,
          }}
        >
          LIÊN HỆ CONCIERGE <ArrowRightOutlined />
        </Button>
      </div>

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
                  {detailModal.category}
                </Tag>
                <Title level={2} style={{ color: '#fff', margin: 0, fontFamily: "'Playfair Display', serif" }}>
                  {detailModal.title}
                </Title>
                <Text style={{ color: '#c9a961', fontStyle: 'italic' }}>{detailModal.subtitle}</Text>
              </div>
            </div>
            <div style={{ padding: '24px 32px 32px' }}>
              <div style={{ display: 'flex', gap: 24, marginBottom: 20, flexWrap: 'wrap' }}>
                <div><ClockCircleOutlined style={{ color: '#c9a961', marginRight: 6 }} /><Text type="secondary">{detailModal.hours}</Text></div>
                <div><StarOutlined style={{ color: '#c9a961', marginRight: 6 }} /><Rate disabled defaultValue={detailModal.rating} allowHalf style={{ fontSize: 14 }} /></div>
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

              <Divider />
              <div style={{ textAlign: 'center' }}>
                <Button
                  type="primary" size="large"
                  icon={<PhoneOutlined />}
                  onClick={() => { setDetailModal(null); navigate('/contact'); }}
                  style={{ background: '#c9a961', borderColor: '#c9a961', borderRadius: 4, fontWeight: 600, letterSpacing: 1, height: 48, padding: '0 40px' }}
                >
                  ĐẶT DỊCH VỤ NGAY
                </Button>
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default CustomerServicesPage;
