import React, { useState, useMemo } from 'react';
import {
  Typography, Card, Row, Col, Rate, Input, Button, Avatar, Divider,
  Form, Space, Tag, App, Empty, Pagination, Select
} from 'antd';
import {
  UserOutlined, StarFilled, SendOutlined, SmileOutlined, ClockCircleOutlined
} from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import { useAdminAuthStore } from '../store/adminAuthStore';
import { useCustomerProfileStore } from '../store/useCustomerProfileStore';
import { useNavigate } from 'react-router-dom';
import { useReviewStore } from '../store/useReviewStore';

const { Title, Text, Paragraph } = Typography;
const { TextArea } = Input;

const CustomerReviewsPage = () => {
  const { t } = useTranslation();
  const { user } = useAdminAuthStore();
  const { getProfile } = useCustomerProfileStore();
  const { notification } = App.useApp();
  const navigate = useNavigate();
  const [form] = Form.useForm();

  const email = user?.email || user?.Email || '';
  const profile = getProfile(email);
  const displayName = profile.displayName || user?.fullName || user?.FullName || t('header.guest');
  const displayAvatar = profile.avatarUrl || user?.avatarUrl || null;

  const { addReview } = useReviewStore();
  const allReviews = useReviewStore(state => state.reviews);
  const reviews = useMemo(() => allReviews.filter(r => !r.isHidden), [allReviews]);
  const [submitting, setSubmitting] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [ratingFilter, setRatingFilter] = useState('all');
  const pageSize = 5;

  const avgRating = reviews.length > 0
    ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
    : 0;

  const handleFilterChange = (value) => {
    setRatingFilter(value);
    setCurrentPage(1);
  };

  const filteredReviews = useMemo(() => {
    if (ratingFilter === 'all') return reviews;
    return reviews.filter(r => Math.floor(r.rating) === parseInt(ratingFilter));
  }, [reviews, ratingFilter]);

  const currentReviews = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize;
    return filteredReviews.slice(startIndex, startIndex + pageSize);
  }, [filteredReviews, currentPage, pageSize]);

  const handleSubmitReview = async (values) => {
    if (!user) {
      notification.warning({
        message: t('reviewsPage.loginWarning'),
        description: t('reviewsPage.loginWarningDesc'),
        placement: 'topRight'
      });
      navigate('/login');
      return;
    }

    setSubmitting(true);
    await new Promise(r => setTimeout(r, 600));

    const now = new Date();
    const dateStr = `${now.getDate().toString().padStart(2, '0')}/${(now.getMonth() + 1).toString().padStart(2, '0')}/${now.getFullYear()}`;

    const newReview = {
      id: Date.now(),
      name: displayName,
      avatar: displayAvatar,
      rating: values.rating,
      room: values.room || t('reviewsPage.unknown'),
      date: dateStr,
      content: values.content
    };

    addReview(newReview);
    form.resetFields();
    setSubmitting(false);

    notification.success({
      message: t('reviewsPage.thankYou'),
      description: t('reviewsPage.successDesc'),
      placement: 'topRight',
      icon: <SmileOutlined style={{ color: '#52c41a' }} />
    });
  };

  const satisfiedPct = reviews.length > 0
    ? Math.round(reviews.filter(r => r.rating >= 4.5).length / reviews.length * 100)
    : 0;

  return (
    <div style={{ maxWidth: 900, margin: '0 auto', padding: '40px 20px' }}>

      {/* HEADER */}
      <div style={{ textAlign: 'center', marginBottom: 48 }}>
        <Title level={2}>{t('reviewsPage.title')}</Title>
        <Paragraph type="secondary" style={{ fontSize: 16 }}>
          {t('reviewsPage.subtitle')}
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
            <div style={{ marginTop: 4, color: 'rgba(255,255,255,0.8)', fontSize: 13 }}>
              {t('reviewsPage.avgScore')}
            </div>
          </Col>
          <Col><div style={{ width: 1, height: 60, background: 'rgba(255,255,255,0.3)' }} /></Col>
          <Col style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '2.5rem', fontWeight: 800, lineHeight: 1 }}>{reviews.length}</div>
            <div style={{ color: 'rgba(255,255,255,0.8)', marginTop: 8, fontSize: 13 }}>
              {t('reviewsPage.totalReviews')}
            </div>
          </Col>
          <Col><div style={{ width: 1, height: 60, background: 'rgba(255,255,255,0.3)' }} /></Col>
          <Col style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '2.5rem', fontWeight: 800, lineHeight: 1 }}>{satisfiedPct}%</div>
            <div style={{ color: 'rgba(255,255,255,0.8)', marginTop: 8, fontSize: 13 }}>
              {t('reviewsPage.satisfiedRate')}
            </div>
          </Col>
        </Row>
      </Card>

      {/* WRITE REVIEW FORM */}
      <Card
        title={
          <Space>
            <SendOutlined style={{ color: '#1890ff' }} />
            <Text strong style={{ fontSize: 18 }}>{t('reviewsPage.writeTitle')}</Text>
          </Space>
        }
        style={{ borderRadius: 16, marginBottom: 40, boxShadow: '0 4px 16px rgba(0,0,0,0.06)' }}
      >
        {user ? (
          <div style={{ display: 'flex', gap: 20 }}>
            <Avatar
              size={48} src={displayAvatar}
              icon={!displayAvatar && <UserOutlined />}
              style={{ background: '#1890ff', flexShrink: 0 }}
            />
            <div style={{ flex: 1 }}>
              <Text strong style={{ fontSize: 16 }}>{displayName}</Text>
              <Form form={form} layout="vertical" onFinish={handleSubmitReview} style={{ marginTop: 12 }}>
                <Form.Item
                  name="rating"
                  label={t('reviewsPage.ratingLabel')}
                  rules={[{ required: true, message: t('reviewsPage.ratingRequired') }]}
                >
                  <Rate allowHalf style={{ fontSize: 28 }} />
                </Form.Item>

                <Form.Item name="room" label={t('reviewsPage.roomLabel')}>
                  <Input
                    size="large"
                    placeholder={t('reviewsPage.roomPlaceholder')}
                    prefix={<StarFilled style={{ color: '#faad14' }} />}
                  />
                </Form.Item>

                <Form.Item
                  name="content"
                  label={t('reviewsPage.contentLabel')}
                  rules={[
                    { required: true, message: t('reviewsPage.contentRequired') },
                    { min: 10, message: t('reviewsPage.contentMinLength') }
                  ]}
                >
                  <TextArea
                    rows={4}
                    placeholder={t('reviewsPage.contentPlaceholder')}
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
                    {t('reviewsPage.submitBtn')}
                  </Button>
                </Form.Item>
              </Form>
            </div>
          </div>
        ) : (
          <div style={{ textAlign: 'center', padding: '20px 0' }}>
            <Paragraph type="secondary" style={{ fontSize: 16, marginBottom: 16 }}>
              {t('reviewsPage.loginRequired')}
            </Paragraph>
            <Button type="primary" size="large" onClick={() => navigate('/login')} style={{ borderRadius: 8 }}>
              {t('reviewsPage.loginBtn')}
            </Button>
          </div>
        )}
      </Card>

      {/* REVIEWS LIST */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24, flexWrap: 'wrap', gap: 16 }}>
        <Title level={4} style={{ margin: 0 }}>
          {t('reviewsPage.allReviews', { count: filteredReviews.length })}
        </Title>
        <Select
          defaultValue="all"
          style={{ width: 180 }}
          onChange={handleFilterChange}
          options={[
            { value: 'all', label: t('reviewsPage.filterAll') },
            { value: '5',   label: t('reviewsPage.filter5') },
            { value: '4',   label: t('reviewsPage.filter4') },
            { value: '3',   label: t('reviewsPage.filter3') },
            { value: '2',   label: t('reviewsPage.filter2') },
            { value: '1',   label: t('reviewsPage.filter1') },
          ]}
        />
      </div>

      {filteredReviews.length === 0 ? (
        <Empty description={t('reviewsPage.noMatch')} style={{ margin: '40px 0' }} />
      ) : (
        <Space direction="vertical" size="middle" style={{ width: '100%' }}>
          {currentReviews.map(review => (
            <Card
              key={review.id}
              style={{ borderRadius: 12, boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}
              bodyStyle={{ padding: '20px 24px' }}
            >
              <div style={{ display: 'flex', gap: 16 }}>
                <Avatar
                  size={48} src={review.avatar}
                  icon={!review.avatar && <UserOutlined />}
                  style={{ background: '#1890ff', flexShrink: 0 }}
                />
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
      )}

      {filteredReviews.length > pageSize && (
        <div style={{ textAlign: 'center', marginTop: 32 }}>
          <Pagination
            current={currentPage}
            pageSize={pageSize}
            total={filteredReviews.length}
            onChange={(page) => setCurrentPage(page)}
            showSizeChanger={false}
          />
        </div>
      )}
    </div>
  );
};

export default CustomerReviewsPage;
