import React, { useState } from 'react';
import { Form, Input, Button, Card, App, Typography, Divider } from 'antd'; 
import { UserOutlined, LockOutlined } from '@ant-design/icons';
import { useNavigate, Link } from 'react-router-dom';
import axiosClient from '../api/axiosClient';
import { useAdminAuthStore } from '../store/adminAuthStore';
import { GoogleLogin } from '@react-oauth/google';

const { Title, Text } = Typography;

const LoginPage = () => {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const setAuth = useAdminAuthStore((state) => state.setAuth);
  const { notification } = App.useApp();

  // Hàm xử lý Role chung cho cả Login thường và Google Login
  const handleAuthSuccess = (data) => {
    const { token, user, permissions } = data;
    
    let rawRole = user?.roleId || user?.RoleId || user?.role_id || user?.role || user?.Role || data?.roleId || '1';
    let finalRoleId = String(rawRole).toLowerCase();
    
    const roleMap = {
      'admin': '1', 'manager': '2', 'receptionist': '3',
      'accountant': '4', 'housekeeping': '5', 'guest': '10'
    };
    
    finalRoleId = roleMap[finalRoleId] || finalRoleId;
    localStorage.setItem('userRole', finalRoleId);
    
    setAuth(token, user, permissions);

    if (finalRoleId === '10' || user?.role?.toLowerCase() === 'guest') {
      navigate('/'); 
    } else {
      navigate('/admin/dashboard'); 
    }
  };

  const onFinish = async (values) => {
    setLoading(true);
    try {
      const response = await axiosClient.post('Auth/Login', {
        email: values.email,
        password: values.password,
      });
      
      handleAuthSuccess(response.data);
      
      notification.success({
        message: 'Đăng nhập thành công!',
        description: `Chào mừng ${response.data.user?.fullName || 'bạn'} quay trở lại.`,
      });
    } catch (error) {
      notification.error({
        message: 'Đăng nhập thất bại',
        description: error.response?.data?.message || 'Sai email hoặc mật khẩu.',
      });
    } finally {
      setLoading(false);
    }
  };

  // ==========================================
  // 🚀 LOGIC GỬI TOKEN XUỐNG BACKEND (NEW)
  // ==========================================
  const handleGoogleLogin = async (credentialResponse) => {
    setLoading(true);
    try {
      // Gửi cái "vé" (credential) Google cấp xuống API C# của ông
      const response = await axiosClient.post('Auth/GoogleLogin', {
        idToken: credentialResponse.credential 
      });

      handleAuthSuccess(response.data);

      notification.success({
        message: 'Đăng nhập Google thành công!',
        description: 'Hệ thống đã xác thực tài khoản Google của bạn.',
      });
    } catch (error) {
      notification.error({
        message: 'Lỗi xác thực Google',
        description: 'Backend không thể xác minh tài khoản này. Vui lòng thử lại!',
      });
    } finally {
      setLoading(false);
    }
  };

  const bigInputStyle = { padding: '16px 20px', fontSize: '18px', borderRadius: '10px' };

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', background: '#f0f2f5' }}>
      <Card style={{ width: 580, borderRadius: '12px', boxShadow: '0 8px 16px rgba(0, 0, 0, .1)', padding: '25px 15px' }}>
        <div style={{ textAlign: 'center', marginBottom: 35 }}>
          <Title level={1} style={{ fontWeight: 'bold', marginBottom: 10, fontFamily: "'Playfair Display', serif" }}>The Royal Citadel</Title>
          <Text style={{ fontSize: '16px', color: '#8c8c8c', letterSpacing: '2px', textTransform: 'uppercase' }}>Luxury Hotel & Resort</Text>
        </div>

        <Form onFinish={onFinish} layout="vertical">
          <Form.Item name="email" rules={[{ required: true, message: 'Vui lòng nhập Email!' }, { type: 'email', message: 'Email không hợp lệ!' }]}>
            <Input prefix={<UserOutlined style={{ fontSize: '20px', color: '#90949c' }} />} placeholder="Email của bạn" style={bigInputStyle} />
          </Form.Item>

          <Form.Item name="password" rules={[{ required: true, message: 'Vui lòng nhập Mật khẩu!' }]}>
            <Input.Password prefix={<LockOutlined style={{ fontSize: '20px', color: '#90949c' }} />} placeholder="Mật khẩu" style={bigInputStyle} />
          </Form.Item>

          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 30 }}>
            <Link to="/forgot-password" style={{ color: '#1877f2', fontSize: '16px' }}>Quên mật khẩu?</Link>
            <Link to="/register" style={{ color: '#1877f2', fontSize: '16px' }}>Đăng ký tài khoản mới?</Link>
          </div>

          <Form.Item>
            <Button type="primary" htmlType="submit" size="large" block loading={loading} style={{ height: '60px', fontSize: '22px', fontWeight: 'bold', borderRadius: '10px' }}>
              Đăng Nhập
            </Button>
          </Form.Item>

          <Divider plain style={{ color: '#8c8c8c', fontSize: '14px' }}>Hoặc</Divider>

          <div style={{ display: 'flex', justifyContent: 'center', width: '100%' }}>
            <GoogleLogin
              onSuccess={handleGoogleLogin} // Đã đổi sang hàm gọi API Backend
              onError={() => notification.error({ message: 'Đăng nhập thất bại' })}
              width="450px"
              theme="outline"
              shape="pill"
            />
          </div>
        </Form>
      </Card>
    </div>
  );
};

export default LoginPage;