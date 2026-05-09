import React, { useState } from 'react';
import { Form, Input, Button, Card, App, Typography, Divider } from 'antd';
import { UserOutlined, LockOutlined, GoogleOutlined } from '@ant-design/icons';
import { useNavigate, Link } from 'react-router-dom';
import { GoogleOAuthProvider, GoogleLogin } from '@react-oauth/google';
import axiosClient from '../api/axiosClient';
import { useAdminAuthStore } from '../store/adminAuthStore';

const { Title, Text } = Typography;

// =====================================================================
// Google Client ID – Thay bằng ID thực từ Google Cloud Console
// Hướng dẫn: https://console.cloud.google.com/apis/credentials
// =====================================================================
const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || '123456789-xxxx.apps.googleusercontent.com';

const LoginPage = () => {
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const navigate = useNavigate();
  const setAuth = useAdminAuthStore((state) => state.setAuth);
  const { notification } = App.useApp();

  // =====================================================================
  // XỬ LÝ SAU KHI NHẬN ĐƯỢC RESPONSE TỪ API (cả login thường & Google)
  // =====================================================================
  const handleLoginSuccess = (response) => {
    const { token, user, permissions } = response.data;

    // Thuật toán bắt trọn Role
    let rawRole = user?.roleId || user?.RoleId || user?.role_id || user?.role || user?.Role || response.data?.roleId || '1';
    let finalRoleId = String(rawRole).toLowerCase();
    if (finalRoleId === 'admin') finalRoleId = '1';
    else if (finalRoleId === 'manager') finalRoleId = '2';
    else if (finalRoleId === 'receptionist') finalRoleId = '3';
    else if (finalRoleId === 'accountant') finalRoleId = '4';
    else if (finalRoleId === 'housekeeping') finalRoleId = '5';
    else if (finalRoleId === 'guest') finalRoleId = '10';

    localStorage.setItem('userRole', finalRoleId);
    setAuth(token, user, permissions);

    notification.success({
      message: 'Đăng nhập thành công!',
      description: `Chào mừng ${user?.fullName || user?.FullName || 'bạn'} quay trở lại.`,
      placement: 'topRight',
    });

    if (finalRoleId === '10' || finalRoleId === 'guest' || user?.role?.toLowerCase() === 'guest') {
      navigate('/');
    } else {
      navigate('/admin/dashboard');
    }
  };

  // =====================================================================
  // ĐĂNG NHẬP THƯỜNG (Email + Password)
  // =====================================================================
  const onFinish = async (values) => {
    setLoading(true);
    try {
      const response = await axiosClient.post('Auth/Login', {
        email: values.email,
        password: values.password,
      });
      handleLoginSuccess(response);
    } catch (error) {
      notification.error({
        message: 'Đăng nhập thất bại',
        description: error.response?.data?.message || 'Sai email hoặc mật khẩu. Vui lòng thử lại!',
        placement: 'topRight',
      });
    } finally {
      setLoading(false);
    }
  };

  // =====================================================================
  // ĐĂNG NHẬP BẰNG GOOGLE (nhận credential → gửi xuống Backend)
  // =====================================================================
  const handleGoogleSuccess = async (credentialResponse) => {
    setGoogleLoading(true);
    try {
      const response = await axiosClient.post('Auth/google-login', {
        credential: credentialResponse.credential,
      });
      handleLoginSuccess(response);
    } catch (error) {
      notification.error({
        message: 'Đăng nhập Google thất bại',
        description: error.response?.data?.message || 'Có lỗi xảy ra khi xác thực tài khoản Google.',
        placement: 'topRight',
      });
    } finally {
      setGoogleLoading(false);
    }
  };

  const handleGoogleError = () => {
    notification.warning({
      message: 'Google OAuth',
      description: 'Không thể kết nối tới Google. Vui lòng thử lại hoặc đăng nhập bằng Email.',
      placement: 'topRight',
    });
  };

  const bigInputStyle = {
    padding: '16px 20px', 
    fontSize: '18px', 
    borderRadius: '10px', 
  };

  // =====================================================================
  // RENDER
  // =====================================================================
  return (
    <div style={{ 
      display: 'flex', 
      justifyContent: 'center', 
      alignItems: 'center', 
      height: '100vh', 
      background: '#f0f2f5', 
      fontFamily: 'SFProDisplay-Regular, Helvetica, Arial, sans-serif' 
    }}>
      <Card style={{ 
        width: 580, 
        borderRadius: '12px', 
        boxShadow: '0 2px 4px rgba(0, 0, 0, .1), 0 8px 16px rgba(0, 0, 0, .1)', 
        padding: '25px 15px' 
      }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: 35 }}>
          <Title level={1} style={{ color: '#1c1e21', fontWeight: 'bold', marginBottom: 10, fontFamily: "'Playfair Display', serif" }}>
            The Royal Citadel
          </Title>
          <Text style={{ fontSize: '16px', color: '#8c8c8c', letterSpacing: '2px', textTransform: 'uppercase' }}>
            Luxury Hotel &amp; Resort
          </Text>
          <br />
          <Text style={{ fontSize: '18px', color: '#1c1e21', marginTop: 8, display: 'inline-block' }}>
            Vui lòng đăng nhập để tiếp tục 
          </Text>
        </div>

        {/* ── FORM ĐĂNG NHẬP THƯỜNG ──────────────────────────── */}
        <Form name="login_form" onFinish={onFinish} layout="vertical">
          <Form.Item
            name="email"
            validateTrigger="onSubmit"
            rules={[
              { required: true, message: 'Vui lòng nhập Email!' }, 
              { type: 'email', message: 'Email không hợp lệ!' }
            ]}
            style={{ marginBottom: 20 }}
          >
            <Input 
              prefix={<UserOutlined style={{ fontSize: '20px', color: '#90949c', marginRight: 8 }} />} 
              placeholder="Email của bạn" 
              size="large" 
              style={bigInputStyle} 
            />
          </Form.Item>

          <Form.Item
            name="password"
            rules={[{ required: true, message: 'Vui lòng nhập Mật khẩu!' }]}
            style={{ marginBottom: 15 }}
          >
            <Input.Password 
              prefix={<LockOutlined style={{ fontSize: '20px', color: '#90949c', marginRight: 8 }} />} 
              placeholder="Mật khẩu" 
              size="large"
              style={bigInputStyle} 
            />
          </Form.Item>

          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 30, padding: '0 5px' }}>
            <Link to="/forgot-password" style={{ color: '#1877f2', fontSize: '16px', fontWeight: '500' }}>Quên mật khẩu?</Link>
            <Link to="/register" style={{ color: '#1877f2', fontSize: '16px', fontWeight: '500' }}>Đăng ký tài khoản mới?</Link>
          </div>

          <Form.Item style={{ marginBottom: 0 }}>
            <Button 
              type="primary" 
              htmlType="submit" 
              size="large" 
              block 
              loading={loading}
              style={{ 
                height: '60px', 
                fontSize: '22px', 
                fontWeight: 'bold', 
                borderRadius: '10px',
                background: '#1877f2', 
                borderColor: '#1877f2'
              }}
            >
              Đăng Nhập
            </Button>
          </Form.Item>
        </Form>

        {/* ── DIVIDER ────────────────────────────────────────── */}
        <Divider style={{ margin: '24px 0 20px', color: '#8c8c8c', fontSize: 14 }}>
          hoặc
        </Divider>

        {/* ── NÚT ĐĂNG NHẬP BẰNG GOOGLE (@react-oauth/google) ── */}
        <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 12 }}>
            <GoogleLogin
              onSuccess={handleGoogleSuccess}
              onError={handleGoogleError}
              theme="outline"
              size="large"
              width="480"
              text="signin_with"
              shape="rectangular"
              logo_alignment="center"
            />
          </div>
        </GoogleOAuthProvider>

        {/* Fallback button nếu Google SDK chưa load */}
        {googleLoading && (
          <div style={{ textAlign: 'center', marginTop: 8 }}>
            <Text type="secondary">Đang xác thực với Google...</Text>
          </div>
        )}
      </Card>
    </div>
  );
};

export default LoginPage;