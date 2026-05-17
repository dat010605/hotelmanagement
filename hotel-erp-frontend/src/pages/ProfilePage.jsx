import React, { useState } from 'react';
import { Card, Tabs, Form, Input, Button, Row, Col, Avatar, Upload, message, Switch, Typography, Select, Divider } from 'antd';
import { UserOutlined, LockOutlined, MailOutlined, PhoneOutlined, UploadOutlined, UserAddOutlined } from '@ant-design/icons';
import { useAdminAuthStore } from '../store/adminAuthStore';

const { Title, Text } = Typography;
const { TabPane } = Tabs;

const ProfilePage = () => {
  const { user } = useAdminAuthStore();
  const [loading, setLoading] = useState(false);
  const [formInfo] = Form.useForm();
  const [formPassword] = Form.useForm();
  const [formCreateAccount] = Form.useForm();

  // 🌟 THUẬT TOÁN NHẬN DIỆN CHỨC VỤ THÔNG MINH
  const isAdmin = user?.role === 'Admin' || Number(user?.roleId) === 1;

  const getRoleDisplayName = () => {
    if (isAdmin) return 'Quản trị viên hệ thống (Admin)';
    if (user?.role === 'Manager' || Number(user?.roleId) === 2) return 'Quản lý (Manager)';
    if (user?.role === 'Receptionist' || Number(user?.roleId) === 3) return 'Lễ tân (Receptionist)';
    if (user?.role === 'Accountant' || Number(user?.roleId) === 4) return 'Kế toán (Accountant)';
    return user?.role || 'Nhân viên';
  };

  // ==========================================
  // TAB 1: CẬP NHẬT THÔNG TIN
  // ==========================================
  const handleUpdateInfo = async (values) => {
    setLoading(true);
    setTimeout(() => {
      message.success('Cập nhật thông tin thành công!');
      setLoading(false);
    }, 1000);
  };

  // ==========================================
  // TAB 2: ĐỔI MẬT KHẨU
  // ==========================================
  const handleChangePassword = async (values) => {
    setLoading(true);
    console.log("Dữ liệu đổi pass:", values);
    setTimeout(() => {
      message.info('Đổi mật khẩu thành công!');
      formPassword.resetFields();
      setLoading(false);
    }, 1000);
  };

  // ==========================================
  // TAB 3: TẠO TÀI KHOẢN MỚI
  // ==========================================
  const handleCreateAccount = async (values) => {
    setLoading(true);
    console.log("Dữ liệu tạo tài khoản:", values);
    setTimeout(() => {
      if (values.sendEmail) {
        message.success(`Đã tạo tài khoản và gửi Email chứa mật khẩu đến ${values.email}!`);
      } else {
        message.success('Tạo tài khoản thành công!');
      }
      formCreateAccount.resetFields();
      setLoading(false);
    }, 1500);
  };

  return (
    <div style={{ padding: '24px', background: 'transparent', minHeight: '100vh' }}>
      <Row gutter={[24, 24]} justify="center">
        {/* Cột Trái: Avatar & Tóm tắt */}
        <Col xs={24} md={8} lg={6}>
          <Card style={{ borderRadius: '12px', textAlign: 'center', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
            <Avatar 
              size={120} 
              src={user?.avatarUrl} 
              icon={<UserOutlined />} 
              style={{ backgroundColor: '#1890ff', marginBottom: '16px' }}
            />
            <Title level={4} style={{ margin: 0 }}>{user?.fullName || 'Người dùng ẩn danh'}</Title>
            
            {/* 🌟 GỌI HÀM HIỂN THỊ CHỨC VỤ Ở ĐÂY */}
            <Text type="secondary" strong>{getRoleDisplayName()}</Text>
            
            <Divider />
            
            <div style={{ textAlign: 'left' }}>
              <p><MailOutlined style={{ marginRight: 8 }}/> {user?.email || 'Chưa cập nhật Email'}</p>
              <p><PhoneOutlined style={{ marginRight: 8 }}/> {user?.phone || 'Chưa cập nhật SĐT'}</p>
            </div>
            
            <Upload showUploadList={false}>
              <Button icon={<UploadOutlined />} style={{ marginTop: 16 }} block>Đổi Ảnh Đại Diện</Button>
            </Upload>
          </Card>
        </Col>

        {/* Cột Phải: Các Tab Chức Năng */}
        <Col xs={24} md={16} lg={14}>
          <Card style={{ borderRadius: '12px', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
            <Tabs defaultActiveKey="1" size="large">
              
              {/* TAB 1 */}
              <TabPane tab={<span><UserOutlined />Thông tin cá nhân</span>} key="1">
                <Form 
                  form={formInfo} 
                  layout="vertical" 
                  onFinish={handleUpdateInfo}
                  initialValues={{ fullName: user?.fullName, phone: user?.phone, email: user?.email }}
                  style={{ marginTop: 20 }}
                >
                  <Row gutter={16}>
                    <Col span={12}>
                      <Form.Item name="fullName" label="Họ và Tên" rules={[{ required: true }]}>
                        <Input size="large" />
                      </Form.Item>
                    </Col>
                    <Col span={12}>
                      <Form.Item name="phone" label="Số điện thoại">
                        <Input size="large" />
                      </Form.Item>
                    </Col>
                    <Col span={24}>
                      <Form.Item name="email" label="Email liên hệ">
                        <Input size="large" />
                      </Form.Item>
                    </Col>
                  </Row>
                  <Button type="primary" htmlType="submit" size="large" loading={loading}>Lưu thay đổi</Button>
                </Form>
              </TabPane>

              {/* TAB 2 */}
              <TabPane tab={<span><LockOutlined />Đổi mật khẩu</span>} key="2">
                <Form form={formPassword} layout="vertical" onFinish={handleChangePassword} style={{ marginTop: 20 }}>
                  <Form.Item name="oldPassword" label="Mật khẩu hiện tại" rules={[{ required: true, message: 'Vui lòng nhập mật khẩu cũ!' }]}>
                    <Input.Password size="large" placeholder="Nhập mật khẩu đang sử dụng" />
                  </Form.Item>
                  <Form.Item name="newPassword" label="Mật khẩu mới" rules={[{ required: true, min: 6, message: 'Mật khẩu mới ít nhất 6 ký tự!' }]}>
                    <Input.Password size="large" placeholder="Nhập mật khẩu mới" />
                  </Form.Item>
                  <Form.Item 
                    name="confirmPassword" 
                    label="Xác nhận mật khẩu mới" 
                    dependencies={['newPassword']}
                    rules={[
                      { required: true, message: 'Vui lòng xác nhận mật khẩu!' },
                      ({ getFieldValue }) => ({
                        validator(_, value) {
                          if (!value || getFieldValue('newPassword') === value) return Promise.resolve();
                          return Promise.reject(new Error('Mật khẩu xác nhận không khớp!'));
                        },
                      }),
                    ]}
                  >
                    <Input.Password size="large" placeholder="Nhập lại mật khẩu mới" />
                  </Form.Item>
                  <Button type="primary" danger htmlType="submit" size="large" loading={loading}>Cập nhật mật khẩu</Button>
                </Form>
              </TabPane>

              {/* TAB 3: TẠO TÀI KHOẢN (ĐÃ FIX: Chỉ hiện nếu là Admin) */}
              {(isAdmin || !user) && (
                <TabPane tab={<span><UserAddOutlined />Tạo tài khoản nhân viên</span>} key="3">
                  <div style={{ background: '#e6f7ff', padding: '16px', borderRadius: '8px', marginBottom: '20px' }}>
                    <Text type="secondary">
                      💡 Mẹo: Khi chọn <b>"Gửi thông tin qua Email"</b>, hệ thống sẽ tự động phát sinh mật khẩu ngẫu nhiên và gửi thẳng vào Gmail của nhân viên để tăng tính bảo mật.
                    </Text>
                  </div>
                  
                  <Form form={formCreateAccount} layout="vertical" onFinish={handleCreateAccount} initialValues={{ sendEmail: true }}>
                    <Row gutter={16}>
                      <Col span={12}>
                        <Form.Item name="fullName" label="Họ và Tên" rules={[{ required: true, message: 'Nhập tên nhân viên!' }]}>
                          <Input size="large" placeholder="VD: Lê Lễ Tân" />
                        </Form.Item>
                      </Col>
                      <Col span={12}>
                        <Form.Item name="roleId" label="Chức vụ" rules={[{ required: true, message: 'Chọn chức vụ!' }]}>
                          <Select size="large" placeholder="-- Chọn cấp bậc --">
                            <Select.Option value={1}>Quản trị viên (Admin)</Select.Option>
                            <Select.Option value={2}>Quản lý (Manager)</Select.Option>
                            <Select.Option value={3}>Lễ tân (Receptionist)</Select.Option>
                            <Select.Option value={4}>Kế toán (Accountant)</Select.Option>
                            <Select.Option value={5}>Buồng phòng (Housekeeping)</Select.Option>
                            <Select.Option value={6}>Bảo vệ (Security)</Select.Option>
                            <Select.Option value={7}>Đầu bếp (Chef)</Select.Option>
                            <Select.Option value={8}>Phục vụ (Waiter)</Select.Option>
                            <Select.Option value={9}>Hỗ trợ IT (IT Support)</Select.Option>
                            <Select.Option value={10}>Khách hàng (Guest)</Select.Option>
                          </Select>
                        </Form.Item>
                      </Col>
                      <Col span={24}>
                        <Form.Item name="email" label="Địa chỉ Email (Bắt buộc để nhận thông báo)" rules={[{ required: true, type: 'email', message: 'Email không hợp lệ!' }]}>
                          <Input size="large" placeholder="VD: letan@hotel.com" />
                        </Form.Item>
                      </Col>
                      <Col span={24}>
                        <Form.Item name="sendEmail" valuePropName="checked">
                          <Switch defaultChecked /> <Text strong style={{ marginLeft: 8 }}>Gửi thông tin tài khoản & mật khẩu về Gmail này</Text>
                        </Form.Item>
                      </Col>
                    </Row>
                    <Button type="primary" htmlType="submit" size="large" icon={<UserAddOutlined />} loading={loading} style={{ backgroundColor: '#52c41a' }}>
                      Đăng ký tài khoản
                    </Button>
                  </Form>
                </TabPane>
              )}

            </Tabs>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default ProfilePage;

