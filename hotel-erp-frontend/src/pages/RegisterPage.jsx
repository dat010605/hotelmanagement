import React, { useState } from 'react';
<<<<<<< HEAD
import { Form, Input, Button, Card, App, Typography, Divider } from 'antd'; // Thêm Divider cho đẹp
import { UserOutlined, LockOutlined, MailOutlined } from '@ant-design/icons';
import { useNavigate, Link } from 'react-router-dom';
import axiosClient from '../api/axiosClient'; 
import { GoogleLogin } from '@react-oauth/google';
import { useAdminAuthStore } from '../store/adminAuthStore'; // Import store để lưu session sau khi ĐK thành công
=======
import { Form, Input, Button, Card, App, Typography, Divider } from 'antd';
import { UserOutlined, LockOutlined, MailOutlined } from '@ant-design/icons';
import { useNavigate, Link } from 'react-router-dom';
import { GoogleOAuthProvider, GoogleLogin } from '@react-oauth/google';
import axiosClient from '../api/axiosClient';
import { useAdminAuthStore } from '../store/adminAuthStore';
>>>>>>> datpronak123

const { Title, Text } = Typography;

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || '123456789-xxxx.apps.googleusercontent.com';

const RegisterPage = () => {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const setAuth = useAdminAuthStore((state) => state.setAuth);
  const { notification } = App.useApp();
  const setAuth = useAdminAuthStore((state) => state.setAuth);

<<<<<<< HEAD
  // --- LOGIC ĐĂNG KÝ THÔNG THƯỜNG ---
=======
  // Đăng ký thường
>>>>>>> datpronak123
  const onFinish = async (values) => {
    setLoading(true);
    try {
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

<<<<<<< HEAD
  // --- LOGIC GỬI TOKEN GOOGLE XUỐNG BACKEND ---
  const handleGoogleRegister = async (credentialResponse) => {
    setLoading(true);
    try {
      // Gửi Token Google xuống đúng endpoint GoogleLogin (thường dùng chung cho cả Login/Register)
      const response = await axiosClient.post('Auth/GoogleLogin', {
        idToken: credentialResponse.credential 
      });

      const { token, user, permissions } = response.data;
      
      // Lưu thông tin vào Store và LocalStorage để người dùng vào thẳng trang chủ
      localStorage.setItem('userRole', '10'); // Mặc định ĐK qua Google là Guest (Role 10)
      setAuth(token, user, permissions);

      notification.success({
        message: 'Đăng ký bằng Google thành công!',
        description: `Chào mừng ${user?.fullName || 'bạn'} đến với The Royal Citadel.`,
      });

      navigate('/'); // Vào thẳng trang chủ
    } catch (error) {
      notification.error({
        message: 'Lỗi đăng ký Google',
        description: 'Backend không thể xác thực tài khoản Google. Vui lòng thử lại!',
      });
    } finally {
      setLoading(false);
    }
  };

=======
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

>>>>>>> datpronak123
  const bigInputStyle = { padding: '16px 20px', fontSize: '18px', borderRadius: '10px' };

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', background: '#f0f2f5', fontFamily: 'SFProDisplay-Regular, Helvetica, Arial, sans-serif' }}>
      <Card style={{ width: 580, borderRadius: '12px', boxShadow: '0 8px 16px rgba(0, 0, 0, .1)', padding: '25px 15px' }}>
        <div style={{ textAlign: 'center', marginBottom: 25 }}>
          <Title level={2} style={{ color: '#1c1e21', fontWeight: 'bold', marginBottom: 4, fontFamily: "'Playfair Display', serif" }}>The Royal Citadel</Title>
<<<<<<< HEAD
          <Text style={{ fontSize: '14px', color: '#8c8c8c', letterSpacing: '2px', textTransform: 'uppercase' }}>Luxury Hotel & Resort</Text>
=======
          <Text style={{ fontSize: '14px', color: '#8c8c8c', letterSpacing: '2px', textTransform: 'uppercase' }}>Luxury Hotel &amp; Resort</Text>
>>>>>>> datpronak123
          <br />
          <Title level={3} style={{ color: '#1c1e21', marginTop: 12, marginBottom: 0 }}>Đăng Ký Tài Khoản</Title>
        </div>

        <Form name="register_form" onFinish={onFinish} layout="vertical">
          <Form.Item name="fullName" rules={[{ required: true, message: 'Vui lòng nhập Họ Tên!' }]} style={{ marginBottom: 15 }}>
            <Input prefix={<UserOutlined style={{ fontSize: '20px', color: '#90949c', marginRight: 8 }} />} placeholder="Họ và Tên" size="large" style={bigInputStyle} />
          </Form.Item>

          <Form.Item name="email" rules={[{ required: true, message: 'Vui lòng nhập Email!' }, { type: 'email', message: 'Email không hợp lệ!' }]} style={{ marginBottom: 15 }}>
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
            <Button type="primary" htmlType="submit" size="large" block loading={loading} style={{ height: '60px', fontSize: '18px', fontWeight: 'bold', borderRadius: '10px', background: '#42b72a', borderColor: '#42b72a' }}>
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

          <Divider plain style={{ fontSize: '14px', margin: '20px 0' }}></Divider>

          <div style={{ display: 'flex', justifyContent: 'center', width: '100%' }}>
            <GoogleLogin
              onSuccess={handleGoogleRegister}
              onError={() => notification.error({ message: 'Đăng ký Google thất bại' })}
              width="100%" 
              theme="outline"
              shape="rectangular"
              text="signup_with" 
            />
          </div>
        </Form>
      </Card>
    </div>
  );
};

<<<<<<< HEAD
export default RegisterPage;
=======
export default RegisterPage;
>>>>>>> datpronak123
