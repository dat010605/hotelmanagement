import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { Typography, Row, Col, Card, Tag, Button, Spin, Empty, Select, Space, Rate, Modal, Form, Input, DatePicker, Divider, message, Alert, Drawer, Tabs, Progress, List, Avatar } from 'antd';
import { CheckCircleOutlined, UserOutlined, FilterOutlined, SortAscendingOutlined, CalendarOutlined, PhoneOutlined, MailOutlined, GiftOutlined, WifiOutlined, CarOutlined, CoffeeOutlined, SafetyCertificateOutlined, CustomerServiceOutlined, StarFilled, SendOutlined, LockOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import { useAdminAuthStore } from '../store/adminAuthStore';
import axiosClient from '../api/axiosClient';
import dayjs from 'dayjs';

const { Title, Text, Paragraph } = Typography;
const { Option } = Select;
const { RangePicker } = DatePicker;
const FALLBACK_IMG = 'https://images.unsplash.com/photo-1611892440504-42a792e24d32?w=800';

const imageByTypeName = {
  'standard': 'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=800',
  'tiêu chuẩn': 'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=800',
  'deluxe': 'https://images.unsplash.com/photo-1566665797739-1674de7a421a?w=800',
  'suite': 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=800',
  'hoàng gia': 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=800',
  'family': 'https://images.unsplash.com/photo-1578683010236-d716f9a3f461?w=800',
  'gia đình': 'https://images.unsplash.com/photo-1578683010236-d716f9a3f461?w=800',
  'executive': 'https://images.unsplash.com/photo-1596394516093-501ba68a0ba6?w=800',
  'cao cấp': 'https://images.unsplash.com/photo-1596394516093-501ba68a0ba6?w=800',
  'premium': 'https://images.unsplash.com/photo-1596394516093-501ba68a0ba6?w=800',
  'villa': 'https://images.unsplash.com/photo-1512918728675-ed5a9ecdebfd?w=800',
  'vip': 'https://images.unsplash.com/photo-1505577058444-a3dab90d4253?w=800',
  'president': 'https://images.unsplash.com/photo-1618221118493-9cfa1a1c00da?w=800',
  'tổng thống': 'https://images.unsplash.com/photo-1618221118493-9cfa1a1c00da?w=800',
  'honeymoon': 'https://images.unsplash.com/photo-1595576508898-0ad5c879a061?w=800',
  'trăng mật': 'https://images.unsplash.com/photo-1595576508898-0ad5c879a061?w=800',
  'bungalow': 'https://images.unsplash.com/photo-1499793983690-e29da59ef1c2?w=800',
};

// Fallback theo ID để mỗi hạng phòng luôn có ảnh khác nhau
const fallbackById = {
  1: 'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=800',
  2: 'https://images.unsplash.com/photo-1566665797739-1674de7a421a?w=800',
  3: 'https://images.unsplash.com/photo-1596394516093-501ba68a0ba6?w=800',
  4: 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=800',
  5: 'https://images.unsplash.com/photo-1578683010236-d716f9a3f461?w=800',
  6: 'https://images.unsplash.com/photo-1505577058444-a3dab90d4253?w=800',
  7: 'https://images.unsplash.com/photo-1618221118493-9cfa1a1c00da?w=800',
  8: 'https://images.unsplash.com/photo-1512918728675-ed5a9ecdebfd?w=800',
};

const getTypeImage = (rt) => {
  // 1. Ưu tiên: mảng images từ API (Cloudinary) — lấy URL hợp lệ đầu tiên
  if (Array.isArray(rt.images) && rt.images.length > 0) {
    const valid = rt.images.find(url => url && typeof url === 'string' && url.startsWith('http'));
    if (valid) return valid;
  }
  // 2. Fallback: thumbnailUrl hoặc imageUrl trên entity (nếu có)
  if (rt.thumbnailUrl && rt.thumbnailUrl.startsWith('http')) return rt.thumbnailUrl;
  if (rt.imageUrl && rt.imageUrl.startsWith('http')) return rt.imageUrl;
  // 3. Cuối cùng: ảnh tĩnh theo tên/ID
  return getLocalFallback(rt);
};

// Fallback không dùng Cloudinary — luôn trả ảnh khác nhau theo tên/ID
const getLocalFallback = (rt) => {
  const name = (rt.name || '').toLowerCase();
  const key = Object.keys(imageByTypeName).find(k => name.includes(k));
  if (key) return imageByTypeName[key];
  if (rt.id && fallbackById[rt.id]) return fallbackById[rt.id];
  return FALLBACK_IMG;
};

const CustomerRoomsPage = () => {
  const { t } = useTranslation();
  const { user } = useAdminAuthStore(); // Lấy user để check eligibility
  const [roomTypes, setRoomTypes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sortOrder, setSortOrder] = useState('default');
  const [dateRange, setDateRange] = useState(null);

  // Booking
  const [bookingModal, setBookingModal] = useState(false);
  const [selectedType, setSelectedType] = useState(null);
  const [bookingForm] = Form.useForm();
  const [submitting, setSubmitting] = useState(false);

  // Voucher
  const [voucherCode, setVoucherCode] = useState('');
  const [voucherInfo, setVoucherInfo] = useState(null);
  const [voucherLoading, setVoucherLoading] = useState(false);
  const [voucherError, setVoucherError] = useState('');

  // Detail drawer
  const [drawerType, setDrawerType] = useState(null);

  // ── REVIEW SYSTEM ────────────────────────────────────────────────────────
  // reviews: reviews thật từ API theo roomTypeId
  // eligibility: { eligible, alreadyReviewed, reason } — kết quả check quyền
  const [reviews, setReviews] = useState([]);
  const [reviewsLoading, setReviewsLoading] = useState(false);
  const [eligibility, setEligibility] = useState(null); // null = chưa check
  const [reviewForm] = Form.useForm();
  const [submittingReview, setSubmittingReview] = useState(false);
  // Dùng ref để track roomTypeId đã load reviews — tránh gọi API trùng
  const loadedReviewsForId = useRef(null);

  const fetchRoomTypes = async (dates) => {
    setLoading(true);
    try {
      let url = '/RoomTypes/availability';
      if (dates && dates[0] && dates[1]) {
        url += `?checkIn=${dates[0].format('YYYY-MM-DD')}&checkOut=${dates[1].format('YYYY-MM-DD')}`;
      }
      const res = await axiosClient.get(url);
      setRoomTypes(res.data);
    } catch (err) {
      console.error('Lỗi tải dữ liệu hạng phòng:', err);
      try {
        const res = await axiosClient.get('/RoomTypes');
        // Giữ lại imageUrl nếu entity có, KHÔNG ghi đè images: []
        setRoomTypes(res.data.map(rt => ({
          ...rt,
          availableRooms: -1,
          totalRooms: 0,
          // Nếu entity có imageUrl → wrap thành mảng để getTypeImage dùng được
          images: rt.images?.length > 0 ? rt.images
            : (rt.imageUrl ? [rt.imageUrl] : []),
          amenities: rt.amenities || []
        })));
      } catch { /* ignore */ }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchRoomTypes(null); }, []);

  // ────────────────────────────────────────────────────────────────────────
  // REVIEW SYSTEM: Khi mở Drawer với một roomType mới → fetch reviews thật
  // + kiểm tra eligibility một lần duy nhất.
  //
  // ✅ Chống infinite loop: deps chỉ là [drawerType, user]
  //    loadedReviewsForId ref giúp bỏ qua lần re-render không cần thiết
  // ────────────────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!drawerType) {
      // Drawer đóng → reset state review
      setReviews([]);
      setEligibility(null);
      reviewForm.resetFields();
      loadedReviewsForId.current = null;
      return;
    }

    // Tránh fetch lại nếu cùng roomTypeId (user scroll/click cùng phòng)
    if (loadedReviewsForId.current === drawerType.id) return;
    loadedReviewsForId.current = drawerType.id;

    const roomTypeId = drawerType.id;

    // Fetch reviews thật
    const fetchReviews = async () => {
      setReviewsLoading(true);
      try {
        const res = await axiosClient.get(`/Reviews/by-room-type/${roomTypeId}`);
        setReviews(res.data);
      } catch (err) {
        console.error('Lỗi tải reviews:', err);
        setReviews([]);
      } finally {
        setReviewsLoading(false);
      }
    };

    // Check eligibility (không throw nếu chưa login — API trả 200 với eligible=false)
    const fetchEligibility = async () => {
      if (!user) {
        setEligibility({ eligible: false, alreadyReviewed: false, reason: 'not_authenticated' });
        return;
      }
      try {
        const res = await axiosClient.get(`/Reviews/check-eligibility?roomTypeId=${roomTypeId}`);
        setEligibility(res.data);
      } catch (err) {
        console.error('Lỗi check eligibility:', err);
        setEligibility({ eligible: false, alreadyReviewed: false, reason: 'error' });
      }
    };

    fetchReviews();
    fetchEligibility();
  }, [drawerType, user]); // ← stable deps, không infinite loop


  const handleDateSearch = (dates) => {
    setDateRange(dates);
    fetchRoomTypes(dates);
  };

  const hasDateFilter = dateRange && dateRange[0] && dateRange[1];

  const sortedTypes = useMemo(() => {
    let result = [...roomTypes];
    if (sortOrder === 'price_asc') result.sort((a, b) => a.basePrice - b.basePrice);
    else if (sortOrder === 'price_desc') result.sort((a, b) => b.basePrice - a.basePrice);
    else if (hasDateFilter) result.sort((a, b) => (b.availableRooms || 0) - (a.availableRooms || 0));
    return result;
  }, [roomTypes, sortOrder, hasDateFilter]);

  const handleSelectType = (rt) => {
    setSelectedType(rt);
    bookingForm.resetFields();
    if (dateRange && dateRange[0] && dateRange[1]) {
      bookingForm.setFieldsValue({ dates: dateRange });
    }
    setVoucherCode(''); setVoucherInfo(null); setVoucherError('');
    setBookingModal(true);
  };

  const handleApplyVoucher = async () => {
    if (!voucherCode.trim()) { setVoucherError(t('rooms.enterVoucherCode')); return; }
    setVoucherLoading(true); setVoucherError(''); setVoucherInfo(null);
    try {
      const res = await axiosClient.get(`/Vouchers/check?code=${voucherCode.trim()}&roomTypeId=${selectedType?.id || ''}`);
      setVoucherInfo(res.data);
    } catch (err) {
      setVoucherError(err.response?.data || t('rooms.voucherInvalid'));
    } finally { setVoucherLoading(false); }
  };

  const handleBookingSubmit = async (values) => {
    if (!selectedType) return;
    setSubmitting(true);
    try {
      const response = await axiosClient.post('/Bookings/by-type', {
        guestName: values.guestName,
        guestPhone: values.phone,
        guestEmail: values.email || null,
        voucherCode: voucherInfo ? voucherCode.trim() : null,
        roomTypeId: selectedType.id,
        checkInDate: values.dates[0].format('YYYY-MM-DD'),
        checkOutDate: values.dates[1].format('YYYY-MM-DD'),
      });
      message.success(
        <span>
          🎉 {t('rooms.bookingSuccess')} {t('rooms.bookingCode')}: <b>{response.data.bookingCode}</b>
          <br />{t('rooms.bookingContact')}
        </span>, 6
      );
      setBookingModal(false);
      bookingForm.resetFields();
      setVoucherCode(''); setVoucherInfo(null); setVoucherError('');
      fetchRoomTypes(dateRange);
    } catch (error) {
      const errMsg = error.response?.data?.message || error.response?.data || t('rooms.bookingError');
      message.error(typeof errMsg === 'string' ? errMsg : t('rooms.bookingError'));
    } finally {
      setSubmitting(false);
    }
  };

  // ── Gửi đánh giá ──────────────────────────────────────────────────────────
  // Guard: eligibility đã được check phía server — không trust frontend
  const handleSubmitReview = async (values) => {
    if (!drawerType) return;
    setSubmittingReview(true);
    try {
      await axiosClient.post('/Reviews', {
        roomTypeId: drawerType.id,
        rating: values.rating,
        comment: values.comment,
      });
      message.success('🌟 Đánh giá đã được gửi thành công! Cảm ơn bạn.');
      reviewForm.resetFields();

      // Refresh reviews + eligibility sau khi submit thành công
      const [reviewsRes, eligRes] = await Promise.all([
        axiosClient.get(`/Reviews/by-room-type/${drawerType.id}`),
        axiosClient.get(`/Reviews/check-eligibility?roomTypeId=${drawerType.id}`)
      ]);
      setReviews(reviewsRes.data);
      setEligibility(eligRes.data);
    } catch (err) {
      const errData = err.response?.data;
      const errMsg = (typeof errData === 'object' && errData?.message)
        ? errData.message
        : (typeof errData === 'string' ? errData : 'Lỗi khi gửi đánh giá!');
      message.error(errMsg);
    } finally {
      setSubmittingReview(false);
    }
  };

  const getAvailabilityInfo = (rt) => {
    if (rt.availableRooms === -1 || !hasDateFilter) {
      return { type: 'total', text: `Tổng: ${rt.totalRooms} phòng`, canBook: true };
    }
    if (rt.availableRooms > 0) {
      return { type: 'available', text: `Còn ${rt.availableRooms}/${rt.totalRooms} trống`, canBook: true };
    }
    return { type: 'soldout', text: t('rooms.soldOut'), canBook: false };
  };

  const facilities = [
    { icon: <WifiOutlined />, label: 'WiFi tốc độ cao miễn phí' },
    { icon: <CarOutlined />, label: 'Bãi đỗ xe miễn phí' },
    { icon: <CoffeeOutlined />, label: 'Bữa sáng buffet' },
    { icon: <SafetyCertificateOutlined />, label: 'Két an toàn trong phòng' },
    { icon: <CustomerServiceOutlined />, label: 'Dịch vụ phòng 24/7' },
    { icon: '🏊', label: 'Hồ bơi ngoài trời' },
    { icon: '🛁', label: 'Bồn tắm sang trọng' },
    { icon: '❄️', label: 'Điều hòa nhiệt độ' },
  ];

  return (
    <div style={{ padding: '40px 20px', minHeight: '60vh', maxWidth: '1200px', margin: '0 auto' }}>
      <div style={{ textAlign: 'center', marginBottom: '40px' }}>
        <Title level={2}>{t('rooms.searchTitle')}</Title>
        <Paragraph type="secondary">{t('rooms.searchSubtitle')}</Paragraph>
        <div style={{ width: '60px', height: '4px', background: '#c9a961', margin: '0 auto', borderRadius: '2px' }} />
      </div>

      {/* SEARCH & SORT BAR */}
      <Card bodyStyle={{ padding: '16px 24px' }} style={{ marginBottom: '24px', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
        <Row justify="space-between" align="middle" gutter={[16, 16]}>
          <Col xs={24} md={14}>
            <Space size="middle" wrap>
              <Text strong><CalendarOutlined /> {t('home.checkInOut')}:</Text>
              <RangePicker
                value={dateRange}
                onChange={handleDateSearch}
                format="DD/MM/YYYY"
                placeholder={[t('home.checkIn'), t('home.checkOut')]}
                disabledDate={(current) => current && current < dayjs().startOf('day')}
                style={{ borderRadius: 8 }}
              />
              {hasDateFilter && (
                <Button size="small" onClick={() => handleDateSearch(null)} type="link" danger>{t('common.clearFilter')}</Button>
              )}
            </Space>
          </Col>
          <Col xs={24} md={10} style={{ textAlign: 'right' }}>
            <Space size="middle" wrap>
              <Text strong><SortAscendingOutlined /> {t('rooms.sortBy')}:</Text>
              <Select value={sortOrder} onChange={setSortOrder} style={{ width: 180 }}>
                <Option value="default">{t('rooms.sortDefault')}</Option>
                <Option value="price_asc">{t('rooms.sortPriceAsc')}</Option>
                <Option value="price_desc">{t('rooms.sortPriceDesc')}</Option>
              </Select>
            </Space>
          </Col>
        </Row>
        {!hasDateFilter && (
          <div style={{ marginTop: 12, padding: '8px 12px', background: '#fffbe6', borderRadius: 8, border: '1px solid #ffe58f' }}>
            <Text type="warning" style={{ fontSize: 13 }}>
              💡 Vui lòng chọn ngày Nhận phòng – Trả phòng để xem số phòng trống chính xác.
            </Text>
          </div>
        )}
      </Card>

      {/* ROOM TYPE GRID */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '50px' }}><Spin size="large" /></div>
      ) : sortedTypes.length === 0 ? (
        <Empty description={t('rooms.noRoomsFound')} style={{ marginTop: '50px' }} />
      ) : (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))',
          gap: '24px',
        }}>
          {sortedTypes.map(rt => {
            const img = getTypeImage(rt);
            const avail = getAvailabilityInfo(rt);
            return (
              <Card
                key={rt.id} hoverable
                style={{
                  borderRadius: 16, overflow: 'hidden',
                  display: 'flex', flexDirection: 'column',
                  boxShadow: '0 4px 16px rgba(0,0,0,0.08)',
                  transition: 'transform 0.2s, box-shadow 0.2s',
                }}
                bodyStyle={{ padding: 0, display: 'flex', flexDirection: 'column', flex: 1 }}
              >
                {/* Ảnh */}
                <div style={{ position: 'relative', aspectRatio: '16/10', overflow: 'hidden' }}>
                  <img alt={rt.name} src={img}
                    onError={(e) => { e.target.onerror = null; e.target.src = getLocalFallback(rt); }}
                    style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
                  <div style={{ position: 'absolute', top: 12, right: 12 }}>
                    {avail.type === 'available' && <Tag color="success" icon={<CheckCircleOutlined />} style={{ fontSize: 12, fontWeight: 600, borderRadius: 6 }}>{avail.text}</Tag>}
                    {avail.type === 'total' && <Tag color="blue" style={{ fontSize: 12, fontWeight: 600, borderRadius: 6 }}>🏨 {avail.text}</Tag>}
                    {avail.type === 'soldout' && <Tag color="error" icon={<UserOutlined />} style={{ fontSize: 12, fontWeight: 600, borderRadius: 6 }}>{avail.text}</Tag>}
                  </div>
                </div>

                {/* Nội dung */}
                <div style={{ padding: '16px 20px', display: 'flex', flexDirection: 'column', flex: 1 }}>
                  <Title level={4} style={{ marginTop: 0, marginBottom: 6 }}>{rt.name}</Title>
                  <Space wrap size={[4, 4]} style={{ marginBottom: 10 }}>
                    {rt.capacityAdults > 0 && <Tag style={{ borderRadius: 4 }}>👤 {rt.capacityAdults}</Tag>}
                    {rt.sizeSqm && <Tag style={{ borderRadius: 4 }}>{rt.sizeSqm} m²</Tag>}
                    {rt.bedType && <Tag style={{ borderRadius: 4 }}>🛏️ {rt.bedType}</Tag>}
                    {rt.viewType && <Tag style={{ borderRadius: 4 }}>🌅 {rt.viewType}</Tag>}
                  </Space>
                  <Paragraph ellipsis={{ rows: 2 }} style={{ color: '#595959', marginBottom: 12, fontSize: 13, flex: 1 }}>
                    {rt.description || t('rooms.defaultDesc')}
                  </Paragraph>

                  {/* Giá + Nút — luôn ở đáy */}
                  <div style={{ marginTop: 'auto', borderTop: '1px solid #f0f0f0', paddingTop: 14 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                      <Text type="secondary" style={{ fontSize: 12 }}>{t('rooms.pricePerNight')}</Text>
                      <Title level={4} style={{ color: '#c9a961', margin: 0 }}>{(rt.basePrice || 0).toLocaleString()}₫</Title>
                    </div>
                    <div style={{ display: 'flex', gap: 8 }}>
                      <Button type="default" block onClick={() => setDrawerType(rt)} style={{ borderRadius: 8, fontWeight: 600, flex: 1 }}>{t('common.viewDetails')}</Button>
                      <Button type="primary" block disabled={!avail.canBook} onClick={() => handleSelectType(rt)}
                        style={{ borderRadius: 8, fontWeight: 'bold', flex: 2, background: avail.canBook ? '#c9a961' : undefined, borderColor: avail.canBook ? '#c9a961' : undefined }}>
                        {avail.canBook ? t('rooms.selectRoom') : t('rooms.soldOut')}
                      </Button>
                    </div>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* ── BOOKING MODAL ────────────────────────────────────────────────── */}
      <Modal
        title={
          <div>
            <Title level={4} style={{ margin: 0, fontFamily: "'Playfair Display', serif" }}>
              {t('rooms.bookRoom')} — {selectedType?.name}
            </Title>
            <Text type="secondary">{selectedType?.name} — {selectedType?.basePrice?.toLocaleString()}₫/{t('rooms.perNight')}</Text>
          </div>
        }
        open={bookingModal}
        onCancel={() => setBookingModal(false)}
        footer={null} width={520} centered destroyOnClose
      >
        <Form form={bookingForm} layout="vertical" onFinish={handleBookingSubmit} style={{ marginTop: 16 }}>
          <Form.Item name="dates" label={<><CalendarOutlined /> {t('rooms.checkInOut')}</>} rules={[{ required: true, message: t('rooms.selectDates') }]}>
            <RangePicker size="large" style={{ width: '100%', borderRadius: 8 }} placeholder={['Check-in', 'Check-out']}
              disabledDate={(d) => d && d < dayjs().startOf('day')} />
          </Form.Item>
          <Form.Item name="guestName" label={t('rooms.fullName')} rules={[{ required: true, message: t('rooms.enterName') }]}>
            <Input size="large" prefix={<UserOutlined />} placeholder="Nguyễn Văn A" style={{ borderRadius: 8 }} />
          </Form.Item>
          <Form.Item name="phone" label={t('rooms.phone')} rules={[{ required: true, message: t('rooms.enterPhone') }]}>
            <Input size="large" prefix={<PhoneOutlined />} placeholder="0986 023 541" style={{ borderRadius: 8 }} />
          </Form.Item>
          <Form.Item name="email" label={t('rooms.email')} rules={[{ type: 'email', message: t('rooms.invalidEmail') }]}>
            <Input size="large" prefix={<MailOutlined />} placeholder="email@example.com" style={{ borderRadius: 8 }} />
          </Form.Item>

          <Divider style={{ margin: '12px 0 16px' }}>🎟️ {t('rooms.voucherSection')}</Divider>
          <div style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
            <Input size="large" prefix={<GiftOutlined style={{ color: '#c9a961' }} />}
              placeholder={t('rooms.enterVoucher')} value={voucherCode}
              onChange={e => { setVoucherCode(e.target.value); setVoucherError(''); setVoucherInfo(null); }}
              style={{ borderRadius: 8, flex: 1 }} />
            <Button size="large" loading={voucherLoading} onClick={handleApplyVoucher}
              style={{ borderRadius: 8, fontWeight: 600, borderColor: '#c9a961', color: '#c9a961' }}>
              {t('common.apply')}
            </Button>
          </div>
          {voucherError && <Alert type="error" message={voucherError} showIcon style={{ marginBottom: 12, borderRadius: 8 }} />}
          {voucherInfo && (
            <Alert type="success" showIcon style={{ marginBottom: 12, borderRadius: 8 }}
              message={`✅ Giảm ${(voucherInfo.discountType || '').toLowerCase() === 'percent' ? voucherInfo.discountValue + '%' : (voucherInfo.discountValue || 0).toLocaleString() + '₫'} — Mã: ${voucherInfo.code}`} />
          )}

          <Button type="primary" htmlType="submit" size="large" block loading={submitting}
            style={{ borderRadius: 8, background: '#c9a961', borderColor: '#c9a961', fontWeight: 'bold', height: 48, marginTop: 8 }}>
            {submitting ? t('rooms.processing') : t('rooms.confirmBooking')}
          </Button>
        </Form>
      </Modal>

      {/* ── DETAIL DRAWER ────────────────────────────────────────────────── */}
      <Drawer open={!!drawerType} onClose={() => setDrawerType(null)} placement="right" width={620} destroyOnClose title={null} bodyStyle={{ padding: 0 }}>
        {drawerType && (() => {
          const img = getTypeImage(drawerType);
          const isAvailable = (drawerType.availableRooms || 0) > 0;
          const fakeReviews = [
            { name: 'Nguyễn Minh Trí', avatar: 'https://i.pravatar.cc/40?img=11', rating: 5, comment: 'Phòng rất sang trọng, sạch sẽ và thoải mái!', date: '10/04/2026' },
            { name: 'Trần Thị Lan', avatar: 'https://i.pravatar.cc/40?img=32', rating: 4, comment: 'View đẹp, giường êm, bữa sáng ngon.', date: '05/04/2026' },
          ];
          return (
            <div>
              <div style={{ position: 'relative', height: 260, overflow: 'hidden' }}>
                <img src={img} alt={drawerType.name} onError={(e) => { e.target.src = FALLBACK_IMG; }} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, rgba(0,0,0,0.1), rgba(0,0,0,0.6))' }} />
                <div style={{ position: 'absolute', bottom: 20, left: 24 }}>
                  <Tag color="geekblue" style={{ marginBottom: 8, fontSize: 13 }}>{drawerType.name}</Tag>
                  <div style={{ color: '#fff', fontSize: 22, fontWeight: 700, textShadow: '0 1px 4px rgba(0,0,0,0.5)' }}>{drawerType.name}</div>
                  <Rate disabled allowHalf defaultValue={4.5} style={{ fontSize: 14, marginTop: 4 }} />
                </div>
                <div style={{ position: 'absolute', top: 16, right: 16 }}>
                  <Tag color={isAvailable ? 'success' : 'error'} style={{ fontSize: 13, padding: '4px 12px' }}>
                    {isAvailable ? `✅ ${t('rooms.available')}: ${drawerType.availableRooms}` : `❌ ${t('rooms.soldOut')}`}
                  </Tag>
                </div>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 24px', background: '#fffbf0', borderBottom: '1px solid #f0e9d2' }}>
                <div>
                  <Text type="secondary">{t('rooms.pricePerNightLabel')}</Text>
                  <div style={{ fontSize: 26, fontWeight: 800, color: '#c9a961' }}>{drawerType.basePrice?.toLocaleString()}₫</div>
                </div>
                <Button type="primary" size="large" disabled={!isAvailable}
                  onClick={() => { setDrawerType(null); handleSelectType(drawerType); }}
                  style={{ background: '#c9a961', borderColor: '#c9a961', fontWeight: 700, borderRadius: 8, height: 46, padding: '0 28px' }}>
                  {isAvailable ? t('rooms.bookNowBtn') : t('rooms.soldOut')}
                </Button>
              </div>
              <Tabs defaultActiveKey="overview" style={{ padding: '0 24px' }} tabBarStyle={{ fontWeight: 600 }} items={[
                { key: 'overview', label: `📋 ${t('rooms.overviewTab')}`, children: (
                  <div style={{ paddingBottom: 32 }}>
                    <Title level={5} style={{ marginTop: 16 }}>{t('rooms.roomDescription')}</Title>
                    <Paragraph style={{ color: '#555', lineHeight: 1.8, fontSize: 14 }}>
                      {drawerType.description || t('rooms.defaultDesc')}
                    </Paragraph>
                    <Row gutter={[12, 12]} style={{ marginTop: 16 }}>
                      {[
                        { label: t('rooms.roomArea'), value: drawerType.sizeSqm ? `${drawerType.sizeSqm} m²` : 'N/A' },
                        { label: t('rooms.roomBedType'), value: drawerType.bedType || 'King size' },
                        { label: t('rooms.roomCapacity'), value: `${drawerType.capacityAdults || 2} ${t('rooms.roomCapacityVal', { adults: drawerType.capacityAdults || 2, children: drawerType.capacityChildren || 0 })}` },
                        { label: t('rooms.roomView'), value: drawerType.viewType || 'City view' },
                      ].map(info => (
                        <Col span={12} key={info.label}>
                          <Card size="small" style={{ borderRadius: 10, background: '#fafafa', textAlign: 'center' }}>
                            <Text type="secondary" style={{ fontSize: 12 }}>{info.label}</Text>
                            <div style={{ fontWeight: 700, fontSize: 15, marginTop: 4 }}>{info.value}</div>
                          </Card>
                        </Col>
                      ))}
                    </Row>
                  </div>
                )},
                { key: 'facilities', label: `🏨 ${t('rooms.facilitiesTab')}`, children: (
                  <div style={{ paddingBottom: 32 }}>
                    <Row gutter={[10, 10]} style={{ marginTop: 16 }}>
                      {facilities.map((item, i) => (
                        <Col span={12} key={i}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px', background: '#f9f9f9', borderRadius: 10, border: '1px solid #f0f0f0' }}>
                            <span style={{ fontSize: 18, color: '#c9a961' }}>{item.icon}</span>
                            <Text style={{ fontSize: 13 }}>{item.label}</Text>
                          </div>
                        </Col>
                      ))}
                    </Row>
                  </div>
                )},
                { key: 'reviews', label: `⭐ Đánh giá (${reviews.length})`, children: (
                  <div style={{ paddingBottom: 32 }}>
                    {/* ─── Danh sách Reviews Thật ─────────────────────────── */}
                    {reviewsLoading ? (
                      <div style={{ textAlign: 'center', padding: 24 }}><Spin /></div>
                    ) : reviews.length === 0 ? (
                      <div style={{ textAlign: 'center', padding: '24px 0', color: '#999' }}>
                        <StarFilled style={{ fontSize: 32, color: '#faad14', marginBottom: 8 }} />
                        <div>{t('rooms.noReviews')}</div>
                      </div>
                    ) : (
                      <List
                        dataSource={reviews}
                        renderItem={rv => (
                          <List.Item style={{ padding: '16px 0', borderBottom: '1px solid #f5f5f5' }}>
                            <div style={{ width: '100%' }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
                                <Avatar
                                  src={rv.userAvatar}
                                  icon={!rv.userAvatar && <UserOutlined />}
                                  size={40}
                                  style={{ background: '#c9a961' }}
                                />
                                <div>
                                  <Text strong>{rv.userName || t('header.guest')}</Text>
                                  <div>
                                    <Rate disabled value={rv.rating} style={{ fontSize: 12 }} />
                                    <Text type="secondary" style={{ fontSize: 12, marginLeft: 6 }}>
                                      {rv.createdAt ? new Date(rv.createdAt).toLocaleDateString('vi-VN') : ''}
                                    </Text>
                                  </div>
                                </div>
                              </div>
                              <Paragraph style={{ color: '#444', margin: 0, fontStyle: 'italic', fontSize: 14 }}>
                                "{rv.comment}"
                              </Paragraph>
                            </div>
                          </List.Item>
                        )}
                      />
                    )}

                    {/* ─── Form Viết Review — CÓ GUARD ELIGIBILITY ─────────── */}
                    <div style={{ marginTop: 24, borderTop: '2px solid #f0f0f0', paddingTop: 20 }}>
                      <Title level={5} style={{ marginBottom: 12 }}>✍️ {t('rooms.writeReview')}</Title>

                      {/* Case 1: Chưa đăng nhập */}
                      {!user && (
                        <Alert
                          type="info"
                          icon={<LockOutlined />}
                          showIcon
                          message={t('rooms.loginToReview')}
                          style={{ borderRadius: 8 }}
                        />
                      )}

                      {/* Case 2: Đã đăng nhập, đang check */}
                      {user && eligibility === null && (
                        <div style={{ textAlign: 'center', padding: 12 }}><Spin size="small" tip={t('rooms.checkingEligibility')} /></div>
                      )}

                      {/* Case 3: Đã đánh giá rồi */}
                      {user && eligibility?.alreadyReviewed && (
                        <Alert
                          type="success"
                          icon={<CheckCircleOutlined />}
                          showIcon
                          message={t('rooms.alreadyReviewed')}
                          style={{ borderRadius: 8 }}
                        />
                      )}

                      {/* Case 4: Chưa đặt hoặc chưa thanh toán */}
                      {user && eligibility && !eligibility.eligible && !eligibility.alreadyReviewed && (
                        <Alert
                          type="warning"
                          icon={<LockOutlined />}
                          showIcon
                          message={t('rooms.reviewNotEligible')}
                          style={{ borderRadius: 8 }}
                        />
                      )}

                      {/* Case 5: Đủ điều kiện → Hiển thị form */}
                      {user && eligibility?.eligible && (
                        <Form
                          form={reviewForm}
                          layout="vertical"
                          onFinish={handleSubmitReview}
                        >
                          <Form.Item
                            name="rating"
                            label={t('rooms.reviewRating')}
                            rules={[{ required: true, message: t('rooms.chooseRating') }]}
                          >
                            <Rate style={{ fontSize: 28 }} />
                          </Form.Item>
                          <Form.Item
                            name="comment"
                            label={t('rooms.reviewComment')}
                            rules={[
                              { required: true, message: t('rooms.reviewMinLength') },
                              { min: 10, message: t('rooms.reviewMinLength') }
                            ]}
                          >
                            <Input.TextArea
                              rows={3}
                              placeholder={t('rooms.reviewPlaceholder')}
                              maxLength={500}
                              showCount
                              style={{ borderRadius: 8 }}
                            />
                          </Form.Item>
                          <Form.Item style={{ marginBottom: 0 }}>
                            <Button
                              type="primary" htmlType="submit"
                              loading={submittingReview}
                              icon={<SendOutlined />}
                              style={{
                                background: '#c9a961', borderColor: '#c9a961',
                                borderRadius: 8, fontWeight: 600
                              }}
                            >
                              {submittingReview ? t('rooms.sendingReview') : t('rooms.sendReview')}
                            </Button>
                          </Form.Item>
                        </Form>
                      )}
                    </div>
                  </div>
                )},
                { key: 'policy', label: `📜 ${t('rooms.policyTab')}`, children: (
                  <div style={{ paddingBottom: 32 }}>
                    {[
                      { title: `🕐 ${t('rooms.checkInOutPolicy')}`, items: [t('rooms.checkInInfo'), t('rooms.earlyCheckinInfo')] },
                      { title: `❌ ${t('rooms.cancelPolicy')}`, items: [t('rooms.cancelBefore48'), t('rooms.cancelIn24to48'), t('rooms.cancelIn24')] },
                      { title: `👶 ${t('rooms.childrenPolicy')}`, items: [t('rooms.childrenUnder6'), t('rooms.extraBed')] },
                    ].map(section => (
                      <div key={section.title} style={{ marginBottom: 20 }}>
                        <Title level={5} style={{ marginTop: 16 }}>{section.title}</Title>
                        <div style={{ background: '#fafafa', borderRadius: 10, padding: '12px 16px', border: '1px solid #f0f0f0' }}>
                          {section.items.map((item, i) => (
                            <div key={i} style={{ display: 'flex', gap: 8, marginBottom: i < section.items.length - 1 ? 8 : 0 }}>
                              <CheckCircleOutlined style={{ color: '#c9a961', marginTop: 3 }} />
                              <Text style={{ color: '#555', fontSize: 14 }}>{item}</Text>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                )},
              ]} />
            </div>
          );
        })()}
      </Drawer>
    </div>
  );
};

export default CustomerRoomsPage;
