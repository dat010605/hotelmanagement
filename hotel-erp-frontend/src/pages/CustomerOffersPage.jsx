import React, { useState } from 'react';
import { Typography, Row, Col, Card, Tag, Button, Divider, message } from 'antd';
import { GiftOutlined, TagOutlined, CrownOutlined, StarFilled } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

const { Title, Text, Paragraph } = Typography;

const CustomerOffersPage = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [copiedCode, setCopiedCode] = useState(null);

  // --- Vouchers Data ---
  const VOUCHERS = [
    { code: 'DELUXE20', discountKey: 'offersPage.voucher1Discount', titleKey: 'offersPage.voucher1Title', descKey: 'offersPage.voucher1Desc', color: '#c41d7f' },
    { code: 'FAMILY500', discountKey: 'offersPage.voucher2Discount', titleKey: 'offersPage.voucher2Title', descKey: 'offersPage.voucher2Desc', color: '#1d39c4' },
    { code: 'VIPSUITE', discountKey: 'offersPage.voucher3Discount', titleKey: 'offersPage.voucher3Title', descKey: 'offersPage.voucher3Desc', color: '#d48806' },
    { code: 'STAYMORE', discountKey: 'offersPage.voucher4Discount', titleKey: 'offersPage.voucher4Title', descKey: 'offersPage.voucher4Desc', color: '#389e0d' },
  ];

  // --- Combos Data ---
  const BEST_COMBOS = [
    { id: 1, titleKey: 'offersPage.combo1Title', descKey: 'offersPage.combo1Desc', price: '4,500,000 VNĐ', originalPrice: '6,000,000 VNĐ', img: 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?w=600', badge: 'HOT' },
    { id: 2, titleKey: 'offersPage.combo2Title', descKey: 'offersPage.combo2Desc', price: '3,200,000 VNĐ', originalPrice: '4,800,000 VNĐ', img: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=600', badge: 'COUPLE' },
    { id: 3, titleKey: 'offersPage.combo3Title', descKey: 'offersPage.combo3Desc', price: '5,500,000 VNĐ', originalPrice: '7,000,000 VNĐ', img: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=600', badge: 'FAMILY' },
  ];

  // --- Bespoke Packages Data ---
  const BESPOKE_PACKAGES = [
    { id: 1, titleKey: 'offersPage.pkg1Title', descKey: 'offersPage.pkg1Desc', badgeKey: 'offersPage.pkg1Badge', priceKey: 'offersPage.pkg1Price', img: 'https://images.unsplash.com/photo-1544161515-4ab6ce6db874?w=600', gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' },
    { id: 2, titleKey: 'offersPage.pkg2Title', descKey: 'offersPage.pkg2Desc', badgeKey: 'offersPage.pkg2Badge', priceKey: 'offersPage.pkg2Price', img: 'https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=600', gradient: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)' },
    { id: 3, titleKey: 'offersPage.pkg3Title', descKey: 'offersPage.pkg3Desc', badgeKey: 'offersPage.pkg3Badge', priceKey: 'offersPage.pkg3Price', img: 'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=600', gradient: 'linear-gradient(135deg, #a18cd1 0%, #fbc2eb 100%)' },
    { id: 4, titleKey: 'offersPage.pkg4Title', descKey: 'offersPage.pkg4Desc', badgeKey: 'offersPage.pkg4Badge', priceKey: 'offersPage.pkg4Price', img: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=600', gradient: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)' },
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

      {/* ── LUXURY HEADER BANNER ─────────────────────────────────────────── */}
      <div style={{
        background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)',
        borderRadius: '16px',
        padding: '48px 40px',
        color: '#fff',
        textAlign: 'center',
        marginBottom: '60px',
        boxShadow: '0 12px 40px rgba(0,0,0,0.3)',
        position: 'relative',
        overflow: 'hidden',
      }}>
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, background: 'radial-gradient(circle at 50% 0%, rgba(201,169,97,0.15), transparent 60%)' }} />
        <div style={{ position: 'relative', zIndex: 1 }}>
          <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginBottom: 16 }}>
            {[...Array(5)].map((_, i) => <StarFilled key={i} style={{ color: '#c9a961', fontSize: 16 }} />)}
          </div>
          <Title level={1} style={{ color: '#fff', margin: 0, fontWeight: 700, fontFamily: "'Playfair Display', Georgia, serif" }}>
            <GiftOutlined style={{ color: '#c9a961', marginRight: 12 }} />{t('offersPage.title')}
          </Title>
          <Paragraph style={{ color: 'rgba(255,255,255,0.7)', fontSize: '1.1rem', marginTop: 16, maxWidth: 600, margin: '16px auto 0' }}>
            {t('offersPage.subtitle')}
          </Paragraph>
        </div>
      </div>

      {/* ── 1. VOUCHERS SECTION (Đẩy lên đầu) ────────────────────────────── */}
      <div style={{ marginBottom: '60px' }}>
        <Title level={2} style={{ marginBottom: 24 }}>
          <TagOutlined style={{ color: '#c9a961' }} /> {t('offersPage.vouchersTitle')}
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

      {/* ── 2. BEST COMBOS SECTION ────────────────────────────────────────── */}
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

      {/* ── 3. BESPOKE PACKAGES SECTION (Mới) ─────────────────────────────── */}
      <div style={{ marginBottom: '40px' }}>
        <div style={{ textAlign: 'center', marginBottom: 40 }}>
          <Title level={2} style={{ marginBottom: 8 }}>
            <CrownOutlined style={{ color: '#c9a961' }} /> {t('offersPage.bespokeTitle')}
          </Title>
          <Text type="secondary" style={{ fontSize: '1rem' }}>{t('offersPage.bespokeSubtitle')}</Text>
        </div>
        <Row gutter={[24, 24]}>
          {BESPOKE_PACKAGES.map(pkg => (
            <Col xs={24} sm={12} md={6} key={pkg.id}>
              <Card
                hoverable
                style={{ borderRadius: '16px', overflow: 'hidden', height: '100%', border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }}
                bodyStyle={{ padding: 0 }}
              >
                <div style={{ position: 'relative', height: 180, overflow: 'hidden' }}>
                  <img src={pkg.img} alt={t(pkg.titleKey)} onError={(e) => { e.target.src = 'https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=600'; }} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(0,0,0,0.5), transparent 60%)' }} />
                  <Tag style={{ position: 'absolute', top: 12, left: 12, background: pkg.gradient, color: '#fff', border: 'none', fontWeight: 600, fontSize: 13, padding: '4px 12px', borderRadius: 20 }}>
                    {t(pkg.badgeKey)}
                  </Tag>
                </div>
                <div style={{ padding: '20px 16px' }}>
                  <Title level={5} style={{ marginBottom: 8 }}>{t(pkg.titleKey)}</Title>
                  <Paragraph type="secondary" style={{ fontSize: 13, minHeight: 60, marginBottom: 16 }}>
                    {t(pkg.descKey)}
                  </Paragraph>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Text strong style={{ color: '#c9a961', fontSize: '1rem' }}>{t(pkg.priceKey)}</Text>
                    <Button type="primary" size="small" onClick={() => navigate('/rooms')}
                      style={{ borderRadius: 20, background: 'linear-gradient(135deg, #c9a961, #e8d5a3)', border: 'none', color: '#1a1a2e', fontWeight: 600 }}>
                      {t('offersPage.pkgBookBtn')}
                    </Button>
                  </div>
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
