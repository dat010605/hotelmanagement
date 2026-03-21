import React, { useState } from 'react';
import { Form, Input, Button, Card, notification, Typography } from 'antd';
import { UserOutlined, LockOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import axiosClient from '../api/axiosClient';
import { useAdminAuthStore } from '../store/adminAuthStore';

const { Title } = Typography;

const LoginPage = () => {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  // Lấy hàm lưu token từ Zustand Store
  const setAuth = useAdminAuthStore((state) => state.setAuth);

  const onFinish = async (values) => {
    setLoading(true);
    try {
      // Gọi API đăng nhập thực tế tới Backend
      const response = await axiosClient.post('/Auth/login', {
        email: values.email,
        password: values.password,
      });

      // Bóc tách dữ liệu từ Backend (Ngài nhớ chỉnh lại key cho khớp với API của team nhé)
      const { token, user, permissions } = response.data;

      // Lưu vào Zustand và LocalStorage
      setAuth(token, user, permissions);
      
      notification.success({
        message: 'Đăng nhập thành công!',
        description: `Chào mừng ${user?.fullName || 'bạn'} quay trở lại.`,
        placement: 'topRight',
      });

      // Chuyển hướng vào trang trong
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

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', background: '#f0f2f5' }}>
      <Card style={{ width: 400, boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>
        <div style={{ textAlign: 'center', marginBottom: 24 }}>
          <Title level={3}>Hotel ERP Admin</Title>
          <p>Vui lòng đăng nhập để tiếp tục</p>
        </div>

        <Form name="login_form" onFinish={onFinish} layout="vertical">
          <Form.Item
            name="email"
            rules={[
              { required: true, message: 'Vui lòng nhập Email!' }, 
              { type: 'email', message: 'Email không hợp lệ!' }
            ]}
          >
            <Input prefix={<UserOutlined />} placeholder="Email quản trị" size="large" />
          </Form.Item>

          <Form.Item
            name="password"
            rules={[{ required: true, message: 'Vui lòng nhập Mật khẩu!' }]}
          >
            <Input.Password prefix={<LockOutlined />} placeholder="Mật khẩu" size="large" />
          </Form.Item>

          <Form.Item>
            <Button type="primary" htmlType="submit" size="large" block loading={loading}>
              Đăng Nhập
            </Button>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
};

export default LoginPage;