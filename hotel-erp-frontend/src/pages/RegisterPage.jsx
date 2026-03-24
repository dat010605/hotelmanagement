import React, { useState } from 'react';
import { Form, Input, Button, Card, notification, Typography } from 'antd';
import { UserOutlined, LockOutlined, MailOutlined } from '@ant-design/icons';
import { useNavigate, Link } from 'react-router-dom';
import axiosClient from '../api/axiosClient'; // Dòng import cực kỳ quan trọng để gọi API

const { Title, Text } = Typography;

const RegisterPage = () => {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const onFinish = async (values) => {
    setLoading(true);
    try {
      // Gọi API thực tế xuống Backend
      await axiosClient.post('/Auth/register', {
        fullName: values.fullName,
        email: values.email,
        password: values.password
      });

      notification.success({
        message: 'Đăng ký thành công!',
        description: 'Tài khoản của ngài đã được tạo. Vui lòng đăng nhập.',
        placement: 'topRight',
      });
      navigate('/login');
    } catch (error) {
      notification.error({
        message: 'Đăng ký thất bại',
        description: error.response?.data?.message || 'Có lỗi xảy ra, vui lòng thử lại!',
        placement: 'topRight',
      });
    } finally {
      setLoading(false);
    }
  };

  const bigInputStyle = { padding: '16px 20px', fontSize: '18px', borderRadius: '10px' };

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', background: '#f0f2f5', fontFamily: 'SFProDisplay-Regular, Helvetica, Arial, sans-serif' }}>
      <Card style={{ width: 580, borderRadius: '12px', boxShadow: '0 2px 4px rgba(0, 0, 0, .1), 0 8px 16px rgba(0, 0, 0, .1)', padding: '25px 15px' }}>
        <div style={{ textAlign: 'center', marginBottom: 25 }}>
          <Title level={1} style={{ color: '#1c1e21', fontWeight: 'bold', marginBottom: 5 }}>Đăng Ký Tài Khoản</Title>
        </div>

        <Form name="register_form" onFinish={onFinish} layout="vertical">
          <Form.Item name="fullName" rules={[{ required: true, message: 'Vui lòng nhập Họ Tên!' }]} style={{ marginBottom: 15 }}>
            <Input prefix={<UserOutlined style={{ fontSize: '20px', color: '#90949c', marginRight: 8 }} />} placeholder="Họ và Tên" size="large" style={bigInputStyle} />
          </Form.Item>

          <Form.Item name="email" validateTrigger="onSubmit" rules={[{ required: true, message: 'Vui lòng nhập Email!' }, { type: 'email', message: 'Email không hợp lệ!' }]} style={{ marginBottom: 15 }}>
            <Input prefix={<MailOutlined style={{ fontSize: '20px', color: '#90949c', marginRight: 8 }} />} placeholder="Email" size="large" style={bigInputStyle} />
          </Form.Item>

          <Form.Item name="password" rules={[{ required: true, message: 'Vui lòng nhập Mật khẩu!' }]} style={{ marginBottom: 15 }}>
            <Input.Password prefix={<LockOutlined style={{ fontSize: '20px', color: '#90949c', marginRight: 8 }} />} placeholder="Mật khẩu mới" size="large" style={bigInputStyle} />
          </Form.Item>

          <Form.Item 
            name="confirmPassword" 
            dependencies={['password']}
            rules={[
              { required: true, message: 'Vui lòng xác nhận Mật khẩu!' },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (!value || getFieldValue('password') === value) return Promise.resolve();
                  return Promise.reject(new Error('Mật khẩu xác nhận không khớp!'));
                },
              }),
            ]} 
            style={{ marginBottom: 25 }}
          >
            <Input.Password prefix={<LockOutlined style={{ fontSize: '20px', color: '#90949c', marginRight: 8 }} />} placeholder="Xác nhận mật khẩu" size="large" style={bigInputStyle} />
          </Form.Item>

          <Form.Item style={{ marginBottom: 15 }}>
            <Button type="primary" htmlType="submit" size="large" block loading={loading} style={{ height: '60px', fontSize: '22px', fontWeight: 'bold', borderRadius: '10px', background: '#42b72a', borderColor: '#42b72a' }}>
              Đăng Ký
            </Button>
          </Form.Item>
          
          <div style={{ textAlign: 'center', marginTop: 15 }}>
            <Link to="/login" style={{ color: '#1877f2', fontSize: '16px', fontWeight: '500' }}>Đã có tài khoản? Đăng nhập ngay</Link>
          </div>
        </Form>
      </Card>
    </div>
  );
};

export default RegisterPage;