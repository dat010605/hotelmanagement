import React, { useState } from 'react';
import { Form, Input, Button, Rate, message, Card, Typography } from 'antd';
import { useNavigate } from 'react-router-dom';
import axiosClient from '../api/axiosClient';

const { Title, Text } = Typography;

const CustomerAddReviewPage = () => {
  const [submitting, setSubmitting] = useState(false);
  const navigate = useNavigate();

  const onFinish = async (values) => {
    setSubmitting(true);
    try {
      // Giả sử API /Reviews nhận { rating, comment }
      await axiosClient.post('/Reviews', values);
      message.success('Cảm ơn bạn đã gửi đánh giá!');
      navigate('/reviews');
    } catch (error) {
      console.error(error);
      message.error('Gửi đánh giá thất bại, vui lòng thử lại.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={{ maxWidth: 600, margin: '40px auto', padding: '0 20px' }}>
      <Card>
        <Title level={3}>Thêm Đánh Giá</Title>
        <Form layout="vertical" onFinish={onFinish}>
          <Form.Item
            name="rating"
            label="Sao (1-5)"
            rules={[{ required: true, message: 'Vui lòng chọn sao' }]}
          >
            <Rate />
          </Form.Item>
          <Form.Item
            name="comment"
            label="Nhận xét"
            rules={[{ required: true, message: 'Vui lòng nhập nhận xét' }]}
          >
            <Input.TextArea rows={4} placeholder="Bạn nghĩ gì về khách sạn?" />
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit" loading={submitting} block>
              Gửi Đánh Giá
            </Button>
          </Form.Item>
        </Form>
        <Text type="secondary">* Đánh giá sẽ hiển thị sau khi được duyệt.</Text>
      </Card>
    </div>
  );
};

export default CustomerAddReviewPage;
