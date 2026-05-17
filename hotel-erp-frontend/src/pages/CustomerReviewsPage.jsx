import React, { useState, useEffect, useMemo } from 'react';
import {
  Typography, Card, Row, Col, Rate, Button, Avatar,
  Space, Tag, Empty, Pagination, Select, Spin, Alert,
  Progress, Form, Input, App, Divider
} from 'antd';
import {
  UserOutlined, StarFilled, ClockCircleOutlined,
  CheckCircleOutlined, LockOutlined, CalendarOutlined,
  ArrowRightOutlined, TrophyOutlined, FilterOutlined, SendOutlined
} from '@ant-design/icons';
import { useAdminAuthStore } from '../store/adminAuthStore';
import { useNavigate } from 'react-router-dom';
import axiosClient from '../api/axiosClient';
import { useReviewStore } from '../store/useReviewStore';

const { Title, Text, Paragraph } = Typography;
const { TextArea } = Input;

// ── Phân loại role ───────────────────────────────────────
const PRIVILEGED_ROLES = ['admin', 'manager', 'receptionist', 'lễ tân'];
const BLOCKED_ROLES    = ['housekeeping', 'buồng phòng'];

const getUserRole      = (u) => (u?.role || u?.Role || '').toLowerCase();
const isPrivileged     = (u) => PRIVILEGED_ROLES.includes(getUserRole(u));
const isBlocked        = (u) => BLOCKED_ROLES.includes(getUserRole(u));

// ── Chuẩn hóa dữ liệu ────────────────────────────────────
const normalizeLocal = (r) => ({
  id: `local_${r.id}`,
  userName:     r.name    || 'Khách hàng',
  userAvatar:   r.avatar  || null,
  rating:       r.rating,
  roomTypeName: r.room    || '',
  comment:      r.content || '',
  createdAt: (() => {
    if (!r.date) return new Date().toISOString();
    const p = r.date.split('/');
    return p.length === 3
      ? new Date(`${p[2]}-${p[1]}-${p[0]}`).toISOString()
      : r.date;
  })(),
});

const normalizeApi = (r) => ({
  id: `api_${r.id}`,
  userName:     r.userName     || 'Khách hàng',
  userAvatar:   r.userAvatar   || null,
  rating:       r.rating,
  roomTypeName: r.roomTypeName || '',
  comment:      r.comment      || '',
  createdAt:    r.createdAt    || new Date().toISOString(),
});

// ── ReviewCard ────────────────────────────────────────────
const ReviewCard = ({ review }) => (
  <Card
    style={{ borderRadius: 12, boxShadow: '0 2px 8px rgba(0,0,0,0.05)', border: '1px solid #f0f0f0' }}
    bodyStyle={{ padding: '20px 24px' }}
  >
    <div style={{ display: 'flex', gap: 16 }}>
      <Avatar
        size={48} src={review.userAvatar}
        icon={!review.userAvatar && <UserOutlined />}
        style={{ background: '#c9a961', flexShrink: 0 }}
      />
      <div style={{ flex: 1 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8 }}>
          <div>
            <Text strong style={{ fontSize: 16, display: 'block' }}>{review.userName}</Text>
            <Space size="small" style={{ marginTop: 4 }}>
              <Rate disabled allowHalf defaultValue={review.rating} style={{ fontSize: 13 }} />
              {review.roomTypeName && (
                <Tag color="gold" style={{ borderRadius: 8 }}>{review.roomTypeName}</Tag>
              )}
            </Space>
          </div>
          <Text type="secondary" style={{ fontSize: 13 }}>
            <ClockCircleOutlined style={{ marginRight: 4 }} />
            {new Date(review.createdAt).toLocaleDateString('vi-VN')}
          </Text>
        </div>
        <p style={{ marginTop: 12, marginBottom: 0, color: '#444', fontSize: 15, lineHeight: 1.8 }}>
          {review.comment}
        </p>
      </div>
    </div>
  </Card>
);

// ── RatingBar ─────────────────────────────────────────────
const RatingBar = ({ star, count, total }) => {
  const pct = total > 0 ? Math.round((count / total) * 100) : 0;
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
      <Text style={{ width: 32, textAlign: 'right', color: '#595959' }}>{star}★</Text>
      <Progress
        percent={pct} showInfo={false}
        strokeColor="#c9a961" trailColor="#f0f0f0"
        style={{ flex: 1, margin: 0 }}
      />
      <Text type="secondary" style={{ width: 28, fontSize: 12 }}>{count}</Text>
    </div>
  );
};

// ── MAIN PAGE ─────────────────────────────────────────────
const CustomerReviewsPage = () => {
  const { user }   = useAdminAuthStore();
  const navigate   = useNavigate();
  const { notification } = App.useApp();
  const [form]     = Form.useForm();

  const localStoreReviews = useReviewStore(state => state.reviews);

  const [apiReviews,   setApiReviews]   = useState([]);
  const [roomTypes,    setRoomTypes]    = useState([]);
  const [loading,      setLoading]      = useState(true);
  const [submitting,   setSubmitting]   = useState(false);
  const [myReviewedIds, setMyReviewedIds] = useState([]);

  // Trạng thái kiểm tra quyền cho Guest
  const [eligibility,        setEligibility]        = useState('idle');
  const [completedBookings,  setCompletedBookings]  = useState(0);

  const [currentPage,  setCurrentPage]  = useState(1);
  const [ratingFilter, setRatingFilter] = useState('all');
  const pageSize = 6;

  // ── Fetch reviews (public) ───────────────────────────────
  const fetchReviews = async () => {
    try {
      const res = await axiosClient.get('/Reviews');
      setApiReviews(res.data || []);
    } catch { setApiReviews([]); }
  };

  // ── Fetch room types (cho form của privileged) ───────────
  const fetchRoomTypes = async () => {
    try {
      const res = await axiosClient.get('/RoomTypes');
      setRoomTypes(res.data || []);
    } catch { setRoomTypes([]); }
  };

  // ── Fetch reviewed IDs của user hiện tại ────────────────
  const fetchMyReviewed = async () => {
    if (!user) return;
    try {
      const res = await axiosClient.get('/Reviews/my-bookings');
      setMyReviewedIds(res.data.reviewedRoomTypeIds || []);
    } catch { setMyReviewedIds([]); }
  };

  useEffect(() => {
    const init = async () => {
      setLoading(true);
      await fetchReviews();
      if (user) {
        if (isPrivileged(user)) {
          await fetchRoomTypes();
          await fetchMyReviewed();
          setEligibility('privileged');
        } else if (isBlocked(user)) {
          setEligibility('blocked');
        } else {
          // Guest — kiểm tra booking
          try {
            const res = await axiosClient.get('/Reviews/my-bookings');
            const done = (res.data.bookings || []).filter(
              b => b.status === 'Completed' || b.status === 'CheckedOut'
            );
            setMyReviewedIds(res.data.reviewedRoomTypeIds || []);
            setCompletedBookings(done.length);
            setEligibility(done.length > 0 ? 'canReview' : 'noBooking');
          } catch { setEligibility('noBooking'); }
        }
      } else {
        setEligibility('notLoggedIn');
      }
      setLoading(false);
    };
    init();
  }, [user]);

  // ── Gộp reviews để hiển thị ─────────────────────────────
  const reviews = useMemo(() => {
    const api   = apiReviews.map(normalizeApi);
    const local = localStoreReviews.filter(r => !r.isHidden).map(normalizeLocal);
    return [...api, ...local].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  }, [apiReviews, localStoreReviews]);

  // ── Thống kê ─────────────────────────────────────────────
  const avgRating = useMemo(() => {
    if (!reviews.length) return 0;
    return (reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(1);
  }, [reviews]);

  const ratingCounts = useMemo(() => {
    const c = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    reviews.forEach(r => { const s = Math.round(r.rating); if (c[s] !== undefined) c[s]++; });
    return c;
  }, [reviews]);

  const satisfiedPct = reviews.length > 0
    ? Math.round(reviews.filter(r => r.rating >= 4).length / reviews.length * 100) : 0;

  // ── Filter + phân trang ──────────────────────────────────
  const filtered = useMemo(() => {
    if (ratingFilter === 'all') return reviews;
    return reviews.filter(r => Math.round(r.rating) === parseInt(ratingFilter));
  }, [reviews, ratingFilter]);

  const currentReviews = useMemo(() => {
    const s = (currentPage - 1) * pageSize;
    return filtered.slice(s, s + pageSize);
  }, [filtered, currentPage]);

  // ── Gửi đánh giá (chỉ privileged dùng form này) ─────────
  const handleSubmit = async (values) => {
    setSubmitting(true);
    try {
      await axiosClient.post('/Reviews', {
        roomTypeId: values.roomTypeId,
        rating:     values.rating,
        comment:    values.comment,
      });
      notification.success({
        message: '🌟 Gửi đánh giá thành công!',
        description: 'Cảm ơn bạn đã đánh giá.',
        placement: 'topRight',
      });
      form.resetFields();
      await fetchReviews();
      await fetchMyReviewed();
    } catch (err) {
      const msg = err.response?.data?.message || err.response?.data || 'Có lỗi xảy ra.';
      notification.error({
        message: 'Gửi thất bại',
        description: typeof msg === 'string' ? msg : 'Vui lòng thử lại.',
        placement: 'topRight',
      });
    } finally {
      setSubmitting(false);
    }
  };

  // ── Form đánh giá cho Privileged staff ───────────────────
  const renderStaffForm = () => (
    <Card
      style={{
        borderRadius: 16, marginBottom: 36,
        border: '1px solid #91caff',
        background: 'linear-gradient(135deg, #e6f7ff 0%, #f0f5ff 100%)',
        boxShadow: '0 4px 16px rgba(22,119,255,0.08)'
      }}
      bodyStyle={{ padding: '28px 36px' }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
        <StarFilled style={{ fontSize: 24, color: '#1677ff' }} />
        <div>
          <Text strong style={{ fontSize: 17, color: '#003eb3', display: 'block' }}>
            Viết đánh giá — Không cần điều kiện
          </Text>
          <Text type="secondary" style={{ fontSize: 13 }}>
            Quyền hạn: Admin / Manager / Lễ Tân
          </Text>
        </div>
      </div>

      <Form form={form} layout="vertical" onFinish={handleSubmit}>
        <Row gutter={16}>
          <Col xs={24} md={10}>
            <Form.Item
              name="roomTypeId"
              label="Hạng phòng"
              rules={[{ required: true, message: 'Vui lòng chọn hạng phòng!' }]}
            >
              <Select
                placeholder="Chọn hạng phòng..."
                size="large"
                options={roomTypes.map(rt => ({
                  value: rt.id,
                  label: rt.name,
                  disabled: myReviewedIds.includes(rt.id),
                }))}
                optionRender={(opt) => (
                  <Space>
                    {opt.data.disabled
                      ? <Tag icon={<CheckCircleOutlined />} color="success" style={{ fontSize: 12 }}>Đã đánh giá</Tag>
                      : null}
                    {opt.label}
                  </Space>
                )}
              />
            </Form.Item>
          </Col>
          <Col xs={24} md={6}>
            <Form.Item
              name="rating"
              label="Số sao"
              rules={[{ required: true, message: 'Chọn số sao!' }]}
            >
              <Rate style={{ fontSize: 28 }} />
            </Form.Item>
          </Col>
        </Row>

        <Form.Item
          name="comment"
          label="Nhận xét"
          rules={[
            { required: true, message: 'Vui lòng viết nhận xét!' },
            { min: 10, message: 'Tối thiểu 10 ký tự.' }
          ]}
        >
          <TextArea
            rows={3}
            placeholder="Chia sẻ nhận xét về hạng phòng này..."
            maxLength={500}
            showCount
            style={{ borderRadius: 8 }}
          />
        </Form.Item>

        <Form.Item style={{ marginBottom: 0, textAlign: 'right' }}>
          <Button
            type="primary"
            htmlType="submit"
            loading={submitting}
            icon={<SendOutlined />}
            size="large"
            style={{ borderRadius: 8, padding: '0 32px', fontWeight: 600 }}
          >
            {submitting ? 'Đang gửi...' : 'Gửi đánh giá'}
          </Button>
        </Form.Item>
      </Form>
    </Card>
  );

  // ── Banner theo trạng thái (Guest) ───────────────────────
  const renderGuestBanner = () => {
    switch (eligibility) {
      case 'notLoggedIn':
        return (
          <Card
            style={{
              borderRadius: 16, marginBottom: 36,
              background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)',
              border: 'none', boxShadow: '0 8px 32px rgba(0,0,0,0.15)'
            }}
            bodyStyle={{ padding: '32px 40px' }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 20 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
                <div style={{
                  width: 56, height: 56, borderRadius: '50%',
                  background: 'rgba(201,169,97,0.15)', display: 'flex',
                  alignItems: 'center', justifyContent: 'center', flexShrink: 0
                }}>
                  <LockOutlined style={{ fontSize: 24, color: '#c9a961' }} />
                </div>
                <div>
                  <Text strong style={{ fontSize: 18, color: '#fff', display: 'block' }}>
                    Đăng nhập để chia sẻ trải nghiệm
                  </Text>
                  <Text style={{ color: 'rgba(255,255,255,0.6)', fontSize: 14 }}>
                    Chỉ khách đã lưu trú mới có thể gửi đánh giá chân thực
                  </Text>
                </div>
              </div>
              <Button
                type="primary" size="large"
                onClick={() => navigate('/login')}
                style={{ background: '#c9a961', borderColor: '#c9a961', borderRadius: 10, fontWeight: 700, height: 48, padding: '0 32px' }}
              >
                Đăng nhập ngay →
              </Button>
            </div>
          </Card>
        );

      case 'blocked':
        return (
          <Alert
            message="Bộ phận buồng phòng không được phép gửi đánh giá"
            description="Chỉ Admin, Manager, Lễ Tân và khách hàng đã hoàn thành lưu trú mới có thể đánh giá."
            type="warning" showIcon icon={<LockOutlined />}
            style={{ borderRadius: 12, marginBottom: 36 }}
          />
        );

      case 'noBooking':
        return (
          <Card
            style={{
              borderRadius: 16, marginBottom: 36,
              background: 'linear-gradient(135deg, #f6ffed 0%, #e6fffb 100%)',
              border: '1px solid #b7eb8f'
            }}
            bodyStyle={{ padding: '28px 36px' }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 20 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                <CalendarOutlined style={{ fontSize: 32, color: '#52c41a' }} />
                <div>
                  <Text strong style={{ fontSize: 16, display: 'block', color: '#237804' }}>
                    Hãy đặt phòng và trải nghiệm để đánh giá!
                  </Text>
                  <Text type="secondary" style={{ fontSize: 13 }}>
                    Bạn chưa có lượt lưu trú nào hoàn thành. Đánh giá được gửi sau khi trả phòng.
                  </Text>
                </div>
              </div>
              <Button
                size="large" onClick={() => navigate('/rooms')}
                style={{ borderColor: '#52c41a', color: '#237804', borderRadius: 10, fontWeight: 600, height: 44 }}
                icon={<ArrowRightOutlined />}
              >
                Xem phòng ngay
              </Button>
            </div>
          </Card>
        );

      case 'canReview':
        return (
          <Card
            style={{
              borderRadius: 16, marginBottom: 36,
              background: 'linear-gradient(135deg, #fffbe6 0%, #fff7e6 100%)',
              border: '1px solid #ffd666'
            }}
            bodyStyle={{ padding: '28px 36px' }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 20 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                <TrophyOutlined style={{ fontSize: 32, color: '#faad14' }} />
                <div>
                  <Text strong style={{ fontSize: 16, display: 'block', color: '#ad6800' }}>
                    Bạn có thể viết đánh giá!
                  </Text>
                  <Text type="secondary" style={{ fontSize: 13 }}>
                    Bạn đã hoàn thành <strong>{completedBookings}</strong> lượt lưu trú. Chia sẻ cảm nhận nhé!
                  </Text>
                </div>
              </div>
              <Button
                type="primary" size="large"
                onClick={() => navigate('/my-bookings')}
                style={{ background: '#c9a961', borderColor: '#c9a961', borderRadius: 10, fontWeight: 700, height: 48, padding: '0 32px' }}
                icon={<StarFilled />}
              >
                Viết đánh giá
              </Button>
            </div>
          </Card>
        );

      default:
        return null;
    }
  };

  // ── RENDER ────────────────────────────────────────────────
  return (
    <div style={{ maxWidth: 960, margin: '0 auto', padding: '40px 20px' }}>

      {/* HEADER */}
      <div style={{ textAlign: 'center', marginBottom: 48 }}>
        <Title level={2} style={{ marginBottom: 8 }}>⭐ Đánh Giá Khách Sạn</Title>
        <Paragraph type="secondary" style={{ fontSize: 16, marginBottom: 0 }}>
          Cảm nhận chân thực từ những vị khách đã lưu trú tại The Royal Citadel
        </Paragraph>
        <div style={{ width: 60, height: 4, background: '#c9a961', margin: '16px auto 0', borderRadius: 2 }} />
      </div>

      {/* THỐNG KÊ */}
      {!loading && reviews.length > 0 && (
        <Card
          style={{
            borderRadius: 20, marginBottom: 40, border: 'none',
            background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)',
            boxShadow: '0 12px 40px rgba(0,0,0,0.15)'
          }}
          bodyStyle={{ padding: '32px 40px' }}
        >
          <Row gutter={[40, 24]} align="middle">
            <Col xs={24} md={8} style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '4rem', fontWeight: 900, color: '#c9a961', lineHeight: 1 }}>{avgRating}</div>
              <Rate disabled defaultValue={parseFloat(avgRating)} allowHalf style={{ fontSize: 18, color: '#fadb14', margin: '8px 0' }} />
              <div style={{ color: 'rgba(255,255,255,0.6)', fontSize: 13 }}>{reviews.length} đánh giá</div>
            </Col>
            <Col xs={24} md={8}>
              <div style={{ padding: '0 16px' }}>
                {[5, 4, 3, 2, 1].map(s => (
                  <RatingBar key={s} star={s} count={ratingCounts[s]} total={reviews.length} />
                ))}
              </div>
            </Col>
            <Col xs={24} md={8} style={{ textAlign: 'center' }}>
              <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: 13, marginBottom: 8 }}>Khách hài lòng (4★+)</div>
              <Progress
                type="circle"
                percent={satisfiedPct}
                strokeColor={{ '0%': '#c9a961', '100%': '#fadb14' }}
                trailColor="rgba(255,255,255,0.1)"
                format={pct => <span style={{ color: '#c9a961', fontWeight: 800, fontSize: 22 }}>{pct}%</span>}
                size={110}
              />
              <div style={{ marginTop: 8 }}>
                <Tag icon={<CheckCircleOutlined />} color="gold" style={{ borderRadius: 10 }}>Đáng tin cậy</Tag>
              </div>
            </Col>
          </Row>
        </Card>
      )}

      {/* FORM PRIVILEGED STAFF — hiện ngay, không cần điều kiện */}
      {eligibility === 'privileged' && renderStaffForm()}

      {/* BANNER CHO GUEST */}
      {eligibility !== 'privileged' && renderGuestBanner()}

      {/* DANH SÁCH */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24, flexWrap: 'wrap', gap: 12 }}>
        <Title level={4} style={{ margin: 0 }}>
          💬 Đánh giá từ khách hàng ({filtered.length})
        </Title>
        <Select
          value={ratingFilter}
          style={{ width: 170 }}
          onChange={(v) => { setRatingFilter(v); setCurrentPage(1); }}
          suffixIcon={<FilterOutlined />}
          options={[
            { value: 'all', label: 'Tất cả số sao' },
            { value: '5',   label: '⭐⭐⭐⭐⭐  5 Sao' },
            { value: '4',   label: '⭐⭐⭐⭐  4 Sao'  },
            { value: '3',   label: '⭐⭐⭐  3 Sao'   },
            { value: '2',   label: '⭐⭐  2 Sao'     },
            { value: '1',   label: '⭐  1 Sao'       },
          ]}
        />
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: 60 }}>
          <Spin size="large" />
          <Paragraph type="secondary" style={{ marginTop: 16 }}>Đang tải đánh giá...</Paragraph>
        </div>
      ) : filtered.length === 0 ? (
        <Empty
          image={Empty.PRESENTED_IMAGE_SIMPLE}
          description={
            <Text type="secondary" style={{ fontSize: 15 }}>
              {ratingFilter === 'all'
                ? 'Chưa có đánh giá nào. Hãy là người đầu tiên!'
                : `Không có đánh giá ${ratingFilter} sao.`}
            </Text>
          }
          style={{ margin: '40px 0' }}
        />
      ) : (
        <Space direction="vertical" size="middle" style={{ width: '100%' }}>
          {currentReviews.map(r => <ReviewCard key={r.id} review={r} />)}
        </Space>
      )}

      {filtered.length > pageSize && (
        <div style={{ textAlign: 'center', marginTop: 36 }}>
          <Pagination
            current={currentPage} pageSize={pageSize} total={filtered.length}
            onChange={(p) => { setCurrentPage(p); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
            showSizeChanger={false}
          />
        </div>
      )}
    </div>
  );
};

export default CustomerReviewsPage;
