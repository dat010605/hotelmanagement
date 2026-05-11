import React, { useState } from 'react';
import { Typography, Row, Col, Card, Tag, Button, Rate, Modal, Input, Divider } from 'antd';
import {
  EnvironmentOutlined, ArrowRightOutlined, SearchOutlined,
  ClockCircleOutlined, CarOutlined, StarFilled,
  CompassOutlined, CameraOutlined
} from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import { useAttractionsStore } from '../store/useAttractionsStore';

const { Title, Paragraph, Text } = Typography;

const FALLBACK_IMG = 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=600';

// ── Dữ liệu mẫu – sử dụng translation keys thay vì hardcode ────────────
const LOCAL_GUIDES_DATA = [
  {
    id: 'g1',
    titleKey: 'attractionsPage.hoian_title',
    categoryKey: 'attractionsPage.catHeritage',
    descKey: 'attractionsPage.hoian_desc',
    fullContentKey: 'attractionsPage.hoian_full',
    img: 'https://images.unsplash.com/photo-1559592413-7cec4d0cae2b?w=600',
    distance: '5 km',
    durationKey: 'attractionsPage.hoian_duration',
    rating: 4.9,
    tagsKey: 'attractionsPage.hoian_tags',
    mapUrl: 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d15348.88!2d108.327!3d15.877!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x31420d8e5e3f8b5b%3A0x7d7c3d5f7e7d0b0a!2zSG9pIEFu!5e0!3m2!1svi!2s!4v1',
  },
  {
    id: 'g2',
    titleKey: 'attractionsPage.bana_title',
    categoryKey: 'attractionsPage.catEntertainment',
    descKey: 'attractionsPage.bana_desc',
    fullContentKey: 'attractionsPage.bana_full',
    img: 'https://images.unsplash.com/photo-1592898741994-2189e4f5e354?w=600',
    distance: '25 km',
    durationKey: 'attractionsPage.bana_duration',
    rating: 4.8,
    tagsKey: 'attractionsPage.bana_tags',
    mapUrl: '',
  },
  {
    id: 'g3',
    titleKey: 'attractionsPage.mykhe_title',
    categoryKey: 'attractionsPage.catNature',
    descKey: 'attractionsPage.mykhe_desc',
    fullContentKey: 'attractionsPage.mykhe_full',
    img: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=600',
    distance: '1 km',
    durationKey: 'attractionsPage.mykhe_duration',
    rating: 4.7,
    tagsKey: 'attractionsPage.mykhe_tags',
    mapUrl: '',
  },
  {
    id: 'g4',
    titleKey: 'attractionsPage.marble_title',
    categoryKey: 'attractionsPage.catSpiritual',
    descKey: 'attractionsPage.marble_desc',
    fullContentKey: 'attractionsPage.marble_full',
    img: 'https://images.unsplash.com/photo-1583417319070-4a69db38a482?w=600',
    distance: '8 km',
    durationKey: 'attractionsPage.marble_duration',
    rating: 4.6,
    tagsKey: 'attractionsPage.marble_tags',
    mapUrl: '',
  },
  {
    id: 'g5',
    titleKey: 'attractionsPage.sontra_title',
    categoryKey: 'attractionsPage.catNature',
    descKey: 'attractionsPage.sontra_desc',
    fullContentKey: 'attractionsPage.sontra_full',
    img: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=600',
    distance: '12 km',
    durationKey: 'attractionsPage.sontra_duration',
    rating: 4.8,
    tagsKey: 'attractionsPage.sontra_tags',
    mapUrl: '',
  },
  {
    id: 'g6',
    titleKey: 'attractionsPage.hanmarket_title',
    categoryKey: 'attractionsPage.catCuisine',
    descKey: 'attractionsPage.hanmarket_desc',
    fullContentKey: 'attractionsPage.hanmarket_full',
    img: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=600',
    distance: '3 km',
    durationKey: 'attractionsPage.hanmarket_duration',
    rating: 4.5,
    tagsKey: 'attractionsPage.hanmarket_tags',
    mapUrl: '',
  },
];

// Category keys for filter buttons
const CATEGORY_KEYS = [
  'attractionsPage.catAll',
  'attractionsPage.catNature',
  'attractionsPage.catHeritage',
  'attractionsPage.catCuisine',
  'attractionsPage.catEntertainment',
  'attractionsPage.catSpiritual',
];

const AttractionCard = ({ item, onMap, onDetail, t }) => {
  const [hovered, setHovered] = useState(false);
  const tags = t(item.tagsKey, { returnObjects: true }) || [];

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
            alt={t(item.titleKey)}
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
              <CompassOutlined /> {t(item.categoryKey)}
            </Tag>
          </div>
        </div>
      }
      bodyStyle={{ padding: 20, display: 'flex', flexDirection: 'column', flex: 1 }}
    >
      <Title level={4} style={{ marginBottom: 8 }}>
        <EnvironmentOutlined style={{ color: '#c9a961', marginRight: 8 }} />
        {t(item.titleKey)}
      </Title>

      <div style={{ display: 'flex', gap: 16, marginBottom: 12, color: '#8c8c8c', fontSize: 13 }}>
        <span><CarOutlined /> {item.distance}</span>
        <span><ClockCircleOutlined /> {t(item.durationKey)}</span>
      </div>

      <Paragraph style={{ color: '#595959', flex: 1, fontSize: '0.9rem', lineHeight: 1.7 }}>
        {t(item.descKey)}
      </Paragraph>

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 16 }}>
        {Array.isArray(tags) && tags.map(tag => (
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
            {t('attractionsPage.map')}
          </Button>
        )}
      </div>
    </Card>
  );
};

const CustomerAttractionsPage = () => {
  const { t } = useTranslation();
  const [selectedMap, setSelectedMap] = useState(null);
  const [detailModal, setDetailModal] = useState(null);
  const [activeCategoryKey, setActiveCategoryKey] = useState('attractionsPage.catAll');
  const [search, setSearch] = useState('');

  const filtered = LOCAL_GUIDES_DATA.filter(item => {
    const matchCategory = activeCategoryKey === 'attractionsPage.catAll' || item.categoryKey === activeCategoryKey;
    const title = t(item.titleKey);
    const matchSearch = !search || title.toLowerCase().includes(search.toLowerCase());
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
          {t('attractionsPage.title')}
        </Title>
        <div style={{ width: 60, height: 1, background: '#c9a961', margin: '16px auto' }} />
        <Paragraph style={{
          color: 'rgba(255,255,255,0.7)', fontSize: '1rem', maxWidth: 600,
          margin: '0 auto', position: 'relative', letterSpacing: '1px',
        }}>
          {t('attractionsPage.subtitle')}
        </Paragraph>
      </div>

      {/* Filters */}
      <div style={{
        display: 'flex', flexWrap: 'wrap', gap: 12, marginBottom: 32,
        justifyContent: 'center', alignItems: 'center',
      }}>
        {CATEGORY_KEYS.map(catKey => (
          <Button
            key={catKey}
            type={activeCategoryKey === catKey ? 'primary' : 'default'}
            onClick={() => setActiveCategoryKey(catKey)}
            style={{
              borderRadius: 20,
              ...(activeCategoryKey === catKey ? {
                background: '#c9a961', borderColor: '#c9a961',
              } : {
                borderColor: '#d4b87a', color: '#8a7340',
              }),
            }}
          >
            {t(catKey)}
          </Button>
        ))}
        <Input
          prefix={<SearchOutlined />}
          placeholder={t('attractionsPage.searchPlaceholder')}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{ width: 200, borderRadius: 20 }}
        />
      </div>

      {/* Grid */}
      <Row gutter={[24, 24]}>
        {filtered.map(item => (
          <Col xs={24} sm={12} lg={8} key={item.id}>
            <AttractionCard item={item} onMap={setSelectedMap} onDetail={setDetailModal} t={t} />
          </Col>
        ))}
      </Row>

      {filtered.length === 0 && (
        <div style={{ textAlign: 'center', padding: 60, color: '#8c8c8c' }}>
          <CompassOutlined style={{ fontSize: 48, marginBottom: 16 }} />
          <Title level={4} type="secondary">{t('attractionsPage.noResults')}</Title>
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
                alt={t(detailModal.titleKey)}
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
                  <CompassOutlined /> {t(detailModal.categoryKey)}
                </Tag>
                <Title level={2} style={{ color: '#fff', margin: 0, fontFamily: "'Playfair Display', serif" }}>
                  {t(detailModal.titleKey)}
                </Title>
              </div>
            </div>
            <div style={{ padding: '24px 32px 32px' }}>
              <div style={{ display: 'flex', gap: 24, marginBottom: 20, flexWrap: 'wrap' }}>
                <div><CarOutlined style={{ color: '#c9a961', marginRight: 6 }} /><Text type="secondary">{detailModal.distance}</Text></div>
                <div><ClockCircleOutlined style={{ color: '#c9a961', marginRight: 6 }} /><Text type="secondary">{t(detailModal.durationKey)}</Text></div>
                <div><StarFilled style={{ color: '#c9a961', marginRight: 6 }} /><Rate disabled defaultValue={detailModal.rating} allowHalf style={{ fontSize: 14 }} /></div>
              </div>

              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 20 }}>
                {(t(detailModal.tagsKey, { returnObjects: true }) || []).map(tag => (
                  <Tag key={tag} style={{ borderRadius: 12, border: '1px solid #d4b87a', color: '#8a7340', background: '#fdf8ed' }}>{tag}</Tag>
                ))}
              </div>

              <Divider />

              <Paragraph style={{ fontSize: '0.95rem', lineHeight: 2, whiteSpace: 'pre-line', color: '#444' }}>
                {t(detailModal.fullContentKey) || t(detailModal.descKey)}
              </Paragraph>

              {detailModal.mapUrl && (
                <>
                  <Divider />
                  <Title level={5}>📍 {t('attractionsPage.map')}</Title>
                  <div style={{ width: '100%', height: 300, borderRadius: 8, overflow: 'hidden' }}>
                    <iframe
                      title={t(detailModal.titleKey)}
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
        title={selectedMap ? t('attractionsPage.mapTitle', { name: t(selectedMap.titleKey) }) : t('attractionsPage.map')}
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
              title={t(selectedMap.titleKey)}
              src={selectedMap.mapUrl}
              width="100%"
              height="100%"
              style={{ border: 0 }}
              allowFullScreen
              loading="lazy"
            />
          </div>
        ) : (
          <p>{t('attractionsPage.noMapData')}</p>
        )}
      </Modal>
    </div>
  );
};

export default CustomerAttractionsPage;
