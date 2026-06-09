import React, { useEffect } from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ConfigProvider, App as AntApp } from 'antd';
import ptBR from 'antd/locale/pt_BR';
import { LoginPage } from './pages/LoginPage';
import { HomePage } from './pages/HomePage';
import { DocumentsPage } from './pages/DocumentsPage';
import { DocumentViewerPage } from './pages/DocumentViewerPage';
import { SurveysPage } from './pages/SurveysPage';
import { TrainingsPage } from './pages/TrainingsPage';
import { FaqPage } from './pages/FaqPage';
import { useUserStore, ensureLoggedIn } from './store/userStore';
import { COLORS, FONT_FAMILY } from './theme/tokens';

const THEME = {
  token: {
    colorPrimary: COLORS.primary,
    colorSuccess: COLORS.success,
    colorWarning: COLORS.warning,
    colorError: '#ff4d4f',
    colorInfo: COLORS.info,
    colorLink: COLORS.primary,
    colorLinkHover: COLORS.primaryHover,
    borderRadius: 8,
    fontFamily: FONT_FAMILY,
    fontSize: 14,
    colorBgContainer: COLORS.surface,
    colorBgLayout: COLORS.bgBase,
    colorTextHeading: COLORS.textHeading,
  },
  components: {
    Button: { borderRadius: 8, controlHeight: 40, fontWeight: 500 },
    Card: { borderRadiusLG: 8 },
    Input: { borderRadius: 8 },
    Tag: { borderRadiusSM: 4 },
    Menu: {
      itemSelectedBg: COLORS.blue1,
      itemSelectedColor: COLORS.primary,
      itemHoverColor: COLORS.primary,
      itemColor: COLORS.textSecondary,
      itemBorderRadius: 8,
      itemMarginInline: 8,
    },
    Segmented: {
      itemSelectedBg: COLORS.primary,
      itemSelectedColor: '#ffffff',
      borderRadius: 8,
    },
  },
};

function AppRouter() {
  const { currentUser, loginComplete } = useUserStore();

  useEffect(() => {
    ensureLoggedIn();
  }, []);

  if (!currentUser) return null;

  const needsLogin = !loginComplete;
  const guard = (el: React.ReactNode) =>
    needsLogin ? <Navigate to="/login" replace /> : el;

  return (
    <Routes>
      <Route
        path="/login"
        element={needsLogin ? <LoginPage /> : <Navigate to="/home" replace />}
      />
      <Route path="/home" element={guard(<HomePage />)} />
      <Route path="/documentos" element={guard(<DocumentsPage />)} />
      <Route path="/documentos/:id" element={guard(<DocumentViewerPage />)} />
      <Route path="/pesquisas" element={guard(<SurveysPage />)} />
      <Route path="/treinamentos" element={guard(<TrainingsPage />)} />
      <Route path="/faq" element={guard(<FaqPage />)} />
      <Route path="*" element={<Navigate to={needsLogin ? '/login' : '/home'} replace />} />
    </Routes>
  );
}

function App() {
  return (
    <ConfigProvider theme={THEME} locale={ptBR}>
      <AntApp>
        <HashRouter>
          <AppRouter />
        </HashRouter>
      </AntApp>
    </ConfigProvider>
  );
}

export default App;
