import React, { useState, useEffect } from 'react';
import { Table, Button, Modal, Form, Input, Select, Switch, message, Tag, Space, Card } from 'antd';
import { PlusOutlined, EditOutlined, UserOutlined, MailOutlined } from '@ant-design/icons';
import axiosClient from '../api/axiosClient';
// 1. Phải đảm bảo file này đã được tạo ở src/components/RequirePermission.jsx
import RequirePermission from '../components/RequirePermission'; 

const UserManagementPage = () => {
  const [users, setUsers] = useState([]);
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(false);
  
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [form] = Form.useForm();

  const fetchData = async () => {
    setLoading(true);
    try {
      const [usersRes, rolesRes] = await Promise.all([
        axiosClient.get('/Users'),
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

  useEffect(() => { fetchData(); }, []);

  const showEditModal = (user) => {
    setIsEditMode(true);
    setEditingUser(user);
    setIsModalVisible(true);
    form.setFieldsValue({
      fullName: user.fullName,
      email: user.email,
      roleId: user.roleId || user.role?.id
    });
  };

  const handleSave = async (values) => {
    try {
      if (isEditMode && editingUser) {
        // Sửa: Gửi đúng endpoint /Roles và chỉ gửi roleId (số nguyên)
        await axiosClient.put(`/Users/${editingUser.id}/Roles`, values.roleId, {
            headers: { 'Content-Type': 'application/json' }
        }); 
        message.success('Cập nhật vai trò thành công!');
      } else {
        await axiosClient.post('/Users', values);
        message.success('Thêm nhân viên thành công!');
      }
      setIsModalVisible(false);
      form.resetFields();
      fetchData();
    } catch (error) {
      message.error('Thao tác thất bại. Kiểm tra lại quyền Admin hoặc Backend!');
    }
  };

  const handleToggleStatus = async (userId, currentStatus) => {
    try {
      await axiosClient.patch(`/Users/${userId}/ToggleStatus`);
      message.success('Đã cập nhật trạng thái');
      fetchData();
    } catch (error) { message.error('Lỗi hệ thống!'); }
  };

  const columns = [
    { title: 'Họ và Tên', dataIndex: 'fullName', key: 'fullName' },
    { title: 'Email', dataIndex: 'email', key: 'email' },
    { 
      title: 'Vai trò', 
      key: 'role',
      render: (_, record) => {
        // Fix lỗi hiển thị: Backend trả về tên Role trực tiếp
        const roleName = record.role || record.Role; 
        return (
          <Tag color={roleName === 'Admin' ? 'volcano' : 'blue'}>
            {roleName || 'Nhân viên'} 
          </Tag>
        );
      }
    },
    {
      title: 'Trạng thái',
      key: 'status',
      render: (_, record) => (
        <Switch 
          checked={record.status} 
          onChange={() => handleToggleStatus(record.id, record.status)}
          checkedChildren="Hoạt động" unCheckedChildren="Khóa"
        />
      )
    },
    {
      title: 'Hành động',
      key: 'action',
      render: (_, record) => (
        <Space>
          {/* 2. Chỉ hiện nút Sửa nếu có quyền MANAGE_USERS */}
          <RequirePermission permission="MANAGE_USERS">
            <Button type="primary" ghost icon={<EditOutlined />} onClick={() => showEditModal(record)}>
              Sửa / Đổi quyền
            </Button>
          </RequirePermission>
        </Space>
      ),
    },
  ];

  return (
    <Card 
      title={<span style={{fontSize: '20px'}}>👥 Quản lý Nhân sự</span>} 
      extra={
        /* 3. Chỉ hiện nút Thêm mới nếu có quyền MANAGE_USERS */
        <RequirePermission permission="MANAGE_USERS">
          <Button 
            type="primary" 
            icon={<PlusOutlined />} 
            onClick={() => { setIsEditMode(false); setIsModalVisible(true); form.resetFields(); }}
          >
            Thêm Nhân Viên
          </Button>
        </RequirePermission>
      }
    >
      <Table dataSource={users} columns={columns} rowKey="id" loading={loading} />

      <Modal
        title={isEditMode ? "📝 Chỉnh sửa nhân viên" : "➕ Thêm nhân viên mới"}
        open={isModalVisible}
        onCancel={() => setIsModalVisible(false)}
        onOk={() => form.submit()}
      >
        <Form form={form} layout="vertical" onFinish={handleSave}>
          <Form.Item name="fullName" label="Họ tên" rules={[{ required: true }]}>
            <Input prefix={<UserOutlined />} disabled={isEditMode} />
          </Form.Item>
          <Form.Item name="email" label="Email" rules={[{ required: true, type: 'email' }]}>
            <Input prefix={<MailOutlined />} disabled={isEditMode} />
          </Form.Item>
          <Form.Item name="roleId" label="Vai trò / Chức vụ" rules={[{ required: true }]}>
            <Select placeholder="Chọn vai trò mới">
              {roles.map(role => (
                <Select.Option key={role.id} value={role.id}>{role.name}</Select.Option>
              ))}
            </Select>
          </Form.Item>
        </Form>
      </Modal>
    </Card>
  );
};

export default UserManagementPage;