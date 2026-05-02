import React, { useState, useMemo } from 'react';
import {
  Typography, Card, Row, Col, Rate, Input, Button, Avatar, Divider,
  Form, Space, Tag, App, Empty
} from 'antd';
import {
  UserOutlined, StarFilled, SendOutlined, SmileOutlined, ClockCircleOutlined
} from '@ant-design/icons';
import { useAdminAuthStore } from '../store/adminAuthStore';
import { useCustomerProfileStore } from '../store/useCustomerProfileStore';
import { useNavigate } from 'react-router-dom';
import { useReviewStore } from '../store/useReviewStore';

const { Title, Text, Paragraph } = Typography;
const { TextArea } = Input;


const CustomerReviewsPage = () => {
  const { user } = useAdminAuthStore();
  const { getProfile } = useCustomerProfileStore();
  const { notification } = App.useApp();
  const navigate = useNavigate();
  const [form] = Form.useForm();

  const email = user?.email || user?.Email || '';
  const profile = getProfile(email);
  const displayName = profile.displayName || user?.fullName || user?.FullName || 'Khách';
  const displayAvatar = profile.avatarUrl || user?.avatarUrl || null;

  const { addReview } = useReviewStore();
  const allReviews = useReviewStore(state => state.reviews);
  const reviews = useMemo(() => allReviews.filter(r => !r.isHidden), [allReviews]);
  const [submitting, setSubmitting] = useState(false);

  // Tính tổng số sao trung bình
  const avgRating = reviews.length > 0 ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1) : 0;

  const handleSubmitReview = async (values) => {
    if (!user) {
      notification.warning({
        message: 'Vui lòng đăng nhập',
        description: 'Bạn cần đăng nhập để gửi đánh giá.',
        placement: 'topRight'
      });
      navigate('/login');
      return;
    }

    setSubmitting(true);
    // Giả lập delay gửi
    await new Promise(r => setTimeout(r, 600));

    const now = new Date();
    const dateStr = `${now.getDate().toString().padStart(2, '0')}/${(now.getMonth() + 1).toString().padStart(2, '0')}/${now.getFullYear()}`;

    const newReview = {
      id: Date.now(),
      name: displayName,
      avatar: displayAvatar,
      rating: values.rating,
      room: values.room || 'Không xác định',
      date: dateStr,
      content: values.content
    };

    addReview(newReview);
    form.resetFields();
    setSubmitting(false);

    notification.success({
      message: 'Cảm ơn bạn!',
      description: 'Đánh giá của bạn đã được gửi thành công.',
      placement: 'topRight',
      icon: <SmileOutlined style={{ color: '#52c41a' }} />
    });
  };

  return (
    <div style={{ maxWidth: 900, margin: '0 auto', padding: '40px 20px' }}>

      {/* HEADER */}
      <div style={{ textAlign: 'center', marginBottom: 48 }}>
        <Title level={2}>⭐ Đánh Giá Khách Sạn</Title>
        <Paragraph type="secondary" style={{ fontSize: 16 }}>
          Chia sẻ trải nghiệm của bạn và đọc cảm nhận từ những khách đã lưu trú
        </Paragraph>
        <div style={{ width: 60, height: 4, background: '#1890ff', margin: '12px auto 0', borderRadius: 2 }} />
      </div>

      {/* STATS BANNER */}
      <Card style={{
        borderRadius: 16,
        background: 'linear-gradient(135deg, #1890ff 0%, #0050b3 100%)',
        marginBottom: 40,
        border: 'none'
      }}>
        <Row align="middle" justify="center" gutter={32} style={{ color: '#fff' }}>
          <Col style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '3.5rem', fontWeight: 900, lineHeight: 1 }}>{avgRating}</div>
            <Rate disabled defaultValue={parseFloat(avgRating)} allowHalf style={{ fontSize: 16, color: '#fadb14', marginTop: 4 }} />
            <div style={{ marginTop: 4, color: 'rgba(255,255,255,0.8)', fontSize: 13 }}>Điểm trung bình</div>
          </Col>
          <Col><div style={{ width: 1, height: 60, background: 'rgba(255,255,255,0.3)' }} /></Col>
          <Col style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '2.5rem', fontWeight: 800, lineHeight: 1 }}>{reviews.length}</div>
            <div style={{ color: 'rgba(255,255,255,0.8)', marginTop: 8, fontSize: 13 }}>Tổng đánh giá</div>
          </Col>
          <Col><div style={{ width: 1, height: 60, background: 'rgba(255,255,255,0.3)' }} /></Col>
          <Col style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '2.5rem', fontWeight: 800, lineHeight: 1 }}>
              {Math.round(reviews.filter(r => r.rating >= 4.5).length / reviews.length * 100)}%
            </div>
            <div style={{ color: 'rgba(255,255,255,0.8)', marginTop: 8, fontSize: 13 }}>Hài lòng (4.5+)</div>
          </Col>
        </Row>
      </Card>

      {/* WRITE REVIEW FORM */}
      <Card
        title={
          <Space>
            <SendOutlined style={{ color: '#1890ff' }} />
            <Text strong style={{ fontSize: 18 }}>Viết đánh giá của bạn</Text>
          </Space>
        }
        style={{ borderRadius: 16, marginBottom: 40, boxShadow: '0 4px 16px rgba(0,0,0,0.06)' }}
      >
        {user ? (
          <div style={{ display: 'flex', gap: 20 }}>
            <Avatar size={48} src={displayAvatar} icon={!displayAvatar && <UserOutlined />} style={{ background: '#1890ff', flexShrink: 0 }} />
            <div style={{ flex: 1 }}>
              <Text strong style={{ fontSize: 16 }}>{displayName}</Text>
              <Form form={form} layout="vertical" onFinish={handleSubmitReview} style={{ marginTop: 12 }}>
                <Form.Item
                  name="rating"
                  label="Đánh giá của bạn"
                  rules={[{ required: true, message: 'Vui lòng chọn số sao!' }]}
                >
                  <Rate allowHalf style={{ fontSize: 28 }} />
                </Form.Item>

                <Form.Item name="room" label="Hạng phòng đã ở">
                  <Input size="large" placeholder="VD: Suite Deluxe, Standard Room..." prefix={<StarFilled style={{ color: '#faad14' }} />} />
                </Form.Item>

                <Form.Item
                  name="content"
                  label="Nhận xét chi tiết"
                  rules={[{ required: true, message: 'Vui lòng viết nhận xét!' }, { min: 10, message: 'Nhận xét phải có ít nhất 10 ký tự.' }]}
                >
                  <TextArea
                    rows={4}
                    placeholder="Chia sẻ trải nghiệm của bạn tại khách sạn: phòng ốc, dịch vụ, ẩm thực, nhân viên..."
                    maxLength={500}
                    showCount
                  />
                </Form.Item>

                <Form.Item style={{ marginBottom: 0, textAlign: 'right' }}>
                  <Button
                    type="primary"
                    htmlType="submit"
                    loading={submitting}
                    icon={<SendOutlined />}
                    size="large"
                    style={{ borderRadius: 8, padding: '0 32px' }}
                  >
                    Gửi đánh giá
                  </Button>
                </Form.Item>
              </Form>
            </div>
          </div>
        ) : (
          <div style={{ textAlign: 'center', padding: '20px 0' }}>
            <Paragraph type="secondary" style={{ fontSize: 16, marginBottom: 16 }}>
              Bạn cần đăng nhập để viết đánh giá
            </Paragraph>
            <Button type="primary" size="large" onClick={() => navigate('/login')} style={{ borderRadius: 8 }}>
              Đăng nhập ngay
            </Button>
          </div>
        )}
      </Card>

      {/* REVIEWS LIST */}
      <Title level={4} style={{ marginBottom: 24 }}>
        💬 Tất cả đánh giá ({reviews.length})
      </Title>

      <Space direction="vertical" size="middle" style={{ width: '100%' }}>
        {reviews.map(review => (
          <Card
            key={review.id}
            style={{ borderRadius: 12, boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}
            bodyStyle={{ padding: '20px 24px' }}
          >
            <div style={{ display: 'flex', gap: 16 }}>
              <Avatar size={48} src={review.avatar} icon={!review.avatar && <UserOutlined />} style={{ background: '#1890ff', flexShrink: 0 }} />
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 8 }}>
                  <div>
                    <Text strong style={{ fontSize: 16, display: 'block' }}>{review.name}</Text>
                    <Space size="small" style={{ marginTop: 4 }}>
                      <Rate disabled allowHalf defaultValue={review.rating} style={{ fontSize: 13 }} />
                      <Tag color="blue">{review.room}</Tag>
                    </Space>
                  </div>
                  <Text type="secondary" style={{ fontSize: 13 }}>
                    <ClockCircleOutlined /> {review.date}
                  </Text>
                </div>

                <p style={{ marginTop: 12, marginBottom: 0, color: '#333', fontSize: 15, lineHeight: 1.7 }}>
                  {review.content || ''}
                </p>
              </div>
            </div>
          </Card>
        ))}
      </Space>
    </div>
  );
};

export default CustomerReviewsPage;
