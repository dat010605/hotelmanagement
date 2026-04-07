import React, { useState, useEffect } from 'react';
import { HubConnectionBuilder, LogLevel } from '@microsoft/signalr'; 
import { Layout, Menu, Button, theme, Avatar, Dropdown, Space, Badge, Typography, notification, ConfigProvider } from 'antd';
import {
  MenuFoldOutlined, MenuUnfoldOutlined, UserOutlined, DashboardOutlined, TeamOutlined,
  LogoutOutlined, SettingOutlined, BellOutlined, HomeOutlined, LockOutlined,
  AlertOutlined, CheckSquareOutlined, CalendarOutlined, GiftOutlined,
  AppstoreOutlined, CreditCardOutlined, FileTextOutlined,
  SunOutlined, MoonOutlined, EnvironmentOutlined 
} from '@ant-design/icons';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useAdminAuthStore } from '../store/adminAuthStore';
import dayjs from 'dayjs';

const { Header, Sider, Content } = Layout;
const { Text } = Typography;

const signalRConnection = new HubConnectionBuilder()
  .withUrl("http://localhost:5057/notificationHub") 
  .configureLogging(LogLevel.Information) 
  .withAutomaticReconnect() 
  .build();

const AdminLayout = () => {
  const [notifications, setNotifications] = useState([]);
  const [collapsed, setCollapsed] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false); 

  const { user, clearAuth } = useAdminAuthStore();
  const navigate = useNavigate();
  const location = useLocation();

  const { token: { borderRadiusLG } } = theme.useToken();

  useEffect(() => {
    let isMounted = true;
    if (signalRConnection.state === 'Disconnected') {
      signalRConnection.start().catch(err => console.error("Lỗi cắm điện: ", err));
    }

    const handleReceiveMessage = (message) => {
      const newNoti = { id: Date.now(), message: message, time: dayjs().format('HH:mm') };
      setNotifications(prev => [newNoti, ...prev]);
      notification.success({
        message: 'Có thông báo mới',
        description: message,
        placement: 'topRight',
        duration: 8,
        icon: <BellOutlined style={{ color: '#1890ff' }} />,
      });
    };

    signalRConnection.on("ReceiveNotification", handleReceiveMessage);
    return () => {
      isMounted = false;
      signalRConnection.off("ReceiveNotification", handleReceiveMessage);
    };
  }, []);

  const handleLogout = () => {
    clearAuth();
    navigate('/login');
  };

  const sidebarItems = [
    { key: '/admin/dashboard', icon: <DashboardOutlined />, label: 'Bảng điều khiển' },
    { key: '/admin/room-grid', icon: <AppstoreOutlined />, label: 'Sơ đồ phòng' }, 
    { key: '/admin/rooms', icon: <HomeOutlined />, label: 'Quản lý quỹ phòng' },
    { key: '/admin/booking', icon: <CalendarOutlined />, label: 'Tạo đơn đặt phòng' },
    { key: '/admin/bookings', icon: <FileTextOutlined />, label: 'Danh sách đặt phòng' },
    { key: '/admin/checkout', icon: <CreditCardOutlined />, label: 'Trả phòng & Thu tiền' }, 
    { key: '/admin/housekeeping', icon: <CheckSquareOutlined />, label: 'Dọn Phòng' },
    { key: '/admin/loss-damage', icon: <AlertOutlined />, label: 'Thất thoát & Đền bù' }, 
    { key: '/admin/inventory', icon: <DashboardOutlined />, label: 'Quản lý kho vật tư' },
    { key: '/admin/vouchers', icon: <GiftOutlined />, label: 'Khuyến mãi' },
    { key: '/admin/employees', icon: <TeamOutlined />, label: 'Quản lý nhân sự' },
    { key: '/admin/roles', icon: <LockOutlined />, label: 'Phân quyền (RBAC)' },
    {key: '/admin/attractions',icon: <EnvironmentOutlined />,label: 'Điểm tham quan'},
    { key: '/admin/profile', icon: <UserOutlined />, label: 'Hồ sơ cá nhân' },
    { key: '/admin/settings', icon: <SettingOutlined />, label: 'Cấu hình hệ thống' },
  ];

  const userDropdownItems = [
    { key: 'profile', icon: <UserOutlined />, label: 'Thông tin cá nhân', onClick: () => navigate('/admin/profile') },
    { type: 'divider' },
    { key: 'logout', icon: <LogoutOutlined />, label: 'Đăng xuất', danger: true, onClick: handleLogout },
  ];

  const notificationMenu = {
    items: notifications.length === 0 
      ? [{ key: 'empty', label: 'Chưa có thông báo nào' }]
      : notifications.map((msg) => ({
          key: msg.id,
          label: (
            <div style={{ padding: '8px 0', borderBottom: '1px solid #f0f0f0' }}>
              <div style={{ fontWeight: 'bold', color: isDarkMode ? '#2e89ff' : '#1890ff' }}>{msg.message}</div>
              <div style={{ fontSize: '12px', color: '#8c8c8c', marginTop: '4px' }}>{msg.time}</div>
            </div>
          )
        }))
  };

  const fbDarkTheme = {
    algorithm: isDarkMode ? theme.darkAlgorithm : theme.defaultAlgorithm,
    token: isDarkMode ? {
      colorBgBase: '#18191a',       
      colorBgContainer: '#242526',  
      colorBgElevated: '#3a3b3c',   
      colorTextBase: '#e4e6eb',     
      colorBorder: '#3e4042',       
      colorPrimary: '#2e89ff',      
    } : {
      colorBgLayout: '#f0f2f5',
    }
  };

  return (
    <ConfigProvider theme={fbDarkTheme}>
      <Layout style={{ minHeight: '100vh', background: isDarkMode ? '#18191a' : '#f0f2f5' }}>
        <Sider trigger={null} collapsible collapsed={collapsed} theme="dark" width={250} style={{ background: isDarkMode ? '#242526' : '#001529',overflow: 'auto', 
    height: '100vh',     
    position: 'sticky', 
    top: 0,              
    left: 0,             
    background: isDarkMode ? '#18191a' : '#001529' }}>
          <div style={{ height: 64, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', background: isDarkMode ? '#242526' : '#001529', borderBottom: `1px solid ${isDarkMode ? '#3e4042' : 'rgba(255,255,255,0.1)'}` }}>
            <Text style={{ color: 'white', fontWeight: 'bold', fontSize: collapsed ? 14 : 20 }}>
              {collapsed ? 'ERP' : 'HOTEL ERP'}
            </Text>
          </div>
          
          <Menu theme="dark" mode="inline" selectedKeys={[location.pathname]} items={sidebarItems} onClick={({ key }) => navigate(key)} style={{ paddingTop: 10, background: 'transparent' }} />
        </Sider>

        <Layout style={{ background: 'transparent' }}>
          <Header style={{ padding: '0 24px', background: isDarkMode ? '#242526' : '#fff', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: `1px solid ${isDarkMode ? '#3e4042' : '#f0f0f0'}`, zIndex: 1 }}>
            <Button type="text" icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />} onClick={() => setCollapsed(!collapsed)} style={{ fontSize: '18px', width: 64, height: 64, color: isDarkMode ? '#e4e6eb' : '#000' }} />

            <Space size={24}>
              <Button 
                type="text" shape="circle" 
                icon={isDarkMode ? <SunOutlined style={{ fontSize: '20px', color: '#faad14' }} /> : <MoonOutlined style={{ fontSize: '20px' }} />} 
                onClick={() => setIsDarkMode(!isDarkMode)} 
              />

              <Dropdown menu={notificationMenu} placement="bottomRight" arrow trigger={['click']}>
                <Badge count={notifications.length} size="small" offset={[-2, 5]}>
                  <BellOutlined style={{ fontSize: '22px', cursor: 'pointer', color: isDarkMode ? '#e4e6eb' : '#65676b' }} />
                </Badge>
              </Dropdown>

              <Dropdown menu={{ items: userDropdownItems }} placement="bottomRight" arrow>
                <Space style={{ cursor: 'pointer' }}>
                  <Text strong style={{ fontSize: '15px', color: isDarkMode ? '#e4e6eb' : '#000' }}>{user?.fullName || 'Admin'}</Text>
                  <Avatar size="large" style={{ backgroundColor: '#2e89ff' }} icon={<UserOutlined />} src={user?.avatarUrl} />
                </Space>
              </Dropdown>
            </Space>
          </Header>

          <Content style={{ margin: '24px 16px', padding: 0, minHeight: 280, borderRadius: borderRadiusLG, overflow: 'auto' }}>
            <Outlet />
          </Content>
        </Layout>
      </Layout>
    </ConfigProvider>
  );
};

export default AdminLayout;