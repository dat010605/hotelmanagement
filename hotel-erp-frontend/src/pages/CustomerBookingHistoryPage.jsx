import React, { useState, useEffect } from 'react';
import {
  Card, Table, Tag, Button, Space, Typography, message,
  Modal, Rate, Input, Form, Empty, Spin, Divider, Badge, Alert
} from 'antd';
import {
  HistoryOutlined, StarOutlined, CalendarOutlined,
  CheckCircleOutlined, CloseCircleOutlined, ClockCircleOutlined,
  StarFilled, SendOutlined, LogoutOutlined
} from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import axiosClient from '../api/axiosClient';
import { useAdminAuthStore } from '../store/adminAuthStore';
import { useNavigate } from 'react-router-dom';
import dayjs from 'dayjs';

const { Title, Text, Paragraph } = Typography;
const { TextArea } = Input;

const CustomerBookingHistoryPage = () => {
  const { t } = useTranslation();
  const { user } = useAdminAuthStore();
  const navigate = useNavigate();
  const [bookings, setBookings] = useState([]);
  const [reviewedRoomTypeIds, setReviewedRoomTypeIds] = useState([]);
  const [loading, setLoading] = useState(true);

  // Review Modal
  const [reviewModal, setReviewModal] = useState(null);
  const [reviewForm] = Form.useForm();
  const [submittingReview, setSubmittingReview] = useState(false);

  const fetchData = async () => {
    if (!user) {
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const res = await axiosClient.get('/Reviews/my-bookings');
      setBookings(res.data.bookings || []);
      setReviewedRoomTypeIds(res.data.reviewedRoomTypeIds || []);
    } catch (err) {
      console.error('Lỗi tải lịch sử:', err);
      if (err.response?.status === 401) {
        message.warning(t('bookingHistory.loginWarning'));
      } else {
        message.error(t('bookingHistory.loadError'));
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [user]);

  const handleSubmitReview = async (values) => {
    if (!reviewModal) return;
    setSubmittingReview(true);
    try {
      await axiosClient.post('/Reviews', {
        roomTypeId: reviewModal.roomTypeId,
        rating: values.rating,
        comment: values.comment,
      });
      message.success(t('bookingHistory.reviewSuccess'));
      setReviewModal(null);
      reviewForm.resetFields();
      fetchData();
    } catch (err) {
      const errMsg = err.response?.data?.message || err.response?.data || t('bookingHistory.reviewError');
      message.error(typeof errMsg === 'string' ? errMsg : t('bookingHistory.reviewError'));
    } finally {
      setSubmittingReview(false);
    }
  };

  const handleCheckOut = async (bookingId) => {
    try {
      await axiosClient.patch(`/Bookings/${bookingId}/request-checkout`);
      message.info(t('bookingHistory.checkoutRedirecting'));
      navigate(`/customer-checkout/${bookingId}`);
    } catch (err) {
      message.error(err.response?.data?.message || err.response?.data || t('bookingHistory.checkoutError'));
    }
  };

  const getStatusTag = (status) => {
    switch (status) {
      case 'Completed':
      case 'CheckedOut':
        return <Tag icon={<CheckCircleOutlined />} color="success">{t('bookingHistory.statusCompleted')}</Tag>;
      case 'PendingCheckout':
        return <Tag icon={<ClockCircleOutlined />} color="warning">{t('bookingHistory.statusPendingCheckout')}</Tag>;
      case 'CheckedIn':
        return <Tag icon={<ClockCircleOutlined />} color="processing">{t('bookingHistory.statusCheckedIn')}</Tag>;
      case 'Cancelled':
        return <Tag icon={<CloseCircleOutlined />} color="error">{t('bookingHistory.statusCancelled')}</Tag>;
      case 'Pending':
        return <Tag icon={<ClockCircleOutlined />} color="warning">{t('bookingHistory.statusPending')}</Tag>;
      default:
        return <Tag color="default">{status}</Tag>;
    }
  };

  const isCompleted = (status) => status === 'Completed' || status === 'CheckedOut';

  if (!user) {
    return (
      <div style={{ maxWidth: 800, margin: '60px auto', textAlign: 'center', padding: '0 20px' }}>
        <Empty
          description={
            <div>
              <Title level={4}>{t('bookingHistory.loginRequired')}</Title>
              <Paragraph type="secondary">{t('bookingHistory.loginRequiredDesc')}</Paragraph>
            </div>
          }
        >
          <Button type="primary" size="large" onClick={() => navigate('/login')}>
            {t('bookingHistory.loginBtn')}
          </Button>
        </Empty>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 1000, margin: '40px auto', padding: '0 20px' }}>
      {/* Header */}
      <div style={{ textAlign: 'center', marginBottom: 40 }}>
        <Title level={2}>
          <HistoryOutlined style={{ marginRight: 12 }} />
          {t('bookingHistory.title')}
        </Title>
        <Paragraph type="secondary" style={{ fontSize: 16 }}>
          {t('bookingHistory.subtitle')}
        </Paragraph>
        <div style={{ width: 60, height: 4, background: '#c9a961', margin: '12px auto 0', borderRadius: 2 }} />
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: 80 }}>
          <Spin size="large" />
          <Paragraph type="secondary" style={{ marginTop: 16 }}>{t('bookingHistory.loading')}</Paragraph>
        </div>
      ) : bookings.length === 0 ? (
        <Empty
          description={
            <div>
              <Title level={4} type="secondary">{t('bookingHistory.noBookings')}</Title>
              <Paragraph type="secondary">{t('bookingHistory.noBookingsDesc')}</Paragraph>
            </div>
          }
        >
          <Button type="primary" size="large" onClick={() => navigate('/rooms')}>
            {t('bookingHistory.bookNowBtn')}
          </Button>
        </Empty>
      ) : (
        <Space direction="vertical" size="large" style={{ width: '100%' }}>
          {bookings.map(booking => {
            const completed = isCompleted(booking.status);
            return (
              <Card
                key={booking.id}
                style={{
                  borderRadius: 16,
                  border: completed ? '1px solid #b7eb8f' : '1px solid #f0f0f0',
                  boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
                }}
                bodyStyle={{ padding: 0 }}
              >
                {/* Header */}
                <div style={{
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                  padding: '16px 24px',
                  background: completed
                    ? 'linear-gradient(135deg, #f6ffed, #e6fffb)'
                    : '#fafafa',
                  borderRadius: '16px 16px 0 0',
                  borderBottom: '1px solid #f0f0f0',
                }}>
                  <div>
                    <Text strong style={{ fontSize: 16 }}>
                      {t('bookingHistory.orderLabel')} <Text style={{ color: '#1890ff', fontWeight: 700 }}>{booking.bookingCode}</Text>
                    </Text>
                    {booking.guestName && (
                      <Text type="secondary" style={{ marginLeft: 16 }}>{booking.guestName}</Text>
                    )}
                  </div>
                  <Space>
                    {getStatusTag(booking.status)}
                    {(booking.status === 'CheckedIn') && (
                      <Button
                        type="primary" danger size="small"
                        icon={<LogoutOutlined />}
                        onClick={() => handleCheckOut(booking.id)}
                        style={{ borderRadius: 6, fontWeight: 600 }}
                      >
                        {t('bookingHistory.checkOutBtn')}
                      </Button>
                    )}
                    {(booking.status === 'PendingCheckout') && (
                      <Button
                        type="primary" size="small"
                        icon={<LogoutOutlined />}
                        onClick={() => navigate(`/customer-checkout/${booking.id}`)}
                        style={{ borderRadius: 6, fontWeight: 600, background: '#fa8c16', borderColor: '#fa8c16' }}
                      >
                        {t('bookingHistory.payNowBtn')}
                      </Button>
                    )}
                  </Space>
                </div>

                {/* Room List */}
                <div style={{ padding: '16px 24px' }}>
                  <Table
                    dataSource={booking.rooms}
                    rowKey="id"
                    pagination={false}
                    size="small"
                    columns={[
                      {
                        title: t('bookingHistory.colRoom'),
                        dataIndex: 'roomNumber',
                        render: (r) => <Text strong>{t('bookingHistory.colRoomPrefix')} {r}</Text>,
                        width: 120,
                      },
                      {
                        title: t('bookingHistory.colRoomType'),
                        dataIndex: 'roomTypeName',
                        render: (name) => <Tag color="blue">{name}</Tag>,
                      },
                      {
                        title: t('bookingHistory.colStayPeriod'),
                        render: (_, r) => (
                          <Text>
                            <CalendarOutlined style={{ marginRight: 6, color: '#c9a961' }} />
                            {dayjs(r.checkInDate).format('DD/MM/YYYY')} – {dayjs(r.checkOutDate).format('DD/MM/YYYY')}
                          </Text>
                        ),
                      },
                      {
                        title: t('bookingHistory.colPricePerNight'),
                        dataIndex: 'pricePerNight',
                        render: (p) => <Text type="danger" strong>{p?.toLocaleString()}₫</Text>,
                        width: 130,
                        align: 'right',
                      },
                      ...(completed ? [{
                        title: t('bookingHistory.colReview'),
                        key: 'review',
                        width: 160,
                        align: 'center',
                        render: (_, r) => {
                          const alreadyReviewed = reviewedRoomTypeIds.includes(r.roomTypeId);
                          if (alreadyReviewed) {
                            return (
                              <Tag icon={<CheckCircleOutlined />} color="success">
                                {t('bookingHistory.alreadyReviewed')}
                              </Tag>
                            );
                          }
                          return (
                            <Button
                              type="primary"
                              size="small"
                              icon={<StarOutlined />}
                              onClick={() => {
                                setReviewModal({
                                  roomTypeId: r.roomTypeId,
                                  roomTypeName: r.roomTypeName,
                                  bookingCode: booking.bookingCode,
                                });
                                reviewForm.resetFields();
                              }}
                              style={{
                                background: '#c9a961', borderColor: '#c9a961',
                                borderRadius: 6, fontWeight: 600,
                              }}
                            >
                              {t('bookingHistory.reviewBtn')}
                            </Button>
                          );
                        },
                      }] : []),
                    ]}
                  />
                </div>
              </Card>
            );
          })}
        </Space>
      )}

      {/* ── REVIEW MODAL ─────────────────────────────────────────────── */}
      <Modal
        title={
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <StarFilled style={{ color: '#faad14', fontSize: 20 }} />
              <Title level={4} style={{ margin: 0 }}>{t('bookingHistory.reviewModalTitle')}</Title>
            </div>
            {reviewModal && (
              <div style={{ marginTop: 8 }}>
                <Tag color="blue">{reviewModal.roomTypeName}</Tag>
                <Text type="secondary">{t('bookingHistory.reviewOrderLabel')} {reviewModal.bookingCode}</Text>
              </div>
            )}
          </div>
        }
        open={!!reviewModal}
        onCancel={() => setReviewModal(null)}
        footer={null}
        width={500}
        centered
        destroyOnClose
      >
        <Form
          form={reviewForm}
          layout="vertical"
          onFinish={handleSubmitReview}
          style={{ marginTop: 16 }}
        >
          <Form.Item
            name="rating"
            label={t('bookingHistory.reviewRatingLabel')}
            rules={[{ required: true, message: t('bookingHistory.reviewRatingRequired') }]}
          >
            <Rate
              allowHalf={false}
              style={{ fontSize: 36 }}
              character={({ index, value }) => {
                const filled = index < value;
                return (
                  <StarFilled
                    style={{
                      color: filled ? '#faad14' : '#e8e8e8',
                      transition: 'all 0.2s',
                      cursor: 'pointer',
                    }}
                  />
                );
              }}
            />
          </Form.Item>

          <Form.Item
            name="comment"
            label={t('bookingHistory.reviewCommentLabel')}
            rules={[
              { required: true, message: t('bookingHistory.reviewCommentRequired') },
              { min: 10, message: t('bookingHistory.reviewCommentMin') }
            ]}
          >
            <TextArea
              rows={4}
              placeholder={t('bookingHistory.reviewCommentPlaceholder')}
              maxLength={500}
              showCount
              style={{ borderRadius: 8 }}
            />
          </Form.Item>

          <Alert
            message={t('bookingHistory.reviewNote')}
            type="info"
            showIcon
            style={{ marginBottom: 16, borderRadius: 8 }}
          />

          <Form.Item style={{ marginBottom: 0, textAlign: 'right' }}>
            <Space>
              <Button onClick={() => setReviewModal(null)}>{t('bookingHistory.reviewCancelBtn')}</Button>
              <Button
                type="primary"
                htmlType="submit"
                loading={submittingReview}
                icon={<SendOutlined />}
                style={{
                  background: '#c9a961', borderColor: '#c9a961',
                  borderRadius: 8, fontWeight: 600,
                }}
              >
                {submittingReview ? t('bookingHistory.reviewSubmitting') : t('bookingHistory.reviewSubmitBtn')}
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default CustomerBookingHistoryPage;
