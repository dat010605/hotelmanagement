import React, { useState } from 'react';
import { Row, Col, Card, Typography, Button, Input, DatePicker, InputNumber, Rate, Avatar, Tag, Divider, Modal } from 'antd';
import {
  EnvironmentOutlined, ArrowRightOutlined, SearchOutlined,
  CalendarOutlined, TeamOutlined, TagOutlined,
  ReadOutlined, UserOutlined, StarFilled, ClockCircleOutlined
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAttractionsStore } from '../store/useAttractionsStore';
import { useReviewStore } from '../store/useReviewStore';
import { useMemo } from 'react';
import HeroSection from '../components/HeroSection';

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
const NewsCard = ({ item }) => (
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
    <Button type="link" style={{ padding: 0, textAlign: 'left', fontWeight: 600 }}>
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
  const allReviews = useReviewStore(state => state.reviews);
  const reviews = useMemo(() => allReviews.filter(r => !r.isHidden).slice(0, 4), [allReviews]);

  const NEWS_DATA = [
    { id: 1, tag: t('home.newsEvent'), tagColor: '#1890ff', title: t('home.newsTitle1'), desc: t('home.newsDesc1'), date: '20/04/2026', img: 'https://images.unsplash.com/photo-1544161515-4ab6ce6db874?w=600', readMore: t('common.readMore') },
    { id: 2, tag: t('home.newsOffer'), tagColor: '#52c41a', title: t('home.newsTitle2'), desc: t('home.newsDesc2'), date: '15/04/2026', img: 'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=600', readMore: t('common.readMore') },
    { id: 3, tag: t('home.newsAward'), tagColor: '#faad14', title: t('home.newsTitle3'), desc: t('home.newsDesc3'), date: '08/04/2026', img: 'https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=600', readMore: t('common.readMore') },
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
              <Text strong style={{ display: 'block', marginBottom: '8px' }}><TeamOutlined /> {t('home.numRooms')}</Text>
              <InputNumber min={1} defaultValue={1} size="large" bordered={false} style={{ borderBottom: '1px solid #d9d9d9', width: '100%' }} />
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

      {/* ── ATTRACTIONS SECTION ───────────────────────────────────────────── */}
      <div style={{ marginTop: '80px' }}>
        <SectionHeader
          title={t('attractionsTitle')}
          subtitle={t('home.attractionsSubtitle')}
        />
        <Row gutter={[24, 24]}>
          {attractions.map((item) => (
            <Col xs={24} sm={12} md={8} key={item.id}>
              <Card
                hoverable
                style={{ borderRadius: '12px', overflow: 'hidden', height: '100%', display: 'flex', flexDirection: 'column' }}
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
                bodyStyle={{ flex: 1, display: 'flex', flexDirection: 'column' }}
              >
                <Title level={4} style={{ marginBottom: '12px' }}>
                  <EnvironmentOutlined style={{ color: '#1890ff', marginRight: '8px' }} />
                  {item.title}
                </Title>
                <p style={{ color: '#595959', flex: 1 }}>{item.desc || ''}</p>
                <div style={{ display: 'flex', gap: '10px', marginTop: 'auto' }}>
                  <Button type="primary" ghost style={{ borderRadius: '6px' }}>
                    {t('viewDetails')} <ArrowRightOutlined />
                  </Button>
                  {item.mapUrl && (
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
            </Col>
          ))}
        </Row>
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
              <NewsCard item={item} />
            </Col>
          ))}
        </Row>
        <div style={{ textAlign: 'center', marginTop: 32 }}>
          <Button size="large" icon={<ReadOutlined />} style={{ borderRadius: '8px', padding: '0 32px' }}>
            {t('home.viewAllNews')}
          </Button>
        </div>
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
        {selectedMap && selectedMap.mapUrl ? (
          <div style={{ width: '100%', height: '450px', borderRadius: '8px', overflow: 'hidden' }}>
            <iframe
              title={selectedMap.title}
              src={selectedMap.mapUrl}
              width="100%"
              height="100%"
              style={{ border: 0 }}
              allowFullScreen=""
              loading="lazy"
            ></iframe>
          </div>
        ) : (
          <p>{t('common.noMapData')}</p>
        )}
      </Modal>

    </div>
  );
};

export default CustomerHomePage;
