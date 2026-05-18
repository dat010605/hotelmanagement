import React, { useState, useEffect } from 'react';
import { 
  Table, Button, Modal, Form, Input, message, 
  Tag, Space, Card, Row, Col, Checkbox 
} from 'antd';
import { 
  EditOutlined, PlusOutlined, DeleteOutlined, KeyOutlined 
} from '@ant-design/icons';
import axiosClient from '../api/axiosClient';
import { useAdminAuthStore } from '../store/adminAuthStore';

const RoleManagementPage = () => {
  const { user } = useAdminAuthStore();
  const [roles, setRoles] = useState([]);
  const [allPermissions, setAllPermissions] = useState([]);
  const [loading, setLoading] = useState(false);
  
  const [isRoleModalOpen, setIsRoleModalOpen] = useState(false);
  const [isPermissionModalOpen, setIsPermissionModalOpen] = useState(false);

  const [currentRole, setCurrentRole] = useState(null);
  const [selectedPermissions, setSelectedPermissions] = useState([]);

  const [roleForm] = Form.useForm();

  const fetchRoles = async () => {
    setLoading(true);
    try {
      const res = await axiosClient.get('/Roles');
      setRoles(res.data);
    } catch (error) {
      message.error('Lỗi khi tải danh sách phân quyền!');
    } finally {
      setLoading(false);
    }
  };

  const fetchPermissions = async () => {
    try {
      const res = await axiosClient.get('/Roles/AllPermissions');
      setAllPermissions(res.data);
    } catch (error) {
      console.error('Lỗi khi tải danh sách quyền hạn:', error);
    }
  };

  useEffect(() => {
    fetchRoles();
    fetchPermissions();
  }, []);

  const openRoleModal = (role = null) => {
    setCurrentRole(role);
    setIsRoleModalOpen(true);
    if (role) {
      roleForm.setFieldsValue({
        name: role.name || role.Name,
      });
    } else {
      roleForm.resetFields();
    }
  };

  const handleSaveRole = async () => {
    try {
      const values = await roleForm.validateFields();
      const currentId = currentRole?.id || currentRole?.Id;
      
      const payload = {
        Name: values.name
      };

      if (currentId) {
        await axiosClient.put(`/Roles/${currentId}`, payload);
        message.success('Cập nhật quyền thành công!');
      } else {
        await axiosClient.post('/Roles', payload);
        message.success('Đã tạo quyền mới thành công!');
      }
      setIsRoleModalOpen(false);
      fetchRoles();
    } catch (error) {
      message.error('Lưu thất bại. Vui lòng kiểm tra lại!');
    }
  };

  const handleDeleteRole = async (id) => {
    try {
      await axiosClient.delete(`/Roles/${id}`);
      message.success('Xóa quyền thành công!');
      fetchRoles();
    } catch (error) {
      message.error('Không thể xóa quyền này vì đang có người dùng thuộc quyền này!');
    }
  };

  const openPermissionModal = (role) => {
    setCurrentRole(role);
    const existingPermissions = (role.permissions || role.Permissions || []).map(p => p.id || p.Id);
    setSelectedPermissions(existingPermissions);
    setIsPermissionModalOpen(true);
  };

  const handleSavePermissions = async () => {
    try {
      const roleId = currentRole?.id || currentRole?.Id;
      await axiosClient.post(`/Roles/${roleId}/AssignPermissions`, selectedPermissions);
      message.success('Cập nhật quyền hạn thành công!');
      setIsPermissionModalOpen(false);
      fetchRoles();

      // Nếu role được phân quyền là chính role hiện tại của tôi, reload lại menu ngay lập tức
      const myRole = user?.role || '';
      const currentRoleName = currentRole?.name || currentRole?.Name || '';
      if (myRole.toLowerCase() === currentRoleName.toLowerCase()) {
        message.loading("Đang thiết lập lại phân quyền menu...", 1.5);
        setTimeout(() => {
          window.location.reload();
        }, 1200);
      }
    } catch (error) {
      message.error('Lỗi khi phân quyền!');
    }
  };

  const columns = [
    { 
      title: 'ID', 
      dataIndex: 'id', 
      key: 'id', 
      width: 80,
      align: 'center',
      render: (text, record) => record.id || record.Id
    },
    { 
      title: 'Tên Role', 
      dataIndex: 'name', 
      key: 'name',
      render: (text, record) => <b>{record.name || record.Name}</b>
    },
    { 
      title: 'Quyền Hạn (Permissions)', 
      key: 'permissions',
      render: (_, record) => {
        const perms = record.permissions || record.Permissions || [];
        if (perms.length === 0) return <Tag color="default">Chưa có quyền nào</Tag>;
        
        // Hiển thị tối đa 5 quyền, còn lại thì hiện ...
        const displayedPerms = perms.slice(0, 5);
        const hasMore = perms.length > 5;
        
        return (
          <Space size={[0, 8]} wrap>
            {displayedPerms.map(p => (
              <Tag color="blue" key={p.id || p.Id}>{p.name || p.Name}</Tag>
            ))}
            {hasMore && <Tag>+ {perms.length - 5} quyền khác</Tag>}
          </Space>
        );
      }
    },
    {
      title: 'Thao tác', 
      align: 'center', 
      width: 300,
      render: (_, record) => {
        const roleName = record.name || record.Name;
        const isSystemAdmin = roleName === 'Admin';
        
        return (
          <Space>
            <Button 
              size="small" 
              type="primary" 
              ghost 
              icon={<EditOutlined />} 
              onClick={() => openRoleModal(record)}
            >
              Sửa Tên
            </Button>
            <Button 
              size="small" 
              style={{ color: '#fa8c16', borderColor: '#fa8c16' }} 
              icon={<KeyOutlined />} 
              onClick={() => openPermissionModal(record)}
              disabled={isSystemAdmin}
            >
              Phân Quyền
            </Button>
            <Button 
              size="small" 
              danger 
              icon={<DeleteOutlined />} 
              onClick={() => {
                Modal.confirm({
                  title: 'Xác nhận xóa',
                  content: `Bạn có chắc muốn xóa Role "${roleName}" không?`,
                  onOk: () => handleDeleteRole(record.id || record.Id),
                  okText: 'Xóa',
                  cancelText: 'Hủy',
                  okButtonProps: { danger: true }
                });
              }}
              disabled={isSystemAdmin}
            >
              Xóa
            </Button>
          </Space>
        );
      },
    },
  ];

  return (
    <div style={{ padding: '24px' }}>
      <Card title={<span style={{fontSize: '20px', fontWeight: 'bold'}}>🛡️ Phân quyền hệ thống (RBAC)</span>}>
        <Row style={{ marginBottom: 20 }} justify="end">
          <Col>
            <Button type="primary" icon={<PlusOutlined />} onClick={() => openRoleModal(null)}>
              Thêm Role Mới
            </Button>
          </Col>
        </Row>

        <Table 
          dataSource={roles} 
          columns={columns} 
          rowKey={(r) => r.id || r.Id} 
          loading={loading} 
          bordered 
          size="middle" 
          pagination={false} 
        />
      </Card>

      <Modal 
        title={currentRole ? `✏️ Cập nhật Role` : '➕ Thêm Role Mới'} 
        open={isRoleModalOpen} 
        onCancel={() => setIsRoleModalOpen(false)} 
        onOk={() => roleForm.submit()} 
        okText="Lưu thông tin"
        cancelText="Hủy"
        destroyOnClose
      >
        <Form 
          form={roleForm} 
          layout="vertical" 
          style={{padding: '20px 0'}} 
          onFinish={handleSaveRole}
        >
          <Form.Item 
            name="name" 
            label="Tên Role" 
            rules={[{required: true, message: 'Vui lòng nhập tên Role!'}]}
          >
            <Input placeholder="VD: Manager, Receptionist, Housekeeping..." />
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        title={`🔑 Quản lý quyền hạn cho: ${currentRole?.name || currentRole?.Name}`}
        open={isPermissionModalOpen}
        onCancel={() => setIsPermissionModalOpen(false)}
        onOk={handleSavePermissions}
        okText="Lưu Quyền Hạn"
        cancelText="Hủy"
        width={700}
      >
        <div style={{ padding: '15px 0' }}>
          <Checkbox.Group 
            style={{ width: '100%' }} 
            value={selectedPermissions} 
            onChange={(values) => setSelectedPermissions(values)}
          >
            <Row gutter={[16, 16]}>
              {allPermissions.map(perm => (
                <Col span={12} key={perm.id || perm.Id}>
                  <Checkbox value={perm.id || perm.Id}>
                    {perm.name || perm.Name}
                  </Checkbox>
                </Col>
              ))}
            </Row>
          </Checkbox.Group>
        </div>
      </Modal>
    </div>
  );
};

export default RoleManagementPage;