import React, { useState, useEffect, useMemo } from 'react';
import { Typography, Row, Col, Card, Tag, Button, Spin, Divider, Badge, message } from 'antd';
import { FireOutlined, GiftOutlined, TagOutlined, RightOutlined, StarFilled } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import axiosClient from '../api/axiosClient';

const { Title, Text, Paragraph } = Typography;

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
  const { t } = useTranslation();
  const [copiedCode, setCopiedCode] = useState(null);

  // --- Dữ liệu Mock sử dụng translation keys ---
  const BEST_COMBOS = [
    {
      id: 1,
      titleKey: 'offersPage.combo1Title',
      descKey: 'offersPage.combo1Desc',
      price: '4,500,000 VNĐ',
      originalPrice: '6,000,000 VNĐ',
      img: 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?w=600',
      badge: 'HOT'
    },
    {
      id: 2,
      titleKey: 'offersPage.combo2Title',
      descKey: 'offersPage.combo2Desc',
      price: '3,200,000 VNĐ',
      originalPrice: '4,800,000 VNĐ',
      img: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=600',
      badge: 'COUPLE'
    },
    {
      id: 3,
      titleKey: 'offersPage.combo3Title',
      descKey: 'offersPage.combo3Desc',
      price: '5,500,000 VNĐ',
      originalPrice: '7,000,000 VNĐ',
      img: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=600',
      badge: 'FAMILY'
    }
  ];

  const VOUCHERS = [
    {
      code: 'DELUXE20',
      discountKey: 'offersPage.voucher1Discount',
      titleKey: 'offersPage.voucher1Title',
      descKey: 'offersPage.voucher1Desc',
      color: 'magenta'
    },
    {
      code: 'FAMILY500',
      discountKey: 'offersPage.voucher2Discount',
      titleKey: 'offersPage.voucher2Title',
      descKey: 'offersPage.voucher2Desc',
      color: 'geekblue'
    },
    {
      code: 'VIPSUITE',
      discountKey: 'offersPage.voucher3Discount',
      titleKey: 'offersPage.voucher3Title',
      descKey: 'offersPage.voucher3Desc',
      color: 'gold'
    },
    {
      code: 'STAYMORE',
      discountKey: 'offersPage.voucher4Discount',
      titleKey: 'offersPage.voucher4Title',
      descKey: 'offersPage.voucher4Desc',
      color: 'green'
    }
  ];

  const handleCopyCode = async (code) => {
    try {
      await navigator.clipboard.writeText(code);
      setCopiedCode(code);
      message.success(t('offersPage.copiedMessage', { code }));
      setTimeout(() => setCopiedCode(null), 2000);
    } catch {
      message.error(t('offersPage.copyError'));
    }
  };

  return (
    <div style={{ padding: '40px 24px', maxWidth: 1200, margin: '0 auto' }}>
      
      {/* ── HEADER BANNER ────────────────────────────────────────────────── */}
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
          <GiftOutlined /> {t('offersPage.title')}
        </Title>
        <Paragraph style={{ color: '#ffd8bf', fontSize: '1.2rem', marginTop: 16 }}>
          {t('offersPage.subtitle')}
        </Paragraph>
      </div>

      {/* ── BEST COMBOS SECTION ───────────────────────────────────────────── */}
      <div style={{ marginBottom: '60px' }}>
        <Title level={2} style={{ marginBottom: 24 }}>
          <GiftOutlined style={{ color: '#1890ff' }} /> {t('offersPage.combosTitle')}
        </Title>
        <Row gutter={[24, 24]}>
          {BEST_COMBOS.map(combo => (
            <Col xs={24} md={8} key={combo.id}>
              <Card
                hoverable
                cover={<img alt={t(combo.titleKey)} src={combo.img} onError={(e) => { e.target.src = 'https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=600'; }} style={{ height: 220, objectFit: 'cover' }} />}
                style={{ borderRadius: '12px', overflow: 'hidden', height: '100%' }}
                bodyStyle={{ padding: 24 }}
              >
                <Tag color="volcano" style={{ position: 'absolute', top: 16, right: 16, fontSize: 14, padding: '4px 8px', fontWeight: 'bold' }}>
                  {combo.badge}
                </Tag>
                <Title level={4}>{t(combo.titleKey)}</Title>
                <Paragraph type="secondary" style={{ minHeight: 66 }}>{t(combo.descKey)}</Paragraph>
                <div style={{ display: 'flex', alignItems: 'flex-end', gap: 12, marginBottom: 16 }}>
                  <Title level={3} style={{ color: '#f5222d', margin: 0 }}>{combo.price}</Title>
                  <Text delete type="secondary">{combo.originalPrice}</Text>
                </div>
                <Button type="primary" block size="large" style={{ borderRadius: 8 }}>
                  {t('offersPage.claimOffer')}
                </Button>
              </Card>
            </Col>
          ))}
        </Row>
      </div>

      {/* ── VOUCHERS SECTION ──────────────────────────────────────────────── */}
      <div>
        <Title level={2} style={{ marginBottom: 24 }}>
          <TagOutlined style={{ color: '#52c41a' }} /> {t('offersPage.vouchersTitle')}
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
                <Title level={5} style={{ margin: 0 }}>{t(voucher.titleKey)}</Title>
                <div style={{ margin: '12px 0' }}>
                  <Text strong style={{ fontSize: '1.5rem', color: voucher.color }}>{t(voucher.discountKey)}</Text>
                </div>
                <Paragraph type="secondary" style={{ fontSize: 13 }}>
                  {t(voucher.descKey)}
                </Paragraph>
                <Divider style={{ margin: '12px 0' }} />
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Text strong>{t('offersPage.code')}: <Tag color={voucher.color} style={{ fontSize: 14, padding: '2px 8px' }}>{voucher.code}</Tag></Text>
                  <Button type="text" onClick={() => handleCopyCode(voucher.code)}
                    style={{ color: copiedCode === voucher.code ? '#52c41a' : '#1890ff', padding: 0, fontWeight: 600 }}
                  >{copiedCode === voucher.code ? t('offersPage.copied') : t('offersPage.copy')}</Button>
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
