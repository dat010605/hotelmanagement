import React, { useState, useEffect } from 'react';
import { Card, Table, Tag, Button, Space, Input, Select, Typography, Row, Col, Modal, Form, Switch, message } from 'antd';
import { SearchOutlined, EditOutlined, KeyOutlined, EyeOutlined, UserAddOutlined, ReloadOutlined } from '@ant-design/icons';
import axiosClient from '../api/axiosClient'; 

const { Title, Text } = Typography;
const { Option } = Select;

const UserManagementPage = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchText, setSearchText] = useState('');
  
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [formCreateAccount] = Form.useForm();
  const [creating, setCreating] = useState(false);

  // 1. LẤY DANH SÁCH NGƯỜI DÙNG TỪ C#
  const fetchUsers = async () => {
    setLoading(true);
    try {
      //  Nếu ngài đã sẵn sàng, hãy mở khóa dòng dưới đây để lấy Data thật từ C#
      // const res = await axiosClient.get('/Users');
      // setUsers(res.data);

      const fakeData = [
        { id: 1, fullName: 'Admin', email: 'admin@hotel.com', phone: '0589784564', role: 'Admin', status: true },
        { id: 2, fullName: 'Trần Manager', email: 'manager@hotel.com', phone: '0900000002', role: 'Manager', status: true },
        { id: 3, fullName: 'Lê Lễ Tân', email: 'reception1@hotel.com', phone: '0900000003', role: 'Receptionist', status: true },
        { id: 4, fullName: 'Khách Hàng A', email: 'guestA@gmail.com', phone: '0900000006', role: 'Guest', status: true },
      ];
      setUsers(fakeData);
    } catch (error) {
      message.error("Không thể tải danh sách nhân viên!");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  // =================================================================
  //  2. HÀM TẠO TÀI KHOẢN & GỬI GMAIL (ĐÃ MỞ KHÓA API THẬT)
  // =================================================================
  const handleCreateUser = async (values) => {
    setCreating(true);
    try {
      // Bắn cục Data này thẳng xuống C# (UsersController -> CreateUserWithEmail)
      const response = await axiosClient.post('/Users/create-with-email', values);
      
      // Nếu C# trả về Ok()
      if (values.sendEmail) {
        message.success(`Đã tạo tài khoản và gửi mật khẩu tới Email: ${values.email}`);
      } else {
        message.success('Tạo tài khoản thành công (Mật khẩu mặc định: 123456)!');
      }
      
      setIsCreateModalOpen(false); // Đóng cửa sổ
      formCreateAccount.resetFields(); // Xóa trắng Form
      fetchUsers(); // Refresh lại danh sách
      
    } catch (error) {
      // Bắt lỗi từ C# (Ví dụ: Trùng Email, Lỗi kết nối Gmail)
      const errorMsg = error.response?.data?.message || error.response?.data || "Có lỗi xảy ra khi tạo tài khoản!";
      message.error(errorMsg);
    } finally {
      setCreating(false);
    }
  };
  // =================================================================

  const columns = [
    { title: 'Họ và Tên', dataIndex: 'fullName', render: (name) => <Text strong>{name}</Text> },
    { title: 'Email', dataIndex: 'email' },
    { title: 'Số điện thoại', dataIndex: 'phone' },
    { 
      title: 'Vai trò', 
      dataIndex: 'role',
      render: (role) => {
        let color = 'blue';
        if (role === 'Admin') color = 'volcano';
        if (role === 'Manager') color = 'purple';
        if (role === 'Guest') color = 'default';
        return <Tag color={color}>{role}</Tag>;
      }
    },
    { 
      title: 'Trạng thái', 
      dataIndex: 'status',
      render: (isActive) => (
        <Switch checked={isActive} checkedChildren="Hoạt động" unCheckedChildren="Khóa" />
      )
    },
    {
      title: 'Hành động',
      align: 'center',
      render: (_, record) => (
        <Space>
          <Button size="small" icon={<EditOutlined style={{ color: '#1890ff' }}/>} />
          <Button size="small" icon={<KeyOutlined style={{ color: '#faad14' }}/>} />
          <Button size="small" icon={<EyeOutlined />} />
        </Space>
      )
    }
  ];

  return (
    <div style={{ padding: '24px' }}>
      <Card title={<Title level={3} style={{ margin: 0 }}>👥 Quản lý Nhân sự & Người dùng</Title>} bordered={false} style={{ borderRadius: '12px' }}>
        
        <Row justify="space-between" align="middle" style={{ marginBottom: 20 }} gutter={[16, 16]}>
          <Col>
            <Space wrap>
              <Input 
                placeholder="Tìm theo Tên, Email hoặc SĐT..." 
                prefix={<SearchOutlined />} 
                style={{ width: 280 }}
                onChange={e => setSearchText(e.target.value)}
              />
              <Select placeholder="Lọc theo Vai trò" style={{ width: 150 }} allowClear>
                <Option value="Admin">Admin</Option>
                <Option value="Manager">Manager</Option>
                <Option value="Receptionist">Receptionist</Option>
                <Option value="Guest">Guest</Option>
              </Select>
              <Select placeholder="Trạng thái" style={{ width: 150 }} allowClear>
                <Option value="true">Hoạt động</Option>
                <Option value="false">Đã khóa</Option>
              </Select>
              <Button type="primary" icon={<SearchOutlined />}>Tìm kiếm</Button>
              <Button icon={<ReloadOutlined />}>Xóa lọc</Button>
            </Space>
          </Col>
          
          <Col>
            <Button 
              type="primary" 
              icon={<UserAddOutlined />} 
              style={{ backgroundColor: '#52c41a', fontWeight: 'bold' }}
              onClick={() => setIsCreateModalOpen(true)}
            >
              Tạo tài khoản
            </Button>
          </Col>
        </Row>

        <Table 
          columns={columns} 
          dataSource={users.filter(u => u.fullName.toLowerCase().includes(searchText.toLowerCase()) || u.email.includes(searchText))} 
          rowKey="id" 
          loading={loading} 
        />
      </Card>

      <Modal
        title={<Title level={4} style={{ margin: 0 }}>Tạo tài khoản nhân viên mới</Title>}
        open={isCreateModalOpen}
        onCancel={() => setIsCreateModalOpen(false)}
        onOk={() => formCreateAccount.submit()}
        confirmLoading={creating}
        okText="Đăng ký & Gửi Email"
        width={600}
      >
        {/* DARK MODE: Dùng viền trong suốt và chữ ăn theo Theme */}
        <div style={{ 
          padding: '12px 16px', 
          borderRadius: '8px', 
          marginBottom: '20px', 
          border: '1px solid #1890ff', 
          backgroundColor: 'transparent' 
        }}>
          <Text type="secondary">
            <span style={{ fontSize: '16px', marginRight: '8px' }}>💡</span>
            <b>Mẹo bảo mật:</b> Khi bật <b>"Gửi thông tin qua Email"</b>, hệ thống sẽ sinh mật khẩu ngẫu nhiên và gửi thẳng vào Gmail của nhân viên để bảo mật.
          </Text>
        </div>
        
        <Form form={formCreateAccount} layout="vertical" onFinish={handleCreateUser} initialValues={{ sendEmail: true }}>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="fullName" label="Họ và Tên" rules={[{ required: true, message: 'Vui lòng nhập tên!' }]}>
                <Input size="large" placeholder="VD: Lê Lễ Tân" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="roleId" label="Chức vụ" rules={[{ required: true, message: 'Vui lòng chọn chức vụ!' }]}>
                <Select size="large" placeholder="-- Chọn cấp bậc --">
                  <Option value={1}>Quản trị viên (Admin)</Option>
                  <Option value={2}>Quản lý (Manager)</Option>
                  <Option value={3}>Lễ tân (Receptionist)</Option>
                  <Option value={4}>Kế toán (Accountant)</Option>
                  <Option value={5}>Buồng phòng (Housekeeping)</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={24}>
              <Form.Item name="email" label="Địa chỉ Email (Nhân viên)" rules={[{ required: true, type: 'email', message: 'Email không hợp lệ!' }]}>
                <Input size="large" placeholder="VD: nhanvien@gmail.com" />
              </Form.Item>
            </Col>
            <Col span={24}>
              <Form.Item name="phone" label="Số điện thoại (Không bắt buộc)">
                <Input size="large" placeholder="VD: 0901234567" />
              </Form.Item>
            </Col>
            <Col span={24}>
              <Form.Item name="sendEmail" valuePropName="checked">
                <Switch defaultChecked /> <Text strong style={{ marginLeft: 8 }}>Gửi thông tin tài khoản & mật khẩu về Gmail này</Text>
              </Form.Item>
            </Col>
          </Row>
        </Form>
      </Modal>
    </div>
  );
};

export default UserManagementPage;