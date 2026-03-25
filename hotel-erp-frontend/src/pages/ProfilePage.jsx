import React, { useState, useEffect } from 'react';
import { Card, Form, Input, Button, Upload, message, Row, Col, Avatar, Divider, Typography, Space } from 'antd';
import { UploadOutlined, UserOutlined, PhoneOutlined, MailOutlined, SaveOutlined } from '@ant-design/icons';
import axiosClient from '../api/axiosClient';
import { useAdminAuthStore } from '../store/adminAuthStore';

const { Title, Text } = Typography;

const ProfilePage = () => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const { user, setAuth, token, permissions } = useAdminAuthStore();
  const [previewImage, setPreviewImage] = useState(user?.avatarUrl || user?.avatar_url || null);
  
  // State phụ để đồng bộ tên/SĐT lên Card bên trái khi đang gõ
  const [displayData, setDisplayData] = useState({
    fullName: user?.fullName || user?.full_name || 'Người dùng',
    phone: user?.phone || 'Chưa cập nhật số điện thoại'
  });

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await axiosClient.get('/UserProfile/my-profile');
        const data = response.data;
        form.setFieldsValue({
          fullName: data.fullName || data.full_name,
          phone: data.phone,
          email: data.email
        });
        setDisplayData({ 
          fullName: data.fullName || data.full_name, 
          phone: data.phone 
        });
        if (data.avatarUrl || data.avatar_url) {
          setPreviewImage(data.avatarUrl || data.avatar_url);
        }
      } catch (error) {
        form.setFieldsValue({
          fullName: user?.fullName || user?.full_name,
          phone: user?.phone || '',
          email: user?.email || ''
        });
      }
    };
    fetchProfile();
  }, [form, user]);

  const onFinish = async (values) => {
    setLoading(true);
    try {
      // 1. Cập nhật thông tin text
      await axiosClient.put('/UserProfile/update-profile', {
        fullName: values.fullName,
        phone: values.phone
      });

      // 2. Upload ảnh nếu có
      if (values.avatar?.file?.originFileObj) {
        const formData = new FormData();
        formData.append('file', values.avatar.file.originFileObj); 

        const uploadRes = await axiosClient.post('/UserProfile/upload-avatar', formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        
        if (uploadRes.data.avatarUrl || uploadRes.data.avatar_url) {
          setPreviewImage(uploadRes.data.avatarUrl || uploadRes.data.avatar_url);
        }
      }

      // 3. Lấy lại dữ liệu tươi nhất để cập nhật Store
      const finalProfile = await axiosClient.get('/UserProfile/my-profile');
      setAuth(token, finalProfile.data, permissions);
      
      message.success('Cập nhật hồ sơ thành công!');
    } catch (error) {
      message.error(error.response?.data?.message || 'Cập nhật thất bại!');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: '20px' }}>
      <Row gutter={24}>
        {/* Cột hiển thị (Bên trái) */}
        <Col xs={24} md={8}>
          <Card style={{ borderRadius: 12, textAlign: 'center' }}>
            <div style={{ padding: '20px 0' }}>
              <Avatar 
                size={140} 
                src={previewImage} 
                icon={<UserOutlined />} 
                style={{ border: '4px solid #f0f2f5', marginBottom: 20 }} 
              />
              <Title level={4}>{displayData.fullName}</Title>
              <Text type="secondary">Kỹ sư Khung giao diện</Text>
            </div>
            <Divider />
            <Space direction="vertical" style={{ width: '100%', textAlign: 'left' }}>
              <Text><MailOutlined /> {user?.email}</Text>
              <Text><PhoneOutlined /> {displayData.phone || 'Chưa cập nhật'}</Text>
            </Space>
          </Card>
        </Col>

        {/* Cột chỉnh sửa (Bên phải) */}
        <Col xs={24} md={16}>
          <Card title="Chỉnh sửa thông tin cá nhân" style={{ borderRadius: 12 }}>
            <Form 
              form={form} 
              layout="vertical" 
              onFinish={onFinish}
              onValuesChange={(changedValues, allValues) => {
                setDisplayData({
                  fullName: allValues.fullName,
                  phone: allValues.phone
                });
              }}
            >
              <Form.Item label="Ảnh đại diện" name="avatar">
                <Upload 
                  maxCount={1} 
                  beforeUpload={() => false} 
                  listType="picture"
                  onChange={(info) => {
                    if (info.fileList.length > 0) {
                      const url = URL.createObjectURL(info.fileList[0].originFileObj);
                      setPreviewImage(url);
                    }
                  }}
                >
                  <Button icon={<UploadOutlined />}>Chọn ảnh mới</Button>
                </Upload>
              </Form.Item>

              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item label="Họ và Tên" name="fullName" rules={[{ required: true, message: 'Vui lòng nhập họ tên!' }]}>
                    <Input prefix={<UserOutlined />} size="large" />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item label="Số điện thoại" name="phone">
                    <Input prefix={<PhoneOutlined />} size="large" />
                  </Form.Item>
                </Col>
              </Row>

              <Form.Item label="Email (Không thể thay đổi)" name="email">
                <Input prefix={<MailOutlined />} disabled size="large" />
              </Form.Item>

              <Button 
                type="primary" 
                htmlType="submit" 
                icon={<SaveOutlined />} 
                loading={loading} 
                size="large"
                style={{ borderRadius: 8, background: '#1877f2', height: '45px', width: '100%' }}
              >
                Lưu thay đổi
              </Button>
            </Form>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default ProfilePage;