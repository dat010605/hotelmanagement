import React, { useState, useEffect } from 'react'; // The Royal Citadel Layout v4
import { Layout, Button, Dropdown, Typography, Space, Avatar } from 'antd';
import {
  GlobalOutlined, LoginOutlined, UserAddOutlined,
  LogoutOutlined, UserOutlined, SettingOutlined, LockOutlined,
  MenuOutlined, CloseOutlined
} from '@ant-design/icons';
import { Outlet, useNavigate, Link, useLocation } from 'react-router-dom';
import { useI18nStore } from '../store/useI18nStore';
import { useAdminAuthStore } from '../store/adminAuthStore';
import { useCustomerProfileStore } from '../store/useCustomerProfileStore';

const { Content, Footer } = Layout;
const { Title, Text } = Typography;

// ── SVG Logo Component ─────────────────────────────────────────────────────
const CitadelLogo = ({ size = 36, color = '#c9a961' }) => (
  <svg width={size} height={size} viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="8" y="38" width="48" height="6" rx="1" fill={color}/>
    <rect x="12" y="44" width="40" height="4" rx="1" fill={color} opacity="0.8"/>
    <rect x="14" y="48" width="36" height="6" rx="1" fill={color}/>
    <rect x="12" y="18" width="8" height="20" rx="1" fill={color}/>
    <rect x="28" y="10" width="8" height="28" rx="1" fill={color}/>
    <rect x="44" y="18" width="8" height="20" rx="1" fill={color}/>
    <polygon points="16,18 12,14 20,14" fill={color}/>
    <polygon points="32,10 27,5 37,5" fill={color}/>
    <polygon points="48,18 44,14 52,14" fill={color}/>
    <rect x="14" y="24" width="4" height="5" rx="1" fill="#1a1a2e" opacity="0.6"/>
    <rect x="30" y="16" width="4" height="5" rx="1" fill="#1a1a2e" opacity="0.6"/>
    <rect x="46" y="24" width="4" height="5" rx="1" fill="#1a1a2e" opacity="0.6"/>
    <circle cx="32" cy="3" r="2" fill="#e8d5a3"/>
  </svg>
);

// ── Navigation Items ───────────────────────────────────────────────────────
const NAV_ITEMS = [
  { path: '/', label: 'Trang chủ' },
  { path: '/rooms', label: 'Phòng & Villa' },
  { path: '/services', label: 'Dịch vụ' },
  { path: '/attractions', label: 'Khám phá' },
  { path: '/offers', label: 'Ưu đãi' },
  { path: '/contact', label: 'Liên hệ' },
];

// ── Inject CSS once ────────────────────────────────────────────────────────
const injectHeaderCSS = () => {
  if (document.getElementById('layout-header-css')) return;
  const style = document.createElement('style');
  style.id = 'layout-header-css';
  style.textContent = `
    .layout-nav-link {
      color: rgba(255,255,255,0.75);
      text-decoration: none;
      font-size: 0.82rem;
      font-weight: 500;
      letter-spacing: 2px;
      text-transform: uppercase;
      transition: color 0.3s, border-bottom 0.3s;
      padding-bottom: 4px;
      border-bottom: 1px solid transparent;
      font-family: 'Inter', 'Segoe UI', sans-serif;
    }
    .layout-nav-link:hover, .layout-nav-link.active {
      color: #c9a961 !important;
      border-bottom: 1px solid #c9a961 !important;
    }
    .layout-book-btn {
      border: 1.5px solid #c9a961;
      color: #c9a961;
      background: transparent;
      padding: 8px 24px;
      border-radius: 2px;
      font-size: 0.78rem;
      font-weight: 600;
      letter-spacing: 3px;
      text-transform: uppercase;
      cursor: pointer;
      transition: all 0.4s;
      font-family: 'Inter', 'Segoe UI', sans-serif;
    }
    .layout-book-btn:hover {
      background: #c9a961 !important;
      color: #0a0a0a !important;
    }
    @media (max-width: 900px) {
      .layout-desktop-nav { display: none !important; }
      .layout-desktop-actions { display: none !important; }
      .layout-hamburger { display: block !important; }
    }
    .layout-mobile-nav {
      position: fixed;
      top: 0;
      right: 0;
      width: 300px;
      height: 100vh;
      background: rgba(10,10,10,0.97);
      backdrop-filter: blur(20px);
      z-index: 1001;
      display: flex;
      flex-direction: column;
      padding: 80px 40px 40px;
      gap: 20px;
      transform: translateX(100%);
      transition: transform 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94);
    }
    .layout-mobile-nav.open {
      transform: translateX(0);
    }
    .layout-mobile-overlay {
      position: fixed;
      inset: 0;
      background: rgba(0,0,0,0.5);
      z-index: 1000;
    }
  `;
  document.head.appendChild(style);
};

const CustomerLayout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { t, language, setLanguage } = useI18nStore();
  const { user, clearAuth } = useAdminAuthStore();
  const { getProfile } = useCustomerProfileStore();
  const [mobileOpen, setMobileOpen] = useState(false);

  const email = user?.email || user?.Email || '';
  const profile = getProfile(email);
  const fullName = profile.displayName || user?.fullName || user?.FullName || user?.name || 'Khách';
  const avatarUrl = profile.avatarUrl || user?.avatarUrl || user?.AvatarUrl || null;
  const isHomePage = location.pathname === '/';

  useEffect(() => {
    injectHeaderCSS();
  }, []);

  const handleLogout = () => {
    clearAuth();
    navigate('/');
  };

  const languageItems = [
    { key: 'vi', label: '🇻🇳 Tiếng Việt', onClick: () => setLanguage('vi') },
    { key: 'en', label: '🇬🇧 English', onClick: () => setLanguage('en') }
  ];

  const accountDropdownItems = user ? [
    {
      key: 'greeting',
      label: (
        <div style={{ padding: '4px 0' }}>
          <Text strong style={{ fontSize: 15 }}>{fullName}</Text><br />
          <Text type="secondary" style={{ fontSize: 12 }}>{email}</Text>
        </div>
      ),
      disabled: true
    },
    { type: 'divider' },
    { key: 'profile', icon: <SettingOutlined />, label: 'Thông tin tài khoản', onClick: () => navigate('/profile') },
    { key: 'bookings', icon: <UserOutlined />, label: 'Lịch sử đặt phòng', onClick: () => navigate('/my-bookings') },
    { key: 'password', icon: <LockOutlined />, label: 'Đổi mật khẩu', onClick: () => navigate('/profile') },
    { type: 'divider' },
    ...(user?.role?.toLowerCase()?.trim() !== 'guest' ? [{
      key: 'admin', icon: <SettingOutlined />, label: 'Trang Quản Trị', onClick: () => navigate('/admin/dashboard')
    }] : []),
    {
      key: 'logout', icon: <LogoutOutlined />,
      label: <Text type="danger">Đăng xuất</Text>,
      onClick: handleLogout, danger: true
    }
  ] : [];

  return (
    <Layout style={{ minHeight: '100vh', background: '#f5f5f5' }}>
      {/* ── Header thống nhất giống trang chủ (dark style) ──────────── */}
      {!isHomePage && (
        <header style={{
          position: 'sticky',
          top: 0,
          zIndex: 999,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '16px 48px',
          background: 'rgba(10, 10, 26, 0.95)',
          backdropFilter: 'blur(12px)',
          boxShadow: '0 2px 24px rgba(0,0,0,0.3)',
        }}>
          {/* Logo */}
          <div
            onClick={() => navigate('/')}
            style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '12px', flexShrink: 0 }}
          >
            <CitadelLogo size={38} color="#c9a961" />
            <div style={{
              fontFamily: "'Playfair Display', Georgia, serif",
              fontSize: '1.4rem',
              fontWeight: 700,
              color: '#fff',
              letterSpacing: '2px',
              textTransform: 'uppercase',
              lineHeight: 1.2,
            }}>
              The Royal Citadel
              <span style={{
                display: 'block',
                fontSize: '0.65rem',
                color: '#c9a961',
                letterSpacing: '4px',
                fontWeight: 400,
                fontStyle: 'italic',
                marginTop: '2px',
              }}>
                Luxury Hotel & Resort
              </span>
            </div>
          </div>

          {/* Desktop Navigation */}
          <nav className="layout-desktop-nav" style={{ flex: 1, display: 'flex', justifyContent: 'center' }}>
            <ul style={{ display: 'flex', alignItems: 'center', gap: '32px', listStyle: 'none', margin: 0, padding: 0 }}>
              {NAV_ITEMS.map(item => (
                <li key={item.path}>
                  <Link
                    to={item.path}
                    className={`layout-nav-link ${location.pathname === item.path ? 'active' : ''}`}
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          {/* Desktop Actions */}
          <div className="layout-desktop-actions" style={{ display: 'flex', alignItems: 'center', gap: '16px', flexShrink: 0 }}>
            {/* Language */}
            <Dropdown menu={{ items: languageItems }} placement="bottomRight">
              <button style={{
                background: 'none', border: 'none', color: 'rgba(255,255,255,0.7)',
                cursor: 'pointer', fontSize: '0.85rem', letterSpacing: '1px',
                fontFamily: "'Inter', sans-serif",
              }}>
                <GlobalOutlined style={{ marginRight: 4 }} />
                {language === 'vi' ? 'VI' : 'EN'}
              </button>
            </Dropdown>

            {user ? (
              <Dropdown menu={{ items: accountDropdownItems }} placement="bottomRight" trigger={['click']}>
                <div style={{
                  display: 'flex', alignItems: 'center', gap: 8,
                  cursor: 'pointer', padding: '4px 12px',
                  borderRadius: '20px', border: '1px solid rgba(255,255,255,0.25)',
                  transition: 'all 0.3s',
                }}>
                  <Avatar size={30} src={avatarUrl} icon={!avatarUrl && <UserOutlined />} style={{ background: '#c9a961' }} />
                  <span style={{ color: '#fff', fontSize: '0.82rem', fontWeight: 500, maxWidth: 90, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {fullName}
                  </span>
                </div>
              </Dropdown>
            ) : (
              <>
                <Link to="/login" style={{ color: 'rgba(255,255,255,0.8)', fontSize: '0.82rem', letterSpacing: '1px', textDecoration: 'none' }}>
                  <LoginOutlined style={{ marginRight: 4 }} />Đăng nhập
                </Link>
                <button className="layout-book-btn" onClick={() => navigate('/rooms')}>
                  Book Now
                </button>
              </>
            )}
          </div>

          {/* Hamburger for mobile */}
          <button
            className="layout-hamburger"
            style={{ display: 'none', color: '#fff', fontSize: 22, cursor: 'pointer', background: 'none', border: 'none', zIndex: 20 }}
            onClick={() => setMobileOpen(!mobileOpen)}
          >
            {mobileOpen ? <CloseOutlined /> : <MenuOutlined />}
          </button>
        </header>
      )}

      {/* Mobile nav overlay */}
      {mobileOpen && <div className="layout-mobile-overlay" onClick={() => setMobileOpen(false)} />}
      <div className={`layout-mobile-nav ${mobileOpen ? 'open' : ''}`}>
        <button
          style={{ position: 'absolute', top: 24, right: 24, background: 'none', border: 'none', color: '#fff', fontSize: 20, cursor: 'pointer' }}
          onClick={() => setMobileOpen(false)}
        >
          <CloseOutlined />
        </button>
        {NAV_ITEMS.map(item => (
          <Link
            key={item.path}
            to={item.path}
            onClick={() => setMobileOpen(false)}
            style={{
              color: location.pathname === item.path ? '#c9a961' : 'rgba(255,255,255,0.85)',
              fontSize: '0.95rem', letterSpacing: '2px', textTransform: 'uppercase',
              textDecoration: 'none', padding: '8px 0',
              borderBottom: '1px solid rgba(255,255,255,0.1)',
              fontFamily: "'Inter', sans-serif",
            }}
          >
            {item.label}
          </Link>
        ))}
        <button className="layout-book-btn" style={{ marginTop: 16, width: '100%', textAlign: 'center' }}
          onClick={() => { navigate('/rooms'); setMobileOpen(false); }}
        >
          Book Now
        </button>
      </div>

      <Content style={{
        width: '100%',
        maxWidth: isHomePage ? '100%' : '1200px',
        margin: '0 auto',
        padding: isHomePage ? '0' : '24px'
      }}>
        <Outlet />
      </Content>

      <Footer style={{ textAlign: 'center', background: '#0a0a1a', padding: '48px 24px' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12, marginBottom: 8 }}>
            <CitadelLogo size={32} />
            <Title level={3} style={{
              color: '#fff', margin: 0,
              fontFamily: "'Playfair Display', Georgia, serif",
              fontWeight: 400, letterSpacing: '2px',
            }}>
              The Royal Citadel
            </Title>
          </div>
          <div style={{ width: 40, height: 1, background: '#c9a961', margin: '12px auto' }} />
          <p style={{ color: 'rgba(255,255,255,0.5)', marginTop: '12px', letterSpacing: '1px', fontSize: 13 }}>
            © 2026 The Royal Citadel. Nơi lưu giữ những khoảnh khắc tuyệt vời.
          </p>
        </div>
      </Footer>
    </Layout>
  );
};

export default CustomerLayout;
