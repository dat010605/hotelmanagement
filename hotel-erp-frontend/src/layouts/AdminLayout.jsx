import React, { useState, useEffect } from 'react';
import { HubConnectionBuilder, LogLevel } from '@microsoft/signalr'; 
import { Layout, Menu, Button, theme, Avatar, Dropdown, Space, Badge, Typography, App, ConfigProvider } from 'antd';
import {
  MenuFoldOutlined, MenuUnfoldOutlined, UserOutlined, DashboardOutlined, TeamOutlined,
  LogoutOutlined, SettingOutlined, BellOutlined, HomeOutlined, LockOutlined,
  AlertOutlined, CheckSquareOutlined, CalendarOutlined, GiftOutlined,
  AppstoreOutlined, CreditCardOutlined, FileTextOutlined,
  SunOutlined, MoonOutlined, EnvironmentOutlined, CommentOutlined
} from '@ant-design/icons';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useAdminAuthStore } from '../store/adminAuthStore';
import axiosClient from '../api/axiosClient';
import useSettingsStore from '../store/useSettingsStore';
import dayjs from 'dayjs';

const { Header, Sider, Content } = Layout;
const { Text } = Typography;

const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5057/api';
const hubUrl = apiBaseUrl.replace(/\/api$/, '') + '/notificationHub';

const signalRConnection = new HubConnectionBuilder()
  .withUrl(hubUrl) 
  .configureLogging(LogLevel.Information) 
  .withAutomaticReconnect() 
  .build();

const AdminLayout = () => {
  const { notification } = App.useApp();
  const [notifications, setNotifications] = useState([]);
  const [collapsed, setCollapsed] = useState(false);
  
  const { themeMode, setThemeMode } = useSettingsStore();
  const isDarkMode = themeMode === 'dark'; 

  const { user, clearAuth, setAuth, token, permissions } = useAdminAuthStore();
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

    // MA PHÁP ĐÁ VĂNG TÀI KHOẢN (BỊ KHÓA)
    const handleForceLogout = (lockedUserId) => {
      const myId = user?.id || user?.Id || user?.nameid;
      if (myId && String(myId) === String(lockedUserId)) {
        clearAuth(); 
        navigate('/login'); 
        notification.error({
          message: 'Tài khoản đã bị khóa',
          description: 'Tài khoản của bạn đã bị Quản trị viên khóa! Vui lòng liên hệ Admin.',
          placement: 'top',
          duration: 7,
        });
      }
    };

    // Lắng nghe khi Admin thay đổi quyền của role nào đó
    const handlePermissionsUpdated = async (data) => {
      const myRole = user?.role?.toLowerCase()?.trim() || '';
      const changedRole = data?.roleName?.toLowerCase()?.trim() || '';
      // Nếu role của mình bị thay đổi → fetch lại permissions và cập nhật store
      if (myRole === changedRole) {
        try {
          const res = await axiosClient.get('/api/Auth/my-permissions');
          const newPermissions = res.data?.permissions || [];
          setAuth(token, user, newPermissions);
          notification.info({
            message: 'Quyền hạn đã thay đổi',
            description: 'Quyền của bạn vừa được cập nhật. Sidebar đã làm mới.',
            placement: 'topRight',
            duration: 5,
          });
        } catch {
          // Nếu không có endpoint my-permissions, dùng data từ SignalR
          setAuth(token, user, data?.permissions || []);
        }
      }
    };

    signalRConnection.on("ReceiveNotification", handleReceiveMessage);
    signalRConnection.on("ForceLogout", handleForceLogout); // Cắm tai nghe lắng nghe lệnh đá
    signalRConnection.on("PermissionsUpdated", handlePermissionsUpdated); // Lắng nghe thay đổi quyền

    return () => {
      isMounted = false;
      signalRConnection.off("ReceiveNotification", handleReceiveMessage);
      signalRConnection.off("ForceLogout", handleForceLogout);
      signalRConnection.off("PermissionsUpdated", handlePermissionsUpdated);
    };
  }, [user, clearAuth, navigate, notification]);

  const handleLogout = () => {
    clearAuth();
    navigate('/login');
  };

  // HÀM KIỂM TRA QUYỀN
  const userRole = user?.role?.toLowerCase()?.trim() || '';
  const isAdmin = userRole === 'admin';

  // Map permission name → menu key để kiểm tra
  const PERMISSION_MAP = {
    'VIEW_DASHBOARD':    ['/admin/dashboard'],
    'MANAGE_ROOMS':      ['/admin/rooms', '/admin/room-grid', 'sub-rooms'],
    'MANAGE_BOOKINGS':   ['/admin/booking', '/admin/bookings', '/admin/checkout', 'sub-reception'],
    'MANAGE_USERS':      ['/admin/employees'],
    'MANAGE_ROLES':      ['/admin/roles'],
    'VIEW_REPORTS':      ['/admin/audit-logs'],
    'MANAGE_VOUCHERS':   ['/admin/vouchers'],
    'MANAGE_INVENTORY':  ['/admin/inventory'],
    'MANAGE_SERVICES':   ['/admin/housekeeping', '/admin/loss-damage'],
    'MANAGE_ATTRACTIONS':['/admin/attractions'],
    'MANAGE_REVIEWS':    ['/admin/reviews'],
    'MANAGE_SETTINGS':   ['/admin/settings'],
  };

  // Tập hợp tất cả menu keys mà user được phép, dựa theo permissions từ store
  const allowedKeys = new Set();
  allowedKeys.add('/admin/profile'); // Profile ai cũng được xem
  if (isAdmin) {
    // Admin có quyền tất cả
    Object.values(PERMISSION_MAP).flat().forEach(k => allowedKeys.add(k));
  } else {
    (permissions || []).forEach(perm => {
      const permName = typeof perm === 'string' ? perm : perm?.name;
      const keys = PERMISSION_MAP[permName] || [];
      keys.forEach(k => allowedKeys.add(k));
    });
  }

  const checkAccess = (item) => {
    if (isAdmin) return true;
    if (!item.allowedKeys) return allowedKeys.has(item.key); // Leaf node
    return true; // Group node — kiểm tra ở con
  };

  // THU GỌN MENU VỚI QUYỀN TRUY CẬP (THEO BẢNG MA TRẬN PHÂN QUYỀN)
  const rawSidebarItems = [
    // Thống kê/Dashboard - Admin, Manager, Lễ tân, Buồng phòng
    { key: '/admin/dashboard', icon: <DashboardOutlined />, label: 'Bảng điều khiển', allowedRoles: ['receptionist', 'lễ tân', 'housekeeping', 'buồng phòng'] },
    
    // Nhóm: Quản lý phòng
    {
      key: 'sub-rooms',
      icon: <AppstoreOutlined />,
      label: 'Quản lý Phòng',
      allowedRoles: ['receptionist', 'lễ tân', 'housekeeping', 'buồng phòng'],
      children: [
        // Sơ đồ phòng: Admin, Manager, Lễ tân, Buồng phòng (Chỉ xem)
        { key: '/admin/room-grid', label: 'Sơ đồ phòng', allowedRoles: ['receptionist', 'lễ tân', 'housekeeping', 'buồng phòng'] },
        // Quản lý quỹ phòng: Chỉ Admin & Manager
        { key: '/admin/rooms', label: 'Quản lý quỹ phòng', allowedRoles: [] }
      ]
    },

    // Nhóm: Quầy Lễ Tân - Chỉ Admin, Manager, Lễ tân
    {
      key: 'sub-reception',
      icon: <TeamOutlined />,
      label: 'Quầy Lễ Tân',
      allowedRoles: ['receptionist', 'lễ tân'],
      children: [
        { key: '/admin/booking', label: 'Tạo đơn đặt phòng', allowedRoles: ['receptionist', 'lễ tân'] },
        { key: '/admin/bookings', label: 'Danh sách đặt phòng', allowedRoles: ['receptionist', 'lễ tân'] },
        { key: '/admin/checkout', label: 'Trả phòng & Thu tiền', allowedRoles: ['receptionist', 'lễ tân'] }
      ]
    },

    // Dọn phòng: Admin, Manager, Lễ tân, Buồng phòng
    { key: '/admin/housekeeping', icon: <CheckSquareOutlined />, label: 'Dọn Phòng', allowedRoles: ['receptionist', 'lễ tân', 'housekeeping', 'buồng phòng'] },
    // Thất thoát & Đền bù: Admin, Manager, Lễ tân, Buồng phòng
    { key: '/admin/loss-damage', icon: <AlertOutlined />, label: 'Thất thoát & Đền bù', allowedRoles: ['receptionist', 'lễ tân', 'housekeeping', 'buồng phòng'] }, 
    // Quản lý kho vật tư: Chỉ Admin & Manager
    { key: '/admin/inventory', icon: <DashboardOutlined />, label: 'Quản lý kho vật tư', allowedRoles: [] },
    // Khuyến mãi: Admin, Manager, Lễ tân
    { key: '/admin/vouchers', icon: <GiftOutlined />, label: 'Khuyến mãi', allowedRoles: ['receptionist', 'lễ tân'] },
    // Điểm tham quan: Admin, Manager, Lễ tân
    { key: '/admin/attractions', icon: <EnvironmentOutlined />, label: 'Điểm tham quan', allowedRoles: ['receptionist', 'lễ tân'] },
    // Quản lý đánh giá: Admin, Manager, Lễ tân
    { key: '/admin/reviews', icon: <CommentOutlined />, label: 'Quản lý đánh giá', allowedRoles: ['receptionist', 'lễ tân'] },
    // Quản lý nhân sự: Chỉ Admin & Manager
    { key: '/admin/employees', icon: <TeamOutlined />, label: 'Quản lý nhân sự', allowedRoles: [] },
    // Phân quyền (RBAC): Chỉ Admin & Manager
    { key: '/admin/roles', icon: <LockOutlined />, label: 'Phân quyền (RBAC)', allowedRoles: [] },
    // Lịch sử hệ thống: Chỉ Admin & Manager
    { key: '/admin/audit-logs', icon: <FileTextOutlined />, label: 'Lịch sử hệ thống', allowedRoles: [] },
    // Hồ sơ cá nhân: Tất cả nhân viên
    { key: '/admin/profile', icon: <UserOutlined />, label: 'Hồ sơ cá nhân' },
    // Cấu hình hệ thống: Chỉ Admin & Manager
    { key: '/admin/settings', icon: <SettingOutlined />, label: 'Cấu hình hệ thống', allowedRoles: [] },
  ];

  // Lọc menu đệ quy dựa theo allowedKeys
  const filterItems = (items) => {
    return items
      .filter(item => {
        if (isAdmin) return true;
        if (item.children) return true; // Group node — sẽ kiểm tra ở con
        return allowedKeys.has(item.key);
      })
      .map(item => {
        if (item.children) {
          const filteredChildren = filterItems(item.children);
          return { ...item, children: filteredChildren };
        }
        return item;
      })
      .filter(item => !item.children || item.children.length > 0);
  };

  const sidebarItems = filterItems(rawSidebarItems);

  const userDropdownItems = [
    { key: 'profile', icon: <UserOutlined />, label: 'Thông tin cá nhân', onClick: () => navigate('/admin/profile') },
    { key: 'web_booking', icon: <HomeOutlined />, label: 'Quay lại Web Booking', onClick: () => navigate('/') },
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

  return (
    <>
      <Layout style={{ minHeight: '100vh', background: isDarkMode ? '#18191a' : '#f0f2f5' }}>
        <Sider trigger={null} collapsible collapsed={collapsed} theme="dark" width={250} style={{ 
          background: isDarkMode ? '#242526' : '#001529',
          overflow: 'auto', 
          height: '100vh',     
          position: 'sticky', 
          top: 0,              
          left: 0,             
        }}>
          <div style={{ height: 64, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', background: isDarkMode ? '#242526' : '#001529', borderBottom: `1px solid ${isDarkMode ? '#3e4042' : 'rgba(255,255,255,0.1)'}` }}>
            <Text style={{ color: 'white', fontWeight: 'bold', fontSize: collapsed ? 14 : 18, fontFamily: "'Playfair Display', Georgia, serif", letterSpacing: '1px' }}>
              {collapsed ? 'TRC' : 'THE ROYAL CITADEL'}
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
                onClick={() => setThemeMode(isDarkMode ? 'light' : 'dark')} 
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
    </>
  );
};

export default AdminLayout;