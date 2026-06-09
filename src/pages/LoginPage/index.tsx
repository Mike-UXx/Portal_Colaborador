import React, { useState } from 'react';
import { Typography, Input, Button, Select } from 'antd';
import { useNavigate } from 'react-router-dom';
import { Logo } from '../../components/Logo';
import { useUserStore } from '../../store/userStore';
import { useBreakpoint } from '../../hooks/useBreakpoint';
import { COLORS } from '../../theme/tokens';

const { Title } = Typography;

const HERO_DESKTOP = `${import.meta.env.BASE_URL}login-hero-desktop.jpg`;
const HERO_MOBILE = `${import.meta.env.BASE_URL}login-hero-mobile.jpg`;

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const { completeLogin } = useUserStore();
  const { isDesktop } = useBreakpoint();
  const [name, setName] = useState('');
  const [lang, setLang] = useState('pt');

  const enter = () => {
    if (!name.trim()) return;
    completeLogin(name);
    navigate('/home', { replace: true });
  };

  const skip = () => {
    completeLogin(null);
    navigate('/home', { replace: true });
  };

  /* ------------------------------ shared blocks ------------------------------ */
  const langSelect = (
    <Select
      value={lang}
      onChange={setLang}
      style={{ width: 86 }}
      options={[
        { value: 'pt', label: 'PT' },
        { value: 'en', label: 'EN' },
      ]}
    />
  );

  const heading = (
    <Title
      level={2}
      style={{ color: COLORS.primary, margin: 0, fontWeight: 400, lineHeight: 1.2, fontSize: isDesktop ? 32 : 26 }}
    >
      <strong style={{ fontWeight: 700 }}>Faça seu login</strong> e seja bem-vindo(a) à plataforma
    </Title>
  );

  const fields = (
    <div style={{ display: 'flex', flexDirection: 'column', width: '100%' }}>
      <label style={{ fontSize: 13, color: COLORS.textSecondary, marginBottom: 6 }}>
        Nome completo <span style={{ color: '#cf1322' }}>*</span>
      </label>
      <Input
        value={name}
        onChange={e => setName(e.target.value)}
        onPressEnter={enter}
        placeholder="Insira seu nome"
        size="large"
        style={{ borderRadius: 8, marginBottom: 20 }}
        autoFocus={isDesktop}
      />
      <Button
        type="primary"
        block
        size="large"
        onClick={enter}
        disabled={!name.trim()}
        style={{
          minHeight: 52,
          borderRadius: 8,
          fontWeight: 600,
          marginBottom: 12,
          background: name.trim() ? COLORS.primary : undefined,
          borderColor: name.trim() ? COLORS.primary : undefined,
        }}
      >
        Entrar
      </Button>
      <Button block size="large" onClick={skip} style={{ minHeight: 52, borderRadius: 8 }}>
        Pular / Ignorar
      </Button>
    </div>
  );

  /* --------------------------------- desktop --------------------------------- */
  if (isDesktop) {
    return (
      <div style={{ minHeight: '100dvh', display: 'flex', background: COLORS.surface }}>
        {/* Image — left (takes most of the width) */}
        <div style={{ flex: '0 0 62%', position: 'relative', overflow: 'hidden' }}>
          <img
            src={HERO_DESKTOP}
            alt=""
            style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }}
          />
        </div>

        {/* Form — right: 64px side spacing, content stretches full width, logo centered */}
        <div
          style={{
            flex: '1 1 0',
            width: '38%',
            position: 'relative',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            padding: '40px 64px',
            minWidth: 360,
          }}
        >
          <div style={{ position: 'absolute', top: 32, right: 64 }}>{langSelect}</div>

          <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 28 }}>
            {heading}
            {fields}
          </div>

          <div style={{ position: 'absolute', bottom: 32, left: 0, right: 0, display: 'flex', justifyContent: 'center' }}>
            <Logo height={42} />
          </div>
        </div>
      </div>
    );
  }

  /* ------------------------------ mobile / tablet ----------------------------- */
  return (
    <div style={{ minHeight: '100dvh', display: 'flex', flexDirection: 'column', background: COLORS.surface }}>
      {/* Image — top */}
      <div style={{ position: 'relative', height: 300, flexShrink: 0, overflow: 'hidden' }}>
        <img
          src={HERO_MOBILE}
          alt=""
          style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }}
        />
        <div style={{ position: 'absolute', top: 16, right: 16 }}>{langSelect}</div>
      </div>

      {/* Form — below */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', padding: '28px 24px 24px' }}>
        <div style={{ marginBottom: 28 }}>{heading}</div>
        {fields}
        <div style={{ marginTop: 'auto', paddingTop: 32, display: 'flex', justifyContent: 'center' }}>
          <Logo height={42} />
        </div>
      </div>
    </div>
  );
};
