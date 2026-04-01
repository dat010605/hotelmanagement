import React, { useState, useEffect } from 'react';
import { Table, Button, Modal, Checkbox, Row, Col, message, Card, Typography, Space, Tag } from 'antd';
import { SettingOutlined, SaveOutlined, LockOutlined } from '@ant-design/icons';
import axiosClient from '../api/axiosClient';
import dayjs from 'dayjs';

const { Title, Text } = Typography;

const RoleManagementPage = () => {
  const [roles, setRoles] = useState([]);
  const [allPermissions, setAllPermissions] = useState([]); // Danh sách tất cả quyền từ DB
  const [loading, setLoading] = useState(false);
  const [saveLoading, setSaveLoading] = useState(false);
  
  // State cho Modal phân quyền
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [selectedRole, setSelectedRole] = useState(null);
  const [checkedList, setCheckedList] = useState([]); // Các quyền được chọn (mảng ID)

  // 1. Lấy dữ liệu Vai trò và tất cả Quyền hiện có
  const fetchData = async () => {
    setLoading(true);
    try {
      // Gọi song song 2 API
      const [rolesRes, permsRes] = await Promise.all([
        axiosClient.get('/Roles'),
        axiosClient.get('/Roles/AllPermissions') // Khớp với hàm Get mới ở Backend
      ]);
      setRoles(rolesRes.data);
      setAllPermissions(permsRes.data);
    } catch (error) {
      console.error(error);
      message.error('Không thể tải dữ liệu vai trò hoặc quyền!');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  // 2. Mở Modal và đổ dữ liệu quyền hiện tại của Role vào Checkbox
  const handleOpenPermissionModal = (role) => {
    setSelectedRole(role);
    
    // Backend trả về Role kèm mảng Permissions (do có lệnh .Include)
    // Chúng ta chỉ lấy danh sách ID để làm checkedList
    const currentPermIds = role.permissions?.map(p => p.id) || [];
    
    setCheckedList(currentPermIds);
    setIsModalVisible(true);
  };

  // 3. Lưu quyền mới (Gửi mảng trực tiếp cho Backend "không DTO")
  const handleSavePermissions = async () => {
    if (!selectedRole) return;
    
    setSaveLoading(true);
    try {
      // Gửi TRỰC TIẾP mảng checkedList (VD: [1, 2, 3])
      await axiosClient.post(`/Roles/${selectedRole.id}/AssignPermissions`, checkedList);
      
      message.success(`Đã cập nhật quyền cho nhóm ${selectedRole.name} thành công!`);
      setIsModalVisible(false);
      fetchData(); // Load lại để cập nhật bảng
    } catch (error) {
      console.error(error);
      message.error('Lỗi khi lưu quyền! Vui lòng kiểm tra lại API.');
    } finally {
      setSaveLoading(false);
    }
  };

  const columns = [
    { 
      title: 'Tên Vai trò', 
      dataIndex: 'name', 
      key: 'name', 
      render: (text) => <Text strong><LockOutlined /> {text}</Text> 
    },
    { 
      title: 'Quyền hiện tại', 
      dataIndex: 'permissions', 
      key: 'perms',
      render: (perms) => (
        <Space wrap>
          {perms?.map(p => (
            <Tag color="blue" key={p.id}>{p.name}</Tag>
          )) || <Tag>Chưa có quyền</Tag>}
        </Space>
      )
    },
    {
      title: 'Thiết lập',
      key: 'action',
      width: 150,
      render: (_, record) => (
        <Button 
          icon={<SettingOutlined />} 
          type="primary" 
          ghost
          onClick={() => handleOpenPermissionModal(record)}
        >
          Phân quyền
        </Button>
      ),
    },
  ];

  return (
    <div style={{ padding: '24px' }}>
      <Card variant="borderless">
        <Title level={3}>🔐 Quản lý Vai trò & Phân quyền</Title>
        <Text type="secondary" style={{ marginBottom: 20, display: 'block' }}>
          Thiết lập các chức năng được phép truy cập cho từng nhóm nhân viên trong hệ thống.
        </Text>
        
        <Table 
          dataSource={roles} 
          columns={columns} 
          rowKey="id" 
          loading={loading} 
          pagination={false} 
          bordered
        />

        <Modal
          title={
            <span>
              <SettingOutlined /> Phân quyền cho nhóm: <Text type="danger">{selectedRole?.name}</Text>
            </span>
          }
          open={isModalVisible}
          onOk={handleSavePermissions}
          onCancel={() => setIsModalVisible(false)}
          width={700}
          okText="Lưu thay đổi"
          cancelText="Hủy"
          confirmLoading={saveLoading}
          destroyOnHidden // Đã sửa từ destroyOnClose theo cảnh báo antd
        >
          <div style={{ marginBottom: 16 }}>
            <Text italic>Chọn các chức năng mà vai trò này được phép thực hiện:</Text>
          </div>
          
          <div style={{ maxHeight: '400px', overflowY: 'auto', padding: '10px', border: '1px solid #f0f0f0', borderRadius: '8px' }}>
            <Checkbox.Group 
              style={{ width: '100%' }} 
              value={checkedList} 
              onChange={(list) => setCheckedList(list)}
            >
              <Row gutter={[16, 16]}>
                {allPermissions.length > 0 ? (
                  allPermissions.map(perm => (
                    <Col span={12} key={perm.id}>
                      <Card size="small" hoverable style={{ border: checkedList.includes(perm.id) ? '1px solid #1890ff' : '1px solid #f0f0f0' }}>
                        <Checkbox value={perm.id}>
                          <Text strong>{perm.name}</Text>
                          <br />
                          <Text type="secondary" style={{ fontSize: '12px' }}>{perm.description || 'Không có mô tả'}</Text>
                        </Checkbox>
                      </Card>
                    </Col>
                  ))
                ) : (
                  <Col span={24} style={{ textAlign: 'center', padding: '20px' }}>
                    <Text type="warning">Chưa có danh sách quyền trong hệ thống. Hãy nạp dữ liệu SQL trước!</Text>
                  </Col>
                )}
              </Row>
            </Checkbox.Group>
          </div>
        </Modal>
      </Card>
    </div>
  );
};

export default RoleManagementPage;