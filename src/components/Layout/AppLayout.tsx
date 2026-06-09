import React, { useState } from 'react';
import { Layout, Menu, Drawer, Button, Avatar, Typography, Tooltip, Divider } from 'antd';
import {
  HomeOutlined,
  FormOutlined,
  FileTextOutlined,
  QuestionCircleOutlined,
  MenuOutlined,
  LeftOutlined,
  RightOutlined,
  LogoutOutlined,
} from '@ant-design/icons';
import { useNavigate, useLocation } from 'react-router-dom';
import { Logo } from '../Logo';
import { useBreakpoint } from '../../hooks/useBreakpoint';
import { useUserStore, initialsOf } from '../../store/userStore';
import { COLORS, SIDEBAR_WIDTH, SIDEBAR_WIDTH_COLLAPSED } from '../../theme/tokens';

const { Header, Sider, Content, Footer } = Layout;
const { Text } = Typography;

interface AppLayoutProps {
  children: React.ReactNode;
  /** When true, clicking the header logo does NOT navigate (e.g. mid-task like accepting a document). */
  disableLogoNav?: boolean;
}

const NAV_ITEMS = [
  { key: '/home', icon: <HomeOutlined />, label: 'Home' },
  { key: '/pesquisas', icon: <FormOutlined />, label: 'Pesquisas' },
  { key: '/documentos', icon: <FileTextOutlined />, label: 'Documentos' },
  { type: 'divider' as const },
  { key: '/faq', icon: <QuestionCircleOutlined />, label: 'FAQ' },
];

const BrandFooter: React.FC = () => (
  <Footer
    style={{
      background: COLORS.bgBase,
      borderTop: `1px solid ${COLORS.cardBorder}`,
      padding: '20px 24px',
      display: 'flex',
      flexWrap: 'wrap',
      gap: 12,
      alignItems: 'center',
      justifyContent: 'space-between',
    }}
  >
    <Logo height={36} />
    <Text style={{ fontSize: 12, color: COLORS.textTertiary, textAlign: 'right' }}>
      © {new Date().getFullYear()} · Todos os direitos reservados
      <br />
      Administrado por Contato Seguro
    </Text>
  </Footer>
);

export const AppLayout: React.FC<AppLayoutProps> = ({ children, disableLogoNav = false }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { isDesktop, isCompact } = useBreakpoint();
  const { currentUser, displayName, reset } = useUserStore();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);

  // Greeting/account display: the name typed at login, falling back to the mock account
  const accountName = displayName ?? currentUser?.name ?? 'Colaborador';
  const accountInitials = displayName ? initialsOf(displayName) : (currentUser?.avatarInitials ?? 'U');
  const accountRole = currentUser?.role ?? '';

  // Logout: clear the session and return to the app entry (onboarding)
  const handleLogout = () => {
    setDrawerOpen(false);
    reset();
    window.location.href = '/';
  };

  const LogoutControl: React.FC<{ compact?: boolean }> = ({ compact = false }) => (
    <Tooltip title={compact ? 'Sair da conta' : ''} placement="right">
      <button
        onClick={handleLogout}
        aria-label="Sair da conta"
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 10,
          width: '100%',
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          color: '#cf1322',
          fontWeight: 500,
          fontSize: 14,
          padding: compact ? '10px 0' : '10px 12px',
          justifyContent: compact ? 'center' : 'flex-start',
          borderRadius: 8,
        }}
        onMouseEnter={e => { e.currentTarget.style.background = '#fff1f0'; }}
        onMouseLeave={e => { e.currentTarget.style.background = 'none'; }}
      >
        <LogoutOutlined style={{ fontSize: 16 }} />
        {!compact && <span>Sair da conta</span>}
      </button>
    </Tooltip>
  );

  // Match the most specific nav key (so /documentos/:id keeps "Documentos" active)
  const navKeys = NAV_ITEMS
    .map(i => ('key' in i ? i.key : undefined))
    .filter((k): k is string => typeof k === 'string');
  const selectedKey =
    navKeys
      .filter(k => location.pathname.startsWith(k))
      .sort((a, b) => b.length - a.length)[0] ?? '/home';

  const handleNav = (key: string) => {
    navigate(key);
    setDrawerOpen(false);
  };

  const menu = (
    <Menu
      mode="inline"
      selectedKeys={[selectedKey]}
      onClick={({ key }) => handleNav(key)}
      items={NAV_ITEMS}
      style={{ border: 'none', background: 'transparent', fontWeight: 500 }}
    />
  );

  return (
    <Layout style={{ minHeight: '100dvh', background: COLORS.bgBase }}>
      {/* Top app bar — full width */}
      <Header
        style={{
          position: 'sticky',
          top: 0,
          zIndex: 100,
          background: COLORS.surface,
          padding: isCompact ? '0 16px' : '0 24px',
          height: 64,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          boxShadow: '0 2px 4px rgba(156,156,156,0.18)',
        }}
      >
        <button
          type="button"
          onClick={() => !disableLogoNav && navigate('/home')}
          aria-label={disableLogoNav ? 'Contato Seguro' : 'Ir para a Home'}
          disabled={disableLogoNav}
          style={{
            background: 'none',
            border: 'none',
            padding: 0,
            display: 'inline-flex',
            alignItems: 'center',
            cursor: disableLogoNav ? 'default' : 'pointer',
          }}
        >
          <Logo height={isCompact ? 34 : 40} />
        </button>

        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          {isDesktop && (
            <Avatar
              size={36}
              style={{ background: COLORS.primary, fontSize: 13, fontWeight: 700 }}
            >
              {accountInitials}
            </Avatar>
          )}
          {isCompact && (
            <Button
              type="text"
              aria-label="Abrir menu"
              icon={<MenuOutlined style={{ fontSize: 22, color: COLORS.primary }} />}
              onClick={() => setDrawerOpen(true)}
            />
          )}
        </div>
      </Header>

      <Layout style={{ background: COLORS.bgBase }}>
        {/* Desktop sidebar */}
        {isDesktop && (
          <Sider
            theme="light"
            width={SIDEBAR_WIDTH}
            collapsedWidth={SIDEBAR_WIDTH_COLLAPSED}
            collapsed={collapsed}
            style={{
              background: COLORS.surface,
              borderRight: `1px solid ${COLORS.cardBorder}`,
              position: 'sticky',
              top: 64,
              height: 'calc(100dvh - 64px)',
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            <div style={{ flex: 1, paddingTop: 12, overflowY: 'auto' }}>{menu}</div>
            {/* Bottom controls pinned to the very bottom: collapse toggle, divider, then logout */}
            <div style={{ borderTop: `1px solid ${COLORS.cardBorder}` }}>
              <div style={{ display: 'flex', justifyContent: collapsed ? 'center' : 'flex-start', padding: 8 }}>
                <Button
                  type="text"
                  aria-label={collapsed ? 'Expandir menu' : 'Recolher menu'}
                  icon={collapsed ? <RightOutlined /> : <LeftOutlined />}
                  onClick={() => setCollapsed(c => !c)}
                  style={{ color: COLORS.textSecondary }}
                />
              </div>
              <Divider style={{ margin: 0 }} />
              <div style={{ padding: 8 }}>
                <LogoutControl compact={collapsed} />
              </div>
            </div>
          </Sider>
        )}

        <Layout style={{ background: COLORS.bgBase }}>
          <Content style={{ padding: isCompact ? 16 : 32 }}>
            <div style={{ width: '100%' }}>{children}</div>
          </Content>
          <BrandFooter />
        </Layout>
      </Layout>

      {/* Mobile / tablet drawer */}
      <Drawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        placement="left"
        width={280}
        styles={{ body: { padding: 0 }, header: { borderBottom: `1px solid ${COLORS.cardBorder}` } }}
        title={
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <Avatar size={36} style={{ background: COLORS.primary, fontSize: 13, fontWeight: 700 }}>
              {accountInitials}
            </Avatar>
            <div style={{ display: 'flex', flexDirection: 'column', lineHeight: 1.2 }}>
              <Text strong style={{ fontSize: 14 }}>{accountName}</Text>
              <Text type="secondary" style={{ fontSize: 12 }}>{accountRole}</Text>
            </div>
          </div>
        }
      >
        <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
          <div style={{ flex: 1, overflowY: 'auto', paddingTop: 4 }}>{menu}</div>
          <div style={{ borderTop: `1px solid ${COLORS.cardBorder}`, padding: 8 }}>
            <LogoutControl />
          </div>
        </div>
      </Drawer>
    </Layout>
  );
};
