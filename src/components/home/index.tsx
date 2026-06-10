import React from 'react';
import { Typography } from 'antd';
import { RightOutlined, CloseOutlined } from '@ant-design/icons';
import { COLORS } from '../../theme/tokens';

const { Text } = Typography;

/* ----------------------------- Home banner ----------------------------- */
interface HomeBannerProps {
  /** 'welcome' = light hero with hand-waving icon; 'announcement' = light card with "Novidade" pill */
  kind: 'welcome' | 'announcement';
  /** Announcement icon (welcome uses the built-in hand-waving icon). */
  icon?: React.ReactNode;
  title: string;
  body: string;
  ctaLabel?: string;
  onCta?: () => void;
  onDismiss: () => void;
}

// Welcome banner palette (brand blues).
const WELCOME_BG = COLORS.blue1;          // #E8F6FD
const WELCOME_BORDER = COLORS.blue3;      // #9DBFEA
const WELCOME_CHIP = COLORS.blue2;        // #D4ECFB
const WELCOME_BODY = COLORS.textSecondary; // rgba(0,0,0,0.65)

export const HomeBanner: React.FC<HomeBannerProps> = ({ kind, icon, title, body, ctaLabel, onCta, onDismiss }) => {
  const isWelcome = kind === 'welcome';
  return (
    <section
      style={{
        position: 'relative',
        background: isWelcome ? WELCOME_BG : COLORS.blue1,
        border: `1px solid ${isWelcome ? WELCOME_BORDER : COLORS.blue3}`,
        borderRadius: 12,
        padding: '16px 18px',
        display: 'flex',
        gap: 14,
        alignItems: 'flex-start',
      }}
    >
      <div
        style={{
          width: 48,
          height: 48,
          borderRadius: 12,
          flexShrink: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: 22,
          background: isWelcome ? WELCOME_CHIP : COLORS.surface,
          border: isWelcome ? 'none' : `1px solid ${COLORS.blue3}`,
          color: COLORS.primary,
        }}
      >
        {isWelcome ? (
          <img
            src={`${import.meta.env.BASE_URL}hand-waving.png`}
            alt=""
            width={28}
            height={28}
            style={{ display: 'block' }}
          />
        ) : (
          icon
        )}
      </div>

      <div style={{ flex: 1, minWidth: 0, paddingRight: 24 }}>
        {!isWelcome && (
          <span
            style={{
              display: 'inline-block',
              background: COLORS.primary,
              color: '#fff',
              fontSize: 11,
              fontWeight: 500,
              padding: '2px 9px',
              borderRadius: 20,
              marginBottom: 7,
            }}
          >
            Novidade
          </span>
        )}
        <div style={{ color: COLORS.primary, fontSize: isWelcome ? 16 : 15, fontWeight: 600, marginBottom: 4 }}>
          {title}
        </div>
        <div style={{ color: isWelcome ? WELCOME_BODY : COLORS.textSecondary, fontSize: isWelcome ? 14 : 13, lineHeight: 1.6 }}>
          {body}
        </div>
        {ctaLabel && (
          <button
            onClick={onCta}
            style={{
              marginTop: 9,
              background: 'none',
              border: 'none',
              color: COLORS.primary,
              fontSize: 13,
              fontWeight: 600,
              cursor: 'pointer',
              padding: 0,
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
            }}
          >
            {ctaLabel} <RightOutlined style={{ fontSize: 12 }} />
          </button>
        )}
      </div>

      <button
        onClick={onDismiss}
        aria-label="Fechar"
        style={{
          position: 'absolute',
          top: 10,
          right: 10,
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          padding: 6,
          borderRadius: 8,
          lineHeight: 1,
          fontSize: 15,
          color: COLORS.textTertiary,
        }}
      >
        <CloseOutlined />
      </button>
    </section>
  );
};

/* ----------------------------- Count tag ----------------------------- */
export const CountTag: React.FC<{ count: number }> = ({ count }) => (
  <span
    style={{
      display: 'inline-flex',
      alignItems: 'center',
      background: COLORS.blue1,
      border: `1px solid ${COLORS.blue3}`,
      color: COLORS.blue6,
      borderRadius: 4,
      fontSize: 12,
      lineHeight: '20px',
      padding: '0 8px',
      fontWeight: 500,
    }}
  >
    {count}
  </span>
);

/* ----------------------------- Status tag ----------------------------- */
type StatusPreset = 'warning' | 'info' | 'success' | 'neutral' | 'danger';

const STATUS_STYLES: Record<StatusPreset, React.CSSProperties> = {
  warning: { background: COLORS.warningBg, border: `1px solid ${COLORS.warningBorder}`, color: COLORS.warning },
  info: { background: COLORS.blue1, border: `1px solid ${COLORS.blue3}`, color: COLORS.blue6 },
  success: { background: COLORS.successBg, border: `1px solid ${COLORS.successBorder}`, color: COLORS.success },
  neutral: { background: '#fafafa', border: '1px solid #d9d9d9', color: COLORS.textSecondary },
  danger: { background: '#fff1f0', border: '1px solid #ffccc7', color: '#cf1322' },
};

export const StatusTag: React.FC<{ preset: StatusPreset; children: React.ReactNode }> = ({ preset, children }) => (
  <span
    style={{
      display: 'inline-flex',
      alignItems: 'center',
      borderRadius: 4,
      fontSize: 12,
      lineHeight: '20px',
      padding: '0 8px',
      fontWeight: 500,
      ...STATUS_STYLES[preset],
    }}
  >
    {children}
  </span>
);

/* ----------------------------- Section card ----------------------------- */
interface SectionCardProps {
  title: string;
  count?: number;
  children?: React.ReactNode;
  footer?: React.ReactNode;
  emptyText?: string;
}

export const SectionCard: React.FC<SectionCardProps> = ({ title, count, children, footer, emptyText }) => {
  const isEmpty = React.Children.count(children) === 0;
  return (
    <section
      style={{
        background: COLORS.surface,
        border: `1px solid ${COLORS.cardBorder}`,
        borderRadius: 8,
        overflow: 'hidden',
      }}
    >
      {/* Header */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          padding: '12px 16px',
          borderBottom: `1px solid ${COLORS.cardBorder}`,
        }}
      >
        <Text strong style={{ fontSize: 14, color: COLORS.textHeading }}>
          {title}
        </Text>
        {typeof count === 'number' && count > 0 && <CountTag count={count} />}
      </div>

      {/* Body */}
      {isEmpty ? (
        <div style={{ padding: '20px 16px' }}>
          <Text type="secondary" style={{ fontSize: 14 }}>
            {emptyText ?? 'Nenhuma pendência no momento'}
          </Text>
        </div>
      ) : (
        <div>{children}</div>
      )}

      {/* Footer (Ver mais) */}
      {footer}
    </section>
  );
};

/* ----------------------------- Pending row ----------------------------- */
interface PendingRowProps {
  tag?: React.ReactNode;
  title: string;
  meta: string;
  actionLabel: string;
  onAction: () => void;
  last?: boolean;
}

export const PendingRow: React.FC<PendingRowProps> = ({
  tag,
  title,
  meta,
  actionLabel,
  onAction,
  last = false,
}) => (
  <div
    style={{
      display: 'flex',
      alignItems: 'center',
      gap: 12,
      padding: '14px 16px',
      borderBottom: last ? 'none' : `1px solid ${COLORS.cardBorder}`,
    }}
  >
    <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 4 }}>
      {tag && <div>{tag}</div>}
      <Text strong style={{ fontSize: 14, color: COLORS.textHeading, lineHeight: 1.4 }} ellipsis={{ tooltip: title }}>
        {title}
      </Text>
      <Text type="secondary" style={{ fontSize: 13 }}>
        {meta}
      </Text>
    </div>
    <button
      onClick={onAction}
      style={{
        background: 'none',
        border: 'none',
        color: COLORS.primary,
        fontWeight: 500,
        fontSize: 14,
        whiteSpace: 'nowrap',
        flexShrink: 0,
        cursor: 'pointer',
        // Touch target ≥ 44×44 (WCAG/Apple) — keeps the text-link look, but the
        // negative right margin offsets the padding so the label stays aligned to
        // the row edge. Extra padding only enlarges the invisible hit area.
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'flex-end',
        minWidth: 44,
        minHeight: 44,
        padding: '0 8px',
        marginRight: -8,
        borderRadius: 8,
      }}
    >
      {actionLabel}
    </button>
  </div>
);

/* ----------------------------- Ver mais footer ----------------------------- */
export const VerMaisFooter: React.FC<{ count: number; onClick: () => void }> = ({ count, onClick }) => (
  <button
    onClick={onClick}
    style={{
      width: '100%',
      background: 'none',
      border: 'none',
      borderTop: `1px solid ${COLORS.cardBorder}`,
      color: COLORS.primary,
      fontWeight: 600,
      fontSize: 14,
      padding: '12px 16px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 8,
    }}
  >
    Ver mais ({count}) <RightOutlined style={{ fontSize: 12 }} />
  </button>
);

/* ----------------------------- Shortcut card ----------------------------- */
interface ShortcutCardProps {
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
}

export const ShortcutCard: React.FC<ShortcutCardProps> = ({ icon, label, onClick }) => (
  <button
    onClick={onClick}
    style={{
      flex: 1,
      minWidth: 0,
      background: COLORS.surface,
      border: `1px solid ${COLORS.cardBorder}`,
      borderRadius: 8,
      padding: '16px 12px',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'flex-start',
      gap: 10,
      transition: 'box-shadow .15s, border-color .15s',
    }}
    onMouseEnter={e => {
      e.currentTarget.style.boxShadow = '0 4px 12px rgba(38,48,114,0.08)';
      e.currentTarget.style.borderColor = COLORS.blue3;
    }}
    onMouseLeave={e => {
      e.currentTarget.style.boxShadow = 'none';
      e.currentTarget.style.borderColor = COLORS.cardBorder;
    }}
  >
    <span style={{ fontSize: 24, color: COLORS.primary }}>{icon}</span>
    <span style={{ fontSize: 14, fontWeight: 500, color: COLORS.textHeading }}>{label}</span>
  </button>
);
