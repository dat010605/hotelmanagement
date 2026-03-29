import React, { useState, useEffect } from 'react';
import { Table, Button, Modal, Form, Input, Select, Switch, message, Tag, Space, Card, Row, Col } from 'antd';
import { PlusOutlined, EditOutlined, UserOutlined, MailOutlined, SearchOutlined, ReloadOutlined } from '@ant-design/icons';
import axiosClient from '../api/axiosClient';
import RequirePermission from '../components/RequirePermission'; 

const UserManagementPage = () => {
  const [users, setUsers] = useState([]);
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(false);
  
  const [filters, setFilters] = useState({ searchTerm: '', roleId: undefined, status: undefined });
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [form] = Form.useForm();

  const fetchData = async () => {
    setLoading(true);
    try {
      const [usersRes, rolesRes] = await Promise.all([
        axiosClient.get('/Users', { params: filters }), 
        axiosClient.get('/Roles')
      ]);
      setUsers(usersRes.data);
      setRoles(rolesRes.data);
    } catch (error) {
      message.error('Lỗi tải dữ liệu!');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, [filters.roleId, filters.status]);

  const handleResetFilters = () => setFilters({ searchTerm: '', roleId: undefined, status: undefined });

  const showEditModal = (user) => {
    setIsEditMode(true); setEditingUser(user); setIsModalVisible(true);
    form.setFieldsValue({ fullName: user.fullName, email: user.email, roleId: user.roleId || user.role?.id });
  };

  const handleSave = async (values) => {
    try {
      if (isEditMode && editingUser) {
        await axiosClient.put(`/Users/${editingUser.id}/Roles`, values.roleId, { headers: { 'Content-Type': 'application/json' }}); 
        message.success('Cập nhật vai trò thành công!');
      } else {
        await axiosClient.post('/Users', values);
        message.success('Thêm nhân viên thành công!');
      }
      setIsModalVisible(false); form.resetFields(); fetchData();
    } catch (error) { message.error('Thao tác thất bại. Kiểm tra lại Backend!'); }
  };

  const handleToggleStatus = async (userId) => {
    try {
      await axiosClient.patch(`/Users/${userId}/ToggleStatus`);
      message.success('Đã cập nhật trạng thái'); fetchData();
    } catch (error) { message.error('Lỗi hệ thống!'); }
  };

  const columns = [
    { title: 'Họ và Tên', dataIndex: 'fullName', key: 'fullName' },
    { title: 'Email', dataIndex: 'email', key: 'email' },
    { title: 'Số điện thoại', dataIndex: 'phone', key: 'phone', render: (text) => text || '---' },
    { 
      title: 'Vai trò', key: 'role',
      render: (_, record) => {
        const roleName = record.role?.name || record.roleName || 'Khách hàng'; 
        return <Tag color={roleName === 'Admin' ? 'volcano' : 'blue'}>{roleName}</Tag>;
      }
    },
    {
      title: 'Trạng thái', key: 'status',
      render: (_, record) => <Switch checked={record.status} onChange={() => handleToggleStatus(record.id)} checkedChildren="Hoạt động" unCheckedChildren="Khóa"/>
    },
    {
      title: 'Hành động', key: 'action',
      render: (_, record) => (
        <RequirePermission permission="MANAGE_USERS">
          <Button type="primary" ghost icon={<EditOutlined />} onClick={() => showEditModal(record)}>Sửa quyền</Button>
        </RequirePermission>
      ),
    },
  ];

  return (
    <Card 
      title={<span style={{fontSize: '20px'}}>👥 Quản lý Nhân sự & Người dùng</span>} 
      extra={
        <RequirePermission permission="MANAGE_USERS">
          <Button type="primary" icon={<PlusOutlined />} onClick={() => { setIsEditMode(false); setIsModalVisible(true); form.resetFields(); }}>Thêm Nhân Viên</Button>
        </RequirePermission>
      }
    >
      <div style={{ marginBottom: 20, padding: '15px', background: '#f9f9f9', borderRadius: '8px' }}>
        <Row gutter={[16, 16]} align="middle">
          <Col xs={24} md={8}>
            <Input prefix={<SearchOutlined style={{color: '#bfbfbf'}}/>} placeholder="Tìm theo Tên, Email hoặc SĐT..." value={filters.searchTerm} onChange={(e) => setFilters({...filters, searchTerm: e.target.value})} onPressEnter={fetchData} allowClear />
          </Col>
          <Col xs={12} md={5}>
            <Select style={{ width: '100%' }} placeholder="Lọc theo Vai trò" value={filters.roleId} onChange={(val) => setFilters({...filters, roleId: val})} allowClear>
              {roles.map(role => <Select.Option key={role.id} value={role.id}>{role.name}</Select.Option>)}
            </Select>
          </Col>
          <Col xs={12} md={4}>
            <Select style={{ width: '100%' }} placeholder="Trạng thái" value={filters.status} onChange={(val) => setFilters({...filters, status: val})} allowClear>
              <Select.Option value={true}>Hoạt động</Select.Option>
              <Select.Option value={false}>Đang khóa</Select.Option>
            </Select>
          </Col>
          <Col xs={24} md={7}>
            <Space>
              <Button type="primary" icon={<SearchOutlined />} onClick={fetchData}>Tìm kiếm</Button>
              <Button icon={<ReloadOutlined />} onClick={handleResetFilters}>Xóa lọc</Button>
            </Space>
          </Col>
        </Row>
      </div>
      <Table dataSource={users} columns={columns} rowKey="id" loading={loading} pagination={{ pageSize: 8 }} />
      <Modal title={isEditMode ? "📝 Chỉnh sửa nhân viên" : "➕ Thêm nhân viên mới"} open={isModalVisible} onCancel={() => setIsModalVisible(false)} onOk={() => form.submit()}>
        <Form form={form} layout="vertical" onFinish={handleSave}>
          <Form.Item name="fullName" label="Họ tên" rules={[{ required: true, message: 'Vui lòng nhập họ tên' }]}><Input prefix={<UserOutlined />} disabled={isEditMode} /></Form.Item>
          <Form.Item name="email" label="Email" rules={[{ required: true, type: 'email', message: 'Email không hợp lệ' }]}><Input prefix={<MailOutlined />} disabled={isEditMode} /></Form.Item>
          <Form.Item name="roleId" label="Vai trò / Chức vụ" rules={[{ required: true, message: 'Vui lòng chọn vai trò' }]}>
            <Select placeholder="Chọn vai trò">{roles.map(role => <Select.Option key={role.id} value={role.id}>{role.name}</Select.Option>)}</Select>
          </Form.Item>
        </Form>
      </Modal>
    </Card>
  );
};

export default UserManagementPage;