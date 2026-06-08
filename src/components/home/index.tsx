import React from 'react';
import { Typography } from 'antd';
import { RightOutlined } from '@ant-design/icons';
import { COLORS } from '../../theme/tokens';

const { Text } = Typography;

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
type StatusPreset = 'warning' | 'info' | 'success' | 'neutral';

const STATUS_STYLES: Record<StatusPreset, React.CSSProperties> = {
  warning: { background: COLORS.warningBg, border: `1px solid ${COLORS.warningBorder}`, color: COLORS.warning },
  info: { background: COLORS.blue1, border: `1px solid ${COLORS.blue3}`, color: COLORS.blue6 },
  success: { background: COLORS.successBg, border: `1px solid ${COLORS.successBorder}`, color: COLORS.success },
  neutral: { background: '#fafafa', border: '1px solid #d9d9d9', color: COLORS.textSecondary },
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
