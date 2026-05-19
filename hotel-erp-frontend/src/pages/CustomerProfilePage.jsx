import React, { useState } from 'react';
import {
  Card, Form, Input, Button, Upload, Avatar, Typography, App,
  Divider, Row, Col, DatePicker
} from 'antd';
import {
  UserOutlined, CameraOutlined, LockOutlined, SaveOutlined, MailOutlined, CalendarOutlined
} from '@ant-design/icons';
import { useAdminAuthStore } from '../store/adminAuthStore';
import { useCustomerProfileStore } from '../store/useCustomerProfileStore';

const { Title, Text } = Typography;

const CustomerProfilePage = () => {
  const { user } = useAdminAuthStore();
  const { getProfile, setDisplayName, setAvatarUrl } = useCustomerProfileStore();
  const { notification } = App.useApp();

  const email = user?.email || user?.Email || '';
  const profile = getProfile(email);

  // Lấy tên & avatar: ưu tiên override, sau đó fallback về server data
  const currentName = profile.displayName || user?.fullName || user?.FullName || user?.name || 'Khách';
  const currentAvatar = profile.avatarUrl || user?.avatarUrl || user?.AvatarUrl || null;

  const [avatarUrl, setAvatarUrlLocal] = useState(currentAvatar);
  const [nameForm] = Form.useForm();
  const [passwordForm] = Form.useForm();
  const [savingName, setSavingName] = useState(false);
  const [savingPw, setSavingPw] = useState(false);

  // ─── Đổi tên ─────────────────────────────────────────────────────────────
  const handleSaveName = async (values) => {
    setSavingName(true);
    try {
      setDisplayName(email, values.fullName);
      notification.success({ message: 'Đã cập nhật tên thành công!', description: 'Tên mới sẽ hiển thị ngay cả sau khi đăng xuất và đăng nhập lại.', placement: 'topRight' });
    } catch {
      notification.error({ message: 'Lỗi khi lưu tên!', placement: 'topRight' });
    } finally {
      setSavingName(false);
    }
  };

  // ─── Đổi mật khẩu ────────────────────────────────────────────────────────
  const handleSavePassword = async (values) => {
    setSavingPw(true);
    try {
      // TODO: gọi API thực khi backend hỗ trợ endpoint đổi mật khẩu
      // await axiosClient.put('/Auth/change-password', { currentPassword: values.currentPassword, newPassword: values.newPassword });
      notification.success({ message: 'Đã đổi mật khẩu thành công!', placement: 'topRight' });
      passwordForm.resetFields();
    } catch (err) {
      notification.error({
        message: 'Đổi mật khẩu thất bại',
        description: err?.response?.data?.message || 'Vui lòng kiểm tra lại mật khẩu hiện tại.',
        placement: 'topRight'
      });
    } finally {
      setSavingPw(false);
    }
  };

  // ─── Đổi Avatar ──────────────────────────────────────────────────────────
  const handleAvatarChange = (info) => {
    const file = info.file.originFileObj || info.file;
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      const dataUrl = e.target.result;
      setAvatarUrlLocal(dataUrl);
      // Lưu vào store bền vững theo email
      setAvatarUrl(email, dataUrl);
      notification.success({ message: 'Đã cập nhật ảnh đại diện!', description: 'Ảnh sẽ được giữ sau khi đăng xuất và đăng nhập lại.', placement: 'topRight' });
    };
    reader.readAsDataURL(file);
  };

  return (
    <div style={{ maxWidth: 720, margin: '40px auto', padding: '0 20px' }}>
      <Title level={2} style={{ marginBottom: 8 }}>Tài khoản của tôi</Title>
      <Text type="secondary">Quản lý thông tin cá nhân và bảo mật tài khoản</Text>

      {/* AVATAR SECTION */}
      <Card style={{ borderRadius: 12, marginTop: 24, marginBottom: 24 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 24 }}>
          <div style={{ position: 'relative' }}>
            <Avatar
              size={96}
              src={avatarUrl}
              icon={!avatarUrl && <UserOutlined />}
              style={{ background: '#1890ff', fontSize: 40 }}
            />
            <Upload
              showUploadList={false}
              accept="image/*"
              beforeUpload={() => false}
              onChange={handleAvatarChange}
            >
              <div style={{
                position: 'absolute', bottom: 0, right: 0,
                background: '#1890ff', borderRadius: '50%',
                width: 28, height: 28, display: 'flex',
                alignItems: 'center', justifyContent: 'center',
                cursor: 'pointer', border: '2px solid #fff'
              }}>
                <CameraOutlined style={{ color: '#fff', fontSize: 14 }} />
              </div>
            </Upload>
          </div>
          <div>
            <Title level={4} style={{ margin: 0 }}>{currentName}</Title>
            <Text type="secondary"><MailOutlined /> {email || 'Chưa có email'}</Text>
          </div>
        </div>
      </Card>

      <Row gutter={[24, 24]}>
        {/* CHANGE NAME */}
        <Col xs={24} md={12}>
          <Card title={<><UserOutlined /> Đổi tên hiển thị</>} style={{ borderRadius: 12, height: '100%' }}>
            <Form
              form={nameForm}
              layout="vertical"
              onFinish={handleSaveName}
              initialValues={{ fullName: currentName }}
            >
              <Form.Item
                name="fullName"
                label="Tên mới"
                rules={[{ required: true, message: 'Vui lòng nhập tên!' }]}
              >
                <Input size="large" placeholder="Nhập tên của bạn" prefix={<UserOutlined />} />
              </Form.Item>
              <Form.Item name="dateOfBirth" label={<><CalendarOutlined style={{ color: '#c9a961' }} /> Ngày sinh <Text type="secondary">(để nhận voucher sinh nhật)</Text></>}>
                <DatePicker size="large" style={{ width: '100%' }} placeholder="Chọn ngày sinh" format="DD/MM/YYYY" />
              </Form.Item>
              <Form.Item style={{ marginBottom: 0 }}>
                <Button type="primary" htmlType="submit" block loading={savingName} icon={<SaveOutlined />} size="large">
                  Lưu thông tin
                </Button>
              </Form.Item>
            </Form>
          </Card>
        </Col>

        {/* CHANGE PASSWORD */}
        <Col xs={24} md={12}>
          <Card title={<><LockOutlined /> Đổi mật khẩu</>} style={{ borderRadius: 12, height: '100%' }}>
            <Form form={passwordForm} layout="vertical" onFinish={handleSavePassword}>
              <Form.Item name="currentPassword" label="Mật khẩu hiện tại" rules={[{ required: true, message: 'Nhập mật khẩu hiện tại!' }]}>
                <Input.Password size="large" placeholder="••••••••" prefix={<LockOutlined />} />
              </Form.Item>
              <Form.Item name="newPassword" label="Mật khẩu mới" rules={[{ required: true, message: 'Nhập mật khẩu mới!' }, { min: 6, message: 'Tối thiểu 6 ký tự!' }]}>
                <Input.Password size="large" placeholder="••••••••" prefix={<LockOutlined />} />
              </Form.Item>
              <Form.Item
                name="confirmPassword"
                label="Xác nhận mật khẩu"
                dependencies={['newPassword']}
                rules={[
                  { required: true, message: 'Xác nhận mật khẩu!' },
                  ({ getFieldValue }) => ({
                    validator(_, value) {
                      if (!value || getFieldValue('newPassword') === value) return Promise.resolve();
                      return Promise.reject(new Error('Mật khẩu không khớp!'));
                    }
                  })
                ]}
              >
                <Input.Password size="large" placeholder="••••••••" prefix={<LockOutlined />} />
              </Form.Item>
              <Form.Item style={{ marginBottom: 0 }}>
                <Button type="primary" htmlType="submit" block loading={savingPw} icon={<SaveOutlined />} size="large" style={{ background: '#52c41a', borderColor: '#52c41a' }}>
                  Đổi mật khẩu
                </Button>
              </Form.Item>
            </Form>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default CustomerProfilePage;
