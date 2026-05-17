import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { SUPPORTED_LANGUAGES } from '../i18n';
import { useAdminAuthStore } from '../store/adminAuthStore';
import { useCustomerProfileStore } from '../store/useCustomerProfileStore';
import {
  GlobalOutlined, LoginOutlined, UserOutlined, SettingOutlined,
  LockOutlined, LogoutOutlined, MenuOutlined, CloseOutlined
} from '@ant-design/icons';
import { Avatar, Dropdown, Typography } from 'antd';

const { Text } = Typography;

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

// ── Inline styles (CSS-in-JS) ──────────────────────────────────────────────
const styles = {
  heroWrapper: {
    position: 'relative',
    width: '100vw',
    height: '100vh',
    overflow: 'hidden',
    marginLeft: 'calc(-50vw + 50%)',
  },
  video: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    minWidth: '100%',
    minHeight: '100%',
    width: 'auto',
    height: 'auto',
    transform: 'translate(-50%, -50%)',
    objectFit: 'cover',
    zIndex: 0,
  },
  overlay: {
    position: 'absolute',
    inset: 0,
    background: 'linear-gradient(180deg, rgba(0,0,0,0.35) 0%, rgba(0,0,0,0.15) 40%, rgba(0,0,0,0.5) 100%)',
    zIndex: 1,
  },
  header: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 1000,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '24px 48px',
    transition: 'background 0.4s ease, box-shadow 0.4s ease, padding 0.4s ease',
  },
  headerScrolled: {
    background: 'rgba(0,0,0,0.75)',
    backdropFilter: 'blur(12px)',
    boxShadow: '0 2px 24px rgba(0,0,0,0.3)',
    padding: '16px 48px',
  },
  logo: {
    fontFamily: "'Playfair Display', Georgia, 'Times New Roman', serif",
    fontSize: '1.6rem',
    fontWeight: 700,
    color: '#fff',
    letterSpacing: '2px',
    cursor: 'pointer',
    textDecoration: 'none',
    textTransform: 'uppercase',
    transition: 'opacity 0.3s',
  },
  logoAccent: {
    color: '#c9a961',
    fontWeight: 400,
    fontStyle: 'italic',
    fontSize: '0.75em',
    display: 'block',
    letterSpacing: '4px',
    marginTop: '2px',
  },
  nav: {
    display: 'flex',
    alignItems: 'center',
    gap: '36px',
    listStyle: 'none',
    margin: 0,
    padding: 0,
  },
  navLink: {
    color: 'rgba(255,255,255,0.85)',
    textDecoration: 'none',
    fontSize: '0.85rem',
    fontWeight: 500,
    letterSpacing: '2px',
    textTransform: 'uppercase',
    transition: 'color 0.3s, border-bottom 0.3s',
    paddingBottom: '4px',
    borderBottom: '1px solid transparent',
    fontFamily: "'Inter', 'Segoe UI', sans-serif",
  },
  navLinkHover: {
    color: '#c9a961',
    borderBottom: '1px solid #c9a961',
  },
  bookNowBtn: {
    border: '1.5px solid #c9a961',
    color: '#c9a961',
    background: 'transparent',
    padding: '10px 28px',
    borderRadius: '2px',
    fontSize: '0.8rem',
    fontWeight: 600,
    letterSpacing: '3px',
    textTransform: 'uppercase',
    cursor: 'pointer',
    transition: 'all 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
    fontFamily: "'Inter', 'Segoe UI', sans-serif",
  },
  bookNowBtnHover: {
    background: '#c9a961',
    color: '#0a0a0a',
  },
  centerContent: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    zIndex: 5,
    textAlign: 'center',
    width: '90%',
    maxWidth: '800px',
  },
  tagline: {
    fontFamily: "'Playfair Display', Georgia, 'Times New Roman', serif",
    fontSize: 'clamp(2.2rem, 5vw, 4rem)',
    fontWeight: 400,
    color: '#fff',
    lineHeight: 1.2,
    marginBottom: '20px',
    letterSpacing: '1px',
    textShadow: '0 4px 20px rgba(0,0,0,0.4)',
  },
  taglineItalic: {
    fontStyle: 'italic',
    color: '#c9a961',
  },
  subtitle: {
    fontFamily: "'Inter', 'Segoe UI', sans-serif",
    fontSize: 'clamp(0.85rem, 1.5vw, 1.05rem)',
    color: 'rgba(255,255,255,0.7)',
    fontWeight: 300,
    letterSpacing: '3px',
    textTransform: 'uppercase',
    marginBottom: '40px',
  },
  divider: {
    width: '60px',
    height: '1px',
    background: '#c9a961',
    margin: '24px auto',
  },
  scrollIndicator: {
    position: 'absolute',
    bottom: '40px',
    left: '50%',
    transform: 'translateX(-50%)',
    zIndex: 5,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '8px',
    color: 'rgba(255,255,255,0.5)',
    fontSize: '0.7rem',
    letterSpacing: '3px',
    textTransform: 'uppercase',
    fontFamily: "'Inter', sans-serif",
  },
  scrollLine: {
    width: '1px',
    height: '40px',
    background: 'linear-gradient(to bottom, rgba(201,169,97,0.8), transparent)',
  },
  /* Mobile hamburger */
  hamburger: {
    display: 'none',
    color: '#fff',
    fontSize: '24px',
    cursor: 'pointer',
    background: 'none',
    border: 'none',
    zIndex: 20,
  },
  mobileNav: {
    position: 'fixed',
    top: 0,
    right: 0,
    width: '300px',
    height: '100vh',
    background: 'rgba(10,10,10,0.97)',
    backdropFilter: 'blur(20px)',
    zIndex: 100,
    display: 'flex',
    flexDirection: 'column',
    padding: '80px 40px 40px',
    gap: '24px',
    transform: 'translateX(100%)',
    transition: 'transform 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
  },
  mobileNavOpen: {
    transform: 'translateX(0)',
  },
  mobileOverlay: {
    position: 'fixed',
    inset: 0,
    background: 'rgba(0,0,0,0.5)',
    zIndex: 99,
  },
};

// ── CSS keyframes injected once ────────────────────────────────────────────
const injectKeyframes = () => {
  if (document.getElementById('hero-keyframes')) return;
  const style = document.createElement('style');
  style.id = 'hero-keyframes';
  style.textContent = `
    @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,500;0,600;0,700;1,400;1,500&family=Inter:wght@300;400;500;600&display=swap');

    @keyframes heroFadeUp {
      from { opacity: 0; transform: translateY(30px); }
      to   { opacity: 1; transform: translateY(0); }
    }
    @keyframes heroFadeIn {
      from { opacity: 0; }
      to   { opacity: 1; }
    }
    @keyframes scrollBounce {
      0%, 100% { transform: translateY(0); }
      50%      { transform: translateY(8px); }
    }
    @keyframes shimmer {
      0% { background-position: -200% center; }
      100% { background-position: 200% center; }
    }
    .hero-tagline {
      animation: heroFadeUp 1.2s ease-out 0.3s both;
    }
    .hero-divider {
      animation: heroFadeIn 1s ease-out 0.8s both;
    }
    .hero-subtitle {
      animation: heroFadeUp 1.2s ease-out 1s both;
    }
    .hero-cta {
      animation: heroFadeUp 1.2s ease-out 1.3s both;
    }
    .hero-scroll {
      animation: scrollBounce 2s ease-in-out infinite, heroFadeIn 1s ease-out 2s both;
    }
    .hero-header {
      animation: heroFadeIn 0.8s ease-out 0.2s both;
    }
    .hero-nav-link:hover {
      color: #c9a961 !important;
      border-bottom-color: #c9a961 !important;
    }
    .hero-book-btn:hover {
      background: #c9a961 !important;
      color: #0a0a0a !important;
    }
    @media (max-width: 768px) {
      .hero-desktop-nav { display: none !important; }
      .hero-desktop-actions { display: none !important; }
      .hero-hamburger { display: block !important; }
    }
    /* Language Dropdown in Hero */
    .hero-lang-item {
      display: flex;
      align-items: center;
      gap: 10px;
      padding: 6px 4px;
      font-size: 0.88rem;
      font-family: 'Inter', 'Segoe UI', sans-serif;
    }
    .hero-lang-item .lang-flag { font-size: 1.15rem; }
    .hero-lang-item .lang-check { color: #c9a961; font-weight: 700; }
  `;
  document.head.appendChild(style);
};

// ── Navigation items (translation keys) ────────────────────────────────────
const NAV_KEYS = [
  { path: '/', key: 'header.home' },
  { path: '/rooms', key: 'header.rooms' },
  { path: '/services', key: 'header.services' },
  { path: '/attractions', key: 'header.explore' },
  { path: '/offers', key: 'header.offers' },
  { path: '/contact', key: 'header.contact' },
];

const HeroSection = () => {
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();
  const { user, clearAuth } = useAdminAuthStore();
  const { getProfile } = useCustomerProfileStore();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [hoveredNav, setHoveredNav] = useState(null);
  const [btnHover, setBtnHover] = useState(false);

  const email = user?.email || user?.Email || '';
  const profile = getProfile(email);
  const fullName = profile.displayName || user?.fullName || user?.FullName || user?.name || t('header.guest');
  const avatarUrl = profile.avatarUrl || user?.avatarUrl || user?.AvatarUrl || null;

  // Lấy thông tin ngôn ngữ hiện tại
  const currentLang = SUPPORTED_LANGUAGES.find(l => l.code === i18n.language) || SUPPORTED_LANGUAGES[0];

  useEffect(() => {
    injectKeyframes();
    const onScroll = () => setScrolled(window.scrollY > 60);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const handleLogout = () => {
    clearAuth();
    navigate('/');
  };

  const handleChangeLanguage = (langCode) => {
    i18n.changeLanguage(langCode);
  };

  // ── Dropdown ngôn ngữ 6 lựa chọn ──────────────────────────────────────
  const languageItems = SUPPORTED_LANGUAGES.map(lang => ({
    key: lang.code,
    label: (
      <div className="hero-lang-item">
        <span className="lang-flag">{lang.flag}</span>
        <span style={{ flex: 1 }}>{lang.label}</span>
        {i18n.language === lang.code && <span className="lang-check">✓</span>}
      </div>
    ),
    onClick: () => handleChangeLanguage(lang.code),
  }));

  // Account dropdown for logged-in users
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
      key: 'admin',
      icon: <SettingOutlined />,
      label: t('header.adminPanel'),
      onClick: () => navigate('/admin/dashboard')
    }] : []),
    {
      key: 'logout',
      icon: <LogoutOutlined />,
      label: <Text type="danger">{t('header.logout')}</Text>,
      onClick: handleLogout,
      danger: true
    }
  ] : [];

  return (
    <div style={styles.heroWrapper} id="hero-section">
      {/* Background Video */}
      <video
        autoPlay
        loop
        muted
        playsInline
        style={styles.video}
        poster="https://images.unsplash.com/photo-1566073771259-6a8506099945?w=1920&q=80"
        onError={(e) => {
          // Nếu video không tải được, ẩn video để hiện poster image bên dưới
          e.target.style.display = 'none';
        }}
      >
        {/* Nguồn 1: resort video nhẹ từ Mixkit (CDN toàn cầu, không bị chặn) */}
        <source
          src="https://assets.mixkit.co/videos/preview/mixkit-waves-in-the-water-1164-large.mp4"
          type="video/mp4"
        />
        {/* Nguồn 2: hotel pool video */}
        <source
          src="https://assets.mixkit.co/videos/preview/mixkit-swimming-pool-in-a-luxury-villa-1239-large.mp4"
          type="video/mp4"
        />
      </video>

      {/* Gradient overlay */}
      <div style={styles.overlay} />

      {/* ── Transparent Header ─────────────────────────────────────────── */}
      <header
        className="hero-header"
        style={{
          ...styles.header,
          ...(scrolled ? styles.headerScrolled : {}),
        }}
      >
        {/* Logo */}
        <div onClick={() => navigate('/')} style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '12px' }}>
          <CitadelLogo size={38} color="#c9a961" />
          <div style={styles.logo}>
            The Royal Citadel
            <span style={styles.logoAccent}>Luxury Hotel & Resort</span>
          </div>
        </div>

        {/* Desktop Navigation */}
        <nav className="hero-desktop-nav" style={{ flex: 1, display: 'flex', justifyContent: 'center' }}>
          <ul style={styles.nav}>
            {NAV_KEYS.map((item) => (
              <li key={item.path}>
                <Link
                  to={item.path}
                  className="hero-nav-link"
                  style={{
                    ...styles.navLink,
                    ...(hoveredNav === item.path ? styles.navLinkHover : {}),
                  }}
                  onMouseEnter={() => setHoveredNav(item.path)}
                  onMouseLeave={() => setHoveredNav(null)}
                >
                  {t(item.key)}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        {/* Desktop Actions */}
        <div className="hero-desktop-actions" style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
          {/* Language Switcher */}
          <Dropdown menu={{ items: languageItems }} placement="bottomRight" trigger={['click']}>
            <button style={{
              background: 'none', border: '1px solid rgba(255,255,255,0.25)', borderRadius: '20px',
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
            <Dropdown
              menu={{ items: accountDropdownItems }}
              placement="bottomRight"
              trigger={['click']}
            >
              <div style={{
                display: 'flex', alignItems: 'center', gap: 8,
                cursor: 'pointer', padding: '4px 12px',
                borderRadius: '20px', border: '1px solid rgba(255,255,255,0.3)',
                transition: 'all 0.3s',
              }}>
                <Avatar
                  size={32}
                  src={avatarUrl}
                  icon={!avatarUrl && <UserOutlined />}
                  style={{ background: '#c9a961' }}
                />
                <span style={{ color: '#fff', fontSize: '0.85rem', fontWeight: 500, maxWidth: 100, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {fullName}
                </span>
              </div>
            </Dropdown>
          ) : (
            <>
              <Link
                to="/login"
                style={{
                  color: 'rgba(255,255,255,0.8)',
                  fontSize: '0.85rem',
                  letterSpacing: '1px',
                  textDecoration: 'none',
                  transition: 'color 0.3s',
                }}
              >
                <LoginOutlined style={{ marginRight: 6 }} />{t('header.login')}
              </Link>
              <button
                className="hero-book-btn"
                style={{
                  ...styles.bookNowBtn,
                  ...(btnHover ? styles.bookNowBtnHover : {}),
                }}
                onMouseEnter={() => setBtnHover(true)}
                onMouseLeave={() => setBtnHover(false)}
                onClick={() => navigate('/rooms')}
              >
                {t('header.bookNow')}
              </button>
            </>
          )}
        </div>

        {/* Hamburger for mobile */}
        <button
          className="hero-hamburger"
          style={styles.hamburger}
          onClick={() => setMobileOpen(!mobileOpen)}
        >
          {mobileOpen ? <CloseOutlined /> : <MenuOutlined />}
        </button>
      </header>

      {/* Mobile nav overlay */}
      {mobileOpen && <div style={styles.mobileOverlay} onClick={() => setMobileOpen(false)} />}
      <div style={{ ...styles.mobileNav, ...(mobileOpen ? styles.mobileNavOpen : {}) }}>
        <button
          style={{ position: 'absolute', top: 24, right: 24, background: 'none', border: 'none', color: '#fff', fontSize: 20, cursor: 'pointer' }}
          onClick={() => setMobileOpen(false)}
        >
          <CloseOutlined />
        </button>

        {/* Mobile Language Selector */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, paddingBottom: 16, borderBottom: '1px solid rgba(255,255,255,0.15)' }}>
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

        {NAV_KEYS.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            onClick={() => setMobileOpen(false)}
            style={{
              color: 'rgba(255,255,255,0.85)',
              fontSize: '1rem',
              letterSpacing: '2px',
              textTransform: 'uppercase',
              textDecoration: 'none',
              padding: '8px 0',
              borderBottom: '1px solid rgba(255,255,255,0.1)',
              fontFamily: "'Inter', sans-serif",
            }}
          >
            {t(item.key)}
          </Link>
        ))}
        <button
          style={{ ...styles.bookNowBtn, marginTop: '16px', width: '100%', textAlign: 'center' }}
          onClick={() => { navigate('/rooms'); setMobileOpen(false); }}
        >
          {t('header.bookNow')}
        </button>
      </div>

      {/* ── Center Content ─────────────────────────────────────────────── */}
      <div style={styles.centerContent}>
        <div className="hero-tagline" style={styles.tagline}>
          {t('hero.tagline1')}<br />
          {t('hero.tagline2')} <span style={styles.taglineItalic}>{t('hero.taglineHighlight')}</span>
        </div>
        <div className="hero-divider" style={styles.divider} />
        <div className="hero-subtitle" style={styles.subtitle}>
          {t('hero.subtitle')}
        </div>
        <div className="hero-cta">
          <button
            className="hero-book-btn"
            style={{
              ...styles.bookNowBtn,
              padding: '14px 48px',
              fontSize: '0.85rem',
              letterSpacing: '4px',
            }}
            onMouseEnter={(e) => { e.target.style.background = '#c9a961'; e.target.style.color = '#0a0a0a'; }}
            onMouseLeave={(e) => { e.target.style.background = 'transparent'; e.target.style.color = '#c9a961'; }}
            onClick={() => navigate('/rooms')}
          >
            {t('hero.exploreRooms')}
          </button>
        </div>
      </div>

      {/* ── Scroll indicator ───────────────────────────────────────────── */}
      <div className="hero-scroll" style={styles.scrollIndicator}>
        <span>{t('header.scroll')}</span>
        <div style={styles.scrollLine} />
      </div>

      {/* ── Wave SVG Bottom ───────────────────────────────────────────── */}
      <div style={{ position: 'absolute', bottom: 0, left: 0, width: '100%', zIndex: 10, lineHeight: 0 }}>
        <svg viewBox="0 0 1440 120" style={{ display: 'block', width: '100%', height: 'auto' }} preserveAspectRatio="none" fill="#f5f5f5">
          <path d="M0,64L80,69.3C160,75,320,85,480,80C640,75,800,53,960,42.7C1120,32,1280,32,1360,32L1440,32L1440,120L1360,120C1280,120,1120,120,960,120C800,120,640,120,480,120C320,120,160,120,80,120L0,120Z"></path>
        </svg>
      </div>
    </div>
  );
};

export default HeroSection;
