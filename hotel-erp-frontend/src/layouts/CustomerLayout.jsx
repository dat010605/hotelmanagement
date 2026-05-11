import React, { useState, useEffect } from 'react'; // The Royal Citadel Layout v5 – i18n
import { Layout, Button, Dropdown, Typography, Space, Avatar } from 'antd';
import {
  GlobalOutlined, LoginOutlined, UserAddOutlined,
  LogoutOutlined, UserOutlined, SettingOutlined, LockOutlined,
  MenuOutlined, CloseOutlined, FacebookFilled
} from '@ant-design/icons';
import { Outlet, useNavigate, Link, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { SUPPORTED_LANGUAGES } from '../i18n';
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

// ── Navigation Items (dùng translation keys) ──────────────────────────────
const NAV_KEYS = [
  { path: '/', key: 'header.home' },
  { path: '/rooms', key: 'header.rooms' },
  { path: '/services', key: 'header.services' },
  { path: '/attractions', key: 'header.explore' },
  { path: '/offers', key: 'header.offers' },
  { path: '/contact', key: 'header.contact' },
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
    /* ── Language Dropdown Styles ── */
    .lang-dropdown-item {
      display: flex;
      align-items: center;
      gap: 10px;
      padding: 6px 4px;
      font-size: 0.88rem;
      font-family: 'Inter', 'Segoe UI', sans-serif;
      transition: all 0.2s;
    }
    .lang-dropdown-item .lang-flag {
      font-size: 1.15rem;
      line-height: 1;
    }
    .lang-dropdown-item .lang-label {
      flex: 1;
    }
    .lang-dropdown-item .lang-check {
      color: #c9a961;
      font-weight: 700;
      font-size: 0.9rem;
    }
    @keyframes pageFadeIn {
      from { opacity: 0; transform: translateY(15px); }
      to { opacity: 1; transform: translateY(0); }
    }
    .page-transition {
      animation: pageFadeIn 0.5s cubic-bezier(0.25, 0.46, 0.45, 0.94) forwards;
    }
  `;
  document.head.appendChild(style);
};

const CustomerLayout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { t, i18n } = useTranslation();
  const { user, clearAuth } = useAdminAuthStore();
  const { getProfile } = useCustomerProfileStore();
  const [mobileOpen, setMobileOpen] = useState(false);

  const email = user?.email || user?.Email || '';
  const profile = getProfile(email);
  const fullName = profile.displayName || user?.fullName || user?.FullName || user?.name || t('header.guest');
  const avatarUrl = profile.avatarUrl || user?.avatarUrl || user?.AvatarUrl || null;
  const isHomePage = location.pathname === '/';

  // Lấy thông tin ngôn ngữ hiện tại
  const currentLang = SUPPORTED_LANGUAGES.find(l => l.code === i18n.language) || SUPPORTED_LANGUAGES[0];

  useEffect(() => {
    injectHeaderCSS();
  }, []);

  const handleLogout = () => {
    clearAuth();
    navigate('/');
  };

  // ── Dropdown ngôn ngữ 6 lựa chọn ──────────────────────────────────────
  const handleChangeLanguage = (langCode) => {
    i18n.changeLanguage(langCode);
  };

  const languageItems = SUPPORTED_LANGUAGES.map(lang => ({
    key: lang.code,
    label: (
      <div className="lang-dropdown-item">
        <span className="lang-flag">{lang.flag}</span>
        <span className="lang-label">{lang.label}</span>
        {i18n.language === lang.code && <span className="lang-check">✓</span>}
      </div>
    ),
    onClick: () => handleChangeLanguage(lang.code),
  }));

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
    { key: 'profile', icon: <SettingOutlined />, label: t('header.accountInfo'), onClick: () => navigate('/profile') },
    { key: 'bookings', icon: <UserOutlined />, label: t('header.bookingHistory'), onClick: () => navigate('/my-bookings') },
    { key: 'password', icon: <LockOutlined />, label: t('header.changePassword'), onClick: () => navigate('/profile') },
    { type: 'divider' },
    ...(user?.role?.toLowerCase()?.trim() !== 'guest' ? [{
      key: 'admin', icon: <SettingOutlined />, label: t('header.adminPanel'), onClick: () => navigate('/admin/dashboard')
    }] : []),
    {
      key: 'logout', icon: <LogoutOutlined />,
      label: <Text type="danger">{t('header.logout')}</Text>,
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
              {NAV_KEYS.map(item => (
                <li key={item.path}>
                  <Link
                    to={item.path}
                    className={`layout-nav-link ${location.pathname === item.path ? 'active' : ''}`}
                  >
                    {t(item.key)}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          {/* Desktop Actions */}
          <div className="layout-desktop-actions" style={{ display: 'flex', alignItems: 'center', gap: '16px', flexShrink: 0 }}>
            {/* Language Switcher */}
            <Dropdown menu={{ items: languageItems }} placement="bottomRight" trigger={['click']}>
              <button style={{
                background: 'none', border: '1px solid rgba(255,255,255,0.2)', borderRadius: '20px',
                color: 'rgba(255,255,255,0.85)', cursor: 'pointer', fontSize: '0.82rem',
                letterSpacing: '1px', fontFamily: "'Inter', sans-serif",
                padding: '5px 14px', display: 'flex', alignItems: 'center', gap: '6px',
                transition: 'all 0.3s',
              }}>
                <span style={{ fontSize: '1rem' }}>{currentLang.flag}</span>
                <span>{currentLang.short}</span>
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
                  <LoginOutlined style={{ marginRight: 4 }} />{t('header.login')}
                </Link>
                <button className="layout-book-btn" onClick={() => navigate('/rooms')}>
                  {t('header.bookNow')}
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

        {/* Mobile Language Selector */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, paddingBottom: 12, borderBottom: '1px solid rgba(255,255,255,0.15)' }}>
          {SUPPORTED_LANGUAGES.map(lang => (
            <button
              key={lang.code}
              onClick={() => handleChangeLanguage(lang.code)}
              style={{
                background: i18n.language === lang.code ? 'rgba(201,169,97,0.2)' : 'rgba(255,255,255,0.05)',
                border: i18n.language === lang.code ? '1px solid #c9a961' : '1px solid rgba(255,255,255,0.15)',
                color: i18n.language === lang.code ? '#c9a961' : 'rgba(255,255,255,0.7)',
                borderRadius: 16, padding: '4px 12px', fontSize: '0.78rem', cursor: 'pointer',
                fontFamily: "'Inter', sans-serif", transition: 'all 0.3s',
              }}
            >
              {lang.flag} {lang.short}
            </button>
          ))}
        </div>

        {NAV_KEYS.map(item => (
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
            {t(item.key)}
          </Link>
        ))}
        <button className="layout-book-btn" style={{ marginTop: 16, width: '100%', textAlign: 'center' }}
          onClick={() => { navigate('/rooms'); setMobileOpen(false); }}
        >
          {t('header.bookNow')}
        </button>
      </div>

      <Content style={{
        width: '100%',
        maxWidth: isHomePage ? '100%' : '1200px',
        margin: '0 auto',
        padding: isHomePage ? '0' : '24px'
      }}>
        <div key={location.pathname} className="page-transition">
          <Outlet />
        </div>
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
          <div style={{ width: 40, height: 1, background: '#c9a961', margin: '12px auto 24px' }} />
          
          <div style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.9rem', marginBottom: 24, lineHeight: 1.8 }}>
            <p style={{ margin: 0 }}><strong>Dương Duy Khánh</strong> | Email: <a href="mailto:duongduykhanh06072005@gmail.com" style={{ color: '#c9a961', textDecoration: 'none' }}>duongduykhanh06072005@gmail.com</a></p>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, marginTop: 8 }}>
              <span>Tìm kiếm chúng tôi trên facebook:</span>
              <a href="https://www.facebook.com/profile.php?id=61589457996947" target="_blank" rel="noopener noreferrer" style={{ color: '#1877f2', fontSize: 24, display: 'flex' }}>
                <FacebookFilled />
              </a>
            </div>
          </div>

          <p style={{ color: 'rgba(255,255,255,0.5)', marginTop: '12px', letterSpacing: '1px', fontSize: 13 }}>
            {t('footer.copyright')}
          </p>
        </div>
      </Footer>
    </Layout>
  );
};

export default CustomerLayout;
