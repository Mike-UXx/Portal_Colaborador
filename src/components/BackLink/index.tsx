import React from 'react';
import { LeftOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { COLORS } from '../../theme/tokens';

interface BackLinkProps {
  /** If provided, navigate to this route. Otherwise go back (with /home fallback). */
  to?: string;
  label?: string;
  style?: React.CSSProperties;
}

/** "< Voltar" link shown above a page/module title. */
export const BackLink: React.FC<BackLinkProps> = ({ to, label = 'Voltar', style }) => {
  const navigate = useNavigate();

  const handleClick = () => {
    if (to) {
      navigate(to);
      return;
    }
    // Go back if there's in-app history, otherwise fall back to Home
    if (window.history.length > 1) navigate(-1);
    else navigate('/home');
  };

  return (
    <button
      onClick={handleClick}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 6,
        background: 'none',
        border: 'none',
        color: COLORS.primary,
        fontSize: 14,
        fontWeight: 500,
        padding: 0,
        marginBottom: 8,
        ...style,
      }}
    >
      <LeftOutlined style={{ fontSize: 12 }} /> {label}
    </button>
  );
};
