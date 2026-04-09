import React, { useState } from 'react';
import { Form, Input, Button, Card, App, Typography } from 'antd';
import { MailOutlined } from '@ant-design/icons';
import { useNavigate, Link } from 'react-router-dom';

const { Title, Text } = Typography;

const ForgotPasswordPage = () => {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { notification } = App.useApp();

  const onFinish = async (values) => {
    setLoading(true);
    // Giả lập gọi API, sau này ngài thay bằng axiosClient.post('/Auth/forgot-password', ...)
    setTimeout(() => {
      setLoading(false);
      notification.success({
        message: 'Đã gửi yêu cầu!',
        description: 'Vui lòng kiểm tra email của ngài để đặt lại mật khẩu.',
        placement: 'topRight',
      });
      navigate('/login');
    }, 1500);
  };

  const bigInputStyle = {
    padding: '16px 20px',
    fontSize: '18px',
    borderRadius: '10px',
  };

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', background: '#f0f2f5', fontFamily: 'SFProDisplay-Regular, Helvetica, Arial, sans-serif' }}>
      <Card style={{ width: 580, borderRadius: '12px', boxShadow: '0 2px 4px rgba(0, 0, 0, .1), 0 8px 16px rgba(0, 0, 0, .1)', padding: '25px 15px' }}>
        <div style={{ textAlign: 'center', marginBottom: 35 }}>
          <Title level={1} style={{ color: '#1c1e21', fontWeight: 'bold', marginBottom: 10 }}>Tìm tài khoản</Title>
          <Text style={{ fontSize: '18px', color: '#1c1e21' }}>Vui lòng nhập email để tìm kiếm tài khoản của ngài.</Text>
        </div>

        <Form name="forgot_password_form" onFinish={onFinish} layout="vertical">
          <Form.Item
            name="email"
            validateTrigger="onSubmit"
            rules={[
              { required: true, message: 'Vui lòng nhập Email!' }, 
              { type: 'email', message: 'Email không hợp lệ!' }
            ]}
            style={{ marginBottom: 25 }}
          >
            <Input prefix={<MailOutlined style={{ fontSize: '20px', color: '#90949c', marginRight: 8 }} />} placeholder="Email đăng ký" size="large" style={bigInputStyle} />
          </Form.Item>

          <Form.Item style={{ marginBottom: 15 }}>
            <Button type="primary" htmlType="submit" size="large" block loading={loading} style={{ height: '60px', fontSize: '22px', fontWeight: 'bold', borderRadius: '10px', background: '#1877f2', borderColor: '#1877f2' }}>
              Gửi Liên Kết
            </Button>
          </Form.Item>
          
          <div style={{ textAlign: 'center', marginTop: 15 }}>
            <Link to="/login" style={{ color: '#1877f2', fontSize: '16px', fontWeight: '500' }}>Hủy và quay lại Đăng nhập</Link>
          </div>
        </Form>
      </Card>
    </div>
  );
};

export default ForgotPasswordPage;

