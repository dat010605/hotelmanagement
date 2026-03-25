import React, { useState, useEffect } from 'react';
import { Table, Button, Modal, Checkbox, Row, Col, message, Card, Typography } from 'antd';
import { SettingOutlined, SaveOutlined } from '@ant-design/icons';
import axiosClient from '../api/axiosClient';

const { Title } = Typography;

const RoleManagementPage = () => {
  const [roles, setRoles] = useState([]);
  const [allPermissions, setAllPermissions] = useState([]); // Danh sách tất cả quyền từ DB
  const [loading, setLoading] = useState(false);
  
  // State cho Modal phân quyền
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [selectedRole, setSelectedRole] = useState(null);
  const [checkedList, setCheckedList] = useState([]); // Các quyền được chọn

  const fetchData = async () => {
    setLoading(true);
    try {
      const [rolesRes, permsRes] = await Promise.all([
        axiosClient.get('/Roles'),
        axiosClient.get('/Permissions') // Gọi API lấy điển quyền bạn vừa tạo ở bước trước
      ]);
      setRoles(rolesRes.data);
      setAllPermissions(permsRes.data);
    } catch (error) {
      message.error('Lỗi tải dữ liệu vai trò hoặc quyền!');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  // Mở Modal và load quyền hiện tại của Role đó
  const handleOpenPermissionModal = (role) => {
    setSelectedRole(role);
    // Giả sử role.permissions là mảng chứa danh sách ID quyền của Role đó
    const currentPermIds = role.permissions?.map(p => p.id) || [];
    setCheckedList(currentPermIds);
    setIsModalVisible(true);
  };

  // Lưu quyền mới cho Role
  const handleSavePermissions = async () => {
    try {
      await axiosClient.post(`/Roles/${selectedRole.id}/AssignPermissions`, {
        permissionIds: checkedList
      });
      message.success(`Đã cập nhật quyền cho nhóm ${selectedRole.name}`);
      setIsModalVisible(false);
      fetchData();
    } catch (error) {
      message.error('Lỗi khi lưu quyền!');
    }
  };

  const columns = [
    { title: 'Tên Vai trò', dataIndex: 'name', key: 'name', render: (text) => <b>{text}</b> },
    { title: 'Mô tả', dataIndex: 'description', key: 'description' },
    {
      title: 'Thiết lập',
      key: 'action',
      render: (_, record) => (
        <Button 
          icon={<SettingOutlined />} 
          type="primary" 
          onClick={() => handleOpenPermissionModal(record)}
        >
          Phân quyền
        </Button>
      ),
    },
  ];

  return (
    <Card>
      <Title level={3}>🔐 Quản lý Vai trò & Phân quyền</Title>
      <Table 
        dataSource={roles} 
        columns={columns} 
        rowKey="id" 
        loading={loading} 
        pagination={false} 
      />

      <Modal
        title={<span><SettingOutlined /> Phân quyền cho nhóm: <b>{selectedRole?.name}</b></span>}
        open={isModalVisible}
        onOk={handleSavePermissions}
        onCancel={() => setIsModalVisible(false)}
        width={600}
        okText="Lưu thay đổi"
      >
        <p>Chọn các chức năng mà vai trò này được phép thực hiện:</p>
        <Checkbox.Group 
          style={{ width: '100%' }} 
          value={checkedList} 
          onChange={(list) => setCheckedList(list)}
        >
          <Row gutter={[16, 16]}>
            {allPermissions.map(perm => (
              <Col span={12} key={perm.id}>
                <Checkbox value={perm.id}>{perm.name} - <small style={{color: 'gray'}}>{perm.description}</small></Checkbox>
              </Col>
            ))}
          </Row>
        </Checkbox.Group>
      </Modal>
    </Card>
  );
};

export default RoleManagementPage;