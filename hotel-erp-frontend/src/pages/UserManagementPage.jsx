import React, { useState, useEffect } from 'react';
import { Card, Table, Tag, Button, Space, Input, Select, Typography, Row, Col, Modal, Form, Switch, message, Descriptions } from 'antd';
import { SearchOutlined, EditOutlined, LockOutlined, EyeOutlined, UserAddOutlined, ReloadOutlined } from '@ant-design/icons';
import axiosClient from '../api/axiosClient';
import { useAdminAuthStore } from '../store/adminAuthStore';

const { Title, Text } = Typography;
const { Option } = Select;

const UserManagementPage = () => {
  const { user, setAuth, token, permissions } = useAdminAuthStore();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchText, setSearchText] = useState('');
  
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [formCreateAccount] = Form.useForm();
  const [creating, setCreating] = useState(false);

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [formEditAccount] = Form.useForm();
  const [editingUser, setEditingUser] = useState(null);

  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [viewingUser, setViewingUser] = useState(null);

  const fetchUsers = async () => {
    setLoading(true);
    try {
     const res = await axiosClient.get('/Users'); 
      setUsers(res.data);
    } catch (error) {
      message.error("Không thể tải danh sách nhân viên!");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleCreateUser = async (values) => {
    setCreating(true);
    try {
      await axiosClient.post('/Users/create-with-email', values);
      await new Promise(resolve => setTimeout(resolve, 1000)); 
      
      const newUser = { id: Date.now(), ...values, role: 'Receptionist', status: true };
      setUsers([newUser, ...users]);

      message.success(values.sendEmail ? `Đã tạo & gửi Email tới: ${values.email}` : 'Tạo tài khoản thành công!');
      setIsCreateModalOpen(false); 
      formCreateAccount.resetFields(); 
    } catch (error) {
      message.error("Có lỗi xảy ra khi tạo tài khoản!");
    } finally {
      setCreating(false);
    }
  };

  const handleOpenEdit = (record) => {
    setEditingUser(record);
    formEditAccount.setFieldsValue({
      fullName: record.fullName,
      phone: record.phone,
      role: record.role
    });
    setIsEditModalOpen(true);
  };

  const handleUpdateUser = async (values) => {
    try {
      await axiosClient.put(`/Users/${editingUser.id}`, values);
      const updatedUsers = users.map(u => 
        u.id === editingUser.id ? { ...u, fullName: values.fullName, phone: values.phone, role: values.role } : u
      );
      setUsers(updatedUsers);
      message.success(`Đã cập nhật thông tin cho ${values.fullName}`);
      setIsEditModalOpen(false);

      // Nếu người được cập nhật là chính người đang đăng nhập, tự động reload lại toàn bộ menu
      const myId = user?.id || user?.Id;
      if (myId && String(myId) === String(editingUser.id)) {
        const updatedUser = { ...user, role: values.role };
        setAuth(token, updatedUser, permissions);
        message.loading("Đang thiết lập lại phân quyền menu...", 1.5);
        setTimeout(() => {
          window.location.reload();
        }, 1200);
      }
    } catch (error) {
      message.error("Lỗi khi cập nhật!");
    }
  };

  //  THUẬT TOÁN BẢO VỆ ADMIN KHI KHÓA TÀI KHOẢN
  const handleToggleStatus = async (checked, record) => {
    if (!checked && (record.role === 'Admin' || record.roleId === 1)) {
      const activeAdmins = users.filter(u => (u.role === 'Admin' || u.roleId === 1) && u.status === true);
      if (activeAdmins.length <= 1) {
        message.error("Lỗi bảo mật: Hệ thống phải có ít nhất 1 Admin hoạt động!");
        return; 
      }
    }

    try {
      await axiosClient.patch(`/Users/${record.id}/ToggleStatus`);
      
      const updatedUsers = users.map(u => 
        u.id === record.id ? { ...u, status: checked } : u
      );
      setUsers(updatedUsers);
      message.success(`Đã ${checked ? 'Mở khóa' : 'Khóa'} tài khoản ${record.fullName}`);
    } catch (error) {
      message.error("Lỗi thay đổi trạng thái!");
    }
  };

  const handleOpenView = (record) => {
    setViewingUser(record);
    setIsViewModalOpen(true);
  };

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
        if (role === 'Receptionist') color = 'blue';
        if (role === 'Accountant') color = 'cyan';
        if (role === 'Housekeeping') color = 'geekblue';
        if (role === 'Security') color = 'magenta';
        if (role === 'Chef') color = 'gold';
        if (role === 'Waiter') color = 'lime';
        if (role === 'IT Support') color = 'orange';
        return <Tag color={color}>{role}</Tag>;
      }
    },
    { 
      title: 'Trạng thái', 
      dataIndex: 'status',
      render: (isActive, record) => (
        <Switch 
          checked={isActive} 
          checkedChildren="Hoạt động" 
          unCheckedChildren="Khóa" 
          onChange={(checked) => handleToggleStatus(checked, record)}
        />
      )
    },
    {
      title: 'Hành động',
      align: 'center',
      render: (_, record) => (
        <Space>
          <Button size="small" icon={<EditOutlined style={{ color: '#1890ff' }}/>} onClick={() => handleOpenEdit(record)} />
          <Button size="small" icon={<LockOutlined style={{ color: '#faad14' }}/>} 
            onClick={() => {
              Modal.confirm({
                title: `Reset mật khẩu cho ${record.fullName}?`,
                content: 'Hệ thống sẽ cấp lại mật khẩu mặc định là 123456.',
                onOk: () => message.success(`Đã cấp lại mật khẩu cho ${record.fullName}`)
              });
            }} 
          />
          <Button size="small" icon={<EyeOutlined />} onClick={() => handleOpenView(record)} />
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
              <Input placeholder="Tìm theo Tên, Email hoặc SĐT..." prefix={<SearchOutlined />} style={{ width: 280 }} onChange={e => setSearchText(e.target.value)} />
              <Button type="primary" icon={<SearchOutlined />}>Tìm kiếm</Button>
            </Space>
          </Col>
          <Col>
            <Button type="primary" icon={<UserAddOutlined />} style={{ backgroundColor: '#52c41a', fontWeight: 'bold' }} onClick={() => setIsCreateModalOpen(true)}>
              Tạo tài khoản
            </Button>
          </Col>
        </Row>

        <Table columns={columns} dataSource={users.filter(u => u.fullName.toLowerCase().includes(searchText.toLowerCase()) || u.email.includes(searchText))} rowKey="id" loading={loading} />
      </Card>

      {/* MODAL TẠO MỚI */}
      <Modal title={<Title level={4} style={{ margin: 0 }}>Tạo tài khoản nhân viên mới</Title>} open={isCreateModalOpen} onCancel={() => setIsCreateModalOpen(false)} onOk={() => formCreateAccount.submit()} confirmLoading={creating} okText="Đăng ký & Gửi Email" width={600}>
        <div style={{ padding: '12px 16px', borderRadius: '8px', marginBottom: '20px', border: '1px solid #1890ff', backgroundColor: 'transparent' }}>
          <Text type="secondary"><span style={{ fontSize: '16px', marginRight: '8px' }}>💡</span><b>Mẹo bảo mật:</b> Khi bật <b>"Gửi thông tin qua Email"</b>, hệ thống sẽ sinh mật khẩu ngẫu nhiên và gửi thẳng vào Gmail.</Text>
        </div>
        <Form form={formCreateAccount} layout="vertical" onFinish={handleCreateUser} initialValues={{ sendEmail: true }}>
          <Row gutter={16}>
            <Col span={12}><Form.Item name="fullName" label="Họ và Tên" rules={[{ required: true }]}><Input size="large" /></Form.Item></Col>
            <Col span={12}>
              <Form.Item name="roleId" label="Chức vụ" rules={[{ required: true }]}>
                <Select size="large">
                  <Option value={1}>Quản trị viên (Admin)</Option>
                  <Option value={2}>Quản lý (Manager)</Option>
                  <Option value={3}>Lễ tân (Receptionist)</Option>
                  <Option value={4}>Kế toán (Accountant)</Option>
                  <Option value={5}>Buồng phòng (Housekeeping)</Option>
                  <Option value={6}>Bảo vệ (Security)</Option>
                  <Option value={7}>Đầu bếp (Chef)</Option>
                  <Option value={8}>Phục vụ (Waiter)</Option>
                  <Option value={9}>Hỗ trợ IT (IT Support)</Option>
                  <Option value={10}>Khách hàng (Guest)</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={24}><Form.Item name="email" label="Địa chỉ Email" rules={[{ required: true, type: 'email' }]}><Input size="large" /></Form.Item></Col>
            <Col span={24}><Form.Item name="phone" label="Số điện thoại"><Input size="large" /></Form.Item></Col>
            <Col span={24}><Form.Item name="sendEmail" valuePropName="checked"><Switch defaultChecked /> <Text strong style={{ marginLeft: 8 }}>Gửi thông tin tài khoản & mật khẩu về Gmail này</Text></Form.Item></Col>
          </Row>
        </Form>
      </Modal>

      {/* MODAL SỬA THÔNG TIN */}
      <Modal title={<Title level={4} style={{ margin: 0 }}>Cập nhật thông tin nhân viên</Title>} open={isEditModalOpen} onCancel={() => setIsEditModalOpen(false)} onOk={() => formEditAccount.submit()} okText="Lưu thay đổi">
        <Form form={formEditAccount} layout="vertical" onFinish={handleUpdateUser} style={{ marginTop: 20 }}>
          <Form.Item name="fullName" label="Họ và Tên" rules={[{ required: true }]}><Input size="large" /></Form.Item>
          <Form.Item name="role" label="Chức vụ">
            <Select size="large">
              <Option value="Admin">Quản trị viên (Admin)</Option>
              <Option value="Manager">Quản lý (Manager)</Option>
              <Option value="Receptionist">Lễ tân (Receptionist)</Option>
              <Option value="Guest">Khách hàng (Guest)</Option>
              <Option value="Accountant">Kế toán (Accountant)</Option>
              <Option value="Housekeeping">Buồng phòng (Housekeeping)</Option>
              <Option value="Security">Bảo vệ (Security)</Option>
              <Option value="Chef">Đầu bếp (Chef)</Option>
              <Option value="Waiter">Phục vụ (Waiter)</Option>
              <Option value="IT Support">IT Hỗ trợ (IT Support)</Option>
            </Select>
          </Form.Item>
          <Form.Item name="phone" label="Số điện thoại"><Input size="large" /></Form.Item>
        </Form>
      </Modal>

      {/* MODAL XEM CHI TIẾT */}
      <Modal title={<Title level={4} style={{ margin: 0 }}>Chi tiết hồ sơ nhân viên</Title>} open={isViewModalOpen} onCancel={() => setIsViewModalOpen(false)} footer={[<Button key="close" type="primary" onClick={() => setIsViewModalOpen(false)}>Đóng</Button>]} width={600}>
        {viewingUser && (
          <Descriptions bordered column={1} size="middle" style={{ marginTop: 20 }}>
            <Descriptions.Item label="Mã định danh (ID)"><b>#{viewingUser.id}</b></Descriptions.Item>
            <Descriptions.Item label="Họ và Tên"><Text strong style={{ fontSize: '16px' }}>{viewingUser.fullName}</Text></Descriptions.Item>
            <Descriptions.Item label="Email liên hệ">{viewingUser.email}</Descriptions.Item>
            <Descriptions.Item label="Số điện thoại">{viewingUser.phone || <Text type="secondary">Chưa cập nhật</Text>}</Descriptions.Item>
            <Descriptions.Item label="Vai trò cấp phép">
              <Tag color={ viewingUser.role === 'Admin' ? 'volcano' : viewingUser.role === 'Manager' ? 'purple' : viewingUser.role === 'Receptionist' ? 'blue' : 'default' }>
                {viewingUser.role}
              </Tag>
            </Descriptions.Item>
            <Descriptions.Item label="Trạng thái tài khoản">
              {viewingUser.status ? <Tag color="success">Đang hoạt động</Tag> : <Tag color="error">Đã khóa</Tag>}
            </Descriptions.Item>
          </Descriptions>
        )}
      </Modal>
    </div>
  );
};

export default UserManagementPage;
