import React, { useState, useEffect } from 'react';
import {
  Card, Table, Tag, Button, Space, Typography, message,
  Modal, Rate, Input, Form, Empty, Spin, Divider, Badge, Alert
} from 'antd';
import {
  HistoryOutlined, StarOutlined, CalendarOutlined,
  CheckCircleOutlined, CloseCircleOutlined, ClockCircleOutlined,
  StarFilled, SendOutlined
} from '@ant-design/icons';
import axiosClient from '../api/axiosClient';
import { useAdminAuthStore } from '../store/adminAuthStore';
import { useNavigate } from 'react-router-dom';
import dayjs from 'dayjs';

const { Title, Text, Paragraph } = Typography;
const { TextArea } = Input;

const CustomerBookingHistoryPage = () => {
  const { user } = useAdminAuthStore();
  const navigate = useNavigate();
  const [bookings, setBookings] = useState([]);
  const [reviewedRoomTypeIds, setReviewedRoomTypeIds] = useState([]);
  const [loading, setLoading] = useState(true);

  // Review Modal
  const [reviewModal, setReviewModal] = useState(null); // { roomTypeId, roomTypeName, bookingCode }
  const [reviewForm] = Form.useForm();
  const [submittingReview, setSubmittingReview] = useState(false);

  // Tải dữ liệu
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
        message.warning('Vui lòng đăng nhập để xem lịch sử đặt phòng.');
      } else {
        message.error('Không thể tải lịch sử đặt phòng.');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [user]);

  // Gửi đánh giá
  const handleSubmitReview = async (values) => {
    if (!reviewModal) return;
    setSubmittingReview(true);
    try {
      await axiosClient.post('/Reviews', {
        roomTypeId: reviewModal.roomTypeId,
        rating: values.rating,
        comment: values.comment,
      });
      message.success('🌟 Đánh giá đã được gửi thành công! Cảm ơn bạn.');
      setReviewModal(null);
      reviewForm.resetFields();
      fetchData(); // Refresh data
    } catch (err) {
      const errMsg = err.response?.data?.message || err.response?.data || 'Có lỗi xảy ra khi gửi đánh giá.';
      message.error(typeof errMsg === 'string' ? errMsg : 'Có lỗi xảy ra.');
    } finally {
      setSubmittingReview(false);
    }
  };

  // Render trạng thái booking
  const getStatusTag = (status) => {
    switch (status) {
      case 'Completed':
      case 'CheckedOut':
        return <Tag icon={<CheckCircleOutlined />} color="success">Đã hoàn thành</Tag>;
      case 'CheckedIn':
        return <Tag icon={<ClockCircleOutlined />} color="processing">Đang lưu trú</Tag>;
      case 'Cancelled':
        return <Tag icon={<CloseCircleOutlined />} color="error">Đã hủy</Tag>;
      case 'Pending':
        return <Tag icon={<ClockCircleOutlined />} color="warning">Chờ nhận phòng</Tag>;
      default:
        return <Tag color="default">{status}</Tag>;
    }
  };

  // Kiểm tra booking đã hoàn thành chưa
  const isCompleted = (status) => status === 'Completed' || status === 'CheckedOut';

  if (!user) {
    return (
      <div style={{ maxWidth: 800, margin: '60px auto', textAlign: 'center', padding: '0 20px' }}>
        <Empty
          description={
            <div>
              <Title level={4}>Vui lòng đăng nhập</Title>
              <Paragraph type="secondary">Bạn cần đăng nhập để xem lịch sử đặt phòng của mình.</Paragraph>
            </div>
          }
        >
          <Button type="primary" size="large" onClick={() => navigate('/login')}>
            Đăng nhập ngay
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
          Lịch Sử Đặt Phòng
        </Title>
        <Paragraph type="secondary" style={{ fontSize: 16 }}>
          Xem lại các đơn đặt phòng và đánh giá trải nghiệm của bạn
        </Paragraph>
        <div style={{ width: 60, height: 4, background: '#c9a961', margin: '12px auto 0', borderRadius: 2 }} />
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: 80 }}>
          <Spin size="large" />
          <Paragraph type="secondary" style={{ marginTop: 16 }}>Đang tải lịch sử...</Paragraph>
        </div>
      ) : bookings.length === 0 ? (
        <Empty
          description={
            <div>
              <Title level={4} type="secondary">Chưa có đơn đặt phòng nào</Title>
              <Paragraph type="secondary">Hãy đặt phòng để có trải nghiệm tuyệt vời tại The Royal Citadel!</Paragraph>
            </div>
          }
        >
          <Button type="primary" size="large" onClick={() => navigate('/rooms')}>
            Đặt phòng ngay
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
                      Đơn: <Text style={{ color: '#1890ff', fontWeight: 700 }}>{booking.bookingCode}</Text>
                    </Text>
                    {booking.guestName && (
                      <Text type="secondary" style={{ marginLeft: 16 }}>{booking.guestName}</Text>
                    )}
                  </div>
                  {getStatusTag(booking.status)}
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
                        title: 'Phòng',
                        dataIndex: 'roomNumber',
                        render: (r) => <Text strong>Phòng {r}</Text>,
                        width: 120,
                      },
                      {
                        title: 'Hạng phòng',
                        dataIndex: 'roomTypeName',
                        render: (name) => <Tag color="blue">{name}</Tag>,
                      },
                      {
                        title: 'Thời gian lưu trú',
                        render: (_, r) => (
                          <Text>
                            <CalendarOutlined style={{ marginRight: 6, color: '#c9a961' }} />
                            {dayjs(r.checkInDate).format('DD/MM/YYYY')} – {dayjs(r.checkOutDate).format('DD/MM/YYYY')}
                          </Text>
                        ),
                      },
                      {
                        title: 'Giá/Đêm',
                        dataIndex: 'pricePerNight',
                        render: (p) => <Text type="danger" strong>{p?.toLocaleString()}₫</Text>,
                        width: 130,
                        align: 'right',
                      },
                      ...(completed ? [{
                        title: 'Đánh giá',
                        key: 'review',
                        width: 160,
                        align: 'center',
                        render: (_, r) => {
                          const alreadyReviewed = reviewedRoomTypeIds.includes(r.roomTypeId);
                          if (alreadyReviewed) {
                            return (
                              <Tag icon={<CheckCircleOutlined />} color="success">
                                Đã đánh giá
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
                              Đánh giá
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

      {/* ── MODAL ĐÁNH GIÁ ──────────────────────────────────────── */}
      <Modal
        title={
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <StarFilled style={{ color: '#faad14', fontSize: 20 }} />
              <Title level={4} style={{ margin: 0 }}>Đánh giá trải nghiệm</Title>
            </div>
            {reviewModal && (
              <div style={{ marginTop: 8 }}>
                <Tag color="blue">{reviewModal.roomTypeName}</Tag>
                <Text type="secondary">Đơn: {reviewModal.bookingCode}</Text>
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
            label="Đánh giá sao"
            rules={[{ required: true, message: 'Vui lòng chọn số sao!' }]}
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
            label="Nhận xét chi tiết"
            rules={[
              { required: true, message: 'Vui lòng viết nhận xét!' },
              { min: 10, message: 'Nhận xét phải có ít nhất 10 ký tự.' }
            ]}
          >
            <TextArea
              rows={4}
              placeholder="Chia sẻ trải nghiệm của bạn: phòng ốc, dịch vụ, nhân viên, vệ sinh..."
              maxLength={500}
              showCount
              style={{ borderRadius: 8 }}
            />
          </Form.Item>

          <Alert
            message="Lưu ý: Mỗi hạng phòng chỉ được đánh giá một lần."
            type="info"
            showIcon
            style={{ marginBottom: 16, borderRadius: 8 }}
          />

          <Form.Item style={{ marginBottom: 0, textAlign: 'right' }}>
            <Space>
              <Button onClick={() => setReviewModal(null)}>Hủy</Button>
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
                {submittingReview ? 'Đang gửi...' : 'Gửi đánh giá'}
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default CustomerBookingHistoryPage;
