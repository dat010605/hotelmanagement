import React, { useState } from 'react';
import { Form, Input, Button, Card, App, Typography } from 'antd';
import { UserOutlined, LockOutlined } from '@ant-design/icons';
import { useNavigate, Link } from 'react-router-dom';
import axiosClient from '../api/axiosClient';
import { useAdminAuthStore } from '../store/adminAuthStore';

const { Title, Text } = Typography;

const LoginPage = () => {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const setAuth = useAdminAuthStore((state) => state.setAuth);
  const { notification } = App.useApp();

  const onFinish = async (values) => {
    setLoading(true);
    try {
      const response = await axiosClient.post('Auth/Login', {
        email: values.email,
        password: values.password,
      });

      const { token, user, permissions } = response.data;

      // =====================================================================
      // 🌟 THUẬT TOÁN "BẮT TRỌN Ổ" CHỨC VỤ (ROLE)
      // =====================================================================
      // 1. Tìm bất kỳ thứ gì có chữ "role" mà API trả về
      let rawRole = user?.roleId || user?.RoleId || user?.role_id || user?.role || user?.Role || response.data?.roleId || '1';
      
      // 2. Dịch chữ sang số để Dashboard hiểu được (nếu API trả về chữ)
      let finalRoleId = String(rawRole).toLowerCase();
      if (finalRoleId === 'admin') finalRoleId = '1';
      else if (finalRoleId === 'manager') finalRoleId = '2';
      else if (finalRoleId === 'receptionist') finalRoleId = '3';
      else if (finalRoleId === 'accountant') finalRoleId = '4';
      else if (finalRoleId === 'housekeeping') finalRoleId = '5';
      
      // 3. Lưu vào bộ nhớ
      localStorage.setItem('userRole', finalRoleId);
      // =====================================================================

      setAuth(token, user, permissions);
      
      notification.success({
        message: 'Đăng nhập thành công!',
        description: `Chào mừng ${user?.fullName || user?.FullName || 'bạn'} quay trở lại.`,
        placement: 'topRight',
      });

      navigate('/admin/dashboard'); 
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

  const bigInputStyle = {
    padding: '16px 20px', 
    fontSize: '18px', 
    borderRadius: '10px', 
  };

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
        <div style={{ textAlign: 'center', marginBottom: 35 }}>
          <Title level={1} style={{ color: '#1c1e21', fontWeight: 'bold', marginBottom: 10 }}>
            Hotel Những Người Bạn
          </Title>
          <Text style={{ fontSize: '18px', color: '#1c1e21' }}>
            Vui lòng đăng nhập để tiếp tục 
          </Text>
        </div>

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
      </Card>
    </div>
  );
};

export default LoginPage;