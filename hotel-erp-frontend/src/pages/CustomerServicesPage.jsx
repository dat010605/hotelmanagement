import React, { useState } from 'react';
import { Typography, Row, Col, Card, Tag, Button, Rate, Divider, Modal } from 'antd';
import {
  CoffeeOutlined, HeartOutlined, ThunderboltOutlined,
  ScissorOutlined, CarOutlined, WifiOutlined,
  StarOutlined, ArrowRightOutlined, EnvironmentOutlined,
  ClockCircleOutlined, PhoneOutlined
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import DiningSection from '../components/DiningSection';

const { Title, Paragraph, Text } = Typography;

const FALLBACK_IMG = 'https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=600';

const ServiceCard = ({ service, onClick, t }) => {
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
            {t(service.categoryKey)}
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
        {t(service.descKey)}
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
  const { t } = useTranslation();
  const [detailModal, setDetailModal] = useState(null);

  const SERVICES = [
    {
      id: 1,
      categoryKey: 'servicesPage.catCuisine',
      icon: <CoffeeOutlined style={{ fontSize: 32, color: '#c9a961' }} />,
      title: 'The Jade Garden Restaurant',
      subtitle: 'Fine Dining & International Cuisine',
      descKey: 'servicesPage.svc1Desc',
      fullContentKey: 'servicesPage.svc1Full',
      img: 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=600',
      rating: 4.9,
      hours: '06:00 – 23:00',
      tags: ['Fine Dining', 'Seafood', 'Wine Bar'],
      highlight: true,
    },
    {
      id: 2,
      categoryKey: 'servicesPage.catHealth',
      icon: <HeartOutlined style={{ fontSize: 32, color: '#c9a961' }} />,
      title: 'Royal Wellness Spa',
      subtitle: 'Rejuvenate Your Body & Soul',
      descKey: 'servicesPage.svc2Desc',
      fullContentKey: 'servicesPage.svc2Full',
      img: 'https://images.unsplash.com/photo-1544161515-4ab6ce6db874?w=600',
      rating: 4.8,
      hours: '08:00 – 22:00',
      tags: ['Massage', 'Sauna', 'Facial'],
      highlight: true,
    },
    {
      id: 3,
      categoryKey: 'servicesPage.catSports',
      icon: <ThunderboltOutlined style={{ fontSize: 32, color: '#c9a961' }} />,
      title: 'Fitness & Aqua Center',
      subtitle: 'State-of-the-Art Equipment',
      descKey: 'servicesPage.svc3Desc',
      fullContentKey: 'servicesPage.svc3Full',
      img: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=600',
      rating: 4.7,
      hours: '05:30 – 21:00',
      tags: ['Gym', 'Infinity Pool', 'Yoga'],
    },
    {
      id: 4,
      categoryKey: 'servicesPage.catBeauty',
      icon: <ScissorOutlined style={{ fontSize: 32, color: '#c9a961' }} />,
      title: 'Citadel Beauty Lounge',
      subtitle: 'Premium Grooming Experience',
      descKey: 'servicesPage.svc4Desc',
      fullContentKey: 'servicesPage.svc4Full',
      img: 'https://images.unsplash.com/photo-1560066984-138dadb4c035?w=600',
      rating: 4.6,
      hours: '09:00 – 20:00',
      tags: ['Hair', 'Nails', 'Skincare'],
    },
    {
      id: 5,
      categoryKey: 'servicesPage.catTransport',
      icon: <CarOutlined style={{ fontSize: 32, color: '#c9a961' }} />,
      title: 'Limousine & Transfers',
      subtitle: 'Luxury Transportation',
      descKey: 'servicesPage.svc5Desc',
      fullContentKey: 'servicesPage.svc5Full',
      img: 'https://images.unsplash.com/photo-1449965408869-ebd3fee7e57e?w=600',
      rating: 4.9,
      hours: '24/7',
      tags: ['Airport', 'Yacht', 'Sports Car'],
    },
    {
      id: 6,
      categoryKey: 'servicesPage.catFacilities',
      icon: <WifiOutlined style={{ fontSize: 32, color: '#c9a961' }} />,
      title: 'Business & Events Center',
      subtitle: 'World-Class Meeting Facilities',
      descKey: 'servicesPage.svc6Desc',
      fullContentKey: 'servicesPage.svc6Full',
      img: 'https://images.unsplash.com/photo-1511578314322-379afb476865?w=600',
      rating: 4.8,
      hours: '07:00 – 23:00',
      tags: ['Meeting', 'Wedding', 'Events'],
    },
  ];

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
          {t('servicesPage.title')}
        </Title>
        <div style={{ width: 60, height: 1, background: '#c9a961', margin: '16px auto' }} />
        <Paragraph style={{
          color: 'rgba(255,255,255,0.7)', fontSize: '1rem', maxWidth: 600,
          margin: '0 auto', position: 'relative', letterSpacing: '1px',
        }}>
          {t('servicesPage.subtitle')}
        </Paragraph>
      </div>

      {/* Services Grid */}
      <Row gutter={[24, 24]}>
        {SERVICES.map(service => (
          <Col xs={24} sm={12} lg={8} key={service.id}>
            <ServiceCard service={service} onClick={setDetailModal} t={t} />
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
          {t('servicesPage.ctaTitle')}
        </Title>
        <Paragraph style={{ color: 'rgba(255,255,255,0.7)', marginBottom: 24 }}>
          {t('servicesPage.ctaDesc')}
        </Paragraph>
        <Button
          size="large"
          onClick={() => navigate('/contact')}
          style={{
            background: 'transparent', color: '#c9a961', border: '1.5px solid #c9a961',
            borderRadius: 2, letterSpacing: 2, fontWeight: 600, padding: '0 40px', height: 48,
          }}
        >
          {t('servicesPage.ctaBtn')} <ArrowRightOutlined />
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
                  {t(detailModal.categoryKey)}
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
                {t(detailModal.fullContentKey) || t(detailModal.descKey)}
              </Paragraph>

              <Divider />
              <div style={{ textAlign: 'center' }}>
                <Button
                  type="primary" size="large"
                  icon={<PhoneOutlined />}
                  onClick={() => { setDetailModal(null); navigate('/contact'); }}
                  style={{ background: '#c9a961', borderColor: '#c9a961', borderRadius: 4, fontWeight: 600, letterSpacing: 1, height: 48, padding: '0 40px' }}
                >
                  {t('servicesPage.bookService')}
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
