import React from 'react';

interface LogoProps {
  /** Height of the logo in px (width scales automatically) */
  height?: number;
  /** color = navy logo (light backgrounds) · white = negative logo (dark backgrounds) */
  variant?: 'color' | 'white';
}

const SRC: Record<NonNullable<LogoProps['variant']>, string> = {
  color: '/logo-contato-seguro.png',
  white: '/logo-contato-seguro-branco.png',
};

/** Official Contato Seguro — Canal de Denúncias logo lockup. */
export const Logo: React.FC<LogoProps> = ({ height = 36, variant = 'color' }) => (
  <img
    src={SRC[variant]}
    alt="Contato Seguro · Canal de Denúncias"
    style={{ height, width: 'auto', display: 'block', userSelect: 'none' }}
    draggable={false}
  />
);
