import React, { useState, useEffect } from 'react';
import { Card, Form, Input, Button, Upload, message, Row, Col, Avatar, Divider, Typography, Space } from 'antd';
import { UploadOutlined, UserOutlined, PhoneOutlined, MailOutlined, SaveOutlined } from '@ant-design/icons';
import axiosClient from '../api/axiosClient';
import { useAdminAuthStore } from '../store/adminAuthStore';

const { Title, Text } = Typography;

const ProfilePage = () => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  
  // Lấy dữ liệu từ Zustand Store
  const { user, setAuth, token, permissions } = useAdminAuthStore();
  
  const API_URL = axiosClient.defaults.baseURL.replace('/api', '');
  const [previewImage, setPreviewImage] = useState(null);
  
  const [displayData, setDisplayData] = useState({
    fullName: 'Người dùng',
    phone: 'Chưa cập nhật'
  });

  // Hàm xử lý hiển thị ảnh
  const getFullAvatarUrl = (url) => {
    if (!url) return null;
    if (url.startsWith('http')) return url; // Link Cloudinary
    return `${API_URL}${url}`; // Link local
  };

  // 1. Load dữ liệu khi vào trang
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await axiosClient.get('/UserProfile/my-profile');
        const data = response.data;

        // Ưu tiên lấy avatarUrl (camelCase) cho khớp với Backend mới
        const currentAvatar = data.avatarUrl || data.avatar_url;

        form.setFieldsValue({
          fullName: data.fullName || data.full_name,
          phone: data.phone,
          email: data.email
        });

        setDisplayData({ 
          fullName: data.fullName || data.full_name, 
          phone: data.phone 
        });

        setPreviewImage(getFullAvatarUrl(currentAvatar));
      } catch (error) {
        console.error("Lỗi load profile:", error);
      }
    };
    fetchProfile();
  }, [form]);

  // 2. Xử lý khi bấm LƯU
  const onFinish = async (values) => {
    setLoading(true);
    try {
      // BƯỚC 1: Cập nhật thông tin text
      await axiosClient.put('/UserProfile/update-profile', {
        fullName: values.fullName,
        phone: values.phone
      });

      // BƯỚC 2: Upload ảnh (nếu có chọn file mới)
      if (values.avatar?.file?.originFileObj) {
        const formData = new FormData();
        formData.append('file', values.avatar.file.originFileObj); 

        const uploadRes = await axiosClient.post('/UserProfile/upload-avatar', formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        
        // Ngay khi upload xong, cập nhật ảnh preview để người dùng thấy luôn
        const newUrl = uploadRes.data.avatarUrl || uploadRes.data.avatar_url;
        if (newUrl) {
          setPreviewImage(getFullAvatarUrl(newUrl));
        }
      }

      // BƯỚC 3: QUAN TRỌNG - Đồng bộ lại toàn bộ hệ thống
      // Lấy lại dữ liệu "sạch" nhất từ Database sau khi đã lưu
      const finalRes = await axiosClient.get('/UserProfile/my-profile');
      const latestData = finalRes.data;

      // Cập nhật Zustand Store. 
      // Chú ý: Đảm bảo setAuth nhận vào đối tượng có cấu trúc giống hệt lúc Login
      setAuth(token, latestData, permissions); 
      
      message.success('Hồ sơ và ảnh đại diện đã được cập nhật!');
    } catch (error) {
      console.error("Lỗi cập nhật:", error);
      message.error('Cập nhật thất bại. Vui lòng kiểm tra lại!');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: '20px' }}>
      <Row gutter={24}>
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
              <Text type="secondary">Nhân viên hệ thống</Text>
            </div>
            <Divider />
            <Space direction="vertical" style={{ width: '100%', textAlign: 'left' }}>
              <Text><MailOutlined /> {form.getFieldValue('email')}</Text>
              <Text><PhoneOutlined /> {displayData.phone || 'Chưa cập nhật'}</Text>
            </Space>
          </Card>
        </Col>

        <Col xs={24} md={16}>
          <Card title="Chỉnh sửa thông tin cá nhân" style={{ borderRadius: 12 }}>
            <Form form={form} layout="vertical" onFinish={onFinish}
              onValuesChange={(changed, all) => {
                setDisplayData({ fullName: all.fullName, phone: all.phone });
              }}
            >
              <Form.Item label="Ảnh đại diện" name="avatar">
                <Upload 
                  maxCount={1} 
                  beforeUpload={() => false} 
                  listType="picture"
                  showUploadList={false}
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
                  <Form.Item label="Họ và Tên" name="fullName" rules={[{ required: true, message: 'Nhập họ tên!' }]}>
                    <Input prefix={<UserOutlined />} size="large" />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item label="Số điện thoại" name="phone">
                    <Input prefix={<PhoneOutlined />} size="large" />
                  </Form.Item>
                </Col>
              </Row>

              <Form.Item label="Email" name="email">
                <Input prefix={<MailOutlined />} disabled size="large" />
              </Form.Item>

              <Button type="primary" htmlType="submit" icon={<SaveOutlined />} loading={loading} size="large" style={{ width: '100%', height: '45px', borderRadius: 8 }}>
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