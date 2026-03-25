import React, { useState } from 'react';
import { Layout, Menu, Button, theme, Avatar, Dropdown, Space, Badge, Typography } from 'antd';
import {
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  UserOutlined,
  DashboardOutlined,
  TeamOutlined,
  LogoutOutlined,
  SettingOutlined,
  BellOutlined,
  HomeOutlined
} from '@ant-design/icons';
import { Outlet, useNavigate, useLocation } from 'react-router-dom'; // Dòng này là đủ rồi Duy nhé
import { useAdminAuthStore } from '../store/adminAuthStore';

const { Header, Sider, Content } = Layout;
const { Text } = Typography;

const AdminLayout = () => {
  const [collapsed, setCollapsed] = useState(false);
  const { user, clearAuth } = useAdminAuthStore();
  const navigate = useNavigate();
  const location = useLocation();
  
  const {
    token: { colorBgContainer, borderRadiusLG },
  } = theme.useToken();

  const handleLogout = () => {
    clearAuth();
    navigate('/login');
  };

  const sidebarItems = [
    { key: '/admin/dashboard', icon: <DashboardOutlined />, label: 'Bảng điều khiển' },
    { key: '/admin/employees', icon: <TeamOutlined />, label: 'Quản lý nhân sự' },
    { key: '/admin/rooms', icon: <HomeOutlined />, label: 'Quản lý phòng' },
    { key: '/admin/profile', icon: <UserOutlined />, label: 'Hồ sơ cá nhân' },
    { key: '/admin/settings', icon: <SettingOutlined />, label: 'Cấu hình hệ thống' },
  ];

  const userDropdownItems = [
    { 
      key: 'profile', 
      icon: <UserOutlined />, 
      label: 'Thông tin cá nhân', 
      onClick: () => navigate('/admin/profile') 
    },
    { type: 'divider' }, 
    { 
      key: 'logout', 
      icon: <LogoutOutlined />, 
      label: 'Đăng xuất', 
      danger: true, 
      onClick: handleLogout 
    },
  ];

  const notificationMenu = {
    items: [
      { key: '1', label: 'Có 3 nhân viên mới vừa đăng ký' },
      { key: '2', label: 'Hệ thống vừa được cập nhật bản 1.0.2' },
    ],
  };

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sider trigger={null} collapsible collapsed={collapsed} theme="dark" width={250}>
        <div style={{ 
          height: 64, 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center', 
          color: 'white', 
          background: '#001529',
          borderBottom: '1px solid rgba(255,255,255,0.1)'
        }}>
          <Text style={{ color: 'white', fontWeight: 'bold', fontSize: collapsed ? 14 : 20 }}>
            {collapsed ? 'ERP' : 'HOTEL ERP'}
          </Text>
        </div>
        <Menu
          theme="dark"
          mode="inline"
          selectedKeys={[location.pathname]}
          items={sidebarItems}
          onClick={({ key }) => navigate(key)}
          style={{ paddingTop: 10 }}
        />
      </Sider>

      <Layout>
        <Header style={{ 
          padding: '0 24px', 
          background: colorBgContainer, 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          boxShadow: '0 1px 4px rgba(0,21,41,.08)',
          zIndex: 1
        }}>
          <Button
            type="text"
            icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
            onClick={() => setCollapsed(!collapsed)}
            style={{ fontSize: '18px', width: 64, height: 64 }}
          />

          <Space size={24}>
            <Dropdown menu={notificationMenu} placement="bottomRight" arrow>
              <Badge count={2} size="small">
                <BellOutlined style={{ fontSize: '20px', cursor: 'pointer', color: '#65676b' }} />
              </Badge>
            </Dropdown>

            <Dropdown menu={{ items: userDropdownItems }} placement="bottomRight" arrow>
              <Space style={{ cursor: 'pointer' }}>
                <Text strong style={{ fontSize: '15px' }}>
                  {user?.fullName || user?.full_name || 'Tên của bạn'}
                </Text>
                <Avatar 
                  size="large" 
                  style={{ backgroundColor: '#1877f2' }} 
                  icon={<UserOutlined />} 
                  src={user?.avatarUrl || user?.avatar_url}
                />
              </Space>
            </Dropdown>
          </Space>
        </Header>

        <Content style={{ 
          margin: '24px 16px', 
          padding: 24, 
          minHeight: 280, 
          background: colorBgContainer, 
          borderRadius: borderRadiusLG,
          overflow: 'auto' 
        }}>
          <Outlet />
        </Content>
      </Layout>
    </Layout>
  );
};

export default AdminLayout;