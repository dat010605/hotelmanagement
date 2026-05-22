import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Card, Typography, Divider, Row, Col, Button, Spin, Tag,
  message, Radio, Descriptions, Statistic, Space, Result, Alert
} from 'antd';
import {
  CheckCircleOutlined, CreditCardOutlined, ArrowLeftOutlined,
  HomeOutlined, DollarOutlined, ShoppingCartOutlined,
  TagOutlined, PercentageOutlined, ClockCircleOutlined
} from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import axiosClient from '../api/axiosClient';

const { Title, Text, Paragraph } = Typography;

const CustomerCheckoutPage = () => {
  const { t } = useTranslation();
  const { bookingId } = useParams();
  const navigate = useNavigate();

  const [invoiceData, setInvoiceData] = useState(null);
  const [bookingDetail, setBookingDetail] = useState(null);
  const [loading, setLoading] = useState(true);
  const [paying, setPaying] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('cash');
  const [paid, setPaid] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [invoiceRes, bookingRes] = await Promise.all([
          axiosClient.get(`/Invoices/calculate-invoice/${bookingId}`),
          axiosClient.get(`/Bookings/${bookingId}`)
        ]);
        setInvoiceData(invoiceRes.data);
        setBookingDetail(bookingRes.data);
      } catch (err) {
        console.error('Lỗi tải dữ liệu checkout:', err);
        message.error(t('checkoutPage.loadError'));
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [bookingId]);

  // Xử lý sau khi MoMo redirect về
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const resultCode = params.get('resultCode');
    if (resultCode !== null) {
      if (resultCode === '0') {
        setPaid(true);
        message.success(t('checkoutPage.momoSuccess'), 5);
      } else {
        message.error(t('checkoutPage.momoFailed'), 5);
      }
      window.history.replaceState(null, '', window.location.pathname);
    }
  }, []);

  const handleCashPayment = async () => {
    setPaying(true);
    try {
      await axiosClient.post('/Invoices/process-payment', {
        bookingId: parseInt(bookingId),
        paymentMethod: 'Cash',
        transactionCode: null
      });
      setPaid(true);
      message.success(t('checkoutPage.paySuccess'));
    } catch (err) {
      const errData = err.response?.data;
      const errMsg = (typeof errData === 'object' && errData?.message)
        ? errData.message
        : (typeof errData === 'string' ? errData : t('checkoutPage.payError'));
      message.error(errMsg);
    } finally {
      setPaying(false);
    }
  };

  const handleMoMoPayment = async () => {
    setPaying(true);
    try {
      message.loading({ content: t('checkoutPage.momoInit'), key: 'momo' });
      const response = await axiosClient.post('/Invoices/create-momo-payment', {
        amount: Math.round(invoiceData.finalTotal),
        orderId: bookingDetail.bookingCode
      });
      if (response.data?.payUrl) {
        message.success({ content: t('checkoutPage.redirecting'), key: 'momo', duration: 2 });
        window.location.href = response.data.payUrl;
      } else {
        message.error({ content: t('checkoutPage.momoNoLink'), key: 'momo' });
      }
    } catch (err) {
      message.error({ content: t('checkoutPage.momoConnectError'), key: 'momo' });
    } finally {
      setPaying(false);
    }
  };

  const handlePayment = () => {
    if (paymentMethod === 'momo') {
      handleMoMoPayment();
    } else {
      handleCashPayment();
    }
  };

  const fmt = (v) => (v || 0).toLocaleString('vi-VN');

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: 120 }}>
        <Spin size="large" />
        <Paragraph type="secondary" style={{ marginTop: 16 }}>{t('checkoutPage.loading')}</Paragraph>
      </div>
    );
  }

  if (paid) {
    return (
      <div style={{ maxWidth: 600, margin: '60px auto', padding: '0 20px' }}>
        <Result
          status="success"
          title={t('checkoutPage.paidTitle')}
          subTitle={t('checkoutPage.paidSubtitle', { code: bookingDetail?.bookingCode || '' })}
          extra={[
            <Button
              type="primary" key="history"
              icon={<HomeOutlined />}
              onClick={() => navigate('/my-bookings')}
              style={{ background: '#c9a961', borderColor: '#c9a961', fontWeight: 600, borderRadius: 8 }}
              size="large"
            >
              {t('checkoutPage.goHistory')}
            </Button>,
            <Button key="home" size="large" onClick={() => navigate('/')} style={{ borderRadius: 8 }}>
              {t('checkoutPage.goHome')}
            </Button>
          ]}
        />
      </div>
    );
  }

  if (!invoiceData || !bookingDetail) {
    return (
      <div style={{ maxWidth: 600, margin: '60px auto', textAlign: 'center', padding: '0 20px' }}>
        <Result
          status="warning"
          title={t('checkoutPage.notFound')}
          subTitle={t('checkoutPage.notFoundDesc')}
          extra={<Button type="primary" onClick={() => navigate('/my-bookings')}>{t('common.back')}</Button>}
        />
      </div>
    );
  }

  if (bookingDetail.status === 'Completed') {
    return (
      <div style={{ maxWidth: 600, margin: '60px auto', padding: '0 20px' }}>
        <Result
          status="success"
          title={t('checkoutPage.alreadyPaidTitle')}
          subTitle={t('checkoutPage.alreadyPaidSubtitle', { code: bookingDetail?.bookingCode || '' })}
          extra={[
            <Button type="primary" key="history" onClick={() => navigate('/my-bookings')}
              style={{ background: '#c9a961', borderColor: '#c9a961', fontWeight: 600 }}>
              {t('checkoutPage.goHistory')}
            </Button>
          ]}
        />
      </div>
    );
  }

  if (bookingDetail.status !== 'CheckedIn' && bookingDetail.status !== 'PendingCheckout') {
    return (
      <div style={{ maxWidth: 600, margin: '60px auto', padding: '0 20px' }}>
        <Result
          status="warning"
          title={t('checkoutPage.cannotPay')}
          subTitle={t('checkoutPage.cannotPayDesc', { status: bookingDetail.status })}
          extra={<Button type="primary" onClick={() => navigate('/my-bookings')}>{t('common.back')}</Button>}
        />
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 720, margin: '40px auto', padding: '0 20px' }}>
      {/* Header */}
      <div style={{ marginBottom: 24 }}>
        <Button
          type="text" icon={<ArrowLeftOutlined />}
          onClick={() => navigate('/my-bookings')}
          style={{ padding: 0, fontWeight: 600 }}
        >
          {t('common.back')}
        </Button>
      </div>

      <div style={{ textAlign: 'center', marginBottom: 32 }}>
        <Title level={2} style={{ margin: 0 }}>
          <CreditCardOutlined style={{ marginRight: 12, color: '#c9a961' }} />
          {t('checkoutPage.title')}
        </Title>
        <Paragraph type="secondary" style={{ fontSize: 16, marginTop: 8 }}>
          {t('checkoutPage.orderLabel')}: <Text strong style={{ color: '#1890ff' }}>{bookingDetail.bookingCode}</Text>
        </Paragraph>
        <Space style={{ marginTop: 8 }}>
          <Tag icon={<ClockCircleOutlined />} color="warning" style={{ fontSize: 14, padding: '4px 12px' }}>
            {t('checkoutPage.awaitingPayment')}
          </Tag>
        </Space>
        <div style={{ width: 60, height: 4, background: '#c9a961', margin: '12px auto 0', borderRadius: 2 }} />
      </div>

      <Alert
        message={t('checkoutPage.alertTitle')}
        description={t('checkoutPage.alertDesc')}
        type="info"
        showIcon
        style={{ borderRadius: 10, marginBottom: 20 }}
      />

      {/* Thông tin khách */}
      <Card
        style={{ borderRadius: 12, marginBottom: 20, border: '1px solid #f0f0f0' }}
        bodyStyle={{ padding: '16px 24px' }}
      >
        <Descriptions column={1} size="small">
          <Descriptions.Item label={t('checkoutPage.guestName')}>
            <Text strong>{invoiceData.guestName}</Text>
          </Descriptions.Item>
          <Descriptions.Item label={t('checkoutPage.guestPhone')}>
            {invoiceData.guestPhone || t('checkoutPage.noPhone')}
          </Descriptions.Item>
        </Descriptions>
      </Card>

      {/* Chi tiết hóa đơn */}
      <Card
        title={
          <Space>
            <ShoppingCartOutlined style={{ color: '#c9a961' }} />
            <Text strong>{t('checkoutPage.invoiceDetail')}</Text>
          </Space>
        }
        style={{ borderRadius: 12, marginBottom: 20 }}
      >
        {/* Tiền phòng */}
        <Row justify="space-between" align="middle" style={{ marginBottom: 12 }}>
          <Col>
            <Space>
              <HomeOutlined style={{ color: '#1890ff' }} />
              <Text>{t('checkoutPage.roomCharge')}</Text>
            </Space>
          </Col>
          <Col>
            <Text strong>{fmt(invoiceData.totalRoomAmount)} ₫</Text>
          </Col>
        </Row>

        {/* Dịch vụ phát sinh */}
        {(invoiceData.totalServiceAmount > 0) && (
          <Row justify="space-between" align="middle" style={{ marginBottom: 12 }}>
            <Col>
              <Space>
                <ShoppingCartOutlined style={{ color: '#722ed1' }} />
                <Text>{t('checkoutPage.serviceCharge')}</Text>
              </Space>
            </Col>
            <Col>
              <Text strong>{fmt(invoiceData.totalServiceAmount)} ₫</Text>
            </Col>
          </Row>
        )}

        {/* Đền bù */}
        {(invoiceData.totalDamageAmount > 0) && (
          <Row justify="space-between" align="middle" style={{ marginBottom: 12 }}>
            <Col>
              <Space>
                <TagOutlined style={{ color: '#cf1322' }} />
                <Text style={{ color: '#cf1322' }}>{t('checkoutPage.damageCharge')}</Text>
              </Space>
            </Col>
            <Col>
              <Text strong style={{ color: '#cf1322' }}>{fmt(invoiceData.totalDamageAmount)} ₫</Text>
            </Col>
          </Row>
        )}

        <Divider style={{ margin: '12px 0' }} />

        {/* Subtotal */}
        <Row justify="space-between" align="middle" style={{ marginBottom: 8 }}>
          <Col><Text type="secondary">{t('checkoutPage.subtotal')}</Text></Col>
          <Col><Text>{fmt(invoiceData.subTotal)} ₫</Text></Col>
        </Row>

        {/* Giảm giá */}
        {(invoiceData.discountAmount > 0) && (
          <Row justify="space-between" align="middle" style={{ marginBottom: 8 }}>
            <Col>
              <Space>
                <PercentageOutlined style={{ color: '#52c41a' }} />
                <Text style={{ color: '#52c41a' }}>{t('checkoutPage.discount')}</Text>
              </Space>
            </Col>
            <Col>
              <Text strong style={{ color: '#52c41a' }}>- {fmt(invoiceData.discountAmount)} ₫</Text>
            </Col>
          </Row>
        )}

        {/* Thuế */}
        <Row justify="space-between" align="middle" style={{ marginBottom: 8 }}>
          <Col><Text type="secondary">{t('checkoutPage.tax')}</Text></Col>
          <Col><Text>{fmt(invoiceData.taxAmount)} ₫</Text></Col>
        </Row>

        <Divider style={{ margin: '16px 0', borderColor: '#c9a961' }} />

        {/* Tổng cộng */}
        <Row justify="space-between" align="middle">
          <Col>
            <Title level={4} style={{ margin: 0 }}>
              <DollarOutlined style={{ marginRight: 8, color: '#c9a961' }} />
              {t('checkoutPage.total')}
            </Title>
          </Col>
          <Col>
            <Statistic
              value={invoiceData.finalTotal}
              suffix="₫"
              precision={0}
              groupSeparator=","
              valueStyle={{ color: '#c9a961', fontWeight: 800, fontSize: 28 }}
            />
          </Col>
        </Row>
      </Card>

      {/* Phương thức thanh toán */}
      <Card
        style={{ borderRadius: 12, marginBottom: 20 }}
        bodyStyle={{ padding: '16px 24px' }}
      >
        <Text strong style={{ fontSize: 16, display: 'block', marginBottom: 12 }}>
          {t('checkoutPage.paymentMethod')}
        </Text>
        <Radio.Group
          value={paymentMethod}
          onChange={e => setPaymentMethod(e.target.value)}
          size="large"
          style={{ width: '100%' }}
        >
          <Space direction="vertical" style={{ width: '100%' }}>
            <Radio value="cash" style={{ padding: '8px 0' }}>
              💵 {t('checkoutPage.payByCash')}
            </Radio>
            <Radio value="momo" style={{ padding: '8px 0', color: '#a50064', fontWeight: 600 }}>
              📱 {t('checkoutPage.payByMomo')}
            </Radio>
          </Space>
        </Radio.Group>
      </Card>

      {/* Nút thanh toán */}
      <Button
        type="primary"
        block
        size="large"
        loading={paying}
        icon={<CheckCircleOutlined />}
        onClick={handlePayment}
        style={{
          height: 56,
          fontSize: 18,
          fontWeight: 700,
          borderRadius: 12,
          background: paymentMethod === 'momo'
            ? 'linear-gradient(135deg, #a50064, #d63384)'
            : 'linear-gradient(135deg, #c9a961, #e0c97f)',
          border: 'none',
          boxShadow: '0 4px 16px rgba(201,169,97,0.3)',
        }}
      >
        {paymentMethod === 'momo' ? `🔒 ${t('checkoutPage.confirmMomo')}` : `🔒 ${t('checkoutPage.confirmPay')}`}
      </Button>

      <Paragraph type="secondary" style={{ textAlign: 'center', marginTop: 12, fontSize: 13 }}>
        {t('checkoutPage.agreement')}
      </Paragraph>
    </div>
  );
};

export default CustomerCheckoutPage;
