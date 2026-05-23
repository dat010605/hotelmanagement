import React, { useState } from 'react';
import { Form, Input, Button, Card, App, Typography, Divider, DatePicker } from 'antd';
import { UserOutlined, LockOutlined, MailOutlined, CalendarOutlined } from '@ant-design/icons';
import { useNavigate, Link } from 'react-router-dom';
import { GoogleOAuthProvider, GoogleLogin } from '@react-oauth/google';
import axiosClient from '../api/axiosClient';
import { useAdminAuthStore } from '../store/adminAuthStore';

const { Title, Text } = Typography;

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || '123456789-xxxx.apps.googleusercontent.com';

const RegisterPage = () => {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const setAuth = useAdminAuthStore((state) => state.setAuth);
  const { notification } = App.useApp();

  // Đăng ký thường
  const onFinish = async (values) => {
    setLoading(true);
    try {
      await axiosClient.post('/Auth/register', {
        fullName: values.fullName,
        email: values.email,
        password: values.password,
        dateOfBirth: values.dateOfBirth ? values.dateOfBirth.format('YYYY-MM-DD') : null
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

  // Đăng ký bằng Google (Google Login = tự động tạo tài khoản nếu chưa có)
  const handleGoogleSuccess = async (credentialResponse) => {
    try {
      const response = await axiosClient.post('Auth/google-login', {
        credential: credentialResponse.credential,
      });
      const { token, user, permissions } = response.data;
      
      let rawRole = user?.role || 'guest';
      let finalRoleId = String(rawRole).toLowerCase();
      if (finalRoleId === 'guest') finalRoleId = '10';
      else if (finalRoleId === 'admin') finalRoleId = '1';

      localStorage.setItem('userRole', finalRoleId);
      setAuth(token, user, permissions);

      notification.success({
        message: 'Đăng ký Google thành công!',
        description: `Chào mừng ${user?.fullName || 'bạn'} đến với The Royal Citadel.`,
        placement: 'topRight',
      });
      navigate('/');
    } catch (error) {
      notification.error({
        message: 'Đăng ký Google thất bại',
        description: error.response?.data?.message || 'Có lỗi xảy ra.',
        placement: 'topRight',
      });
    }
  };

  const handleGoogleError = () => {
    notification.warning({
      message: 'Google OAuth',
      description: 'Không thể kết nối tới Google. Vui lòng thử lại.',
      placement: 'topRight',
    });
  };

  const bigInputStyle = { padding: '16px 20px', fontSize: '18px', borderRadius: '10px' };

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', background: '#f0f2f5', fontFamily: 'SFProDisplay-Regular, Helvetica, Arial, sans-serif' }}>
      <Card style={{ width: 580, borderRadius: '12px', boxShadow: '0 2px 4px rgba(0, 0, 0, .1), 0 8px 16px rgba(0, 0, 0, .1)', padding: '25px 15px' }}>
        <div style={{ textAlign: 'center', marginBottom: 25 }}>
          <Title level={2} style={{ color: '#1c1e21', fontWeight: 'bold', marginBottom: 4, fontFamily: "'Playfair Display', serif" }}>The Royal Citadel</Title>
          <Text style={{ fontSize: '14px', color: '#8c8c8c', letterSpacing: '2px', textTransform: 'uppercase' }}>Luxury Hotel &amp; Resort</Text>
          <br />
          <Title level={3} style={{ color: '#1c1e21', marginTop: 12, marginBottom: 0 }}>Đăng Ký Tài Khoản</Title>
        </div>

        <Form name="register_form" onFinish={onFinish} layout="vertical">
          <Form.Item name="fullName" rules={[{ required: true, message: 'Vui lòng nhập Họ Tên!' }]} style={{ marginBottom: 15 }}>
            <Input prefix={<UserOutlined style={{ fontSize: '20px', color: '#90949c', marginRight: 8 }} />} placeholder="Họ và Tên" size="large" style={bigInputStyle} />
          </Form.Item>

          <Form.Item name="email" validateTrigger="onSubmit" rules={[{ required: true, message: 'Vui lòng nhập Email!' }, { type: 'email', message: 'Email không hợp lệ!' }]} style={{ marginBottom: 15 }}>
            <Input prefix={<MailOutlined style={{ fontSize: '20px', color: '#90949c', marginRight: 8 }} />} placeholder="Email" size="large" style={bigInputStyle} />
          </Form.Item>

          <Form.Item name="dateOfBirth" label={<span style={{ fontWeight: 500 }}>Ngày sinh <Text type="secondary" style={{ fontWeight: 400 }}>(để nhận voucher sinh nhật)</Text></span>} style={{ marginBottom: 15 }}>
            <DatePicker size="large" style={{ ...bigInputStyle, width: '100%' }} placeholder="Chọn ngày sinh" format="DD/MM/YYYY" suffixIcon={<CalendarOutlined style={{ color: '#c9a961' }} />} />
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

          {/* ── GOOGLE SIGN UP ─────────────────────────────────── */}
          <Divider style={{ margin: '16px 0', color: '#8c8c8c', fontSize: 14 }}>hoặc</Divider>
          
          <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 12 }}>
              <GoogleLogin
                onSuccess={handleGoogleSuccess}
                onError={handleGoogleError}
                theme="outline"
                size="large"
                width="480"
                text="signup_with"
                shape="rectangular"
              />
            </div>
          </GoogleOAuthProvider>
          
          <div style={{ textAlign: 'center', marginTop: 15 }}>
            <Link to="/login" style={{ color: '#1877f2', fontSize: '16px', fontWeight: '500' }}>Đã có tài khoản? Đăng nhập ngay</Link>
          </div>
        </Form>
      </Card>
    </div>
  );
};

export default RegisterPage;
