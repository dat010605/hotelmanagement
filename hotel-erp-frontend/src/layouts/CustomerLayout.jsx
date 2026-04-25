import React from 'react';
import { Layout, Menu, Button, Dropdown, Typography, Space, Avatar, theme } from 'antd';
import {
  GlobalOutlined, LoginOutlined, UserAddOutlined, HomeOutlined,
  TagOutlined, LogoutOutlined, UserOutlined, SettingOutlined, LockOutlined
} from '@ant-design/icons';
import { Outlet, useNavigate, Link } from 'react-router-dom';
import { useI18nStore } from '../store/useI18nStore';
import { useAdminAuthStore } from '../store/adminAuthStore';
import { useCustomerProfileStore } from '../store/useCustomerProfileStore';

const { Header, Content, Footer } = Layout;
const { Title, Text } = Typography;

const CustomerLayout = () => {
  const navigate = useNavigate();
  const { t, language, setLanguage } = useI18nStore();
  const { user, clearAuth } = useAdminAuthStore();
  const { getProfile } = useCustomerProfileStore();

  const email = user?.email || user?.Email || '';
  const profile = getProfile(email);

  // Ưu tiên override từ store > dữ liệu gốc từ server
  const fullName = profile.displayName || user?.fullName || user?.FullName || user?.name || 'Khách';
  const avatarUrl = profile.avatarUrl || user?.avatarUrl || user?.AvatarUrl || null;

  const handleLogout = () => {
    clearAuth();
    navigate('/');
  };

  const languageItems = [
    { key: 'vi', label: '🇻🇳 Tiếng Việt', onClick: () => setLanguage('vi') },
    { key: 'en', label: '🇬🇧 English', onClick: () => setLanguage('en') }
  ];

  const menuItems = [
    { key: '/', icon: <HomeOutlined />, label: <Link to="/">{t('home')}</Link> },
    { key: '/offers', icon: <TagOutlined />, label: <Link to="/offers">{t('offers')}</Link> }
  ];

  // Dropdown menu khi đã đăng nhập
  const accountDropdownItems = [
    {
      key: 'greeting',
      label: (
        <div style={{ padding: '4px 0' }}>
          <Text strong style={{ fontSize: 15 }}>{fullName}</Text><br />
          <Text type="secondary" style={{ fontSize: 12 }}>{user?.email || user?.Email || ''}</Text>
        </div>
      ),
      disabled: true
    },
    { type: 'divider' },
    {
      key: 'profile',
      icon: <SettingOutlined />,
      label: 'Thông tin tài khoản',
      onClick: () => navigate('/profile')
    },
    {
      key: 'password',
      icon: <LockOutlined />,
      label: 'Đổi mật khẩu',
      onClick: () => navigate('/profile')
    },
    { type: 'divider' },
    ...(user?.role?.toLowerCase()?.trim() !== 'guest' && user ? [{
      key: 'admin',
      icon: <SettingOutlined />,
      label: 'Trang Quản Trị',
      onClick: () => navigate('/admin/dashboard')
    }] : []),
    {
      key: 'logout',
      icon: <LogoutOutlined />,
      label: <Text type="danger">Đăng xuất</Text>,
      onClick: handleLogout,
      danger: true
    }
  ];

  return (
    <Layout style={{ minHeight: '100vh', background: '#f5f5f5' }}>
      <Header style={{
        position: 'sticky',
        top: 0,
        zIndex: 100,
        width: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        background: '#fff',
        boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
        padding: '0 24px'
      }}>
        {/* LOGO */}
        <div style={{ display: 'flex', alignItems: 'center', cursor: 'pointer', flexShrink: 0 }} onClick={() => navigate('/')}>
          <div style={{
            width: 40, height: 40, borderRadius: '8px',
            background: 'linear-gradient(135deg, #1890ff 0%, #0050b3 100%)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: '#fff', fontWeight: 'bold', fontSize: '20px', marginRight: '12px'
          }}>
            W
          </div>
          <Title level={4} style={{ margin: 0, color: '#0050b3' }}>Web Booking</Title>
        </div>

        {/* NAVIGATION MENU */}
        <Menu
          mode="horizontal"
          selectedKeys={[window.location.pathname]}
          items={menuItems}
          style={{ flex: 1, borderBottom: 'none', marginLeft: '40px', fontSize: '16px', fontWeight: 500 }}
        />

        {/* ACTIONS */}
        <Space size="middle">
          {/* Language switcher */}
          <Dropdown menu={{ items: languageItems }} placement="bottomRight">
            <Button type="text" style={{ fontSize: '15px' }}>
              <GlobalOutlined /> {language === 'vi' ? '🇻🇳 VI' : '🇬🇧 EN'}
            </Button>
          </Dropdown>

          {user ? (
            /* Avatar Dropdown khi đã đăng nhập */
            <Dropdown
              menu={{ items: accountDropdownItems }}
              placement="bottomRight"
              trigger={['click']}
            >
              <div style={{
                display: 'flex', alignItems: 'center', gap: 8,
                cursor: 'pointer', padding: '4px 12px',
                borderRadius: '20px', border: '1px solid #e8e8e8',
                transition: 'all 0.2s',
                ':hover': { background: '#f0f0f0' }
              }}>
                <Avatar
                  size={34}
                  src={avatarUrl}
                  icon={!avatarUrl && <UserOutlined />}
                  style={{ background: '#1890ff' }}
                />
                <Text strong style={{ maxWidth: 100, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {fullName}
                </Text>
              </div>
            </Dropdown>
          ) : (
            /* Nút đăng nhập / đăng ký khi chưa login */
            <Space>
              <Button type="text" icon={<LoginOutlined />} onClick={() => navigate('/login')} size="large">
                {t('login')}
              </Button>
              <Button
                type="primary"
                icon={<UserAddOutlined />}
                onClick={() => navigate('/register')}
                size="large"
                style={{ borderRadius: '8px' }}
              >
                {t('register')}
              </Button>
            </Space>
          )}
        </Space>
      </Header>

      <Content style={{ width: '100%', maxWidth: '1200px', margin: '0 auto', padding: '24px' }}>
        <Outlet />
      </Content>

      <Footer style={{ textAlign: 'center', background: '#001529' }}>
        <div style={{ color: '#fff', padding: '20px 0' }}>
          <Title level={3} style={{ color: '#fff', margin: 0 }}>Web Booking</Title>
          <p style={{ marginTop: '10px', color: 'rgba(255,255,255,0.65)' }}>{t('footerText')}</p>
        </div>
      </Footer>
    </Layout>
  );
};

export default CustomerLayout;
